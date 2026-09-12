"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity as ActivityIcon,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CirclePlus,
  CircleX,
  Eye,
} from "lucide-react";

import { useActivities } from "@/hooks/use-activity";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
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

function getActionStyle(action: string) {
  if (action.includes("CREATED")) {
    return {
      wrapper: "bg-emerald-50 text-emerald-700",
      icon: CirclePlus,
    };
  }

  if (action.includes("CANCELLED") || action.includes("DELETED")) {
    return {
      wrapper: "bg-red-50 text-red-700",
      icon: CircleX,
    };
  }

  if (action.includes("FAILED") || action.includes("ERROR")) {
    return {
      wrapper: "bg-red-50 text-red-700",
      icon: CircleAlert,
    };
  }

  if (action.includes("UPDATED") || action.includes("CHANGED")) {
    return {
      wrapper: "bg-blue-50 text-blue-700",
      icon: CircleCheck,
    };
  }

  return {
    wrapper: "bg-slate-100 text-slate-600",
    icon: ActivityIcon,
  };
}

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [userId, setUserId] = useState("");

  const filters = useMemo(
    () => ({
      page,
      limit: 20,
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
      ...(userId ? { userId } : {}),
    }),
    [page, action, entityType, userId],
  );

  const { data, isLoading, isFetching, isError, error } =
    useActivities(filters);

  const users = useMemo(() => {
    const map = new Map<string, string>();

    for (const activity of data?.activities ?? []) {
      if (activity.user) {
        map.set(activity.user.id, activity.user.name);
      }
    }

    return Array.from(map.entries());
  }, [data?.activities]);

  const activities = data?.activities ?? [];
  const pagination = data?.pagination;

  function clearFilters() {
    setAction("");
    setEntityType("");
    setUserId("");
    setPage(1);
  }

  const hasFilters = Boolean(action || entityType || userId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading activity...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader />

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error instanceof Error ? error.message : "Failed to load activity."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row">
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All entities</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="TRANSACTION">Transaction</option>
            <option value="PLAN">Plan</option>
          </select>

          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All actions</option>
            <option value="CUSTOMER_CREATED">Customer created</option>
            <option value="CUSTOMER_UPDATED">Customer updated</option>
            <option value="CUSTOMER_DELETED">Customer deleted</option>
            <option value="SUBSCRIPTION_CREATED">Subscription created</option>
            <option value="SUBSCRIPTION_PLAN_CHANGED">
              Subscription plan changed
            </option>
            <option value="SUBSCRIPTION_CANCELLED">
              Subscription cancelled
            </option>
            <option value="TRANSACTION_CREATED">Transaction created</option>
            <option value="PLAN_CREATED">Plan created</option>
            <option value="PLAN_UPDATED">Plan updated</option>
          </select>

          <select
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All users</option>

            {users.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {isFetching && (
          <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400">
            Updating...
          </div>
        )}

        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <ActivityIcon className="mx-auto h-9 w-9 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No activity found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Activity will appear here as actions happen in your organization.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => {
                const style = getActionStyle(activity.action);
                const Icon = style.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex gap-4 p-5 hover:bg-slate-50"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.wrapper}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {activity.description}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span>{formatAction(activity.action)}</span>

                            <span>·</span>

                            <span>{activity.entityType}</span>

                            {activity.user && (
                              <>
                                <span>·</span>
                                <span>{activity.user.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {formatDate(activity.createdAt)}
                          </span>

                          <Link
                            href={`/activity/${activity.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} ·{" "}
                  {pagination.total} total
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Activity</h1>

      <p className="mt-1 text-sm text-slate-500">
        Track actions and changes across your organization.
      </p>
    </div>
  );
}
