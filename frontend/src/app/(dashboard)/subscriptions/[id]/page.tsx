"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import {
  useCancelSubscription,
  useChangeSubscriptionPlan,
  useSubscription,
} from "@/hooks/use-subscriptions";
import { usePlans } from "@/hooks/use-plans";

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
    hour: "numeric",
    minute: "2-digit",
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

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: subscription, isLoading, isError, error } = useSubscription(id);

  const { data: plans } = usePlans();

  const cancelMutation = useCancelSubscription();
  const changePlanMutation = useChangeSubscriptionPlan();

  const [showPlanChange, setShowPlanChange] = useState(false);
  const [newPlanId, setNewPlanId] = useState("");

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading subscription...
      </div>
    );
  }

  if (isError || !subscription) {
    return (
      <div className="space-y-4">
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subscriptions
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error instanceof Error ? error.message : "Subscription not found."}
        </div>
      </div>
    );
  }

  const subscriptionId = subscription.id;

  async function handleCancel() {
    const confirmed = window.confirm(
      "Cancel this subscription? This action cannot be undone.",
    );

    if (!confirmed) return;

    await cancelMutation.mutateAsync(subscriptionId);
  }

  async function handlePlanChange() {
    if (!newPlanId) return;

    await changePlanMutation.mutateAsync({
      id: subscriptionId,
      planId: newPlanId,
    });

    setShowPlanChange(false);
    setNewPlanId("");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subscriptions
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Subscription
              </h1>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                  subscription.status,
                )}`}
              >
                {subscription.status.replace("_", " ")}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">{subscription.id}</p>
          </div>

          {subscription.status !== "CANCELLED" && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewPlanId(subscription.plan.id);
                  setShowPlanChange(true);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Change plan
              </button>

              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isPending
                  ? "Cancelling..."
                  : "Cancel subscription"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Customer"
          value={subscription.customer.name}
          secondary={subscription.customer.email}
          href={`/customers/${subscription.customer.id}`}
        />

        <InfoCard
          label="Plan"
          value={subscription.plan.name}
          secondary={`${formatCurrency(subscription.plan.price)} / ${subscription.plan.billingInterval.toLowerCase()}`}
        />

        <InfoCard
          label="Subscription ID"
          value={subscription.id}
          secondary="Internal identifier"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Subscription timeline
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            <TimelineRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Started"
              value={formatDate(subscription.startedAt)}
            />

            <TimelineRow
              icon={<Clock3 className="h-4 w-4" />}
              label="Current period started"
              value={formatDate(subscription.currentPeriodStart)}
            />

            <TimelineRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Current period ends"
              value={formatDate(subscription.currentPeriodEnd)}
            />

            <TimelineRow
              icon={<Clock3 className="h-4 w-4" />}
              label="Trial ends"
              value={formatDate(subscription.trialEndsAt)}
            />

            <TimelineRow
              icon={<XCircle className="h-4 w-4" />}
              label="Cancelled"
              value={formatDate(subscription.cancelledAt)}
            />

            <TimelineRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Ended"
              value={formatDate(subscription.endedAt)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">Transactions</h2>
          </div>

          {subscription.transactions?.length ? (
            <div className="divide-y divide-slate-100">
              {subscription.transactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/transactions/${transaction.id}`}
                  className="flex items-center justify-between p-5 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.description || transaction.type}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(transaction.occurredAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(transaction.amount)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No transactions for this subscription.
            </div>
          )}
        </section>
      </div>

      {showPlanChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Change plan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a new active plan for this subscription.
            </p>

            <select
              value={newPlanId}
              onChange={(e) => setNewPlanId(e.target.value)}
              className="mt-5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
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

            {changePlanMutation.isError && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {changePlanMutation.error instanceof Error
                  ? changePlanMutation.error.message
                  : "Failed to change plan."}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowPlanChange(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handlePlanChange}
                disabled={!newPlanId || changePlanMutation.isPending}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {changePlanMutation.isPending ? "Saving..." : "Change plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
  secondary,
  href,
}: {
  label: string;
  value: string;
  secondary: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{secondary}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {content}
    </div>
  );
}

function TimelineRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
