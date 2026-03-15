import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";

const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    icon: "/javascript.png",
    monacoLang: "javascript",
  },
  python: {
    name: "Python",
    icon: "/python.png",
    monacoLang: "python",
  },
  java: {
    name: "Java",
    icon: "/java.png",
    monacoLang: "java",
  },
  cpp: {
    name: "C++",
    icon: "/cpp.png",
    monacoLang: "cpp",
  },
};

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  sessionId,
}) {
  const editorRef = useRef(null);
  const yjsDocRef = useRef(null);
  const wsRef = useRef(null);
  const bindingRef = useRef(null);
  const isYjsUpdate = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  const cleanupYjs = useCallback(() => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (yjsDocRef.current) {
      yjsDocRef.current.destroy();
      yjsDocRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const setupYjsCollaboration = useCallback(
    (editor) => {
      cleanupYjs();

      const doc = new Y.Doc();
      yjsDocRef.current = doc;
      const yText = doc.getText("code");

      // Connect to Yjs WebSocket server
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost =
        import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, "").replace(
          /\/api$/,
          ""
        ) || "localhost:3000";
      const wsUrl = `${wsProtocol}//${wsHost}/yjs?room=${sessionId}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[Yjs] Connected to collaboration server");

        // If the shared doc is empty and we have local code, seed it
        if (yText.length === 0 && code) {
          doc.transact(() => {
            yText.insert(0, code);
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const update = new Uint8Array(event.data);
          Y.applyUpdate(doc, update);
        } catch (err) {
          console.error("[Yjs] Error applying update:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("[Yjs] Disconnected");
      };

      ws.onerror = (err) => {
        console.error("[Yjs] WebSocket error:", err);
        setIsConnected(false);
      };

      // Send local updates to the server
      doc.on("update", (update, origin) => {
        if (origin !== "remote" && ws.readyState === WebSocket.OPEN) {
          ws.send(update);
        }
      });

      // Bind Yjs text to Monaco editor
      const model = editor.getModel();
      if (model) {
        try {
          const binding = new MonacoBinding(yText, model, new Set([editor]));
          bindingRef.current = binding;
        } catch (err) {
          console.warn("[Yjs] Could not bind Monaco editor:", err);
        }
      }

      // Sync code changes back to parent state
      yText.observe(() => {
        isYjsUpdate.current = true;
        onCodeChange?.(yText.toString());
        // Reset flag on next tick
        setTimeout(() => {
          isYjsUpdate.current = false;
        }, 0);
      });
    },
    [sessionId, cleanupYjs]
  );

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    if (sessionId) {
      setupYjsCollaboration(editor);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupYjs();
  }, [cleanupYjs]);

  // Re-setup collaboration when sessionId changes
  useEffect(() => {
    if (sessionId && editorRef.current) {
      setupYjsCollaboration(editorRef.current);
    }
  }, [sessionId]);

  // Handle external code changes (e.g. language change / problem push)
  // Only update Yjs doc when the parent pushes new starter code
  const handleEditorChange = (value) => {
    if (!sessionId) {
      onCodeChange?.(value);
    }
    // When Yjs is active, the binding handles syncing
  };

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          <img
            src={LANGUAGE_CONFIG[selectedLanguage]?.icon || "/javascript.png"}
            alt={LANGUAGE_CONFIG[selectedLanguage]?.name || "Language"}
            className="size-6"
          />
          <select
            className="select select-sm"
            value={selectedLanguage}
            onChange={onLanguageChange}
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Collaboration status indicator */}
          {sessionId && (
            <div className="flex items-center gap-1.5 ml-2">
              <div
                className={`size-2 rounded-full ${
                  isConnected ? "bg-success animate-pulse" : "bg-error"
                }`}
              />
              <span className="text-xs text-base-content/60">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-sm gap-2"
          disabled={isRunning}
          onClick={onRunCode}
        >
          {isRunning ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayIcon className="size-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      <div className="flex-1">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLang || "javascript"}
          value={sessionId ? undefined : code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "gutter",
            bracketPairColorization: { enabled: true },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
        />
      </div>
    </div>
  );
}
export default CodeEditorPanel;
