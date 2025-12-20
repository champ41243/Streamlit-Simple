import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ReportInput } from "@shared/routes";

export function useReports() {
  return useQuery({
    queryKey: [api.reports.list.path],
    queryFn: async () => {
      const res = await fetch(api.reports.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return api.reports.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReportInput) => {
      const res = await fetch(api.reports.create.path, {
        method: api.reports.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.reports.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create report");
      }
      return api.reports.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.reports.delete.path, { id });
      const res = await fetch(url, {
        method: api.reports.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Report not found");
        throw new Error("Failed to delete report");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
    },
  });
}

export function useCompleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/reports/${id}/complete`, {
        method: "PATCH",
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Report not found");
        throw new Error("Failed to complete report");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Report not found");
        throw new Error("Failed to update report");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
    },
  });
}
