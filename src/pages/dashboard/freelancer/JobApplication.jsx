import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, IndianRupee, Briefcase, CheckCircle2,
  Loader2, AlertCircle, PencilLine, Send, ChevronRight,
  BadgeCheck, Ban, Banknote, BarChart3, ChevronLeft, Pencil, X,
  Check, MoreVertical, Phone, Video, Paperclip, Image, File,
  Download, PhoneCall, PhoneOff,
} from "lucide-react";
import { io } from "socket.io-client";
import formatTimeAgo from "../../../components/dashboard/formatTimeAgo";

// ─── Shared ───────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const apiFetch = async (url, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Something went wrong");
  }
  return res.json();
};

const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-teal-600">
    <Loader2 size={28} className="animate-spin" />
    <p className="text-sm font-medium text-gray-400">{text}</p>
  </div>
);

const ErrorBanner = ({ message }) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">
    <AlertCircle size={17} />
    <span>{message}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    pending:     { color: "bg-yellow-50 text-yellow-600 border-yellow-200", label: "Pending Review" },
    negotiation: { color: "bg-blue-50 text-blue-600 border-blue-200",       label: "In Negotiation" },
    accepted:    { color: "bg-green-50 text-green-600 border-green-200",    label: "Accepted" },
    rejected:    { color: "bg-red-50 text-red-500 border-red-200",          label: "Rejected" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${c.color}`}>
      {c.label}
    </span>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, photo, size = "md" }) => {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  return photo ? (
    <img src={photo} alt={name} className={`${sizes[size]} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
};

