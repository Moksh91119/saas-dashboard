"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Plus,
  XCircle,
} from "lucide-react";

import {
  useCancelSubscription,
  useChangeSubscriptionPlan,
  useCreateSubscription,
  useSubscriptions,
} from "@/hooks/use-subscriptions";
import { useCustomers } from "@/hooks/use-customers";
import { usePlans } from "@/hooks/use-plans";

type StatusFilter = "ALL" | "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";
    case "TRIAL":
      return "bg-blue-50 text-blue-700";
    case "PAST_DUE":
      return "bg-amber-50 text-amber-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "TRIAL") {
    return <Clock3 className="h-3.5 w-3.5" />;
  }

  if (status === "CANCELLED") {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <AlertCircle className="h-3.5 w-3.5" />;
}

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading, isError, error } = useSubscriptions();

  const { data: customersData } = useCustomers({
    page: 1,
    limit: 100,
  });

  const { data: plans } = usePlans();

  const createMutation = useCreateSubscription();
  const cancelMutation = useCancelSubscription();
  const changePlanMutation = useChangeSubscriptionPlan();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "TRIAL">("ACTIVE");

  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);

  const [newPlanId, setNewPlanId] = useState("");

  const customers = customersData?.customers ?? [];

  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions) return [];

    const query = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesStatus =
        statusFilter === "ALL" || subscription.status === statusFilter;

      const matchesSearch =
        !query ||
        subscription.customer.name.toLowerCase().includes(query) ||
        subscription.customer.email.toLowerCase().includes(query) ||
        subscription.customer.companyName?.toLowerCase().includes(query) ||
        subscription.plan.name.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, statusFilter, search]);

  const summary = useMemo(() => {
    const items = subscriptions ?? [];

    return {
      total: items.length,
      active: items.filter((item) => item.status === "ACTIVE").length,
      trial: items.filter((item) => item.status === "TRIAL").length,
      cancelled: items.filter((item) => item.status === "CANCELLED").length,
    };
  }, [subscriptions]);

  function resetCreateForm() {
    setCustomerId("");
    setPlanId("");
    setStatus("ACTIVE");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!customerId || !planId) return;

    await createMutation.mutateAsync({
      customerId,
      planId,
      status,
    });

    resetCreateForm();
    setShowCreate(false);
  }

  async function handleCancel(id: string) {
    const confirmed = window.confirm(
      "Cancel this subscription? This action cannot be undone.",
    );

    if (!confirmed) return;

    await cancelMutation.mutateAsync(id);
  }

  async function handleChangePlan(id: string) {
    if (!newPlanId) return;

    await changePlanMutation.mutateAsync({
      id,
      planId: newPlanId,
    });

    setChangingPlanId(null);
    setNewPlanId("");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your subscriptions.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading subscriptions...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your subscriptions.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "Failed to load subscriptions."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer subscriptions and plans.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New subscription
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total"
          value={summary.total}
          icon={<CreditCard className="h-5 w-5" />}
        />

        <SummaryCard
          label="Active"
          value={summary.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <SummaryCard
          label="Trial"
          value={summary.trial}
          icon={<Clock3 className="h-5 w-5" />}
        />

        <SummaryCard
          label="Cancelled"
          value={summary.cancelled}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, email, company or plan..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 lg:flex-1"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="PAST_DUE">Past due</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No subscriptions found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Period ends</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/customers/${subscription.customer.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {subscription.customer.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {subscription.customer.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {changingPlanId === subscription.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newPlanId}
                            onChange={(e) => setNewPlanId(e.target.value)}
                            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
                          >
                            <option value="">Select plan</option>
                            {(plans ?? [])
                              .filter((plan) => plan.isActive)
                              .map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name}
                                </option>
                              ))}
                          </select>

                          <button
                            onClick={() => handleChangePlan(subscription.id)}
                            disabled={changePlanMutation.isPending}
                            className="text-xs font-medium text-slate-900 hover:underline disabled:opacity-50"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => {
                              setChangingPlanId(null);
                              setNewPlanId("");
                            }}
                            className="text-xs text-slate-500 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-slate-900">
                            {subscription.plan.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {subscription.plan.billingInterval}
                          </p>
                        </>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {formatCurrency(subscription.plan.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                          subscription.status,
                        )}`}
                      >
                        <StatusIcon status={subscription.status} />
                        {subscription.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        {formatDate(subscription.currentPeriodEnd)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/subscriptions/${subscription.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>

                        {subscription.status !== "CANCELLED" && (
                          <>
                            <button
                              onClick={() => {
                                setChangingPlanId(subscription.id);
                                setNewPlanId(subscription.plan.id);
                              }}
                              className="text-xs font-medium text-slate-600 hover:text-slate-900"
                            >
                              Change plan
                            </button>

                            <button
                              onClick={() => handleCancel(subscription.id)}
                              disabled={cancelMutation.isPending}
                              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
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

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                New subscription
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Assign an active plan to a customer.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Customer
                </label>

                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">Select customer</option>

                  {customers
                    .filter((customer) => customer.status === "ACTIVE")
                    .map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} — {customer.email}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Plan
                </label>

                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">Select plan</option>

                  {(plans ?? [])
                    .filter((plan) => plan.isActive)
                    .map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {formatCurrency(plan.price)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "ACTIVE" | "TRIAL")
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="TRIAL">Trial</option>
                </select>
              </div>

              {createMutation.isError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Failed to create subscription."}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetCreateForm();
                    setShowCreate(false);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createMutation.isPending || !customerId || !planId}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
