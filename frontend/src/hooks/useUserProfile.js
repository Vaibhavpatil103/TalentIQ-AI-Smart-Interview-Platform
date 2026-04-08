import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useUser } from "@clerk/clerk-react";

export function useUserProfile() {
  const { isSignedIn } = useUser();
  
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/profile");
      return res.data.user;
    },
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000, 
  });
}
