import { LogOut, Menu } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { roleLabel } from "../utils/helpers";

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <button className="focus-ring rounded-md p-2 lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div>
          <p className="text-sm text-slate-500">Team Task Manager</p>
          <h1 className="text-lg font-semibold text-ink">Workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs uppercase text-slate-500">{roleLabel(user?.role)}</p>
          </div>
          <button className="focus-ring rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" onClick={logout} aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

