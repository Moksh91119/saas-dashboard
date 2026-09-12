import { api } from "@/lib/api/client";

export type TransactionType = "CHARGE" | "REFUND" | "CREDIT";

export type TransactionStatus = "SUCCEEDED" | "PENDING" | "FAILED";

export interface TransactionCustomer {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
}

export interface TransactionPlan {
  id: string;
  name: string;
  price: string | number;
}

export interface TransactionSubscription {
  id: string;
  status: string;
  plan: TransactionPlan;
}

export interface Transaction {
  id: string;
  amount: string | number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  occurredAt: string;
  createdAt: string;
  customer: TransactionCustomer;
  subscription: TransactionSubscription | null;
}

export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: TransactionPagination;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: TransactionStatus;
  type?: TransactionType;
}

export interface CreateTransactionPayload {
  customerId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  type: TransactionType;
  status?: TransactionStatus;
  occurredAt?: string;
}

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<TransactionListResponse> {
  const response = await api.get("/transactions", {
    params: filters,
  });

  return response.data.data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const response = await api.get(`/transactions/${id}`);
  return response.data.data;
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const response = await api.post("/transactions", payload);
  return response.data.data;
}
