import { useState, useCallback, useRef } from "react";
import { Task } from "@/lib/tasks";
import { format } from "date-fns";
import { Clock, Pencil } from "lucide-react";

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}

export default function TaskCard({ task, onComplete, onEdit, onView }: Props) {
  const [confirming, setConfirming] = useState(false);
  const lastTap = useRef(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      onView(task);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [onView, task]);

  const handleCheck = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirming(true);
    },
    []
  );

  const confirmComplete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.vibrate) navigator.vibrate(50);
      onComplete(task.id);
      setConfirming(false);
    },
    [onComplete, task.id]
  );

  const cancelComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
  }, []);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(task);
    },
    [onEdit, task]
  );

  const isOverdue = task.scheduledTime && !task.completed && Date.now() > task.scheduledTime;

  return (
    <div
      className="bg-card rounded-2xl p-4 mb-3 cursor-pointer transition-all duration-200 hover:shadow-xl shadow-md border border-border/50 active:scale-[0.98]"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-secondary-foreground text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
          {task.scheduledTime && (
            <div className={`flex items-center gap-1.5 mt-2 text-xs ${isOverdue ? "text-destructive" : "text-primary"}`}>
              <Clock size={12} />
              <span>{format(new Date(task.scheduledTime), "MMM d, h:mm a")}</span>
              {isOverdue && <span className="font-medium">(overdue)</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleEdit}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Edit task"
          >
            <Pencil size={14} className="text-secondary-foreground" />
          </button>
          <button
            onClick={handleCheck}
            className="w-7 h-7 rounded-lg border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            aria-label="Complete task"
          >
            {confirming && (
              <div className="w-3.5 h-3.5 rounded-sm bg-primary animate-in zoom-in duration-150" />
            )}
          </button>
        </div>
      </div>

      {confirming && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-xs text-secondary-foreground">Mark as completed?</span>
          <div className="flex gap-2">
            <button
              onClick={cancelComplete}
              className="px-4 py-1.5 text-xs rounded-lg bg-muted text-foreground hover:brightness-110 transition-colors font-medium"
            >
              No
            </button>
            <button
              onClick={confirmComplete}
              className="px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-colors"
            >
              Yes
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-2 opacity-50">Double-tap to view details</p>
    </div>
  );
}
