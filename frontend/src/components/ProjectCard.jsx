import { ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description || "No description provided."}</p>
        </div>
        <Link to={`/projects/${project.slug || project.id}`} className="focus-ring rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label={`Open ${project.name}`}>
          <ArrowRight size={18} />
        </Link>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>{project.tasks?.length || 0} tasks</span>
        <span className="flex items-center gap-2">
          <Users size={16} />
          {project.members?.length || 0}
        </span>
      </div>
    </article>
  );
}

