"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Plus,
  Search,
} from "lucide-react";

import {
  useCreateTransaction,
  useTransactions,
} from "@/hooks/use-transactions";
import { useCustomers } from "@/hooks/use-customers";
import { useSubscriptions } from "@/hooks/use-subscriptions";

type StatusFilter = "ALL" | "SUCCEEDED" | "PENDING" | "FAILED";
type TypeFilter = "ALL" | "CHARGE" | "REFUND" | "CREDIT";

function formatCurrency(value: string | number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatDate(value: string) {
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

function typeClasses(type: string) {
  switch (type) {
    case "REFUND":
      return "text-red-600";
    case "CREDIT":
      return "text-blue-600";
    default:
      return "text-emerald-600";
  }
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");
  const [customerId, setCustomerId] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const filters = useMemo(
    () => ({
      page,
      limit: 10,
      ...(search ? { search } : {}),
      ...(status !== "ALL" ? { status } : {}),
      ...(type !== "ALL" ? { type } : {}),
      ...(customerId ? { customerId } : {}),
    }),
    [page, search, status, type, customerId],
  );

  const { data, isLoading, isFetching, isError, error } =
    useTransactions(filters);

  const { data: customersData } = useCustomers({
    page: 1,
    limit: 100,
  });

  const { data: subscriptions } = useSubscriptions();

  const createMutation = useCreateTransaction();

  const customers = customersData?.customers ?? [];

  const [form, setForm] = useState({
    customerId: "",
    subscriptionId: "",
    amount: "",
    currency: "USD",
    type: "CHARGE" as "CHARGE" | "REFUND" | "CREDIT",
    status: "SUCCEEDED" as "SUCCEEDED" | "PENDING" | "FAILED",
    description: "",
  });

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("ALL");
    setType("ALL");
    setCustomerId("");
    setPage(1);
  }

  function resetForm() {
    setForm({
      customerId: "",
      subscriptionId: "",
      amount: "",
      currency: "USD",
      type: "CHARGE",
      status: "SUCCEEDED",
      description: "",
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!form.customerId || !form.amount) return;

    await createMutation.mutateAsync({
      customerId: form.customerId,
      subscriptionId: form.subscriptionId || null,
      amount: Number(form.amount),
      currency: form.currency,
      type: form.type,
      status: form.status,
      ...(form.description ? { description: form.description } : {}),
    });

    resetForm();
    setShowCreate(false);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader onCreate={() => setShowCreate(true)} />

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading transactions...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader onCreate={() => setShowCreate(true)} />

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "Failed to load transactions."}
        </div>
      </div>
    );
  }

  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader onCreate={() => setShowCreate(true)} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row">
          <form onSubmit={applySearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search customer, email or company..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Search
            </button>
          </form>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as TypeFilter);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All types</option>
            <option value="CHARGE">Charge</option>
            <option value="REFUND">Refund</option>
            <option value="CREDIT">Credit</option>
          </select>

          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All customers</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          {(search || status !== "ALL" || type !== "ALL" || customerId) && (
            <button
              onClick={resetFilters}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>

        {isFetching && (
          <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400">
            Updating...
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No transactions found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters or create a transaction.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Subscription</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <Link
                          href={`/customers/${transaction.customer.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {transaction.customer.name}
                        </Link>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {transaction.customer.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold ${typeClasses(
                            transaction.type,
                          )}`}
                        >
                          {transaction.type === "REFUND"
                            ? "-"
                            : transaction.type === "CREDIT"
                              ? "+"
                              : ""}
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {transaction.type}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {transaction.subscription ? (
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {transaction.subscription.plan.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {transaction.subscription.status}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No subscription
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(transaction.occurredAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/transactions/${transaction.id}`}
                          className="text-xs font-medium text-slate-700 hover:text-slate-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              New transaction
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a transaction for a customer.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Customer
                </label>

                <select
                  required
                  value={form.customerId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      customerId: e.target.value,
                      subscriptionId: "",
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">Select customer</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} — {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Subscription
                </label>

                <select
                  value={form.subscriptionId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      subscriptionId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">No subscription</option>

                  {(subscriptions ?? [])
                    .filter(
                      (subscription) =>
                        subscription.customerId === form.customerId,
                    )
                    .map((subscription) => (
                      <option key={subscription.id} value={subscription.id}>
                        {subscription.plan.name} — {subscription.status}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Amount
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        amount: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Currency
                  </label>

                  <input
                    required
                    maxLength={3}
                    value={form.currency}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        currency: e.target.value.toUpperCase().slice(0, 3),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        type: e.target.value as "CHARGE" | "REFUND" | "CREDIT",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="CHARGE">Charge</option>
                    <option value="REFUND">Refund</option>
                    <option value="CREDIT">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        status: e.target.value as
                          | "SUCCEEDED"
                          | "PENDING"
                          | "FAILED",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="SUCCEEDED">Succeeded</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  placeholder="Optional description"
                />
              </div>

              {createMutation.isError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Failed to create transaction."}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreate(false);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || !form.customerId || !form.amount
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage financial transactions.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        New transaction
      </button>
    </div>
  );
}
