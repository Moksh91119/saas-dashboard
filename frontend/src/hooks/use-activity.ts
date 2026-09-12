"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getActivities,
  getActivity,
  type ActivityFilters,
} from "@/lib/api/activity.api";

export const activityKeys = {
  all: ["activity"] as const,
  list: (filters: ActivityFilters) => ["activity", "list", filters] as const,
  detail: (id: string) => ["activity", id] as const,
};

export function useActivities(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => getActivities(filters),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => getActivity(id),
    enabled: Boolean(id),
  });
}
