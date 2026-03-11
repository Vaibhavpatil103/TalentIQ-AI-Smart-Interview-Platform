import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

export function useAIFeedback(sessionId) {
  return useQuery({
    queryKey: ["ai-feedback", sessionId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/sessions/${sessionId}`);
      return res.data.session?.aiReview || null;
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      // Poll every 5 seconds until AI review is complete
      const data = query.state.data;
      if (data?.completedAt) return false; // stop polling
      return 5000;
    },
  });
}
