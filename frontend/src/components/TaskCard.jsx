import { Trash2 } from "lucide-react";
import { formatDate, priorityClass, statusLabel } from "../utils/helpers";
import useAuth from "../hooks/useAuth";

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const { canLeadWork, user } = useAuth();
  const canChange = canLeadWork || task.assignedTo?.id === user?.id;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{task.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{task.description || "No description."}</p>
        </div>
        {canLeadWork && (
          <button className="focus-ring rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete?.(task.id)} aria-label="Delete task">
            <Trash2 size={17} />
          </button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <span className={`rounded-full px-2.5 py-1 ${priorityClass(task.priority)}`}>{task.priority}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{task.project?.name}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{formatDate(task.dueDate)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Assigned to {task.assignedTo?.name || "Unassigned"}</p>
        <select
          className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          value={task.status}
          disabled={!canChange}
          onChange={(event) => onStatusChange?.(task.id, event.target.value)}
        >
          <option value="TODO">{statusLabel("TODO")}</option>
          <option value="IN_PROGRESS">{statusLabel("IN_PROGRESS")}</option>
          <option value="DONE">{statusLabel("DONE")}</option>
        </select>
      </div>
    </article>
  );
}



