"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { use } from "react";

import { useCustomer, useUpdateCustomer } from "@/hooks/use-customers";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function statusClass(status: string) {
  if (status === "ACTIVE" || status === "SUCCEEDED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "CANCELLED" || status === "PAST_DUE") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const customer = useCustomer(id);
  const updateMutation = useUpdateCustomer();

  if (customer.isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading customer...
        </div>
      </div>
    );
  }

  if (customer.isError || !customer.data) {
    return (
      <div className="space-y-4">
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>

        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-900">Customer not found</h2>
          <p className="mt-1 text-sm text-slate-500">
            This customer may no longer exist.
          </p>
        </div>
      </div>
    );
  }

  const data = customer.data;

  async function toggleStatus() {
    await updateMutation.mutateAsync({
      id: data.id,
      data: {
        status: data.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <User className="h-6 w-6 text-slate-600" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{data.name}</h1>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                  data.status,
                )}`}
              >
                {data.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">{data.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleStatus}
            disabled={updateMutation.isPending}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {data.status === "ACTIVE" ? "Mark Inactive" : "Mark Active"}
          </button>
        </div>
      </div>

      {/* Customer information */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Email</span>
          </div>
          <p className="mt-3 truncate text-sm font-medium text-slate-900">
            {data.email}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Company</span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {data.companyName || "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Country</span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {data.country || "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Joined</span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {formatDate(data.joinedAt)}
          </p>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-slate-600" />
            <h2 className="font-semibold text-slate-900">Subscriptions</h2>
          </div>
        </div>

        {data.subscriptions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No subscriptions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Price
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Started
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Period End
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {subscription.plan.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {subscription.plan.billingInterval}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {formatCurrency(subscription.plan.price, "USD")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          subscription.status,
                        )}`}
                      >
                        {subscription.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(subscription.startedAt)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(subscription.currentPeriodEnd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-slate-600" />
            <h2 className="font-semibold text-slate-900">Transactions</h2>
          </div>
        </div>

        {data.transactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No transactions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Description
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(transaction.occurredAt)}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {transaction.type}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          transaction.status,
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {transaction.description || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
