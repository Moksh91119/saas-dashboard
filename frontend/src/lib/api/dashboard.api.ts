import { api } from "@/lib/api/client";

export interface DashboardMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  customers: number;
  activeCustomers: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  arpc: number;
}

export interface RecentTransaction {
  id: string;
  customerId: string;
  subscriptionId: string;
  amount: string;
  currency: string;
  type: string;
  status: string;
  description: string | null;
  occurredAt: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
    status: string;
    country: string | null;
  };
}

export interface RecentActivity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface DashboardOverview {
  metrics: DashboardMetrics;
  recentTransactions: RecentTransaction[];
  recentActivity: RecentActivity[];
}

export interface RevenueTrend {
  month: string;
  revenue: number;
}

export interface CustomerTrend {
  month: string;
  customers: number;
}

export interface PlanAnalytics {
  id: string;
  name: string;
  price: number;
  billingInterval: string;
  activeSubscriptions: number;
  estimatedMrr: number;
}

export interface SubscriptionAnalytics {
  status: string;
  count: number;
}

export interface ChurnAnalytics {
  month: string;
  startingActive: number;
  cancelledDuringMonth: number;
  churnRate: number;
}

export interface DashboardAnalytics {
  revenueTrend: RevenueTrend[];
  customerTrend: CustomerTrend[];
  planAnalytics: PlanAnalytics[];
  subscriptionAnalytics: SubscriptionAnalytics[];
  churnAnalytics: ChurnAnalytics[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await api.get<ApiResponse<DashboardOverview>>(
    "/dashboard/overview",
  );

  return response.data.data;
}

export async function getDashboardAnalytics(
  months = 6,
): Promise<DashboardAnalytics> {
  const response = await api.get<ApiResponse<DashboardAnalytics>>(
    `/dashboard/analytics?months=${months}`,
  );

  return response.data.data;
}
