import { api } from "@/lib/api/client";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export type Customer = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  status: CustomerStatus;
  country: string | null;
  joinedAt: string;
  createdAt: string;
  deletedAt?: string | null;
  updatedAt?: string;
  _count?: {
    subscriptions: number;
    transactions: number;
  };
};

export type CustomerSubscription = {
  id: string;
  planId: string;
  status: string;
  startedAt: string;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    billingInterval: string;
    isActive: boolean;
  };
};

export type CustomerTransaction = {
  id: string;
  subscriptionId: string | null;
  amount: string;
  currency: string;
  type: string;
  status: string;
  description: string | null;
  occurredAt: string;
  createdAt: string;
};

export type CustomerDetails = Customer & {
  organizationId: string;
  subscriptions: CustomerSubscription[];
  transactions: CustomerTransaction[];
};

export type CustomerListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  country?: string;
  sortBy?: "name" | "joinedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type CustomerPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type CustomerListResponse = {
  customers: Customer[];
  pagination: CustomerPagination;
};

export type CreateCustomerInput = {
  name: string;
  email: string;
  companyName?: string;
  country?: string;
};

export type UpdateCustomerInput = {
  name?: string;
  email?: string;
  companyName?: string;
  country?: string;
  status?: CustomerStatus;
};

export async function getCustomers(
  params: CustomerListParams = {},
): Promise<CustomerListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.country) searchParams.set("country", params.country);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await api.get<ApiResponse<CustomerListResponse>>(
    `/customers?${searchParams.toString()}`,
  );

  return response.data.data;
}

export async function getCustomer(id: string): Promise<CustomerDetails> {
  const response = await api.get<ApiResponse<CustomerDetails>>(
    `/customers/${id}`,
  );

  return response.data.data;
}

export async function createCustomer(
  data: CreateCustomerInput,
): Promise<Customer> {
  const response = await api.post<ApiResponse<Customer>>("/customers", data);

  return response.data.data;
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerInput,
): Promise<Customer> {
  const response = await api.patch<ApiResponse<Customer>>(
    `/customers/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