// ─── Socket singleton ─────────────────────────────────────────────────────────
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(BASE_URL, {
      auth:              { token: getToken() },
      transports:        ["websocket"],
      reconnection:      true,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

// ─── 1. Project Details Tab  (JobDetailsPage code) ───────────────────────────
const ProjectDetailsTab = ({ jobId }) => {
  const navigate = useNavigate();

  const [job, setJob]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isSaved, setIsSaved]       = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [isApplied, setIsApplied]   = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [bidAmount, setBidAmount]   = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const token = getToken();

  // Fetch job
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch job");
        const data = await response.json();
        setJob(data.data);
        setIsSaved(data.data?.isSaved || false);
        setBidAmount(data.data?.budget || "");
        setIsApplied(data.data?.isApplied || false);
        setIsRejected(data.data?.applicationStatus === "rejected" || false);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  // Track view
  useEffect(() => {
    if (!jobId) return;
    const trackView = async () => {
      try {
        await fetch(`${BASE_URL}/api/jobs/${jobId}/view`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Failed to track view", error);
      }
    };
    trackView();
  }, [jobId]);

  // Save toggle
  const handleSave = async () => {
    const prevState = isSaved;
    setIsSaved(!prevState);
    try {
      const response = await fetch(`${BASE_URL}/api/jobs/${jobId}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save toggle failed");
      setIsSaved(data.saved);
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(prevState);
    }
  };

  // Apply toggle
  const handleToggleApplication = async (bidValue) => {
    try {
      const response = await fetch(`${BASE_URL}/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bidAmount: bidValue ?? bidAmount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Application toggle failed");
      const newAppliedState = data.applied;
      setIsApplied(newAppliedState);
      setJob((prev) => ({ ...prev, isApplied: newAppliedState }));
      if (newAppliedState) {
        alert("Application submitted successfully!");
        setShowModal(false);
      } else {
        alert("Application cancelled successfully!");
        setShowCancelModal(false);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <Spinner text="Loading project details..." />;
  if (!job)    return <div className="text-center py-16 text-gray-400">Job not found.</div>;

  return (
    <div className="w-full relative">
      {/* Title & Time */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 font-medium mb-5">
          Posted {formatTimeAgo(job.postedTime)}
        </p>
        <h1 className="text-2xl font-bold text-gray-800 leading-tight mb-1">
          {job.title}
        </h1>
      </div>

      <div className="space-y-10">
        {/* Summary */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Summary:</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-100">
          <div className="flex items-start gap-3">
            <Banknote className="text-gray-400 mt-1" size={22} />
            <div>
              <p className="text-sm font-bold text-gray-800">Budget: ₹{job.budget || "1500"}</p>
              <p className="text-xs text-gray-400">Negotiable</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="text-gray-400 mt-1" size={22} />
            <div>
              <p className="text-sm font-bold text-gray-800">Est. budget: ₹{job.budget || "1500"}</p>
              <p className="text-xs text-gray-400">Negotiable</p>
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

        {/* Skills */}
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

        {/* Activity */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700">Activity on this job</h2>
          <p className="text-sm text-gray-500">Proposals: <span className="text-gray-800 font-medium">{job.proposals || 0}</span></p>
          <p className="text-sm text-gray-500">Last viewed by client: <span className="text-gray-800 font-medium">yesterday</span></p>
          <p className="text-sm text-gray-500">Interviewing: <span className="text-gray-800 font-medium">{job.interviewing || 0}</span></p>
          <p className="text-sm text-gray-500">Invites sent: <span className="text-gray-800 font-medium">{job.invitesSent || 0}</span></p>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mt-12 gap-2 pt-8 border-t border-gray-50">
        {isRejected ? (
          /* ── Rejected state — no apply/cancel, show locked UI ── */
          <div className="flex-1 max-w-[540px] flex items-center justify-center gap-3 bg-red-50 border border-red-200 rounded-xl py-4 px-6">
            <Ban size={18} className="text-red-400 shrink-0" />
            <p className="text-sm font-semibold text-red-500">Your application was rejected by the client</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => { isApplied ? setShowCancelModal(true) : setShowModal(true); }}
              className={`flex-1 min-w-[160px] m-auto max-w-[260px] font-bold py-3.5 rounded-xl transition-all shadow-lg ${
                isApplied ? "bg-red-500 hover:bg-red-600 text-white" : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100"
              }`}
            >
              {isApplied ? "Cancel Application" : "Apply to the job"}
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 min-w-[160px] m-auto max-w-[260px] border-2 font-bold py-3.5 rounded-xl transition-all ${
                isSaved ? "border-teal-600 text-teal-600 bg-teal-50" : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isSaved ? "Job Saved" : "Save job"}
            </button>
          </>
        )}
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-md font-bold text-gray-800">Est. budget: ₹{job.budget || "1500"}</h3>
                <p className="text-[10px] text-gray-400 font-bold">{job.isNegotiable ? "(Negotiable)" : "(Fixed Price)"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-500"><X size={20} /></button>
            </div>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold">₹</span>
              </div>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={!job.isNegotiable}
                className={`w-full border-none rounded-xl py-4 pl-8 pr-12 font-bold text-gray-800 text-lg ${
                  job.isNegotiable ? "bg-[#f3f4f6] focus:ring-2 focus:ring-teal-500" : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Pencil size={18} className="text-gray-400" />
              </div>
            </div>
            <button
              onClick={() => handleToggleApplication(bidAmount)}
              className="w-full bg-[#1b4b43] hover:bg-[#143a34] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-sm"
            >
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
              <h3 className="text-md font-bold text-gray-800">Are you sure you want to cancel your application for this job?</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-300 hover:text-gray-500"><X size={20} /></button>
            </div>
            <div className="flex flex-row gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-sm"
              >
                Keep Application
              </button>
              <button
                onClick={() => handleToggleApplication(null)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-sm"
              >
                Cancel Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 2. Application Status Tab ─── SAME, NO CHANGES ──────────────────────────
const ApplicationTab = ({ jobId }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [negotiateMode, setNegotiateMode] = useState(false);
  const [newBid, setNewBid]           = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");

  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/freelancer/application/${jobId}`);
      setApplication(res.application);
      setNewBid(res.application?.bidAmount?.toString() || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { loadApplication(); }, [loadApplication]);

  const handleNegotiate = async (e) => {
    e.preventDefault();
    if (!newBid || isNaN(Number(newBid))) { alert("Please enter a valid amount"); return; }
    try {
      setSubmitting(true);
      await apiFetch(`/api/freelancer/application/${application._id}/negotiate`, {
        method: "PATCH",
        body: JSON.stringify({ bidAmount: Number(newBid) }),
      });
      setSuccessMsg("Counter offer sent successfully!");
      setNegotiateMode(false);
      await loadApplication();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="Loading your application..." />;
  if (error)   return <ErrorBanner message={error} />;
  if (!application) return (
    <div className="text-center py-16 text-gray-400 text-sm">
      <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
      No application found for this job
    </div>
  );

  const canNegotiate = ["pending", "negotiation"].includes(application.status);
  const updatedAt = application.updatedAt
    ? new Date(application.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="space-y-5">
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Application Status</p>
          <StatusBadge status={application.status} />
        </div>
        {updatedAt && <p className="text-[11px] text-gray-400">Updated {updatedAt}</p>}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Your Bid</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">₹{application.bidAmount?.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-400 mt-1">Proposed amount</p>
          </div>
          {canNegotiate && !negotiateMode && (
            <button onClick={() => setNegotiateMode(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
              <PencilLine size={14} /> Edit Offer
            </button>
          )}
        </div>
      </div>

      {application.status === "pending" && !negotiateMode && (
        <div className="w-full py-5 px-6 border border-gray-100 bg-gray-50 text-center rounded-xl shadow-sm">
          <Clock size={20} className="mx-auto text-yellow-400 mb-2" />
          <p className="text-sm text-gray-500 italic">The client is yet to review your application</p>
        </div>
      )}

      {application.status === "negotiation" && !negotiateMode && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ChevronRight size={16} className="text-blue-500" />
            <p className="text-sm font-semibold text-blue-700">Negotiation in progress</p>
          </div>
          <p className="text-xs text-blue-500">The client has initiated negotiation. You can send a counter offer below.</p>
        </div>
      )}

      {application.status === "accepted" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
          <BadgeCheck size={32} className="text-green-500 shrink-0" />
          <div>
            <p className="font-bold text-green-700 text-sm">Congratulations! You've been hired.</p>
            <p className="text-xs text-green-500 mt-0.5">The client has accepted your application.</p>
          </div>
        </div>
      )}

      {application.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <Ban size={28} className="text-red-400 shrink-0" />
          <div>
            <p className="font-bold text-red-600 text-sm">Application Rejected</p>
            <p className="text-xs text-red-400 mt-0.5">The client has rejected your application.</p>
          </div>
        </div>
      )}

      {negotiateMode && (
        <form onSubmit={handleNegotiate} className="bg-white border border-teal-200 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-gray-700">Send Counter Offer</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
            <input type="number" value={newBid} onChange={(e) => setNewBid(e.target.value)}
              placeholder="Your proposed amount"
              className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              required autoFocus />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setNegotiateMode(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {submitting ? "Sending..." : "Submit Offer"}
            </button>
          </div>
        </form>
      )}

      {application.proposal && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Your Proposal</p>
          <p className="text-sm text-gray-600 leading-relaxed">{application.proposal}</p>
        </div>
      )}
    </div>
  );
};

// ─── 3. Messages Tab  (WorkspaceMessagesSection code) ────────────────────────

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

const IncomingCallBanner = ({ call, callerName, onAccept, onReject }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
    <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
      <PhoneCall size={16} className="text-green-400 animate-bounce" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white">{callerName}</p>
      <p className="text-xs text-gray-400">Incoming {call.callType === "video" ? "video" : "voice"} call...</p>
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

const MessagesTab = ({ projectId, clientInfo, isRejected = false }) => {
  const [messages, setMessages]         = useState([]);
  const [loadingMsg, setLoadingMsg]     = useState(true);
  const [errorMsg, setErrorMsg]         = useState(null);
  const [text, setText]                 = useState("");
  const [sending, setSending]           = useState(false);
  const [typing, setTyping]             = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview]   = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const fileInputRef   = useRef(null);
  const pollRef        = useRef(null);
  const typingTimeout  = useRef(null);
  const socketRef      = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchMessages = useCallback(async () => {
    if (!clientInfo?._id) return;
    try {
      setErrorMsg(null);
      const res = await apiFetch(`/api/client/messages/${clientInfo._id}?jobId=${projectId}`);
      setMessages(res.messages || []);
      setTimeout(scrollToBottom, 80);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoadingMsg(false);
    }
  }, [projectId, clientInfo?._id]);

  useEffect(() => {
    if (!clientInfo?._id) return;
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("join_room", projectId);
    socket.on("receive_message", (msg) => { setMessages((prev) => [...prev, msg]); setTimeout(scrollToBottom, 50); });
    socket.on("user_typing",      () => { setTyping(true);  setTimeout(() => setTyping(false), 3000); });
    socket.on("user_stop_typing", () => setTyping(false));
    socket.on("incoming_call",    ({ from, offer, callType, callerName }) => setIncomingCall({ from, offer, callType, callerName }));
    socket.on("call_ended",       () => setIncomingCall(null));
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 8000);
    return () => {
      clearInterval(pollRef.current);
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("incoming_call");
      socket.off("call_ended");
    };
  }, [fetchMessages, clientInfo?._id, projectId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!text.trim() && !selectedFile) || !clientInfo?._id) return;
    const optimistic = {
      _id: Date.now().toString(), text: text.trim(), senderId: "me",
      senderRole: "freelancer", createdAt: new Date().toISOString(), pending: true,
      fileUrl: filePreview, fileName: selectedFile?.name,
      fileType: selectedFile
        ? selectedFile.type.startsWith("image/") ? "image"
        : selectedFile.type.startsWith("video/") ? "video" : "document"
        : null,
    };
    setMessages((prev) => [...prev, optimistic]);
    const sentText = text.trim();
    const sentFile = selectedFile;
    setText(""); setSelectedFile(null); setFilePreview(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);
    setTimeout(scrollToBottom, 50);
    try {
      const formData = new FormData();
      formData.append("receiverId", clientInfo._id);
      formData.append("jobId", projectId);
      if (sentText) formData.append("text", sentText);
      if (sentFile) formData.append("file", sentFile);
      const res = await fetch(`${BASE_URL}/api/client/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      setMessages((prev) => prev.map((m) => m._id === optimistic._id ? data.message : m));
      socketRef.current?.emit("new_message", { jobId: projectId, message: data.message });
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
    socketRef.current?.emit("typing", { jobId: projectId, name: "Freelancer" });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socketRef.current?.emit("stop_typing", { jobId: projectId }), 1500);
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

  const formatTime = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (iso) => {
    const d = new Date(iso); const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!clientInfo?._id) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <Send size={22} className="opacity-30 mb-3" />
      <p className="text-sm font-semibold text-gray-500">Client info unavailable</p>
      <p className="text-xs mt-1">Project details not loaded</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white shrink-0">
        <Avatar name={clientInfo.name} photo={clientInfo.photo} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{clientInfo.name}</p>
          <p className="text-xs text-gray-400 font-medium">{typing ? "typing..." : "Client"}</p>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Phone size={16} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Video size={16} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={16} /></button>
        </div>
      </div>

      {/* Incoming Call Banner */}
      {incomingCall && (
        <IncomingCallBanner
          call={incomingCall}
          callerName={incomingCall.callerName || clientInfo.name}
          onAccept={() => setIncomingCall(null)}
          onReject={() => { socketRef.current?.emit("end_call", { to: incomingCall.from }); setIncomingCall(null); }}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-[#f0f4f8]">
        {loadingMsg ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-teal-500" /></div>
        ) : errorMsg ? (
          <ErrorBanner message={errorMsg} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Send size={20} className="opacity-30 mb-3" />
            <p className="text-sm font-medium">Say hello!</p>
            <p className="text-xs mt-1">Start the conversation with {clientInfo.name}</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === "me" || msg.senderRole === "freelancer";
              const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1]?.createdAt).toDateString();
              return (
                <React.Fragment key={msg._id || idx}>
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{formatDate(msg.createdAt)}</span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && <Avatar name={clientInfo.name} photo={clientInfo.photo} size="sm" />}
                    <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMe ? `bg-teal-600 text-white rounded-br-sm ${msg.pending ? "opacity-60" : ""}` : "bg-white text-gray-800 rounded-bl-sm"
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

      {/* File Preview Bar — hide if rejected */}
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

      {/* Rejected Banner — input ki jagah */}
      {isRejected ? (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-red-100 bg-red-50 shrink-0">
          <Ban size={15} className="text-red-400 shrink-0" />
          <p className="text-xs font-semibold text-red-400">Messaging disabled — application was rejected</p>
        </div>
      ) : (
      /* Input Bar */
      <form onSubmit={handleSend} className="flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0">
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-teal-600 transition shrink-0">
          <Paperclip size={18} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt"
          className="hidden" onChange={handleFileSelect} />
        <button type="button"
          onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = handleFileSelect; inp.click(); }}
          className="p-2 text-gray-400 hover:text-teal-600 transition shrink-0">
          <Image size={18} />
        </button>
        <div className="flex-1 flex items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-teal-400 transition-colors">
          <textarea ref={textareaRef} value={text} onChange={handleTyping}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Message ${clientInfo.name}...`} rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none max-h-24 leading-relaxed" />
        </div>
        <button type="submit" disabled={(!text.trim() && !selectedFile) || sending}
          className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const FreelancerProjectApplication = () => {
  const { id: jobId } = useParams();
  const [activeTab, setActiveTab]   = useState("details");
  const [clientInfo, setClientInfo] = useState(null);
  const [isApplied, setIsApplied]   = useState(false);  // ✅ tabs control
  const [isRejected, setIsRejected] = useState(false);  // ✅ chat + button control

  // Client info + application status fetch
  useEffect(() => {
    const loadJobInfo = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const job = data.data;

        setClientInfo({
          _id:   job?.clientId?._id  || job?.clientId,
          name:  job?.clientId?.name || job?.clientName || "Client",
          photo: job?.clientId?.photo || job?.clientPhoto || null,
        });

        setIsApplied(job?.isApplied || false);
        setIsRejected(job?.applicationStatus === "rejected" || false);
      } catch (e) {
        console.error("Job info load failed", e);
      }
    };
    loadJobInfo();
  }, [jobId]);

  // Sirf apply hone ke baad baaki tabs dikhao
  const tabs = [
    { key: "details", label: "Project Details" },
    ...(isApplied || isRejected ? [
      { key: "application", label: "Application Process" },
      { key: "messages",    label: "Messages"            },
    ] : []),
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-white min-h-screen">
      {/* Tab Nav */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "details"     && <ProjectDetailsTab jobId={jobId} />}
        {activeTab === "application" && <ApplicationTab    jobId={jobId} />}
        {activeTab === "messages"    && <MessagesTab projectId={jobId} clientInfo={clientInfo} isRejected={isRejected} />}
      </div>
    </div>
  );
};

export default FreelancerProjectApplication;