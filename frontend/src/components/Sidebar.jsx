import { BarChart3, FolderKanban, ListTodo } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: ListTodo }
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0`}>
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <span className="text-xl font-bold text-ink">Ethara Tasks</span>
      </div>
      <nav className="space-y-1 p-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-moss text-white" : "text-slate-600 hover:bg-slate-100"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
