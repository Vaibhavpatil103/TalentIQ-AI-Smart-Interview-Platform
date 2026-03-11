import { useEffect, useRef } from "react";

export const useTabDetection = (sessionId, socket) => {
  const violations = useRef(0);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        violations.current += 1;
        socket?.emit("tab-switch", {
          sessionId,
          count: violations.current,
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [sessionId, socket]);

  return { violations: violations.current };
};
