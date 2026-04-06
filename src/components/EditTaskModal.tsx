import { useState, useCallback, useRef, useEffect } from "react";
import { Task } from "@/lib/tasks";
import { X } from "lucide-react";
import { format } from "date-fns";

interface Props {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, title: string, description: string, scheduledTime: number | null) => void;
}

export default function EditTaskModal({ task, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDateTime(
        task.scheduledTime
          ? format(new Date(task.scheduledTime), "yyyy-MM-dd'T'HH:mm")
          : ""
      );
    }
  }, [task]);

  const handleSave = useCallback(() => {
    if (!task) return;
    const trimmed = title.trim();
    if (!trimmed || saving.current) return;
    saving.current = true;

    const scheduled = dateTime ? new Date(dateTime).getTime() : null;
    onSave(task.id, trimmed, description, scheduled);

    saving.current = false;
    onClose();
  }, [task, title, description, dateTime, onSave, onClose]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-bold text-lg">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={18} className="text-secondary-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-secondary-foreground mb-1.5 block font-medium">
              Title *
            </label>
            <input
              type="text"
              maxLength={50}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition"
              autoFocus
            />
            <span className="text-xs text-muted-foreground mt-1 block text-right">
              {title.length}/50
            </span>
          </div>

          <div>
            <label className="text-xs text-secondary-foreground mb-1.5 block font-medium">
              Description
            </label>
            <textarea
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
            />
            <span className="text-xs text-muted-foreground mt-1 block text-right">
              {description.length}/1000
            </span>
          </div>

          <div>
            <label className="text-xs text-secondary-foreground mb-1.5 block font-medium">
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
