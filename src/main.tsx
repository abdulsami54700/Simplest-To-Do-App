import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard: unregister NON-firebase service workers in preview/iframe contexts
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((regs) => {
    regs.forEach((r) => {
      // Don't unregister the Firebase messaging SW - it handles push notifications
      if (!r.active?.scriptURL?.includes("firebase-messaging-sw")) {
        r.unregister();
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
