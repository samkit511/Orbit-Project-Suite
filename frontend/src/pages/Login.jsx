import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/helpers";

const testAccounts = [
  ["Admin", "admin@example.com"],
  ["Manager", "manager@example.com"],
  ["Project Lead", "pl@example.com"],
  ["QA Lead", "ql@example.com"],
  ["Developer", "developer@example.com"],
  ["Intern", "intern@example.com"],
  ["Member", "member@example.com"]
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-ink">Sign in</h1>
        <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Test Credentials (Password: Password123):</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {testAccounts.map(([role, email]) => (
              <li key={email}>
                {role}: <span className="font-mono">{email}</span>
              </li>
            ))}
          </ul>
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mt-5 block text-sm font-medium text-slate-700">
          Email
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="focus-ring mt-6 w-full rounded-md bg-moss px-4 py-2 font-semibold text-white hover:bg-moss/90" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here? <Link className="font-semibold text-moss" to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
