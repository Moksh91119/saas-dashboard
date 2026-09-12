"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Code2, User } from "lucide-react";

import { useActivity } from "@/hooks/use-activity";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: activity, isLoading, isError, error } = useActivity(id);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading activity...
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="space-y-4">
        <Link
          href="/activity"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to activity
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error instanceof Error ? error.message : "Activity not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/activity"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to activity
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Activity details
          </h1>

          <p className="mt-1 break-all text-sm text-slate-500">{activity.id}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-lg font-semibold text-slate-900">
          {activity.description}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {formatAction(activity.action)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">Details</h2>
          </div>

          <div className="divide-y divide-slate-100">
            <DetailRow
              icon={<User className="h-4 w-4" />}
              label="User"
              value={
                activity.user
                  ? `${activity.user.name} (${activity.user.email})`
                  : "System"
              }
            />

            <DetailRow
              icon={<Code2 className="h-4 w-4" />}
              label="Action"
              value={formatAction(activity.action)}
            />

            <DetailRow
              icon={<Code2 className="h-4 w-4" />}
              label="Entity"
              value={activity.entityType}
            />

            <DetailRow
              icon={<Code2 className="h-4 w-4" />}
              label="Entity ID"
              value={activity.entityId ?? "—"}
            />

            <DetailRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Created"
              value={formatDate(activity.createdAt)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">Metadata</h2>
          </div>

          <div className="p-5">
            {activity.metadata ? (
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-200">
                {JSON.stringify(activity.metadata, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">No metadata available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <span className="max-w-[60%] break-all text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}
