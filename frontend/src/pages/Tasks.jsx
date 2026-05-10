import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";
import useAuth from "../hooks/useAuth";
import { getErrorMessage, roleLabel, statusLabel } from "../utils/helpers";

const emptyForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  assignedToId: "",
  projectId: ""
};

export default function Tasks() {
  const { user, canCreateTasks, canLeadWork } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const tasks = useQuery({ queryKey: ["tasks", status], queryFn: async () => (await api.get("/tasks", { params: { status: status || undefined } })).data });
  const projects = useQuery({ queryKey: ["projects"], queryFn: async () => (await api.get("/projects")).data });

  const projectMembers = useMemo(() => {
    const project = projects.data?.find((item) => item.id === form.projectId);
    const members = project?.members?.map((member) => member.user) || [];
    return canLeadWork ? members : members.filter((member) => member.id === user?.id);
  }, [projects.data, form.projectId, canLeadWork, user?.id]);

  const createTask = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        assignedToId: canLeadWork ? form.assignedToId : user.id,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
      };
      return (await api.post("/tasks", payload)).data;
    },
    onSuccess: () => {
      setForm(emptyForm);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-tasks"] });
    },
    onError: (err) => setError(getErrorMessage(err))
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, nextStatus }) => (await api.patch(`/tasks/${id}/status`, { status: nextStatus })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-tasks"] });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (id) => (await api.delete(`/tasks/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });

  function handleProjectChange(projectId) {
    const nextMembers = projects.data?.find((item) => item.id === projectId)?.members?.map((member) => member.user) || [];
    const defaultAssignee = canLeadWork ? "" : nextMembers.find((member) => member.id === user?.id)?.id || "";
    setForm({ ...form, projectId, assignedToId: defaultAssignee });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-ink">Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">Assign work, filter status, and keep progress current.</p>
        </div>
        <select className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="TODO">{statusLabel("TODO")}</option>
          <option value="IN_PROGRESS">{statusLabel("IN_PROGRESS")}</option>
          <option value="DONE">{statusLabel("DONE")}</option>
        </select>
      </div>

      {canCreateTasks && (
        <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={(event) => { event.preventDefault(); createTask.mutate(); }}>
          <h3 className="font-semibold text-ink">Create task</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select className="focus-ring rounded-md border border-slate-200 px-3 py-2" value={form.projectId} onChange={(e) => handleProjectChange(e.target.value)} required>
              <option value="">Project</option>
              {projects.data?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <select className="focus-ring rounded-md border border-slate-200 px-3 py-2" value={canLeadWork ? form.assignedToId : user?.id || ""} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} disabled={!canLeadWork} required>
              <option value="">Assignee</option>
              {projectMembers.map((member) => <option key={member.id} value={member.id}>{member.name} ({roleLabel(member.role)})</option>)}
            </select>
            <select className="focus-ring rounded-md border border-slate-200 px-3 py-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md bg-moss px-4 py-2 font-semibold text-white hover:bg-moss/90" disabled={createTask.isPending}>
            <Plus size={18} />
            Create task
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>
      )}

      {tasks.isLoading ? (
        <p className="text-sm text-slate-500">Loading tasks...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tasks.data?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={(id, nextStatus) => updateStatus.mutate({ id, nextStatus })}
              onDelete={(id) => deleteTask.mutate(id)}
            />
          ))}
          {!tasks.data?.length && <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">No tasks match this filter.</p>}
        </div>
      )}
    </div>
  );
}
