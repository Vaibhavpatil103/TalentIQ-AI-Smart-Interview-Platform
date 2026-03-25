import { useState, useEffect, useCallback, useRef } from "react";
import {
  InboxIcon, Loader2Icon, SendIcon, XIcon, PlusIcon,
  MailIcon, MailOpenIcon, FilterIcon, ArrowLeftIcon,
  MessageSquareIcon, ArchiveIcon
} from "lucide-react";
import Navbar from "../components/Navbar";
import { axiosInstance } from "../lib/axios";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_CONFIG = {
  feedback: { emoji: "📊", label: "Feedback", color: "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e40]" },
  offer_letter: { emoji: "🎉", label: "Offer Letter", color: "bg-[#58a6ff20] text-[#58a6ff] border-[#58a6ff40]" },
  appointment: { emoji: "📅", label: "Appointment", color: "bg-[#a371f720] text-[#a371f7] border-[#a371f740]" },
  rejection: { emoji: "📋", label: "Rejection", color: "bg-[#f8514920] text-[#f85149] border-[#f8514940]" },
  general: { emoji: "💬", label: "General", color: "bg-[#484f5820] text-[#7d8590] border-[#484f5840]" },
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

  useEffect(() => {
    selectedMessageRef.current = selectedMessage;
  }, [selectedMessage]);

  useEffect(() => {
    fetchRole();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [filter, page]);

  useEffect(() => {
    if (!user?.id) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    const socket = io(serverUrl, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:inbox", user.id);
    });

    socket.on("inbox:new-message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [{ ...msg, replyCount: 0, lastActivity: msg.createdAt }, ...prev];
      });
      if (!msg.isSentByMe) {
        toast("📬 New message received!", { 
          duration: 3000, 
          style: { background: '#1c2128', color: '#e6edf3', border: '1px solid #30363d' } 
        });
      }
    });

    socket.on("inbox:new-reply", (reply) => {
      const current = selectedMessageRef.current;
      if (current && reply.parentMessageId === current._id) {
        setReplies((prev) => {
          if (prev.some((r) => r._id === reply._id)) return prev;
          return [...prev, reply];
        });
      }
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
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
      );
    } catch {
      toast.error("Failed to load message", { style: { background: '#1c2128', color: '#e6edf3' } });
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
      setMessages((prev) =>
        prev.map((m) =>
          m._id === selectedMessage._id
            ? { ...m, replyCount: (m.replyCount || 0) + 1, lastActivity: res.data.reply.createdAt }
            : m
        )
      );
      setReplyText("");
      toast.success("Reply sent!", { style: { background: '#1c2128', color: '#e6edf3' } });
    } catch {
      toast.error("Failed to send reply", { style: { background: '#1c2128', color: '#e6edf3' } });
    } finally {
      setSendingReply(false);
    }
  };

  const handleCompose = async () => {
    if (!composeData.recipientEmail || !composeData.subject || !composeData.body) {
      toast.error("Please fill all fields", { style: { background: '#1c2128', color: '#e6edf3' } });
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
      toast.success("Message sent!", { style: { background: '#1c2128', color: '#e6edf3' } });
      setShowCompose(false);
      setComposeData({ recipientEmail: "", type: "general", subject: "", body: "" });
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send", { style: { background: '#1c2128', color: '#e6edf3' } });
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
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <div className={`w-full lg:w-80 bg-[#161b22] border-r border-[#30363d] flex flex-col shrink-0 transition-transform duration-300 ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#30363d]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#e6edf3] flex items-center gap-2">
                <InboxIcon className="size-5 text-[#2cbe4e]" />
                Inbox
              </h2>
            </div>
            
            {canCompose && (
              <button
                className="btn-green w-full gap-2 justify-center mb-4 py-2.5"
                onClick={() => setShowCompose(true)}
              >
                <PlusIcon className="size-4" />
                Compose
              </button>
            )}

            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                    filter === tab.key 
                      ? "bg-[#2cbe4e20] text-[#2cbe4e] border-[#2cbe4e40]" 
                      : "bg-[#0d1117] text-[#7d8590] border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58]"
                  }`}
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
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#1c2128] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <ArchiveIcon className="size-10 mb-3 text-[#484f58]" />
                <p className="font-semibold text-[#e6edf3]">No messages</p>
                <p className="text-sm text-[#7d8590] mt-1">Your inbox is looking quite empty right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#30363d]">
                {messages.map((msg) => {
                  const isSelected = selectedMessage?._id === msg._id;
                  const isUnread = !msg.isRead;
                  const typeCfg = TYPE_CONFIG[msg.type] || TYPE_CONFIG.general;

                  return (
                    <button
                      key={msg._id}
                      className={`w-full text-left px-4 py-3 cursor-pointer transition-colors block border-l-2 ${
                        isUnread ? "border-[#2cbe4e] bg-[#1c2128]" : 
                        isSelected ? "border-[#2cbe4e] bg-[#0d1117]" : "border-transparent hover:bg-[#1c2128]"
                      }`}
                      onClick={() => handleSelectMessage(msg)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-xs truncate max-w-[140px] ${isUnread ? "font-semibold text-[#e6edf3]" : "text-[#7d8590]"}`}>
                          {msg.isSentByMe ? `To: ${msg.recipientId?.slice(0, 12)}…` : msg.senderName}
                        </span>
                        <span className="text-[11px] text-[#484f58] shrink-0">
                          {formatDate(msg.lastActivity || msg.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm truncate mb-1.5 ${isUnread ? "font-semibold text-[#e6edf3]" : "text-[#e6edf3]"}`}>
                        {msg.subject}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${typeCfg.color} uppercase tracking-widest font-bold`}>
                          {typeCfg.emoji} {typeCfg.label}
                        </span>
                        {msg.replyCount > 0 && (
                          <span className="text-[10px] text-[#7d8590] flex items-center gap-0.5 ml-auto">
                            <MessageSquareIcon className="size-3" />
                            {msg.replyCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="p-3 border-t border-[#30363d] flex items-center justify-between bg-[#0d1117]">
              <button
                className="btn-ghost-dark px-2 py-1 text-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <span className="text-xs text-[#7d8590]">
                {page} / {totalPages}
              </span>
              <button
                className="btn-ghost-dark px-2 py-1 text-xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className={`flex-1 bg-[#0d1117] flex flex-col h-full overflow-hidden transition-transform duration-300 ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          {selectedMessage ? (
            <div className="flex flex-col h-full relative">
              {/* Message Header */}
              <div className="p-6 md:px-8 border-b border-[#30363d] shrink-0 bg-[#0d1117]">
                <button
                  className="btn-ghost-dark text-xs gap-1 mb-4 lg:hidden"
                  onClick={() => setSelectedMessage(null)}
                >
                  <ArrowLeftIcon className="size-3" />
                  Back to list
                </button>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#e6edf3] mb-2 leading-tight">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-[#1c2128] flex items-center justify-center font-bold text-[#e6edf3] border border-[#30363d]">
                        {selectedMessage.senderName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#e6edf3]">
                          {selectedMessage.senderName} <span className="text-[#7d8590] font-normal text-xs ml-1 capitalize">({selectedMessage.senderRole})</span>
                        </p>
                        <p className="text-xs text-[#484f58]">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded border ${TYPE_CONFIG[selectedMessage.type]?.color || TYPE_CONFIG.general.color} uppercase font-bold tracking-wider shrink-0`}>
                    {TYPE_CONFIG[selectedMessage.type]?.emoji} {TYPE_CONFIG[selectedMessage.type]?.label}
                  </span>
                </div>
              </div>

              {/* Message Content & Replies */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">
                <div className="text-[#e6edf3] leading-relaxed whitespace-pre-wrap text-[15px]">
                  {selectedMessage.body}
                </div>

                {replies.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-[#30363d]">
                    <h3 className="text-xs font-bold text-[#7d8590] uppercase tracking-wider">
                      Thread ({replies.length})
                    </h3>
                    {replies.map((reply) => {
                      const isMine = reply.senderId === user?.id;
                      return (
                        <div
                          key={reply._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                            isMine 
                              ? "bg-[#1c2128] text-[#e6edf3] border border-[#30363d] rounded-tr-sm" 
                              : "bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-tl-sm"
                          }`}>
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#30363d]/50 gap-4">
                              <span className="font-bold text-xs">
                                {isMine ? "You" : reply.senderName}
                              </span>
                              <span className="text-[10px] text-[#7d8590]">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Reply Box acts as bottom padding basically so it flows properly */}
                <div className="card-dark p-4 mt-8">
                  <h3 className="text-xs font-bold text-[#7d8590] uppercase tracking-wider mb-2">
                    Reply
                  </h3>
                  <textarea
                    className="input-dark w-full min-h-[100px] resize-none py-3"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      className="btn-green gap-2 px-6 shadow-lg shadow-[#2cbe4e]/10 py-2 h-auto min-h-0"
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyText.trim()}
                    >
                      {sendingReply ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <SendIcon className="size-4" />
                      )}
                      Send
                    </button>
                  </div>
                </div>
                {/* Extra spacer at bottom */}
                <div className="h-4" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="size-24 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-6 shadow-xl">
                <MailOpenIcon className="size-10 text-[#2cbe4e]" />
              </div>
              <h3 className="text-xl font-bold text-[#e6edf3] mb-2">Select a Conversation</h3>
              <p className="text-[#7d8590] max-w-sm">
                Choose a message from the list to read it, or compose a new one if you have permission.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0"
              onClick={() => setShowCompose(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#30363d] shrink-0 bg-[#161b22]">
                <h3 className="text-lg font-bold text-[#e6edf3]">Compose Message</h3>
                <button
                  className="text-[#7d8590] hover:text-[#e6edf3] transition-colors"
                  onClick={() => setShowCompose(false)}
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-xs font-bold text-[#7d8590] uppercase tracking-wider mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    className="input-dark w-full"
                    placeholder="candidate@example.com"
                    value={composeData.recipientEmail}
                    onChange={(e) =>
                      setComposeData({ ...composeData, recipientEmail: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7d8590] uppercase tracking-wider mb-2">Type</label>
                  <select
                    className="input-dark w-full appearance-none cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#7d8590] uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    className="input-dark w-full"
                    placeholder="Message subject"
                    value={composeData.subject}
                    onChange={(e) =>
                      setComposeData({ ...composeData, subject: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7d8590] uppercase tracking-wider mb-2">Body</label>
                  <textarea
                    className="input-dark w-full min-h-[160px] py-3 resize-y"
                    placeholder="Write your message..."
                    value={composeData.body}
                    onChange={(e) =>
                      setComposeData({ ...composeData, body: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="p-6 border-t border-[#30363d] flex items-center justify-end gap-3 shrink-0 bg-[#161b22]">
                <button
                  className="btn-ghost-dark py-2 px-4"
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-green gap-2 py-2 px-6"
                  onClick={handleCompose}
                  disabled={sendingCompose}
                >
                  {sendingCompose ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <SendIcon className="size-4" />
                  )}
                  Send Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InboxPage;
