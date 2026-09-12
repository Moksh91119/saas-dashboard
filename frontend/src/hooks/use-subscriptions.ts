"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelSubscription,
  changeSubscriptionPlan,
  createSubscription,
  getSubscription,
  getSubscriptions,
  type CreateSubscriptionPayload,
} from "@/lib/api/subscriptions.api";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  detail: (id: string) => ["subscriptions", id] as const,
};

export function useSubscriptions() {
  return useQuery({
    queryKey: subscriptionKeys.all,
    queryFn: getSubscriptions,
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => getSubscription(id),
    enabled: Boolean(id),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubscriptionPayload) =>
      createSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useChangeSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, planId }: { id: string; planId: string }) =>
      changeSubscriptionPlan(id, planId),

    onSuccess: (subscription) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });

      queryClient.setQueryData(
        subscriptionKeys.detail(subscription.id),
        subscription,
      );
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelSubscription(id),

    onSuccess: (subscription) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });

      queryClient.setQueryData(
        subscriptionKeys.detail(subscription.id),
        subscription,
      );

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}
