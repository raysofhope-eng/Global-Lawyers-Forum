"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApplicationDetail,
  ApplicationStatus,
  ApplicationSummary,
  Page,
} from "@/contracts";
import { api } from "@/lib/api";
export const applicationKeys = {
  all: ["applications"] as const,
  list: (page: number, status: string) =>
    ["applications", "list", page, status] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
};
export function useApplications(
  page: number,
  status: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: applicationKeys.list(page, status),
    queryFn: () =>
      api<Page<ApplicationSummary>>(
        `/admin/applications?page=${page}${status ? `&status=${status}` : ""}`,
      ),
    enabled,
  });
}
export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => api<ApplicationDetail>(`/admin/applications/${id}`),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });
}
export function useUpdateApplication(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (status: ApplicationStatus) =>
      api(`/admin/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: applicationKeys.all }),
  });
}
