// ─── MessagesSection.jsx ──────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Send, Check, Search, MoreVertical, ArrowLeft, Loader2, Clock,
  Paperclip, Image, File, Download, X, MessageSquare,
} from "lucide-react";
import { apiFetch, ErrorBanner, Avatar } from "./Shared";

const BASE_URL = import.meta.env.VITE_API_URL;

const MessagesSection = ({ jobId, initialChatUser = null }) => {
  const [applicants, setApplicants]     = useState([]);  // all applicants list
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [msgError, setMsgError]         = useState(null);
  const [text, setText]                 = useState("");
  const [sending, setSending]           = useState(false);
  const [search, setSearch]             = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview]   = useState(null);
  const [unreadMap, setUnreadMap]       = useState({});
  const [lastMsgMap, setLastMsgMap]     = useState({});

  const messagesEndRef   = useRef(null);
  const chatContainerRef = useRef(null); // ✅ FIX: to detect if user scrolled up
  const fileInputRef     = useRef(null);
  const pollRef          = useRef(null);
  const prevMsgCountRef  = useRef(0);    // ✅ FIX: only scroll on real new messages

  const isRejected = selectedConv?.status === "rejected";
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ✅ FIX: only "safe" to auto-scroll if user is already near the bottom
  const isNearBottom = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  };

  // ── Fetch all applicants ────────────────────────────────────────────────────
  const fetchApplicants = useCallback(async () => {
    try {
      setLoadingConvs(true);

      // Get all applications for this job
      const appRes = await apiFetch(`/api/client/job-applications/${jobId}`);
      const apps   = appRes.applications || [];

      // Get conversation metadata (last message, unread)
      let convMeta = [];
      try {
        const convRes = await apiFetch(`/api/client/messages/conversations?jobId=${jobId}`);
        convMeta = convRes.conversations || [];
      } catch (_) {}

      // Build lookup maps
      const unread  = {};
      const lastMsg = {};
      convMeta.forEach((c) => {
        unread[c.userId]  = c.unread || 0;
        lastMsg[c.userId] = { text: c.lastMessage, time: c.lastMessageAt };
      });
      setUnreadMap(unread);
      setLastMsgMap(lastMsg);

      // Map applications to conv objects
      const list = apps.map((app) => ({
        userId: app.user?._id?.toString(),
        name:    app.user?.name,
        photo:   app.user?.photo,
        email:   app.user?.email,
        status:  app.status,
        skills:  app.user?.skills || [],
        bidAmount: app.bidAmount,
      })).filter((c) => !!c.userId);

      setApplicants(list);

      // Auto-select if initialChatUser passed
      if (initialChatUser && !selectedConv) {
        const uid   = initialChatUser.user?._id;
        const match = list.find((c) => c.userId === uid);
        if (match) setSelectedConv(match);
      }
    } catch (e) {
      console.error("fetchApplicants error", e);
    } finally {
      setLoadingConvs(false);
    }
  }, [jobId]); // eslint-disable-line

  // ── Fetch messages for selected conv ───────────────────────────────────────
  const fetchMessages = useCallback(async (userId) => {
    try {
      setLoadingMsgs(true);
      setMsgError(null);
      const res = await apiFetch(`/api/client/messages/${userId}?jobId=${jobId}`);
      setMessages(res.messages || []);
      // ❌ REMOVED: setTimeout(scrollToBottom, 100) — was forcing scroll on
      // every 5s poll even when nothing new arrived / user was reading history.
    } catch (e) {
      setMsgError(e.message);
    } finally {
      setLoadingMsgs(false);
    }
  }, [jobId]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  useEffect(() => {
    if (!selectedConv) return;
    prevMsgCountRef.current = 0; // ✅ FIX: reset counter when switching conversations
    fetchMessages(selectedConv.userId);
    pollRef.current = setInterval(() => fetchMessages(selectedConv.userId), 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedConv, fetchMessages]);

  // ✅ FIX (auto-scroll): only scroll when the message count actually grew,
  // and only if it's our own message or the user was already near the bottom.
  // Previously this ran on every `messages` change (including identical
  // content re-fetched by the 5s poll), yanking the view down while reading.
  useEffect(() => {
    const newMessageArrived = messages.length > prevMsgCountRef.current;
    if (newMessageArrived) {
      const lastMsg = messages[messages.length - 1];
      const isOwnMessage = (lastMsg?.senderRole || "").toLowerCase() === "client";
      if (isOwnMessage || isNearBottom()) {
        scrollToBottom();
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFile) || !selectedConv || isRejected) return;

    const optimistic = {
      _id:        Date.now().toString(),
      text:       text.trim(),
      senderId:   "me",
      senderRole: "client",
      createdAt:  new Date().toISOString(),
      pending:    true,
      fileUrl:    filePreview,
      fileName:   selectedFile?.name,
      fileType:   selectedFile
        ? selectedFile.type.startsWith("image/") ? "image"
        : selectedFile.type.startsWith("video/") ? "video"
        : "document" : null,
    };

    setMessages((prev) => [...prev, optimistic]);
    const sentText = text.trim();
    const sentFile = selectedFile;
    setText("");
    setSelectedFile(null);
    setFilePreview(null);
    setSending(true);

    try {
      if (sentFile) {
        const formData = new FormData();
        formData.append("receiverId", selectedConv.userId);
        formData.append("jobId", jobId);
        if (sentText) formData.append("text", sentText);
        formData.append("file", sentFile);
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/client/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to send");
      } else {
        await apiFetch("/api/client/messages", {
          method: "POST",
          body: JSON.stringify({ receiverId: selectedConv.userId, jobId, text: sentText }),
        });
      }
      await fetchMessages(selectedConv.userId);
      await fetchApplicants();
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      alert(`Failed to send: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const filtered = applicants.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const statusLabel = {
    accepted:    { text: "Hired",          color: "bg-green-50 text-green-600 border-green-200" },
    rejected:    { text: "Rejected",       color: "bg-red-50 text-red-500 border-red-200" },
    negotiation: { text: "Negotiation",    color: "bg-blue-50 text-blue-600 border-blue-200" },
    pending:     { text: "Applied",        color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  };

  const FilePreviewBubble = ({ msg }) => {
    if (!msg.fileUrl) return null;
    if (msg.fileType === "image") {
      return (
        <img src={msg.fileUrl} alt={msg.fileName}
          className="max-w-[200px] rounded-xl mt-1 cursor-pointer hover:opacity-90"
          onClick={() => window.open(msg.fileUrl, "_blank")}
        />
      );
    }
    return (
      <a href={msg.fileUrl} download={msg.fileName} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 mt-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl transition">
        <File size={14} />
        <p className="text-xs font-semibold truncate">{msg.fileName || "File"}</p>
        <Download size={12} className="shrink-0" />
      </a>
    );
  };

  return (
    <div className="flex h-[620px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">

      {/* ── Left Panel: Applicants List ── */}
      <div className={`flex flex-col border-r border-gray-100 ${
        selectedConv ? "hidden md:flex w-72 shrink-0" : "flex w-full md:w-72 md:shrink-0"
      }`}>
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-base mb-3">Messages</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicant..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-teal-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 px-4">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No applicants yet</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive  = selectedConv?.userId === conv.userId;
              const sl        = statusLabel[conv.status] || statusLabel.pending;
              const unread    = unreadMap[conv.userId] || 0;
              const last      = lastMsgMap[conv.userId];

              return (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                    isActive ? "bg-teal-50 border-l-2 border-l-teal-500" : ""
                  }`}
                >
                  {/* Avatar + unread badge */}
                  <div className="relative shrink-0">
                    <Avatar name={conv.name} photo={conv.photo} size="md" />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">{conv.name}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {last?.time ? formatTime(last.time) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5 gap-1">
                      <p className="text-xs text-gray-400 truncate flex-1">
                        {last?.text || "No messages yet"}
                      </p>
                      <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${sl.color}`}>
                        {sl.text}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Panel: Chat ── */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <button className="md:hidden mr-1 text-gray-500" onClick={() => setSelectedConv(null)}>
              <ArrowLeft size={18} />
            </button>
            <Avatar name={selectedConv.name} photo={selectedConv.photo} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 text-sm">{selectedConv.name}</p>
                {isRejected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-500">
                    Rejected
                  </span>
                )}
              </div>
              <p className={`text-xs font-medium ${
                selectedConv.status === "accepted"    ? "text-green-500" :
                selectedConv.status === "rejected"    ? "text-red-400"   :
                selectedConv.status === "negotiation" ? "text-blue-500"  :
                "text-yellow-500"
              }`}>
                {selectedConv.status === "accepted"    ? "Hired Freelancer"     :
                 selectedConv.status === "rejected"    ? "Application Rejected" :
                 selectedConv.status === "negotiation" ? "In Negotiation"       :
                 "Applied"}
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#f0f4f8]">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin text-teal-500" />
              </div>
            ) : msgError ? (
              <ErrorBanner message={msgError} />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <Send size={20} className="opacity-30" />
                </div>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">
                  {isRejected ? "This applicant was rejected" : "Start the conversation"}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  // ✅ FIX (sender side glitch): rely only on senderRole, not
                  // the short-lived "me" placeholder that only optimistic
                  // messages carry — once the real message comes back from
                  // the server/poll it no longer has senderId "me".
                  const isMe = (msg.senderRole || "").toLowerCase() === "client";
                  const showDate =
                    idx === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(messages[idx - 1]?.createdAt).toDateString();
                  return (
                    <React.Fragment key={msg._id || idx}>
                      {showDate && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                            {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                              weekday: "short", day: "numeric", month: "short",
                            })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && <Avatar name={selectedConv.name} photo={selectedConv.photo} size="sm" />}
                        <div className={`max-w-[65%] mx-2 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? `bg-teal-600 text-white rounded-br-sm ${msg.pending ? "opacity-70" : ""}`
                              : "bg-white text-gray-800 rounded-bl-sm"
                          }`}>
                            {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                            <FilePreviewBubble msg={msg} />
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                            {isMe && !msg.pending && <Check size={10} className="text-teal-500" />}
                            {isMe &&  msg.pending && <Clock size={10} className="text-gray-300" />}
                          </div>
                        </div>
                        {isMe && <div className="w-8 shrink-0" />}
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* File Preview Bar */}
          {selectedFile && !isRejected && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-teal-50 border-t border-teal-100 shrink-0">
              {filePreview ? (
                <img src={filePreview} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-white rounded-lg border border-teal-200 flex items-center justify-center">
                  <File size={16} className="text-teal-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-teal-800 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-teal-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="text-teal-500 hover:text-teal-700">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSend}
            className={`flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0 transition-opacity ${
              isRejected ? "opacity-40 pointer-events-none select-none" : ""
            }`}
          >
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-teal-600 transition shrink-0">
              <Paperclip size={18} />
            </button>
            <input ref={fileInputRef} type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt"
              className="hidden" onChange={handleFileSelect} />
            <button type="button"
              onClick={() => {
                const inp = document.createElement("input");
                inp.type = "file"; inp.accept = "image/*";
                inp.onchange = (e) => handleFileSelect(e);
                inp.click();
              }}
              className="p-2 text-gray-400 hover:text-teal-600 transition shrink-0">
              <Image size={18} />
            </button>
            <div className="flex-1 flex items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-teal-400 transition-colors">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                }}
                placeholder={isRejected ? "Messaging disabled" : "Type a message..."}
                rows={1}
                className="flex-1 bg-transparent text-sm outline-none resize-none max-h-24 leading-relaxed"
              />
            </div>
            <button type="submit"
              disabled={(!text.trim() && !selectedFile) || sending || isRejected}
              className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-gray-50/50">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <MessageSquare size={28} className="opacity-30" />
          </div>
          <p className="text-base font-semibold text-gray-500">Select a conversation</p>
          <p className="text-sm mt-1">Choose an applicant to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default MessagesSection;