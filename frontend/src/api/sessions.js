import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async ({ id, joinCode }) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`, { joinCode });
    return response.data;
  },

  approveParticipant: async ({ sessionId, userId }) => {
    const response = await axiosInstance.post(`/sessions/${sessionId}/approve`, { userId });
    return response.data;
  },

  rejectParticipant: async ({ sessionId, userId }) => {
    const response = await axiosInstance.post(`/sessions/${sessionId}/reject`, { userId });
    return response.data;
  },

  endSession: async ({ id, code, language } = {}) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`, { code, language });
    return response.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};
