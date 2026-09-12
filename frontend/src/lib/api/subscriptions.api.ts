import { api } from "@/lib/api/client";

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";

export interface SubscriptionCustomer {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string | number;
  billingInterval: "MONTHLY" | "YEARLY";
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: SubscriptionCustomer;
  plan: SubscriptionPlan;
  transactions?: SubscriptionTransaction[];
  subscriptionEvents?: SubscriptionEvent[];
}

export interface CreateSubscriptionPayload {
  customerId: string;
  planId: string;
  status?: "TRIAL" | "ACTIVE";
}

export interface SubscriptionTransaction {
  id: string;
  amount: string | number;
  currency: string;
  type: "CHARGE" | "REFUND" | "CREDIT";
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  description: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface SubscriptionEvent {
  id: string;
  eventType: string;
  createdAt: string;
  fromPlan?: unknown;
  toPlan?: unknown;
  user?: {
    id: string;
    name: string;
  } | null;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await api.get("/subscriptions");
  return response.data.data;
}

export async function getSubscription(id: string): Promise<Subscription> {
  const response = await api.get(`/subscriptions/${id}`);
  return response.data.data;
}

export async function createSubscription(
  payload: CreateSubscriptionPayload,
): Promise<Subscription> {
  const response = await api.post("/subscriptions", payload);
  return response.data.data;
}

export async function changeSubscriptionPlan(
  id: string,
  planId: string,
): Promise<Subscription> {
  const response = await api.patch(`/subscriptions/${id}/plan`, {
    planId,
  });

  return response.data.data;
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  const response = await api.post(`/subscriptions/${id}/cancel`);
  return response.data.data;
}
