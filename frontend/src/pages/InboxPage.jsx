import { useState, useEffect, useCallback, useRef } from "react";
import {
  InboxIcon,
  Loader2Icon,
  SendIcon,
  XIcon,
  PlusIcon,
  MailIcon,
  MailOpenIcon,
  FilterIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { axiosInstance } from "../lib/axios";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const TYPE_CONFIG = {
  feedback: { emoji: "📊", label: "Feedback", color: "badge-info" },
  offer_letter: { emoji: "🎉", label: "Offer Letter", color: "badge-success" },
  appointment: { emoji: "📅", label: "Appointment", color: "badge-primary" },
  rejection: { emoji: "📋", label: "Rejection", color: "badge-error" },
  general: { emoji: "💬", label: "General", color: "badge-ghost" },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "feedback", label: "Feedback" },
  { key: "offer_letter", label: "Offers" },
  { key: "rejection", label: "Rejections" },
  { key: "general", label: "General" },
];

function InboxPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    recipientEmail: "",
    type: "general",
    subject: "",
    body: "",
  });
  const [sendingCompose, setSendingCompose] = useState(false);
  const [userRole, setUserRole] = useState("candidate");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socketRef = useRef(null);
  const selectedMessageRef = useRef(null);

  // Keep ref in sync so socket handler can read current selectedMessage
  useEffect(() => {
    selectedMessageRef.current = selectedMessage;
  }, [selectedMessage]);

  useEffect(() => {
    fetchRole();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [filter, page]);

  // ─── Socket.IO connection for real-time inbox ──────
  useEffect(() => {
    if (!user?.id) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    const socket = io(serverUrl, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:inbox", user.id);
    });

    // New top-level message received
    socket.on("inbox:new-message", (msg) => {
      setMessages((prev) => {
        // Don't add duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [{ ...msg, replyCount: 0, lastActivity: msg.createdAt }, ...prev];
      });
      if (!msg.isSentByMe) {
        toast("📬 New message received!", { duration: 3000 });
      }
    });

    // New reply received on a thread
    socket.on("inbox:new-reply", (reply) => {
      // If user is viewing the parent message, append the reply
      const current = selectedMessageRef.current;
      if (current && reply.parentMessageId === current._id) {
        setReplies((prev) => {
          if (prev.some((r) => r._id === reply._id)) return prev;
          return [...prev, reply];
        });
      }
      // Update reply count in message list
      setMessages((prev) =>
        prev.map((m) =>
          m._id === reply.parentMessageId
            ? { ...m, replyCount: (m.replyCount || 0) + 1, lastActivity: reply.createdAt }
            : m
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  const fetchRole = async () => {
    try {
      const res = await axiosInstance.get("/users/profile");
      setUserRole(res.data.user?.role || "candidate");
    } catch {
      /* ignore */
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/inbox?page=${page}&limit=20&type=${filter}`
      );
      setMessages(res.data.messages);
      setTotalPages(res.data.totalPages);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (msg) => {
    try {
      const res = await axiosInstance.get(`/inbox/${msg._id}`);
      setSelectedMessage(res.data.message);
      setReplies(res.data.replies || []);
      // Update the read status in the list
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
      );
    } catch {
      toast.error("Failed to load message");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    setSendingReply(true);
    try {
      const res = await axiosInstance.post(`/inbox/${selectedMessage._id}/reply`, {
        body: replyText.trim(),
      });
      setReplies((prev) => [...prev, res.data.reply]);
      // Update reply count in the message list (socket no longer echoes back to sender)
      setMessages((prev) =>
        prev.map((m) =>
          m._id === selectedMessage._id
            ? { ...m, replyCount: (m.replyCount || 0) + 1, lastActivity: res.data.reply.createdAt }
            : m
        )
      );
      setReplyText("");
      toast.success("Reply sent!");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCompose = async () => {
    if (!composeData.recipientEmail || !composeData.subject || !composeData.body) {
      toast.error("Please fill all fields");
      return;
    }
    setSendingCompose(true);
    try {
      await axiosInstance.post("/inbox", {
        recipientEmail: composeData.recipientEmail,
        type: composeData.type,
        subject: composeData.subject,
        body: composeData.body,
      });
      toast.success("Message sent!");
      setShowCompose(false);
      setComposeData({ recipientEmail: "", type: "general", subject: "", body: "" });
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send");
    } finally {
      setSendingCompose(false);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const canCompose =
    userRole === "interviewer" ||
    userRole === "recruiter" ||
    userRole === "admin";

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <InboxIcon className="size-5 text-white" />
            </div>
            <h1 className="text-2xl font-black">Inbox</h1>
          </div>
          {canCompose && (
            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={() => setShowCompose(true)}
            >
              <PlusIcon className="size-4" />
              Compose
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="tabs tabs-boxed bg-base-100 mb-4 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${filter === tab.key ? "tab-active" : ""}`}
              onClick={() => {
                setFilter(tab.key);
                setPage(1);
                setSelectedMessage(null);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[70vh]">
          {/* Message List (left) */}
          <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
            <div className="divide-y divide-base-200 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2Icon className="size-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-base-content/50">
                  <InboxIcon className="size-12 mb-3 opacity-30" />
                  <p className="font-medium">No messages</p>
                  <p className="text-xs">Your inbox is empty</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <button
                    key={msg._id}
                    className={`w-full text-left px-4 py-3 hover:bg-base-200/50 transition-colors ${
                      selectedMessage?._id === msg._id
                        ? "bg-primary/5 border-l-4 border-primary"
                        : ""
                    } ${!msg.isRead ? "bg-base-200/30" : ""}`}
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {msg.isRead ? (
                          <MailOpenIcon className="size-4 text-base-content/30" />
                        ) : (
                          <MailIcon className="size-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm truncate ${
                              !msg.isRead && !msg.isSentByMe ? "font-bold" : "font-medium"
                            }`}
                          >
                            {msg.isSentByMe ? (
                              <span className="text-base-content/50">To: </span>
                            ) : null}
                            {msg.isSentByMe ? msg.recipientId?.slice(0, 12) + "…" : msg.senderName}
                          </span>
                          <span className="text-xs text-base-content/50 flex-shrink-0 ml-2">
                            {formatDate(msg.lastActivity || msg.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            !msg.isRead && !msg.isSentByMe
                              ? "text-base-content"
                              : "text-base-content/70"
                          }`}
                        >
                          {msg.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`badge badge-xs ${
                              TYPE_CONFIG[msg.type]?.color || "badge-ghost"
                            }`}
                          >
                            {TYPE_CONFIG[msg.type]?.emoji}{" "}
                            {TYPE_CONFIG[msg.type]?.label || msg.type}
                          </span>
                          {msg.isSentByMe && (
                            <span className="badge badge-xs badge-outline">Sent</span>
                          )}
                          {msg.replyCount > 0 && (
                            <span className="text-xs text-base-content/40">
                              {msg.replyCount}{" "}
                              {msg.replyCount === 1 ? "reply" : "replies"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-3 border-t border-base-200">
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="text-xs self-center text-base-content/50">
                  {page} / {totalPages}
                </span>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Message Detail (right) */}
          <div className="lg:col-span-3 card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
            {selectedMessage ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-base-200">
                  <button
                    className="btn btn-ghost btn-xs gap-1 mb-2 lg:hidden"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <ArrowLeftIcon className="size-3" />
                    Back
                  </button>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold">
                        {selectedMessage.subject}
                      </h2>
                      <p className="text-sm text-base-content/60">
                        From:{" "}
                        <span className="font-medium">
                          {selectedMessage.senderName}
                        </span>{" "}
                        ({selectedMessage.senderRole})
                      </p>
                      <p className="text-xs text-base-content/40 mt-1">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        TYPE_CONFIG[selectedMessage.type]?.color || "badge-ghost"
                      }`}
                    >
                      {TYPE_CONFIG[selectedMessage.type]?.emoji}{" "}
                      {TYPE_CONFIG[selectedMessage.type]?.label}
                    </span>
                  </div>
                </div>

                {/* Body + Replies */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Original Message */}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed bg-base-200/50 p-4 rounded-xl">
                    {selectedMessage.body}
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                        Replies ({replies.length})
                      </p>
                      {replies.map((reply) => {
                        const isMine = reply.senderId === user?.id;
                        return (
                          <div
                            key={reply._id}
                            className={`p-3 rounded-xl text-sm ${
                              isMine
                                ? "bg-primary/10 ml-6 border-l-2 border-primary"
                                : "bg-base-200/50 mr-6 border-l-2 border-base-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs">
                                {isMine ? "You" : reply.senderName}
                              </span>
                              <span className="text-xs text-base-content/40">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{reply.body}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-base-200">
                  <div className="flex gap-2">
                    <textarea
                      className="textarea textarea-bordered flex-1 textarea-sm"
                      placeholder="Write a reply..."
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <button
                      className="btn btn-primary btn-sm self-end gap-1"
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyText.trim()}
                    >
                      {sendingReply ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <SendIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-base-content/40">
                <MailOpenIcon className="size-16 mb-4 opacity-20" />
                <p className="font-medium">Select a message</p>
                <p className="text-sm">Choose a message from the left to read it</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Compose Modal ─── */}
      {showCompose && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Compose Message</h3>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowCompose(false)}
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label text-sm font-semibold">
                  Recipient Email
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full input-sm"
                  placeholder="candidate@example.com"
                  value={composeData.recipientEmail}
                  onChange={(e) =>
                    setComposeData({ ...composeData, recipientEmail: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label text-sm font-semibold">Type</label>
                <select
                  className="select select-bordered w-full select-sm"
                  value={composeData.type}
                  onChange={(e) =>
                    setComposeData({ ...composeData, type: e.target.value })
                  }
                >
                  <option value="general">💬 General</option>
                  <option value="offer_letter">🎉 Offer Letter</option>
                  <option value="appointment">📅 Appointment</option>
                  <option value="rejection">📋 Rejection</option>
                </select>
              </div>

              <div>
                <label className="label text-sm font-semibold">Subject</label>
                <input
                  type="text"
                  className="input input-bordered w-full input-sm"
                  placeholder="Message subject"
                  value={composeData.subject}
                  onChange={(e) =>
                    setComposeData({ ...composeData, subject: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label text-sm font-semibold">Body</label>
                <textarea
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Write your message..."
                  value={composeData.body}
                  onChange={(e) =>
                    setComposeData({ ...composeData, body: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowCompose(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary gap-2"
                onClick={handleCompose}
                disabled={sendingCompose}
              >
                {sendingCompose ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SendIcon className="size-4" />
                )}
                Send
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowCompose(false)} />
        </div>
      )}
    </div>
  );
}

export default InboxPage;
