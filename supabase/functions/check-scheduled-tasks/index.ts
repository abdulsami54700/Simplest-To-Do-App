import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.102.1/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Firebase service account
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: "Missing FIREBASE_SERVICE_ACCOUNT" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const now = Date.now();

    // Find due tasks that haven't been notified
    const { data: dueTasks, error: taskError } = await supabase
      .from("scheduled_tasks")
      .select("*")
      .eq("completed", false)
      .eq("notified", false)
      .lte("scheduled_time", now);

    if (taskError) {
      return new Response(JSON.stringify({ error: taskError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dueTasks || dueTasks.length === 0) {
      return new Response(JSON.stringify({ message: "No due tasks", checked_at: now }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all FCM tokens
    const { data: tokens, error: tokenError } = await supabase
      .from("fcm_tokens")
      .select("token");

    if (tokenError || !tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ error: "No FCM tokens found" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get OAuth2 access token for FCM v1 API
    const accessToken = await getAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    let sent = 0;
    const errors: string[] = [];

    for (const task of dueTasks) {
      for (const { token } of tokens) {
        try {
          const res = await fetch(
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: {
                  token,
                  notification: {
                    title: "Task Reminder",
                    body: `You have a task: ${task.title}`,
                  },
                  webpush: {
                    notification: {
                      title: "Task Reminder",
                      body: `You have a task: ${task.title}`,
                      icon: "/icon-192.png",
                    },
                  },
                },
              }),
            }
          );

          if (res.ok) {
            sent++;
          } else {
            const errBody = await res.text();
            errors.push(`Token ${token.slice(0, 10)}...: ${errBody}`);
            // If token is invalid, remove it
            if (res.status === 404 || res.status === 400) {
              await supabase.from("fcm_tokens").delete().eq("token", token);
            }
          }
        } catch (e) {
          errors.push(`Send error: ${(e as Error).message}`);
        }
      }

      // Mark task as notified
      await supabase
        .from("scheduled_tasks")
        .update({ notified: true })
        .eq("task_id", task.task_id);
    }

    return new Response(
      JSON.stringify({ sent, tasks_processed: dueTasks.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Generate OAuth2 access token from service account using JWT
async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemContents = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64url(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

function base64url(bytes: Uint8Array): string {
  const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
