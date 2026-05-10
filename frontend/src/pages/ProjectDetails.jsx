import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";
import useAuth from "../hooks/useAuth";
import { getErrorMessage, roleLabel } from "../utils/helpers";

export default function ProjectDetails() {
  const { key } = useParams();
  const { canManageProjects } = useAuth();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  const project = useQuery({ queryKey: ["project", key], queryFn: async () => (await api.get(`/projects/${key}`)).data });
  const users = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get("/users")).data, enabled: canManageProjects });

  const addMember = useMutation({
    mutationFn: async () => (await api.post(`/projects/${id}/members`, { userId })).data,
    onSuccess: () => {
      setUserId("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["project", key] });
    },
    onError: (err) => setError(getErrorMessage(err))
  });

  const removeMember = useMutation({
    mutationFn: async (memberId) => (await api.delete(`/projects/${key}/members/${memberId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", key] })
  });

  const updateStatus = useMutation({
    mutationFn: async ({ taskId, status }) => (await api.patch(`/tasks/${taskId}/status`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", key] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-tasks"] });
    },
    onError: (err) => setError(getErrorMessage(err))
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId) => (await api.delete(`/tasks/${taskId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", key] }),
    onError: (err) => setError(getErrorMessage(err))
  });

  if (project.isLoading) return <p className="text-sm text-slate-500">Loading project...</p>;

  const data = project.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">{data.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{data.description || "No description provided."}</p>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-ink">Tasks</h3>
          <div className="grid gap-4">
            {data.tasks?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(taskId, status) => updateStatus.mutate({ taskId, status })}
                onDelete={(taskId) => deleteTask.mutate(taskId)}
              />
            ))}
            {!data.tasks?.length && <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">No tasks yet.</p>}
          </div>
        </div>

        <aside className="space-y-4">
          {canManageProjects && (
            <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={(event) => { event.preventDefault(); addMember.mutate(); }}>
              <h3 className="font-semibold text-ink">Add member</h3>
              <select className="focus-ring mt-3 w-full rounded-md border border-slate-200 px-3 py-2" value={userId} onChange={(e) => setUserId(e.target.value)} required>
                <option value="">Select user</option>
                {users.data?.map((user) => <option key={user.id} value={user.id}>{user.name} ({roleLabel(user.role)})</option>)}
              </select>
              <button className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-moss px-4 py-2 font-semibold text-white hover:bg-moss/90">
                <Plus size={18} />
                Add
              </button>
            </form>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-ink">Members</h3>
            <div className="mt-3 space-y-3">
              {data.members?.map((member) => (
                <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3" key={member.id}>
                  <div>
                    <p className="text-sm font-medium text-ink">{member.user.name}</p>
                    <p className="text-xs text-slate-500">{member.user.email} - {roleLabel(member.user.role)}</p>
                  </div>
                  {canManageProjects && (
                    <button className="focus-ring rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => removeMember.mutate(member.id)} aria-label="Remove member">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
