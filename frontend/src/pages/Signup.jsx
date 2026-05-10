import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/helpers";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
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
        <h1 className="text-2xl font-bold text-ink">Create account</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mt-5 block text-sm font-medium text-slate-700">
          Name
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Email
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Confirm password
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
        </label>
        <button className="focus-ring mt-6 w-full rounded-md bg-moss px-4 py-2 font-semibold text-white hover:bg-moss/90" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link className="font-semibold text-moss" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

