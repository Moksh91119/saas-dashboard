"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTransaction,
  getTransaction,
  getTransactions,
  type CreateTransactionPayload,
  type TransactionFilters,
} from "@/lib/api/transactions.api";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (filters: TransactionFilters) =>
    ["transactions", "list", filters] as const,
  detail: (id: string) => ["transactions", id] as const,
};

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: Boolean(id),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}
