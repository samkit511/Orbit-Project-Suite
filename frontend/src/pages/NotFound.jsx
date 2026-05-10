import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <h2 className="text-3xl font-bold text-ink">Page not found</h2>
        <p className="mt-2 text-slate-500">The page you requested does not exist.</p>
        <Link className="mt-5 inline-flex rounded-md bg-moss px-4 py-2 font-semibold text-white" to="/">Back to dashboard</Link>
      </div>
    </div>
  );
}
