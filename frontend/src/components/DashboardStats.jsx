import { AlertTriangle, CheckCircle2, Clock, FolderKanban, ListTodo, Percent } from "lucide-react";

const icons = {
  totalTasks: ListTodo,
  completedTasks: CheckCircle2,
  pendingTasks: Clock,
  overdueTasks: AlertTriangle,
  totalProjects: FolderKanban,
  progress: Percent
};

export default function DashboardStats({ stats }) {
  const cards = [
    ["totalTasks", "Total tasks", stats?.totalTasks ?? 0],
    ["completedTasks", "Completed", stats?.completedTasks ?? 0],
    ["pendingTasks", "Pending", stats?.pendingTasks ?? 0],
    ["overdueTasks", "Overdue", stats?.overdueTasks ?? 0],
    ["totalProjects", "Projects", stats?.totalProjects ?? 0],
    ["progress", "Progress", `${stats?.progress ?? 0}%`]
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([key, label, value]) => {
        const Icon = icons[key];
        return (
          <div key={key} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon className="text-moss" size={20} />
            </div>
            <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
          </div>
        );
      })}
    </section>
  );
}
