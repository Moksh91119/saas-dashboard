"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { register } from "@/lib/api/auth.api";
import { useAuth } from "@/lib/auth/AuthContext";
import { getApiErrorMessage } from "@/lib/api/error";

export default function RegisterPage() {
  const router = useRouter();
  const { login: authenticate } = useAuth();

  const [form, setForm] = useState({
    organizationName: "",
    organizationSlug: "",
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await register(form);

      authenticate(data);
      router.replace("/dashboard");
    } catch (error) {
      setError(getApiErrorMessage(error, "Unable to sign in"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create an organization and your admin account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Organization name
            </label>

            <input
              required
              value={form.organizationName}
              onChange={(e) => updateField("organizationName", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Organization slug
            </label>

            <input
              required
              value={form.organizationSlug}
              onChange={(e) =>
                updateField("organizationSlug", e.target.value.toLowerCase())
              }
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
              placeholder="acme"
            />

            <p className="mt-1 text-xs text-slate-400">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Your name
            </label>

            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-slate-900 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
