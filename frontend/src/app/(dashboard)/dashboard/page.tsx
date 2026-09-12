const stats = [
  {
    title: "Total Revenue",
    value: "$124,580",
    change: "+12.5%",
  },
  {
    title: "Customers",
    value: "2,420",
    change: "+8.2%",
  },
  {
    title: "Active Subscriptions",
    value: "1,842",
    change: "+6.4%",
  },
  {
    title: "Churn Rate",
    value: "2.4%",
    change: "-0.8%",
  },
];

export default function DashboardPage() {
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>

              <span className="text-sm font-medium text-emerald-600">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Revenue Overview</h2>
        </div>

        <div className="h-80 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Plan Distribution</h2>
        </div>
      </div>
    </div>
  );
}
