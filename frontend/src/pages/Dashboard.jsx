import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import DashboardStats from "../components/DashboardStats";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: async () => (await api.get("/dashboard/stats")).data });
  const recent = useQuery({ queryKey: ["recent-tasks"], queryFn: async () => (await api.get("/dashboard/recent")).data });

  const updateStatus = useMutation({
    mutationFn: async ({ taskId, status }) => (await api.patch(`/tasks/${taskId}/status`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (err) => console.error("Status update failed:", err)
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Track project progress, overdue work, and recent activity.</p>
      </div>
      <DashboardStats stats={stats.data} />
      <section>
        <h3 className="mb-3 text-lg font-semibold text-ink">Recent tasks</h3>
        {recent.isLoading && <p className="text-sm text-slate-500">Loading recent tasks...</p>}
        <div className="grid gap-4 lg:grid-cols-2">
          {recent.data?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={(taskId, status) => updateStatus.mutate({ taskId, status })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
