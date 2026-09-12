"use client";

import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useDashboardAnalytics,
  useDashboardOverview,
} from "@/hooks/use-dashboard";
import Link from "next/link";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-");

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(Number(year), Number(monthNumber) - 1));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusClass(status: string) {
  switch (status) {
    case "SUCCEEDED":
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING":
    case "TRIAL":
      return "bg-amber-50 text-amber-700";

    case "PAST_DUE":
    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function DashboardPage() {
  const overview = useDashboardOverview();
  const analytics = useDashboardAnalytics(6);

  if (overview.isLoading || analytics.isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (overview.isError || analytics.isError) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <h2 className="mt-3 font-semibold text-red-900">
            Failed to load dashboard
          </h2>
          <p className="mt-1 text-sm text-red-700">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!overview.data || !analytics.data) {
    return null;
  }

  const { metrics, recentTransactions, recentActivity } = overview.data;
  const {
    revenueTrend,
    customerTrend,
    planAnalytics,
    subscriptionAnalytics,
    churnAnalytics,
  } = analytics.data;

  const latestChurn =
    churnAnalytics.length > 0
      ? churnAnalytics[churnAnalytics.length - 1].churnRate
      : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Customers",
      value: metrics.customers.toLocaleString(),
      icon: Users,
    },
    {
      title: "Active Subscriptions",
      value: metrics.activeSubscriptions.toLocaleString(),
      icon: CreditCard,
    },
    {
      title: "Churn Rate",
      value: `${latestChurn.toFixed(2)}%`,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your SaaS business.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="rounded-lg bg-slate-100 p-2">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">MRR</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatCurrency(metrics.mrr)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">ARR</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatCurrency(metrics.arr)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Customers</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {metrics.activeCustomers}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">ARPC</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatCurrency(metrics.arpc)}
          </p>
        </div>
      </div>

      {/* Revenue + Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">Revenue Overview</h2>
            <p className="mt-1 text-xs text-slate-500">
              Monthly revenue for the last 6 months
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Revenue",
                  ]}
                  labelFormatter={(label) => formatMonth(String(label))}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">Plan Distribution</h2>
            <p className="mt-1 text-xs text-slate-500">
              Active subscriptions by plan
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planAnalytics}
                  dataKey="activeSubscriptions"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                >
                  {planAnalytics.map((plan, index) => (
                    <Cell
                      key={plan.id}
                      fill={`hsl(${index * 100}, 70%, 50%)`}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customers + Churn */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">Customer Growth</h2>
            <p className="mt-1 text-xs text-slate-500">
              Total customers over time
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => [Number(value), "Customers"]}
                  labelFormatter={(label) => formatMonth(String(label))}
                />

                <Bar dataKey="customers" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">Churn</h2>
            <p className="mt-1 text-xs text-slate-500">Monthly churn rate</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={churnAnalytics}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(2)}%`,
                    "Churn",
                  ]}
                  labelFormatter={(label) => formatMonth(String(label))}
                />

                <Line
                  type="monotone"
                  dataKey="churnRate"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-semibold text-slate-900">Subscription Status</h2>
          <p className="mt-1 text-xs text-slate-500">
            Current subscription distribution
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subscriptionAnalytics.map((item) => (
            <div
              key={item.status}
              className="rounded-lg border bg-slate-50 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.status.replace("_", " ")}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">
              Recent Transactions
            </h2>
          </div>

          <div className="space-y-4">
            {recentTransactions.slice(0, 6).map((transaction) => (
              <Link
                key={transaction.id}
                href={`/transactions/${transaction.id}`}
                className="flex items-center justify-between gap-4 rounded-lg p-2 -m-2 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {transaction.customer.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(transaction.occurredAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {transaction.type === "REFUND" ? "-" : "+"}
                    {formatCurrency(Number(transaction.amount))}
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusClass(
                      transaction.status,
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity) => (
              <Link
                key={activity.id}
                href={`/activity/${activity.id}`}
                className="flex gap-3 rounded-lg p-2 -m-2 hover:bg-slate-50"
              >
                <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                  {activity.action.includes("CREATED") ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-600" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-900">
                    {activity.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {activity.user.name} · {formatAction(activity.action)} ·{" "}
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
