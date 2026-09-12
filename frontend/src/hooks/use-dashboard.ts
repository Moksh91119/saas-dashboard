"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardAnalytics,
  getDashboardOverview,
} from "@/lib/api/dashboard.api";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
  });
}

export function useDashboardAnalytics(months = 6) {
  return useQuery({
    queryKey: ["dashboard", "analytics", months],
    queryFn: () => getDashboardAnalytics(months),
  });
}
