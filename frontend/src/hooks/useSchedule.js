import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

export function useScheduledSessions() {
  return useQuery({
    queryKey: ["scheduled-sessions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/sessions/scheduled");
      return res.data;
    },
  });
}
