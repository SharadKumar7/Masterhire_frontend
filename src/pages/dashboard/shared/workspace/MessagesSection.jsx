// ─── WorkspaceMessagesSection.jsx ────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Send, Check, MoreVertical, Loader2, Clock,
  Phone, Video, Paperclip, Image, X, Download, File,
  PhoneCall, PhoneOff, PhoneMissed, PhoneIncoming,
} from "lucide-react";
import { io } from "socket.io-client";
import { apiFetch, ErrorBanner, Avatar, BASE_URL, getToken } from "./Shared";

const SOCKET_URL = BASE_URL.replace("/workspace", "");
import VideoCallModal from "./VideoCallModel";

let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token: getToken() },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

// ─── File Preview ─────────────────────────────────────────────────────────────
const FilePreview = ({ msg }) => {
  if (!msg.fileUrl) return null;
  if (msg.fileType === "image") {
    return (
      <div className="mt-1">
        <img src={msg.fileUrl} alt={msg.fileName}
          className="max-w-[220px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
          onClick={() => window.open(msg.fileUrl, "_blank")} />
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

// ─── Call Log Bubble ─────────────────────────────────────────────────────────
const CallLogBubble = ({ msg, isMe }) => {
  const isMissed   = msg.callStatus === "missed";
  const isRejected = msg.callStatus === "rejected";
  const isVideo    = msg.callType   === "video";

  const formatDuration = (s) => {
    if (!s) return "";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const Icon = isMissed || isRejected
    ? PhoneMissed
    : isVideo ? Video : Phone;

  const color = isMissed || isRejected ? "text-red-500" : "text-green-500";
  const label = isMissed
    ? `Missed ${isVideo ? "video" : "voice"} call`
    : isRejected
    ? `${isVideo ? "Video" : "Voice"} call declined`
    : `${isVideo ? "Video" : "Voice"} call${msg.callDuration ? ` · ${formatDuration(msg.callDuration)}` : ""}`;

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm shadow-sm max-w-[220px]
      ${isMe ? "bg-teal-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"}`}>
      <Icon size={16} className={isMe ? "text-white/80" : color} />
      <span className={`text-xs font-medium ${isMe ? "text-white/90" : "text-gray-600"}`}>
        {label}
      </span>
    </div>
  );
};

// ─── Incoming Call Banner ─────────────────────────────────────────────────────
const IncomingCallBanner = ({ call, callerName, onAccept, onReject }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
    <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
      <PhoneCall size={16} className="text-green-400 animate-bounce" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white">{callerName}</p>
      <p className="text-xs text-gray-400">
        Incoming {call.callType === "video" ? "video" : "voice"} call...
      </p>
    </div>
    <button onClick={onReject}
      className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition shrink-0">
      <PhoneOff size={15} className="text-white" />
    </button>
    <button onClick={onAccept}
      className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition shrink-0">
      <Phone size={15} className="text-white" />
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const WorkspaceMessagesSection = ({ 
  projectId, freelancer, role = "client",
  sharedSocket,              // socket from parent workspace
  incomingCallFromParent,    // incoming call passed from parent
  onIncomingCallHandled,     // clear parent's incomingCall state
}) => {
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [text, setText]                 = useState("");
  const [sending, setSending]           = useState(false);
  const [typing, setTyping]             = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview]   = useState(null);
  const [callModal, setCallModal]       = useState({ open: false, type: "video", incoming: null });
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const fileInputRef   = useRef(null);
  const pollRef        = useRef(null);
  const typingTimeout  = useRef(null);
  const socketRef      = useRef(null);

  const otherPersonLabel = role === "client" ? "Hired Freelancer" : "Client";

  // Sync incoming call from parent (workspace-level socket)
  useEffect(() => {
    if (incomingCallFromParent) {
      setIncomingCall(incomingCallFromParent);
    }
  }, [incomingCallFromParent]);
  const checkIsMe = (msg) =>
    role === "client"
      ? msg.senderId === "me" || msg.senderRole === "client"
      : msg.senderId === "me" || msg.senderRole === "freelancer";

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ── Save call log to DB + chat ────────────────────────────────────────────
  const saveCallLog = async ({ callType, callStatus, callDuration }) => {
    if (!freelancer?._id || !projectId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/client/messages/call-log`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          receiverId: freelancer._id,
          jobId:      projectId,
          callType,
          callStatus,
          callDuration,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(prev => [...prev, data.message]);
      setTimeout(scrollToBottom, 50);
      // Also broadcast to other side via socket
      socketRef.current?.emit("new_message", { jobId: projectId, message: data.message });
    } catch (e) {
      console.error("saveCallLog error:", e);
    }
  };

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!freelancer?._id) return;
    try {
      setError(null);
      const res = await apiFetch(`/api/client/messages/${freelancer._id}?jobId=${projectId}`);
      setMessages(res.messages || []);
      setTimeout(scrollToBottom, 80);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, freelancer?._id]);

  // ── Socket setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!freelancer?._id) return;
    const socket = sharedSocket?.current || getSocket();
    socketRef.current = socket;
    socket.emit("join_room", projectId);

    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(scrollToBottom, 50);
    });

    socket.on("user_typing",      () => { setTyping(true); setTimeout(() => setTyping(false), 3000); });
    socket.on("user_stop_typing", () => setTyping(false));

    // Incoming call
    socket.on("incoming_call", ({ from, offer, callType, callerName, jobId, receiverId }) => {
      setIncomingCall({ from, offer, callType, callerName, jobId, receiverId });
    });

    // Call ended by other side
    socket.on("call_ended", () => {
      setIncomingCall(null);
      if (callModal.open) {
        const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
        saveCallLog({ callType: callModal.type, callStatus: "ended", callDuration: duration });
        setCallModal({ open: false, type: "video", incoming: null });
        setCallStartTime(null);
      }
    });

    // Missed call (auto-cut after 60s)
    socket.on("call_missed", ({ callType }) => {
      setIncomingCall(null);
      setCallModal({ open: false, type: "video", incoming: null });
      saveCallLog({ callType: callType || "audio", callStatus: "missed", callDuration: 0 });
    });

    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 8000);

    return () => {
      clearInterval(pollRef.current);
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("incoming_call");
      socket.off("call_ended");
      socket.off("call_missed");
    };
  }, [fetchMessages, freelancer?._id, projectId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // ── Accept call ─────────────────────────────────────────────────────────────
  const handleAcceptCall = () => {
    if (!incomingCall) return;
    onIncomingCallHandled?.();
    setCallStartTime(Date.now());
    setCallModal({
      open:     true,
      type:     incomingCall.callType,
      incoming: { from: incomingCall.from, offer: incomingCall.offer },
    });
    setIncomingCall(null);
  };

  // ── Reject call ─────────────────────────────────────────────────────────────
  const handleRejectCall = () => {
    if (!incomingCall) return;
    onIncomingCallHandled?.();
    socketRef.current?.emit("end_call", { to: incomingCall.from });
    saveCallLog({ callType: incomingCall.callType, callStatus: "rejected", callDuration: 0 });
    setIncomingCall(null);
  };

  // ── End call (from modal) ───────────────────────────────────────────────────
  const handleCallEnd = (callType) => {
    const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
    saveCallLog({ callType, callStatus: "ended", callDuration: duration });
    setCallModal({ open: false, type: "video", incoming: null });
    setCallStartTime(null);
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!text.trim() && !selectedFile) || !freelancer?._id) return;

    const optimistic = {
      _id:         Date.now().toString(),
      text:        text.trim(),
      senderId:    "me",
      senderRole:  role,
      createdAt:   new Date().toISOString(),
      pending:     true,
      messageType: "text",
      fileUrl:     filePreview,
      fileName:    selectedFile?.name,
      fileType:    selectedFile
        ? selectedFile.type.startsWith("image/") ? "image"
        : selectedFile.type.startsWith("video/") ? "video"
        : "document"
        : null,
    };

    setMessages(prev => [...prev, optimistic]);
    const sentText = text.trim();
    const sentFile = selectedFile;
    setText("");
    setSelectedFile(null);
    setFilePreview(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);
    setTimeout(scrollToBottom, 50);

    try {
      const formData = new FormData();
      formData.append("receiverId", freelancer._id);
      formData.append("jobId",      projectId);
      if (sentText) formData.append("text", sentText);
      if (sentFile) formData.append("file", sentFile);

      const res = await fetch(`${BASE_URL}/api/client/messages`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
      });
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      setMessages(prev => prev.map(m => m._id === optimistic._id ? data.message : m));
      socketRef.current?.emit("new_message", { jobId: projectId, message: data.message });
    } catch (e) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      alert(`Failed to send: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
    socketRef.current?.emit("typing", { jobId: projectId, name: role === "client" ? "Client" : "Freelancer" });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { jobId: projectId });
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
    const d = new Date(iso), now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!freelancer?._id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Send size={22} className="opacity-30" />
        </div>
        <p className="text-sm font-semibold text-gray-500">
          {role === "client" ? "No freelancer assigned yet" : "Client info unavailable"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white shrink-0">
          <Avatar name={freelancer.name} photo={freelancer.photo} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">{freelancer.name}</p>
            <p className="text-xs text-gray-400 font-medium">
              {typing ? "typing..." : otherPersonLabel}
            </p>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <button
              onClick={() => { setCallStartTime(Date.now()); setCallModal({ open: true, type: "audio", incoming: null }); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Voice call">
              <Phone size={16} />
            </button>
            <button
              onClick={() => { setCallStartTime(Date.now()); setCallModal({ open: true, type: "video", incoming: null }); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Video call">
              <Video size={16} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* ── Incoming Call Banner ────────────────────────────────────────────── */}
        {incomingCall && (
          <IncomingCallBanner
            call={incomingCall}
            callerName={incomingCall.callerName || freelancer.name}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
          />
        )}

        {/* ── Messages ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-[#f0f4f8]">
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
              <p className="text-sm font-medium">Say hello!</p>
              <p className="text-xs mt-1">Start the conversation with {freelancer.name}</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isMe     = checkIsMe(msg);
                const showDate = idx === 0 ||
                  new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1]?.createdAt).toDateString();
                const isCallLog = msg.messageType === "call_log";

                return (
                  <React.Fragment key={msg._id || idx}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    {/* Call log — centered */}
                    {isCallLog ? (
                      <div className="flex justify-center my-2">
                        <CallLogBubble msg={msg} isMe={isMe} />
                      </div>
                    ) : (
                      <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && <Avatar name={freelancer.name} photo={freelancer.photo} size="sm" />}
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
                    )}
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ── File preview bar ───────────────────────────────────────────────── */}
        {selectedFile && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-teal-50 border-t border-teal-100 shrink-0">
            {filePreview
              ? <img src={filePreview} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
              : <div className="w-10 h-10 bg-white rounded-lg border border-teal-200 flex items-center justify-center">
                  <File size={16} className="text-teal-600" />
                </div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-teal-800 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-teal-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => { setSelectedFile(null); setFilePreview(null); }}
              className="text-teal-500 hover:text-teal-700 transition">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Input ──────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSend}
          className="flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0">
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-teal-600 transition shrink-0" title="Attach file">
            <Paperclip size={18} />
          </button>
          <input ref={fileInputRef} type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt"
            className="hidden" onChange={handleFileSelect} />

          <button type="button"
            onClick={() => {
              const inp = document.createElement("input");
              inp.type = "file"; inp.accept = "image/*";
              inp.onchange = (e) => handleFileSelect(e); inp.click();
            }}
            className="p-2 text-gray-400 hover:text-teal-600 transition shrink-0" title="Send image">
            <Image size={18} />
          </button>

          <div className="flex-1 flex items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-teal-400 transition-colors">
            <textarea ref={textareaRef} value={text} onChange={handleTyping}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message ${freelancer.name}...`} rows={1}
              className="flex-1 bg-transparent text-sm outline-none resize-none max-h-24 leading-relaxed" />
          </div>

          <button type="submit"
            disabled={(!text.trim() && !selectedFile) || sending}
            className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>

      {/* ── Video Call Modal ──────────────────────────────────────────────────── */}
      <VideoCallModal
        isOpen={callModal.open}
        onClose={() => handleCallEnd(callModal.type)}
        callType={callModal.type}
        freelancer={freelancer}
        socket={socketRef.current}
        incomingOffer={callModal.incoming}
        peerId={freelancer._id?.toString()}
        callerName={role === "client" ? "Client" : "Freelancer"}
      />
    </>
  );
};

export default WorkspaceMessagesSection;