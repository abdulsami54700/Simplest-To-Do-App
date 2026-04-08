import { supabase } from "@/integrations/supabase/client";
import { Task } from "./tasks";

/**
 * Store FCM token in Supabase for backend push notifications
 */
export async function storeFCMToken(token: string): Promise<void> {
  try {
    await supabase.from("fcm_tokens").upsert({ token }, { onConflict: "token" });
  } catch (e) {
    console.warn("Failed to store FCM token:", e);
  }
}

/**
 * Sync a scheduled task to Supabase for backend notification delivery
 */
export async function syncScheduledTask(task: Task): Promise<void> {
  if (!task.scheduledTime || task.completed) return;
  try {
    await supabase.from("scheduled_tasks").upsert(
      {
        task_id: task.id,
        title: task.title,
        scheduled_time: task.scheduledTime,
        completed: task.completed,
        notified: task.notified ?? false,
      },
      { onConflict: "task_id" }
    );
  } catch (e) {
    console.warn("Failed to sync task:", e);
  }
}

/**
 * Mark a task as completed in Supabase
 */
export async function markTaskCompleted(taskId: string): Promise<void> {
  try {
    await supabase
      .from("scheduled_tasks")
      .update({ completed: true })
      .eq("task_id", taskId);
  } catch (e) {
    console.warn("Failed to mark task completed:", e);
  }
}

/**
 * Remove a task from Supabase
 */
export async function removeScheduledTask(taskId: string): Promise<void> {
  try {
    await supabase.from("scheduled_tasks").delete().eq("task_id", taskId);
  } catch (e) {
    console.warn("Failed to remove task:", e);
  }
}

/**
 * Sync all scheduled tasks to Supabase
 */
export async function syncAllScheduledTasks(tasks: Task[]): Promise<void> {
  const scheduled = tasks.filter((t) => t.scheduledTime && !t.completed);
  for (const task of scheduled) {
    await syncScheduledTask(task);
  }
}
