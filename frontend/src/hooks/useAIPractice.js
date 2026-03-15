import { useState, useCallback } from "react";
import { axiosInstance } from "../lib/axios";

const initialState = {
  sessionId: null, messages: [], isLoading: false, isComplete: false,
  feedback: null, mode: null, questionCount: 0, startTime: null,
  history: [], historyMeta: { totalCount: 0, page: 1, totalPages: 1 },
  currentSession: null,
};

export function useAIPractice() {
  const [state, setState] = useState(initialState);

  const startSession = useCallback(async ({
    mode, topic, difficulty, persona, interviewType,
    voiceModeEnabled, resumeFile,
  }) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const formData = new FormData();
      formData.append("mode", mode);
      if (mode === "topic") {
        formData.append("topic", topic);
        formData.append("difficulty", difficulty);
      }
      if (persona) formData.append("persona", persona);
      if (interviewType) formData.append("interviewType", interviewType);
      formData.append("voiceModeEnabled", voiceModeEnabled || false);
      if (mode === "resume" && resumeFile) formData.append("resume", resumeFile);

      const res = await axiosInstance.post("/ai-practice/start", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setState((s) => ({
        ...s, sessionId: res.data.sessionId, mode: res.data.mode,
        messages: [{ role: "ai", content: res.data.question }],
        questionCount: 1, startTime: Date.now(),
        isLoading: false, isComplete: false, feedback: null,
      }));
      return res.data;
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, []);

  const sendAnswer = useCallback(async ({ userAnswer, timeTaken }) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await axiosInstance.post("/ai-practice/respond", {
        sessionId: state.sessionId, userAnswer, timeTaken,
      });
      setState((s) => {
        const newMessages = [...s.messages, { role: "user", content: userAnswer, timeTaken }];
        if (res.data.isComplete) {
          return { ...s, messages: newMessages, isComplete: true, isLoading: false, questionCount: s.questionCount + 1 };
        }
        return {
          ...s,
          messages: [...newMessages, { role: "ai", content: res.data.reply }],
          isLoading: false, questionCount: s.questionCount + 1, startTime: Date.now(),
        };
      });
      return res.data;
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, [state.sessionId]);

  const endSession = useCallback(async ({ totalDuration }) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await axiosInstance.post("/ai-practice/end", {
        sessionId: state.sessionId, totalDuration,
      });
      setState((s) => ({ ...s, feedback: res.data.feedback, isLoading: false }));
      return res.data;
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, [state.sessionId]);

  const loadHistory = useCallback(async (page = 1) => {
    try {
      const res = await axiosInstance.get(`/ai-practice/sessions?page=${page}&limit=10`);
      setState((s) => ({
        ...s, history: res.data.sessions,
        historyMeta: { totalCount: res.data.totalCount, page: res.data.page, totalPages: res.data.totalPages },
      }));
      return res.data;
    } catch (error) { throw error; }
  }, []);

  const loadSession = useCallback(async (id) => {
    try {
      const res = await axiosInstance.get(`/ai-practice/sessions/${id}`);
      setState((s) => ({ ...s, currentSession: res.data.session }));
      return res.data.session;
    } catch (error) { throw error; }
  }, []);

  const reset = useCallback(() => { setState(initialState); }, []);

  return { ...state, startSession, sendAnswer, endSession, loadHistory, loadSession, reset };
}
