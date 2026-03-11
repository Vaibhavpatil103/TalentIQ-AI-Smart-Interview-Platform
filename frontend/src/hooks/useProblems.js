import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

export function useProblems(filters = {}) {
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.difficulty) params.set("difficulty", filters.difficulty);
      if (filters.tag) params.set("tag", filters.tag);
      if (filters.search) params.set("search", filters.search);

      const queryString = params.toString();
      const url = `/problems${queryString ? `?${queryString}` : ""}`;
      const res = await axiosInstance.get(url);
      return res.data;
    },
  });
}

export function useProblemById(id) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/problems/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/problems", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}
