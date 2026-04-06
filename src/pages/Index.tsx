import { useState, useCallback, useMemo } from "react";
import { Task, loadTasks, saveTasks, createTask } from "@/lib/tasks";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";
import TaskCard from "@/components/TaskCard";
import HistoryCard from "@/components/HistoryCard";
import AddTaskModal from "@/components/AddTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import ViewTaskModal from "@/components/ViewTaskModal";
import BottomNav from "@/components/BottomNav";
import { Plus, ClipboardList, Archive, Search, Sun, Moon } from "lucide-react";

type Tab = "tasks" | "history";

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [tab, setTab] = useState<Tab>("tasks");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggle: toggleTheme } = useTheme();

  useNotifications(tasks, setTasks);

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((t) => !t.completed)
        .filter(
          (t) =>
            !searchQuery ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (a.scheduledTime && b.scheduledTime) return a.scheduledTime - b.scheduledTime;
          if (a.scheduledTime) return -1;
          if (b.scheduledTime) return 1;
          return b.createdAt - a.createdAt;
        }),
    [tasks, searchQuery]
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.completed)
        .filter(
          (t) =>
            !searchQuery ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [tasks, searchQuery]
  );

  const handleAdd = useCallback(
    (title: string, description: string, scheduledTime: number | null) => {
      const task = createTask(title, description, scheduledTime);
      setTasks((prev) => {
        const next = [...prev, task];
        saveTasks(next);
        return next;
      });
    },
    []
  );

  const handleComplete = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, completed: true } : t
      );
      saveTasks(next);
      return next;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTasks(next);
      return next;
    });
  }, []);

  const handleEdit = useCallback(
    (id: string, title: string, description: string, scheduledTime: number | null) => {
      setTasks((prev) => {
        const next = prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: title.slice(0, 50),
                description: description.slice(0, 1000),
                scheduledTime,
                notified: scheduledTime !== t.scheduledTime ? false : t.notified,
              }
            : t
        );
        saveTasks(next);
        return next;
      });
    },
    []
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-20">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                To Do List
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTasks.length} active task{activeTasks.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-foreground" />
              ) : (
                <Moon size={18} className="text-foreground" />
              )}
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {tab === "tasks" ? (
          activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-secondary-foreground">
              <ClipboardList size={48} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">
                {searchQuery ? "No matching tasks" : "No tasks yet"}
              </p>
              {!searchQuery && (
                <p className="text-xs mt-1 opacity-60">Tap + to add one</p>
              )}
            </div>
          ) : (
            activeTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onComplete={handleComplete}
                onEdit={(task) => setEditingTask(task)}
                onView={(task) => setViewingTask(task)}
              />
            ))
          )
        ) : completedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary-foreground">
            <Archive size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {searchQuery ? "No matching tasks" : "No completed tasks"}
            </p>
          </div>
        ) : (
          completedTasks.map((t) => (
            <HistoryCard
              key={t.id}
              task={t}
              onDelete={handleDelete}
              onView={(task) => setViewingTask(task)}
            />
          ))
        )}
      </main>

      {tab === "tasks" && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:brightness-110 active:scale-90 transition-all"
          aria-label="Add task"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAdd}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEdit}
      />

      <ViewTaskModal
        task={viewingTask}
        onClose={() => setViewingTask(null)}
      />

      <BottomNav
        active={tab}
        onChange={setTab}
        historyCount={completedTasks.length}
      />
    </div>
  );
}
