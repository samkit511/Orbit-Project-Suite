import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/helpers";

export default function Projects() {
  const { canManageProjects } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const projects = useQuery({ queryKey: ["projects"], queryFn: async () => (await api.get("/projects")).data });

  const createProject = useMutation({
    mutationFn: async () => (await api.post("/projects", form)).data,
    onSuccess: () => {
      setForm({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err) => setError(getErrorMessage(err))
  });

  const filtered = useMemo(() => {
    return (projects.data || []).filter((project) => project.name.toLowerCase().includes(search.toLowerCase()));
  }, [projects.data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-ink">Projects</h2>
          <p className="mt-1 text-sm text-slate-500">Create projects, manage members, and review workstreams.</p>
        </div>
        <label className="relative block md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="focus-ring w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-3" placeholder="Search projects" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      {canManageProjects && (
        <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={(event) => { event.preventDefault(); createProject.mutate(); }}>
          <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
            <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-moss px-4 py-2 font-semibold text-white hover:bg-moss/90" disabled={createProject.isPending}>
              <Plus size={18} />
              Create
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>
      )}

      {projects.isLoading ? (
        <p className="text-sm text-slate-500">Loading projects...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </div>
  );
}

