// ─── MessagesSection.jsx ──────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Send, Check, Search, MoreVertical, ArrowLeft, Loader2, Clock,
} from "lucide-react";
import { apiFetch, ErrorBanner, Avatar } from "./Shared";

const MessagesSection = ({ jobId, initialChatUser = null }) => {
  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null); // { userId, name, photo, email }
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgError, setMsgError] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Fetch conversation list — merges existing message threads with ALL applicants
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);

      const [convRes, appRes] = await Promise.allSettled([
        apiFetch(`/api/client/messages/conversations?jobId=${jobId}`),
        apiFetch(`/api/client/job-applications/${jobId}`),
      ]);

      const existingConvs = convRes.status === "fulfilled"
        ? (convRes.value.conversations || []) : [];

      const applicants = appRes.status === "fulfilled"
        ? (appRes.value.applications || []) : [];

      const convMap = new Map();
      existingConvs.forEach((c) => convMap.set(c.userId, c));

      applicants.forEach((app) => {
        const uid = app.user?._id;
        if (uid && !convMap.has(uid)) {
          convMap.set(uid, {
            userId:        uid,
            name:          app.user?.name,
            photo:         app.user?.photo,
            email:         app.user?.email,
            lastMessage:   null,
            lastMessageAt: null,
            unread:        0,
            status:        app.status,
          });
        } else if (uid && convMap.has(uid)) {
          convMap.set(uid, { ...convMap.get(uid), status: app.status });
        }
      });

      const merged = Array.from(convMap.values());
      setConversations(merged);

      if (initialChatUser && !selectedConv) {
        const match = merged.find((c) => c.userId === initialChatUser.user?._id);
        if (match) {
          setSelectedConv(match);
        } else {
          setSelectedConv({
            userId: initialChatUser.user?._id,
            name:   initialChatUser.user?.name,
            photo:  initialChatUser.user?.photo,
            email:  initialChatUser.user?.email,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvs(false);
    }
  }, [jobId]); // eslint-disable-line

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(
    async (userId) => {
      try {
        setLoadingMsgs(true);
        setMsgError(null);
        // GET /api/client/messages/:userId?jobId=...
        const res = await apiFetch(
          `/api/client/messages/${userId}?jobId=${jobId}`
        );
        setMessages(res.messages || []);
        setTimeout(scrollToBottom, 100);
      } catch (e) {
        setMsgError(e.message);
      } finally {
        setLoadingMsgs(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv.userId);
    // Poll every 5s for new messages
    pollRef.current = setInterval(
      () => fetchMessages(selectedConv.userId),
      5000
    );
    return () => clearInterval(pollRef.current);
  }, [selectedConv, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedConv) return;
    const optimistic = {
      _id: Date.now().toString(),
      text: text.trim(),
      senderId: "me",
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);
    setTimeout(scrollToBottom, 50);
    try {
      // POST /api/client/messages
      await apiFetch("/api/client/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedConv.userId,
          jobId,
          text: optimistic.text,
        }),
      });
      // Replace optimistic with real
      await fetchMessages(selectedConv.userId);
      await fetchConversations();
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      alert(`Failed to send: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">

      {/* ── Left Panel: Conversation List ──────────────────────────────────── */}
      <div
        className={`flex flex-col border-r border-gray-100 ${
          selectedConv
            ? "hidden md:flex w-72 shrink-0"
            : "flex w-full md:w-72 md:shrink-0"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-base mb-3">Messages</h3>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-teal-500" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Send size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No conversations yet</p>
              <p className="text-[11px] mt-1">Hire a freelancer to start chatting</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isActive = selectedConv?.userId === conv.userId;
              return (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                    isActive ? "bg-teal-50 border-l-2 border-l-teal-500" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar name={conv.name} photo={conv.photo} size="md" />
                    {conv.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread > 9 ? "9+" : conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {conv.name}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                        {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-gray-400 truncate">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                      {conv.status && (
                        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          conv.status === "accepted"    ? "bg-green-50 text-green-600 border-green-200" :
                          conv.status === "rejected"    ? "bg-red-50 text-red-500 border-red-200" :
                          conv.status === "negotiation" ? "bg-blue-50 text-blue-600 border-blue-200" :
                          "bg-yellow-50 text-yellow-600 border-yellow-200"
                        }`}>
                          {conv.status}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Panel: Chat Window ───────────────────────────────────────── */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <button
              className="md:hidden mr-1 text-gray-500"
              onClick={() => setSelectedConv(null)}
            >
              <ArrowLeft size={18} />
            </button>
            <Avatar name={selectedConv.name} photo={selectedConv.photo} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">{selectedConv.name}</p>
              <p className={`text-xs font-medium ${
                selectedConv.status === "accepted"    ? "text-green-500" :
                selectedConv.status === "rejected"    ? "text-red-400" :
                selectedConv.status === "negotiation" ? "text-blue-500" :
                "text-yellow-500"
              }`}>
                {selectedConv.status === "accepted"    ? "Hired Freelancer" :
                 selectedConv.status === "rejected"    ? "Rejected" :
                 selectedConv.status === "negotiation" ? "In Negotiation" :
                 "Applied"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#f0f4f8]">
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
                <p className="text-sm font-medium">Say hello!</p>
                <p className="text-xs mt-1">
                  Start the conversation with your freelancer
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const isMe =
                    msg.senderId === "me" || msg.senderRole === "client";
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
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {!isMe && (
                          <Avatar
                            name={selectedConv.name}
                            photo={selectedConv.photo}
                            size="sm"
                          />
                        )}
                        <div
                          className={`max-w-[65%] mx-2 ${
                            isMe ? "items-end" : "items-start"
                          } flex flex-col`}
                        >
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                              isMe
                                ? `bg-teal-600 text-white rounded-br-sm ${
                                    msg.pending ? "opacity-70" : ""
                                  }`
                                : "bg-white text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-0.5 ${
                              isMe ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span className="text-[10px] text-gray-400">
                              {formatTime(msg.createdAt)}
                            </span>
                            {isMe && !msg.pending && (
                              <Check size={10} className="text-teal-500" />
                            )}
                            {isMe && msg.pending && (
                              <Clock size={10} className="text-gray-300" />
                            )}
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

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0"
          >
            <div className="flex-1 flex items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-teal-400 transition-colors">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent text-sm outline-none resize-none max-h-24 leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Empty state when no conversation selected (desktop) */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-[#f0f4f8]">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Send size={28} className="opacity-30" />
          </div>
          <p className="text-base font-semibold text-gray-500">
            Select a conversation
          </p>
          <p className="text-sm mt-1">Choose a freelancer to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default MessagesSection;