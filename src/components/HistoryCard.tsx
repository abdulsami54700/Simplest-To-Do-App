import { Task } from "@/lib/tasks";
import { format } from "date-fns";
import { Trash2, Clock, CheckCircle2 } from "lucide-react";
import { useCallback, useRef } from "react";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  onView: (task: Task) => void;
}

export default function HistoryCard({ task, onDelete, onView }: Props) {
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

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(task.id);
    },
    [onDelete, task.id]
  );

  return (
    <div
      className="bg-card rounded-2xl p-4 mb-3 shadow-md border border-border/50 cursor-pointer active:scale-[0.98] transition-all"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm line-through opacity-70">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-secondary-foreground text-xs mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
          {task.scheduledTime && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-secondary-foreground">
              <Clock size={12} />
              <span>{format(new Date(task.scheduledTime), "MMM d, h:mm a")}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl hover:bg-destructive/20 text-destructive transition-colors shrink-0"
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 opacity-50">Double-tap to view details</p>
    </div>
  );
}
