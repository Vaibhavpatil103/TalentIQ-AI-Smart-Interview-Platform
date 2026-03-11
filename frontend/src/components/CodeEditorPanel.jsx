import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon, UsersIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  sessionId, // if provided, enables Yjs collaboration
}) {
  const editorRef = useRef(null);
  const yjsDocRef = useRef(null);
  const wsRef = useRef(null);
  const bindingRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    // If sessionId exists, set up Yjs collaboration
    if (sessionId) {
      setupYjsCollaboration(editor);
    }
  };

  const setupYjsCollaboration = (editor) => {
    // Clean up previous connection
    cleanupYjs();

    const doc = new Y.Doc();
    yjsDocRef.current = doc;

    const yText = doc.getText("code");

    // Connect to Yjs WebSocket server
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, "").replace(/\/api$/, "") || "localhost:3000";
    const wsUrl = `${wsProtocol}//${wsHost}/yjs?room=${sessionId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setIsConnected(true);
      console.log("[Yjs] Connected to collaboration server");

      // If the doc is empty, initialize with current code
      if (yText.length === 0 && code) {
        doc.transact(() => {
          yText.insert(0, code);
        });
      }
    };

    ws.onmessage = (event) => {
      const update = new Uint8Array(event.data);
      Y.applyUpdate(doc, update);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("[Yjs] Disconnected from collaboration server");
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
    if (model && editor) {
      try {
        const binding = new MonacoBinding(yText, model, new Set([editor]));
        bindingRef.current = binding;
      } catch (err) {
        console.warn("[Yjs] Could not bind Monaco editor:", err);
      }
    }

    // Sync code changes back to parent
    yText.observe(() => {
      const newCode = yText.toString();
      onCodeChange?.(newCode);
    });
  };

  const cleanupYjs = () => {
    bindingRef.current?.destroy();
    yjsDocRef.current?.destroy();
    if (wsRef.current) {
        wsRef.current.close();
    }

    bindingRef.current = null;
    wsRef.current = null;
    yjsDocRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupYjs();
  }, []);

  // Re-setup collaboration when sessionId changes
  useEffect(() => {
    if (sessionId && editorRef.current) {
      setupYjsCollaboration(editorRef.current);
    }
  }, [sessionId]);

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          <img
            src={LANGUAGE_CONFIG[selectedLanguage]?.icon || "/javascript.png"}
            alt={LANGUAGE_CONFIG[selectedLanguage]?.name || "Language"}
            className="size-6"
          />
          <select className="select select-sm" value={selectedLanguage} onChange={onLanguageChange}>
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

        <button className="btn btn-primary btn-sm gap-2" disabled={isRunning} onClick={onRunCode}>
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
          value={sessionId ? undefined : code} // When using Yjs, don't control value
          onChange={sessionId ? undefined : onCodeChange} // Yjs handles syncing
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}
export default CodeEditorPanel;
