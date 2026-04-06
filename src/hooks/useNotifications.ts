import { useEffect, useRef } from "react";
import { Task, saveTasks } from "@/lib/tasks";

export function useNotifications(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) {
  const permissionAsked = useRef(false);

  useEffect(() => {
    const scheduled = tasks.filter((t) => t.scheduledTime && !t.completed && !t.notified);
    if (scheduled.length === 0) return;

    if (!permissionAsked.current && "Notification" in window && Notification.permission === "default") {
      permissionAsked.current = true;
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const now = Date.now();
      let changed = false;

      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.scheduledTime && !t.completed && !t.notified && now >= t.scheduledTime) {
            new Notification("You have a task: " + t.title, {
              body: t.description || "Task reminder",
              icon: "/icon-192.png",
              tag: t.id,
            });
            changed = true;
            return { ...t, notified: true };
          }
          return t;
        });
        if (changed) saveTasks(updated);
        return changed ? updated : prev;
      });
    }, 30_000); // Check every 30 seconds for more responsive notifications

    // Also check immediately on mount
    const checkNow = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const now = Date.now();
      let changed = false;
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.scheduledTime && !t.completed && !t.notified && now >= t.scheduledTime) {
            new Notification("You have a task: " + t.title, {
              body: t.description || "Task reminder",
              icon: "/icon-192.png",
              tag: t.id,
            });
            changed = true;
            return { ...t, notified: true };
          }
          return t;
        });
        if (changed) saveTasks(updated);
        return changed ? updated : prev;
      });
    };
    checkNow();

    return () => clearInterval(interval);
  }, [tasks, setTasks]);
}
