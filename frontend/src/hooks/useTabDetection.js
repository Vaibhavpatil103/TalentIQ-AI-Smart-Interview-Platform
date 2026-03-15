import { useEffect, useState, useCallback } from "react";

/**
 * Hook that detects tab switches (visibilitychange) and window blur events.
 * Emits cheat:detected via the provided socket instance.
 *
 * @param {string} sessionId - The current session ID
 * @param {string} userId - The current user's ID
 * @param {object} socket - Socket.io client instance
 * @returns {{ violationCount: number }}
 */
export const useTabDetection = (sessionId, userId, socket) => {
  const [violationCount, setViolationCount] = useState(0);

  const handleViolation = useCallback(
    (type) => {
      setViolationCount((prev) => {
        const newCount = prev + 1;

        socket?.emit("cheat:detected", {
          sessionId,
          userId,
          type,
          timestamp: new Date().toISOString(),
        });

        return newCount;
      });
    },
    [sessionId, userId, socket]
  );

  useEffect(() => {
    if (!sessionId || !userId) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("tab_switch");
      }
    };

    const onWindowBlur = () => {
      // Only fire if the document is not already hidden
      // (visibilitychange handles that case)
      if (!document.hidden) {
        handleViolation("window_blur");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [sessionId, userId, handleViolation]);

  return { violationCount };
};
