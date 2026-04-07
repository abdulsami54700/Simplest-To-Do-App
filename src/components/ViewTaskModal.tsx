import { Task } from "@/lib/tasks";
import { format } from "date-fns";
import { X, Clock, CalendarDays, CheckCircle2 } from "lucide-react";

interface Props {
  task: Task | null;
  onClose: () => void;
}

export default function ViewTaskModal({ task, onClose }: Props) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {task.completed && (
              <CheckCircle2 size={20} className="text-primary shrink-0" />
            )}
            <h2 className="text-foreground font-bold text-lg leading-tight">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 ml-2"
          >
            <X size={18} className="text-secondary-foreground" />
          </button>
        </div>

        {task.description && (
          <div className="mb-4">
            <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap break-words">
              {task.description}
            </p>
          </div>
        )}

        <div className="space-y-2 text-xs text-secondary-foreground">
          {task.scheduledTime && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Clock size={14} className="text-primary" />
              <span>Scheduled: {format(new Date(task.scheduledTime), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <CalendarDays size={14} className="text-secondary-foreground" />
            <span>Created: {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          {task.completed && (
            <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
              <CheckCircle2 size={14} className="text-primary" />
              <span className="text-primary font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
