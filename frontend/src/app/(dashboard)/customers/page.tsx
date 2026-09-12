"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  useCreateCustomer,
  useDeleteCustomer,
  useCustomers,
  useUpdateCustomer,
} from "@/hooks/use-customers";
import type { Customer, CustomerStatus } from "@/lib/api/customers.api";

type FormData = {
  name: string;
  email: string;
  companyName: string;
  country: string;
};

const countries = [
  "Australia",
  "France",
  "Germany",
  "India",
  "United Kingdom",
  "United States",
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function statusClass(status: CustomerStatus) {
  return status === "ACTIVE"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-600";
}

function emptyForm(): FormData {
  return {
    name: "",
    email: "",
    companyName: "",
    country: "",
  };
}

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "">("");
  const [country, setCountry] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "joinedAt" | "createdAt">(
    "joinedAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm());
  const [formError, setFormError] = useState("");

  const customers = useCustomers({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    country: country || undefined,
    sortBy,
    sortOrder,
  });

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const data = customers.data;
  const rows = data?.customers ?? [];
  const pagination = data?.pagination;

  function updateForm(field: keyof FormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreate() {
    setForm(emptyForm());
    setEditingCustomer(null);
    setFormError("");
    setModal("create");
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      companyName: customer.companyName ?? "",
      country: customer.country ?? "",
    });
    setFormError("");
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditingCustomer(null);
    setFormError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    try {
      if (modal === "create") {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          email: form.email.trim(),
          companyName: form.companyName.trim() || undefined,
          country: form.country.trim() || undefined,
        });
      }

      if (modal === "edit" && editingCustomer) {
        await updateMutation.mutateAsync({
          id: editingCustomer.id,
          data: {
            name: form.name.trim(),
            email: form.email.trim(),
            companyName: form.companyName.trim() || undefined,
            country: form.country.trim() || undefined,
          },
        });
      }

      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      setFormError(message);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(`Deactivate ${customer.name}?`);

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(customer.id);
    } catch {
      window.alert("Failed to deactivate customer.");
    }
  }

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearch("");
    setSearchInput("");
    setStatus("");
    setCountry("");
    setSortBy("joinedAt");
    setSortOrder("desc");
    setPage(1);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your customers.</p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form onSubmit={applySearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search customers..."
                className="w-full rounded-lg border px-9 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Search
            </button>
          </form>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as CustomerStatus | "");
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="">All countries</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(event) => {
              const [field, order] = event.target.value.split("-");

              setSortBy(field as "name" | "joinedAt" | "createdAt");
              setSortOrder(order as "asc" | "desc");
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="joinedAt-desc">Newest</option>
            <option value="joinedAt-asc">Oldest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="createdAt-desc">Recently created</option>
            <option value="createdAt-asc">Oldest created</option>
          </select>

          <button
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {customers.isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading customers...
            </div>
          </div>
        ) : customers.isError ? (
          <div className="flex h-80 items-center justify-center text-sm text-red-600">
            Failed to load customers.
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center">
            <p className="font-medium text-slate-900">No customers found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Company
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Country
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {rows.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {customer.name}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {customer.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {customer.companyName || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {customer.country || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            customer.status,
                          )}`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(customer.joinedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="View customer"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => openEdit(customer)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Edit customer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {customer.status === "ACTIVE" && (
                            <button
                              onClick={() => handleDelete(customer)}
                              disabled={deleteMutation.isPending}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              title="Deactivate customer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between border-t px-5 py-4">
                <p className="text-sm text-slate-500">
                  {pagination.total === 0
                    ? "0 customers"
                    : `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )} of ${pagination.total}`}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-2 text-sm text-slate-600">
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </span>

                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {modal === "create" ? "Add Customer" : "Edit Customer"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {modal === "create"
                    ? "Create a new customer account."
                    : "Update customer information."}
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
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Company
                </label>
                <input
                  value={form.companyName}
                  onChange={(event) =>
                    updateForm("companyName", event.target.value)
                  }
                  className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  value={form.country}
                  onChange={(event) =>
                    updateForm("country", event.target.value)
                  }
                  className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  placeholder="India"
                />
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
                  {modal === "create" ? "Create Customer" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
