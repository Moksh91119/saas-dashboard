"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  User,
} from "lucide-react";

import { useTransaction } from "@/hooks/use-transactions";

function formatCurrency(value: string | number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClasses(status: string) {
  switch (status) {
    case "SUCCEEDED":
      return "bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    case "FAILED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: transaction, isLoading, isError, error } = useTransaction(id);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading transaction...
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="space-y-4">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to transactions
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error instanceof Error ? error.message : "Transaction not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to transactions
        </Link>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Transaction</h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                transaction.status,
              )}`}
            >
              {transaction.status}
            </span>
          </div>

          <p className="mt-1 break-all text-sm text-slate-500">
            {transaction.id}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Transaction amount</p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {transaction.type}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Transaction details
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            <DetailRow
              icon={<CreditCard className="h-4 w-4" />}
              label="Type"
              value={transaction.type}
            />

            <DetailRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Status"
              value={transaction.status}
            />

            <DetailRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Occurred"
              value={formatDate(transaction.occurredAt)}
            />

            <DetailRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Created"
              value={formatDate(transaction.createdAt)}
            />

            <DetailRow
              icon={<CreditCard className="h-4 w-4" />}
              label="Currency"
              value={transaction.currency}
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Customer
                </p>

                <Link
                  href={`/customers/${transaction.customer.id}`}
                  className="mt-1 block font-semibold text-slate-900 hover:underline"
                >
                  {transaction.customer.name}
                </Link>

                <p className="mt-1 text-sm text-slate-500">
                  {transaction.customer.email}
                </p>

                {transaction.customer.companyName && (
                  <p className="text-sm text-slate-500">
                    {transaction.customer.companyName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Subscription
                </p>

                {transaction.subscription ? (
                  <>
                    <Link
                      href={`/subscriptions/${transaction.subscription.id}`}
                      className="mt-1 block font-semibold text-slate-900 hover:underline"
                    >
                      {transaction.subscription.plan.name}
                    </Link>

                    <p className="mt-1 text-sm text-slate-500">
                      {transaction.subscription.status}
                    </p>

                    <p className="text-sm text-slate-500">
                      {formatCurrency(
                        transaction.subscription.plan.price,
                        transaction.currency,
                      )}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    No subscription attached
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {transaction.description && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Description</h2>

          <p className="mt-2 text-sm text-slate-600">
            {transaction.description}
          </p>
        </section>
      )}
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
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <span className="text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}
