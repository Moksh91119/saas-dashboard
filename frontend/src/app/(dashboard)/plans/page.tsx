"use client";

import { Check, Loader2, Pencil, Plus, Power, X } from "lucide-react";
import { useState } from "react";

import {
  useCreatePlan,
  useDeactivatePlan,
  usePlans,
  useUpdatePlan,
} from "@/hooks/use-plans";
import type { BillingInterval, Plan } from "@/lib/api/plans.api";

type FormData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  billingInterval: BillingInterval;
};

function emptyForm(): FormData {
  return {
    name: "",
    slug: "",
    description: "",
    price: "",
    billingInterval: "MONTHLY",
  };
}

function formatCurrency(price: string, interval: BillingInterval) {
  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));

  return `${value}/${interval === "MONTHLY" ? "mo" : "yr"}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function PlansPage() {
  const plans = usePlans();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deactivateMutation = useDeactivatePlan();

  const [modal, setModal] = useState<"create" | "edit" | null>(null);

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm());
  const [formError, setFormError] = useState("");

  function openCreate() {
    setForm(emptyForm());
    setEditingPlan(null);
    setFormError("");
    setModal("create");
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan);

    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      price: plan.price,
      billingInterval: plan.billingInterval,
    });

    setFormError("");
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditingPlan(null);
    setFormError("");
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const price = Number(form.price);

    if (!form.name.trim()) {
      setFormError("Plan name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setFormError("Slug is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Price must be a non-negative number.");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim() || undefined,
        price,
        billingInterval: form.billingInterval,
      };

      if (modal === "create") {
        await createMutation.mutateAsync(payload);
      } else if (modal === "edit" && editingPlan) {
        await updateMutation.mutateAsync({
          id: editingPlan.id,
          data: payload,
        });
      }

      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  async function handleDeactivate(plan: Plan) {
    const confirmed = window.confirm(`Deactivate the ${plan.name} plan?`);

    if (!confirmed) return;

    try {
      await deactivateMutation.mutateAsync(plan.id);
    } catch {
      window.alert("Failed to deactivate plan.");
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (plans.isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading plans...
        </div>
      </div>
    );
  }

  if (plans.isError) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <p className="font-medium text-red-600">Failed to load plans.</p>
        <p className="mt-1 text-sm text-slate-500">
          Refresh the page and try again.
        </p>
      </div>
    );
  }

  const rows = plans.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plans</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your subscription plans.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Plans</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {rows.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Plans</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {rows.filter((plan) => plan.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Subscriptions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {rows.reduce(
              (total, plan) => total + (plan._count?.subscriptions ?? 0),
              0,
            )}
          </p>
        </div>
      </div>

      {/* Plans table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center">
            <p className="font-medium text-slate-900">No plans found</p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first subscription plan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Price
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subscriptions
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{plan.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {plan.slug}
                      </p>

                      {plan.description && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {plan.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(plan.price, plan.billingInterval)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {plan._count?.subscriptions ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      {plan.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(plan.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(plan)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Edit plan"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {plan.isActive && (
                          <button
                            onClick={() => handleDeactivate(plan)}
                            disabled={deactivateMutation.isPending}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            title="Deactivate plan"
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {modal === "create" ? "Add Plan" : "Edit Plan"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Configure your subscription plan.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {formError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Growth"
                  className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", event.target.value.toLowerCase())
                  }
                  placeholder="growth"
                  className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Lowercase letters, numbers and hyphens only.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={3}
                  placeholder="For growing SaaS businesses."
                  className="mt-1.5 w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    placeholder="79"
                    className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Billing Interval
                  </label>
                  <select
                    value={form.billingInterval}
                    onChange={(event) =>
                      updateField("billingInterval", event.target.value)
                    }
                    className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modal === "create" ? "Create Plan" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
