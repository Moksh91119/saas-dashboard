"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPlan,
  deactivatePlan,
  getPlan,
  getPlans,
  updatePlan,
  type CreatePlanInput,
  type UpdatePlanInput,
} from "@/lib/api/plans.api";

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ["plan", id],
    queryFn: () => getPlan(id),
    enabled: Boolean(id),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanInput) => createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanInput }) =>
      updatePlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });

      queryClient.invalidateQueries({
        queryKey: ["plan", variables.id],
      });
    },
  });
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivatePlan,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });

      queryClient.invalidateQueries({
        queryKey: ["plan", id],
      });
    },
  });
}
