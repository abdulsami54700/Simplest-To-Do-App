export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  scheduledTime: number | null;
  createdAt: number;
  notified?: boolean;
}

const STORAGE_KEY = "todo_tasks";

function sanitize(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t: any) =>
        typeof t.id === "string" &&
        typeof t.title === "string" &&
        typeof t.completed === "boolean"
    );
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTask(
  title: string,
  description: string,
  scheduledTime: number | null
): Task {
  return {
    id: crypto.randomUUID(),
    title: sanitize(title.trim()).slice(0, 50),
    description: sanitize(description.trim()).slice(0, 1000),
    completed: false,
    scheduledTime,
    createdAt: Date.now(),
  };
}
