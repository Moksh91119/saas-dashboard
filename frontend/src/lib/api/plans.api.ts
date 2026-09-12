import { api } from "@/lib/api/client";

export type BillingInterval = "MONTHLY" | "YEARLY";

export type Plan = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  billingInterval: BillingInterval;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
};

export type CreatePlanInput = {
  name: string;
  slug: string;
  description?: string;
  price: number;
  billingInterval: BillingInterval;
};

export type UpdatePlanInput = Partial<CreatePlanInput> & {
  isActive?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function getPlans(): Promise<Plan[]> {
  const response = await api.get<ApiResponse<Plan[]>>("/plans");
  return response.data.data;
}

export async function getPlan(id: string): Promise<Plan> {
  const response = await api.get<ApiResponse<Plan>>(`/plans/${id}`);
  return response.data.data;
}

export async function createPlan(data: CreatePlanInput): Promise<Plan> {
  const response = await api.post<ApiResponse<Plan>>("/plans", data);

  return response.data.data;
}

export async function updatePlan(
  id: string,
  data: UpdatePlanInput,
): Promise<Plan> {
  const response = await api.patch<ApiResponse<Plan>>(`/plans/${id}`, data);

  return response.data.data;
}

export async function deactivatePlan(id: string): Promise<Plan> {
  const response = await api.delete<ApiResponse<Plan>>(`/plans/${id}`);

  return response.data.data;
}
