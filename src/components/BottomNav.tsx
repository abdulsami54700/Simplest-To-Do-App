import { ListTodo, History } from "lucide-react";

type Tab = "tasks" | "history";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  historyCount: number;
}

export default function BottomNav({ active, onChange, historyCount }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 safe-area-pb">
      <div className="max-w-md mx-auto flex">
        <button
          onClick={() => onChange("tasks")}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${
            active === "tasks"
              ? "text-primary"
              : "text-secondary-foreground hover:text-foreground"
          }`}
        >
          <ListTodo size={22} />
          <span className="text-[11px] font-semibold">Tasks</span>
          {active === "tasks" && (
            <div className="w-1 h-1 rounded-full bg-primary" />
          )}
        </button>
        <button
          onClick={() => onChange("history")}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all relative ${
            active === "history"
              ? "text-primary"
              : "text-secondary-foreground hover:text-foreground"
          }`}
        >
          <History size={22} />
          <span className="text-[11px] font-semibold">History</span>
          {active === "history" && (
            <div className="w-1 h-1 rounded-full bg-primary" />
          )}
          {historyCount > 0 && (
            <span className="absolute top-1.5 right-1/4 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold px-1">
              {historyCount > 99 ? "99+" : historyCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
