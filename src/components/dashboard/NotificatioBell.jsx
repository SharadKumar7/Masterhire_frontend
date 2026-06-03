import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, BriefcaseBusiness, MessageSquare, IndianRupee,
  CheckCircle2, UserCheck, X, Check, CheckCheck,
  Loader2, AlertCircle, ChevronRight, Trash2,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

// ─── Type config — icon + colors per notification type ────────────────────────
const TYPE_CONFIG = {
  JOB_APPLIED: {
    icon: BriefcaseBusiness,
    iconBg: "bg-teal-50 text-teal-600",
    dotColor: "bg-teal-500",
  },
  JOB_ASSIGNED: {
    icon: UserCheck,
    iconBg: "bg-emerald-50 text-emerald-600",
    dotColor: "bg-emerald-500",
  },
  NEW_MESSAGE: {
    icon: MessageSquare,
    iconBg: "bg-blue-50 text-blue-600",
    dotColor: "bg-blue-500",
  },
  PAYMENT_RECEIVED: {
    icon: IndianRupee,
    iconBg: "bg-violet-50 text-violet-600",
    dotColor: "bg-violet-500",
  },
  JOB_COMPLETED: {
    icon: CheckCircle2,
    iconBg: "bg-amber-50 text-amber-600",
    dotColor: "bg-amber-500",
  },
};

// ─── Time ago helper ──────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ─── Navigation links per notification type ───────────────────────────────────
// ⚠️ Replace these URLs with your actual route paths
const getNotificationLink = (type, referenceId) => {
  const id = referenceId?.toString() || "";
  switch (type) {
    case "JOB_APPLIED":
      // Client → job applications page (someone applied to your job)
      // Freelancer → their application status page
      return `/client/dashboard/jobs/${id}/applications`;

    case "JOB_ASSIGNED":
      // Freelancer → job detail / contract page
      return `/freelancer/dashboard/applications/${id}`;

    case "NEW_MESSAGE":
      // Both → message thread for this job
      return `/freelancer/dashboard/messages/${id}`;

    case "PAYMENT_RECEIVED":
      // Freelancer → transaction/payment page
      return `/freelancer/dashboard/transactions`;

    case "JOB_COMPLETED":
      // Both → contract detail
      return `/freelancer/dashboard/contracts/${id}`;

    default:
      return null;
  }
};

// ─── Single notification row ──────────────────────────────────────────────────
const NotificationItem = ({ notification, onMarkRead, onDelete, onClose }) => {
  const navigate = useNavigate();
  const cfg  = TYPE_CONFIG[notification.type] || TYPE_CONFIG.NEW_MESSAGE;
  const Icon = cfg.icon;

  const handleClick = () => {
    if (!notification.isRead) onMarkRead(notification._id);
    onClose();
    const link = getNotificationLink(notification.type, notification.referenceId);
    if (link) navigate(link);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 group ${
        !notification.isRead ? "bg-teal-50/50" : ""
      }`}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`} />
      )}

      {/* Type icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
        <Icon size={15} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-1">
        <p className={`text-xs leading-snug ${
          !notification.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
        }`}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Action buttons — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!notification.isRead && (
          <button
            onClick={e => { e.stopPropagation(); onMarkRead(notification._id); }}
            title="Mark as read"
            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 transition-all"
          >
            <Check size={10} className="text-slate-400" />
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDelete(notification._id); }}
          title="Delete"
          className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-all"
        >
          <Trash2 size={10} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
};

// ─── Main NotificationBell component ─────────────────────────────────────────
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(false);
  const [open, setOpen]                   = useState(false);
  const [filter, setFilter]               = useState("all"); // "all" | "unread"
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Mount + poll every 30s ────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // ── Mark single read ──────────────────────────────────────────────────────
  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: false } : n));
    }
  };

  // ── Mark all read ─────────────────────────────────────────────────────────
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  // ── Delete single ─────────────────────────────────────────────────────────
  const deleteOne = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await fetch(`${apiUrl}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  // ── Clear all ─────────────────────────────────────────────────────────────
  const clearAll = async () => {
    setNotifications([]);
    try {
      await fetch(`${apiUrl}/api/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const displayed = filter === "unread"
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative p-2 rounded-xl transition-all ${
          open
            ? "bg-teal-50 text-teal-600"
            : "text-slate-500 hover:text-teal-600 hover:bg-teal-50"
        }`}
      >
        <Bell size={28} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800 px-2 py-1 rounded-lg hover:bg-teal-50 transition-all"
                >
                  <CheckCheck size={12} /> All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-500 px-2 py-1 rounded-lg hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors ml-1"
              >
                <X size={12} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex px-4 border-b border-slate-100">
            {[
              { key: "all",    label: `All (${notifications.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 mr-4 text-xs font-bold border-b-2 -mb-px transition-colors ${
                  filter === tab.key
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={22} className="text-teal-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <AlertCircle size={22} className="text-rose-400" />
                <p className="text-xs text-slate-400">Failed to load notifications</p>
                <button onClick={fetchNotifications}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">
                  Try again
                </button>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <Bell size={30} className="text-slate-200" />
                <p className="text-sm font-semibold text-slate-400">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            ) : (
              displayed.map(n => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onMarkRead={markRead}
                  onDelete={deleteOne}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5">
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors py-1"
              >
                View all notifications <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;