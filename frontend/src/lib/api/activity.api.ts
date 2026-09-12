import { api } from "@/lib/api/client";

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: ActivityUser | null;
}

export interface ActivityPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ActivityListResponse {
  activities: Activity[];
  pagination: ActivityPagination;
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
}

export async function getActivities(
  filters: ActivityFilters = {},
): Promise<ActivityListResponse> {
  const response = await api.get("/activity", {
    params: filters,
  });

  return response.data.data;
}

export async function getActivity(id: string): Promise<Activity> {
  const response = await api.get(`/activity/${id}`);
  return response.data.data;
}
