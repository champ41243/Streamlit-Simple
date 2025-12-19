import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type DataPointInput } from "@shared/routes";

export function useDataPoints() {
  return useQuery({
    queryKey: [api.data.list.path],
    queryFn: async () => {
      const res = await fetch(api.data.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch data points");
      return api.data.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDataPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DataPointInput) => {
      const res = await fetch(api.data.create.path, {
        method: api.data.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.data.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create data point");
      }
      return api.data.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.data.list.path] });
    },
  });
}

export function useDeleteDataPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.data.delete.path, { id });
      const res = await fetch(url, {
        method: api.data.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Data point not found");
        throw new Error("Failed to delete data point");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.data.list.path] });
    },
  });
}
