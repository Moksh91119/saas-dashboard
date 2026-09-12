import { api } from "./client";
import type { AuthResponse, MeResponse } from "@/types/auth";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type RegisterPayload = {
  organizationName: string;
  organizationSlug: string;
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    payload,
  );

  return response.data.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    payload,
  );

  return response.data.data;
}

export async function getMe(): Promise<MeResponse> {
  const response = await api.get<ApiResponse<MeResponse>>("/auth/me");

  return response.data.data;
}
