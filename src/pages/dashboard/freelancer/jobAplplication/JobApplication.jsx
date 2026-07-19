import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, Banknote, BarChart3, Pencil, X, Briefcase,
  CheckCircle2, Loader2, AlertCircle, PencilLine, Send,
  ChevronRight, BadgeCheck, Ban, Paperclip, Image, File, Download,
  Check,
} from "lucide-react";
import { io } from "socket.io-client";
import formatTimeAgo from "../../../../components/dashboard/formatTimeAgo";
import ApplicationTab from "./Negotiation"; // ✅ alag file se import

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

// ─── API Helper ───────────────────────────────────────────────────────────────
const apiFetch = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Something went wrong");
  }
  return res.json();
};

// ─── Socket singleton ─────────────────────────────────────────────────────────
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(BASE_URL, {
      auth: { token: getToken() },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-teal-600">
    <Loader2 size={28} className="animate-spin" />
    <p className="text-sm font-medium text-gray-400">{text}</p>
  </div>
);

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">
    <AlertCircle size={17} />
    <span>{message}</span>
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name = "", size = "md", photo = "" }) => {
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-12 h-12 text-lg" };
  return photo ? (
    <img src={photo} alt={name} className={`${sizes[size]} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
};

// ─── File Preview ─────────────────────────────────────────────────────────────
const FilePreview = ({ msg }) => {
  if (!msg.fileUrl) return null;
  if (msg.fileType === "image") {
    return (
      <div className="mt-1">
        <img src={msg.fileUrl} alt={msg.fileName}
          className="max-w-[220px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
          onClick={() => window.open(msg.fileUrl, "_blank")}
        />
      </div>
    );
  }
  if (msg.fileType === "video") {
    return <video src={msg.fileUrl} controls className="max-w-[260px] rounded-xl mt-1" />;
  }
  return (
    <a href={msg.fileUrl} download={msg.fileName} target="_blank" rel="noreferrer"
      className="flex items-center gap-2 mt-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl transition">
      <File size={16} />
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{msg.fileName || "File"}</p>
        {msg.fileSize && <p className="text-[10px] opacity-70">{msg.fileSize}</p>}
      </div>
      <Download size={13} className="shrink-0 ml-1" />
    </a>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TAB 1: Job Details ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const JobDetailsTab = ({ job, isApplied, isRejected, isSaved, onApply, onSave, bidAmount, setBidAmount }) => {
  const [showModal, setShowModal]             = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!job) return null;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="text-xs text-gray-400 font-medium mb-5">
            Posted {formatTimeAgo(job.postedTime)}
          </p>

          <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tracking-wide">
            JOB ID: {job.jobId}
          </span>
        </div>
        <h1 className="flex-1 text-2xl font-bold text-gray-800 leading-tight truncate">
          {job.title}
        </h1>
      </div>

      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Summary:</h2>
        <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">{job.description}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8  border-y border-gray-100">
        <div className="flex items-start gap-3">
          <Banknote className="text-gray-400 mt-1" size={22} />
          <div>
            <p className="text-sm font-bold text-gray-800">Budget: ₹{job.budget || "1500"}</p>
            <p className="text-xs text-gray-400">{job.allowNegotiation ? "Negotiable" : "Fixed Price"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <BarChart3 className="text-gray-400 mt-1" size={22} />
          <div>
            <p className="text-sm font-bold text-gray-800">{job.experienceLevel || "Intermediate"}</p>
            <p className="text-xs text-gray-400">Experience Level</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-4">Skills and expertise</h2>
        <div className="flex flex-wrap gap-2">
          {job.skills?.map((skill, i) => (
            <span key={i} className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-medium border border-teal-100">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-700">Activity on this job</h2>
        <p className="text-sm text-gray-500">Proposals: <span className="text-gray-800 font-medium">{job.proposals || 0}</span></p>
        <p className="text-sm text-gray-500">Last viewed by client: <span className="text-gray-800 font-medium">yesterday</span></p>
        <p className="text-sm text-gray-500">Interviewing: <span className="text-gray-800 font-medium">{job.interviewing || 0}</span></p>
        <p className="text-sm text-gray-500">Invites sent: <span className="text-gray-800 font-medium">{job.invitesSent || 0}</span></p>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-center mt-12 gap-2 pt-8 border-t border-gray-50">
        {isRejected ? (
          <button disabled
            className="flex-1 min-w-[160px] m-auto max-w-[260px] font-bold py-3.5 rounded-xl bg-gray-200 text-gray-400 cursor-not-allowed">
            Application Rejected
          </button>
        ) : (
          <button
            onClick={() => isApplied ? setShowCancelModal(true) : setShowModal(true)}
            className={`flex-1 min-w-[160px] m-auto max-w-[260px] font-bold py-3.5 rounded-xl transition-all shadow-lg ${
              isApplied
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100"
            }`}>
            {isApplied ? "Cancel Application" : "Apply to the job"}
          </button>
        )}
        <button onClick={onSave}
          className={`flex-1 min-w-[160px] m-auto max-w-[260px] border-2 font-bold py-3.5 rounded-xl transition-all ${
            isSaved
              ? "border-teal-600 text-teal-600 bg-teal-50"
              : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}>
          {isSaved ? "Job Saved" : "Save job"}
        </button>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-md font-bold text-gray-800">Est. budget: ₹{job.budget || "1500"}</h3>
                <p className="text-[10px] text-gray-400 font-bold">
                  {job.allowNegotiation ? "(Negotiable)" : "(Fixed Price)"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold">₹</span>
              </div>
              <input type="number" value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={!job.allowNegotiation}
                className={`w-full border-none rounded-xl py-4 pl-8 pr-12 font-bold text-gray-800 text-lg ${
                  job.allowNegotiation ? "bg-[#f3f4f6] focus:ring-2 focus:ring-teal-500" : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Pencil size={18} className="text-gray-400" />
              </div>
            </div>
            <button onClick={() => { onApply(bidAmount); setShowModal(false); }}
              className="w-full bg-[#1b4b43] hover:bg-[#143a34] text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-sm">
              Submit application
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-md font-bold text-gray-800">Are you sure you want to cancel your application?</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-300 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowCancelModal(false)}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-sm">
                Keep Application
              </button>
              <button onClick={() => { onApply(null); setShowCancelModal(false); }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-sm">
                Cancel Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TAB 3: Messages ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const MessagesTab = ({ jobId, clientInfo, isRejected }) => {
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [text, setText]                 = useState("");
  const [sending, setSending]           = useState(false);
  const [typing, setTyping]             = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview]   = useState(null);

  const messagesEndRef   = useRef(null);
  const chatContainerRef = useRef(null); // ✅ FIX: needed to detect if user has scrolled up
  const textareaRef      = useRef(null);
  const fileInputRef     = useRef(null);
  const pollRef          = useRef(null);
  const typingTimeout    = useRef(null);
  const socketRef        = useRef(null);
  const prevMsgCountRef  = useRef(0); // ✅ FIX: track count so we only scroll on truly new messages

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ✅ FIX: only treated as "near bottom" (safe to auto-scroll) if within ~150px of the bottom
  const isNearBottom = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  };

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const res = await apiFetch(`/api/freelancer/messages/${jobId}`);
      setMessages(res.messages || []);
      // ❌ REMOVED: setTimeout(scrollToBottom, 80) — was forcing scroll on every 8s poll
      // even when nothing new arrived / user was reading old messages.
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("join_room", jobId);
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      // ❌ REMOVED: setTimeout(scrollToBottom, 50) — now handled by the
      // length-aware effect below, which respects isNearBottom().
    });
    socket.on("user_typing",      () => { setTyping(true); setTimeout(() => setTyping(false), 3000); });
    socket.on("user_stop_typing", () => setTyping(false));

    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 8000);

    return () => {
      clearInterval(pollRef.current);
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [fetchMessages, jobId]);

  // ✅ FIX (issue 1 — auto-scroll):
  // Old code ran `scrollToBottom()` on every `messages` change, including the
  // 8s poll (which replaces the array even with identical content), so the
  // chat kept yanking you back down while reading. Now we only scroll when:
  //  - the message count actually grew (a real new message arrived), AND
  //  - it's either OUR own message, or the user was already near the bottom.
  // This stops the constant forced scroll while still following live chat.
  useEffect(() => {
    const newMessageArrived = messages.length > prevMsgCountRef.current;
    if (newMessageArrived) {
      const lastMsg = messages[messages.length - 1];
      const isOwnMessage = (lastMsg?.senderRole || "").toLowerCase() === "freelancer";
      if (isOwnMessage || isNearBottom()) {
        scrollToBottom();
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !selectedFile) return;
    if (isRejected) return;

    const optimistic = {
      _id:        Date.now().toString(),
      text:       text.trim(),
      senderId:   "me",
      senderRole: "freelancer",
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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      if (sentText) formData.append("text", sentText);
      if (sentFile) formData.append("file", sentFile);

      const res = await fetch(`${BASE_URL}/api/freelancer/messages`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
      });
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      // ✅ FIX (issue 2 — sender side glitch): make sure the message that
      // replaces the optimistic one always carries senderRole "freelancer",
      // even if the backend response happens to omit/rename that field.
      const confirmedMessage = { ...data.message, senderRole: data.message?.senderRole || "freelancer" };
      setMessages((prev) => prev.map((m) => m._id === optimistic._id ? confirmedMessage : m));
      socketRef.current?.emit("new_message", { jobId, message: confirmedMessage });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      alert(`Failed to send: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
    if (isRejected) return;
    socketRef.current?.emit("typing", { jobId, name: "Freelancer" });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { jobId });
    }, 1500);
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

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white shrink-0">
        <Avatar name={clientInfo?.name || "Client"} photo={clientInfo?.photo} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{clientInfo?.name || "Client"}</p>
          <p className={`text-xs font-medium ${isRejected ? "text-red-400" : "text-gray-400"}`}>
            {isRejected ? "Application Rejected" : typing ? "typing..." : "Job Client"}
          </p>
        </div>
      </div>

      {isRejected && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-b border-red-100 shrink-0">
          <Ban size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-500 font-medium">
            Your application was rejected. You can view previous messages but cannot send new ones.
          </p>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-[#f0f4f8]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-teal-500" />
          </div>
        ) : error ? (
          <ErrorBanner message={error} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Send size={20} className="opacity-30" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              // ✅ FIX (issue 2 — sender side glitch): rely ONLY on senderRole.
              // The old `msg.senderId === "me"` check only ever matched the
              // short-lived optimistic message; once the real message came
              // back from the server/poll (with a real senderId, no "me"),
              // it silently fell through to senderRole — and if that field
              // was ever missing/miscased, the message flipped to the left.
              const isMe = (msg.senderRole || "").toLowerCase() === "freelancer";
              const showDate =
                idx === 0 ||
                new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1]?.createdAt).toDateString();

              return (
                <React.Fragment key={msg._id || idx}>
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && <Avatar name={clientInfo?.name || "Client"} photo={clientInfo?.photo} size="sm" />}
                    <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMe
                          ? `bg-teal-600 text-white rounded-br-sm ${msg.pending ? "opacity-60" : ""}`
                          : "bg-white text-gray-800 rounded-bl-sm"
                      }`}>
                        {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                        <FilePreview msg={msg} />
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
          <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="text-teal-500 hover:text-teal-700 transition">
            <X size={16} />
          </button>
        </div>
      )}

      {isRejected ? (
        <div className="flex items-center justify-center px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400 font-medium">Messaging is disabled</p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0">
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
            <textarea ref={textareaRef} value={text} onChange={handleTyping}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Message client..."
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none resize-none max-h-24 leading-relaxed"
            />
          </div>
          <button type="submit"
            disabled={(!text.trim() && !selectedFile) || sending}
            className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Page ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const FreelancerJobApplication = () => {
  const { id: jobId } = useParams();

  const [job, setJob]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isSaved, setIsSaved]       = useState(false);
  const [isApplied, setIsApplied]   = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [bidAmount, setBidAmount]   = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const [activeTab, setActiveTab]   = useState("details");

  const token = getToken();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();
        setJob(data.data);
        setIsSaved(data.data?.isSaved       || false);
        setBidAmount(data.data?.budget      || "");
        setIsApplied(data.data?.isApplied   || false);
        setIsRejected(data.data?.isRejected || false);
        setClientInfo(data.data?.client     || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    fetch(`${BASE_URL}/api/jobs/${jobId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(console.error);
  }, [jobId]);

  const handleSave = async () => {
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      const res  = await fetch(`${BASE_URL}/api/jobs/${jobId}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIsSaved(data.saved);
    } catch (e) {
      setIsSaved(prev);
    }
  };

  const handleApply = async (bidValue) => {
    try {
      const res = await fetch(`${BASE_URL}/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bidAmount: bidValue ?? bidAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const newApplied = data.applied;
      setIsApplied(newApplied);
      setJob((prev) => ({ ...prev, isApplied: newApplied }));

      if (!newApplied) {
        await fetch(`${BASE_URL}/api/freelancer/messages/${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setActiveTab("details");
        alert("Application cancelled successfully!");
      } else {
        alert("Application submitted successfully!");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const tabs = [
    { key: "details",     label: "Job Details" },
    ...(isApplied || isRejected ? [{ key: "application", label: "Application" }] : []),
    ...(isApplied || isRejected ? [{ key: "messages",    label: "Messages"    }] : []),
  ];

  if (loading) return <div className="p-20 text-center text-teal-600 font-bold">Loading...</div>;
  if (!job)    return <div className="p-20 text-center">Job not found.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-white min-h-screen">
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-400 hover:text-gray-700"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "details" && (
          <JobDetailsTab
            job={job} isApplied={isApplied} isRejected={isRejected}
            isSaved={isSaved} onApply={handleApply} onSave={handleSave}
            bidAmount={bidAmount} setBidAmount={setBidAmount}
          />
        )}
        {activeTab === "application" && (isApplied || isRejected) && (
          <ApplicationTab jobId={jobId} />  // ✅ alag file se aa raha hai
        )}
        {activeTab === "messages" && (isApplied || isRejected) && (
          <MessagesTab jobId={jobId} clientInfo={clientInfo} isRejected={isRejected} />
        )}
      </div>
    </div>
  );
};

export default FreelancerJobApplication;