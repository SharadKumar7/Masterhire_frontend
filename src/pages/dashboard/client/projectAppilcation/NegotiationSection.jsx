// ─── NegotiationSection.jsx ───────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, PencilIcon, Loader2, ChevronRight, ArrowLeftRight,
  CheckCircle2, XCircle, Lock, Search,
} from "lucide-react";
import { apiFetch, Spinner, ErrorBanner, Avatar } from "./Shared";

// ─── Left Panel: Freelancer List ──────────────────────────────────────────────
const NegotiationList = ({ jobId, selectedId, onSelect }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/client/job-applications/${jobId}`);
        // Only show negotiation applications in left panel
        const negotiating = (res.applications || []).filter(
          (a) => a.status === "negotiation"
        );
        setApplications(negotiating);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [jobId]);

  const filtered = applications.filter((a) =>
    a.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border-r border-gray-100 w-72 shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-900 text-base mb-3">Negotiations</h3>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search freelancer..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-teal-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 px-4">
            <ArrowLeftRight size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No active negotiations</p>
            <p className="text-[11px] mt-1 text-gray-300">
              Go to Applications and click "Negotiate"
            </p>
          </div>
        ) : (
          filtered.map((app) => {
            const isActive = selectedId === app._id;
            return (
              <button
                key={app._id}
                onClick={() => onSelect(app)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                  isActive ? "bg-teal-50 border-l-2 border-l-teal-500" : ""
                }`}
              >
                <Avatar name={app.user?.name} photo={app.user?.photo} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {app.user?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{app.user?.email}</p>
                  <p className="text-[11px] text-blue-500 font-semibold mt-0.5">
                    Bid: ₹{app.bidAmount?.toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                  Active
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Right Panel: Negotiation Detail ─────────────────────────────────────────
const NegotiationDetail = ({ jobId, selectedApplication, onClearSelection }) => {
  const navigate = useNavigate();
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [proposedAmount, setProposedAmount] = useState("");
  const [message, setMessage]           = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [editMode, setEditMode]         = useState(false);

  const fetchHistory = useCallback(async (appId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/client/negotiation/${appId}`);
      setHistory(res.history || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedApplication?._id) {
      fetchHistory(selectedApplication._id);
      setProposedAmount(selectedApplication.bidAmount?.toString() || "");
      setEditMode(false);
      setMessage("");
    }
  }, [selectedApplication, fetchHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposedAmount || isNaN(Number(proposedAmount))) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      setSubmitting(true);
      await apiFetch("/api/client/negotiation", {
        method: "POST",
        body: JSON.stringify({
          applicationId:  selectedApplication._id,
          proposedAmount: Number(proposedAmount),
          message,
        }),
      });
      setMessage("");
      setEditMode(false);
      await fetchHistory(selectedApplication._id);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndNegotiation = async () => {
    if (!window.confirm("End this negotiation and reject the application?")) return;
    try {
      await apiFetch(`/api/client/${selectedApplication._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected" }),
      });
      onClearSelection();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleAcceptOffer = async () => {
    if (!window.confirm("Accept this offer and hire the freelancer?")) return;
    try {
      await apiFetch(`/api/client/${selectedApplication._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "accepted" }),
      });
      navigate("/client/dashboard");
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  // Empty state
  if (!selectedApplication) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
          <ArrowLeftRight size={28} className="opacity-30" />
        </div>
        <p className="text-base font-semibold text-gray-500">No negotiation selected</p>
        <p className="text-sm mt-1 text-center px-8">
          Select a freelancer from the left to view negotiation details
        </p>
      </div>
    );
  }

  // Latest offers
  const myLatestOffer      = [...history].reverse().find((h) => h.proposedBy === "client");
  const freelancerLatest   = [...history].reverse().find((h) => h.proposedBy === "freelancer");
  const counterCount       = history.filter((h) => h.proposedBy === "freelancer").length;

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name={selectedApplication.user?.name} photo={selectedApplication.user?.photo} />
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  Negotiating with {selectedApplication.user?.name}
                </p>
                <p className="text-xs text-gray-400">{selectedApplication.user?.email}</p>
              </div>
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full font-semibold">
              In Negotiation
            </span>
          </div>

          {/* ── Current Offers ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Current Offers</h3>
            <div className="flex items-center gap-3">

              {/* Your Offer */}
              <div className="flex-1 bg-teal-50 border border-teal-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Your Offer</p>
                {editMode ? (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                      className="w-24 border border-teal-400 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => setEditMode(false)} className="text-[10px] text-gray-400 hover:text-gray-600 ml-1">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black text-gray-900">
                      ₹{Number(proposedAmount || selectedApplication.bidAmount).toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1 text-teal-600 text-xs font-medium hover:text-teal-700"
                    >
                      <PencilIcon size={12} /> Edit
                    </button>
                  </div>
                )}
                {myLatestOffer && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Last updated: {formatDateTime(myLatestOffer.createdAt)}
                  </p>
                )}
              </div>

              {/* Counter info */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <p className="text-[10px] text-gray-400 font-medium">Counter</p>
                <ArrowLeftRight size={20} className="text-teal-500" />
                <p className="text-[10px] text-gray-500 font-semibold">{counterCount} time{counterCount !== 1 ? "s" : ""}</p>
              </div>

              {/* Freelancer's Offer */}
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Freelancer's Offer</p>
                <p className="text-2xl font-black text-gray-900">
                  ₹{(freelancerLatest?.proposedAmount || selectedApplication.bidAmount)?.toLocaleString("en-IN")}
                </p>
                {freelancerLatest && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Last updated: {formatDateTime(freelancerLatest.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Negotiation History ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Negotiation History
            </h3>

            {loading ? (
              <Spinner text="Loading history..." />
            ) : error ? (
              <ErrorBanner message={error} />
            ) : history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No history yet</p>
            ) : (
              <div className="space-y-1">
                {history.map((item, idx) => {
                  const isClient = item.proposedBy === "client";
                  return (
                    <div key={item._id || idx} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isClient ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {isClient ? "U" : "F"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">
                          {isClient ? "You sent an offer" : `${selectedApplication.user?.name} sent a counter offer`}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          ₹{item.proposedAmount?.toLocaleString("en-IN")}
                        </p>
                        {item.message && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.message}</p>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 shrink-0">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Send Counter Offer ── */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-800">Send Counter Offer</h3>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                placeholder="Enter your offer"
                className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Sending..." : "Send Counter Offer"}
            </button>
          </form>

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <button
              onClick={handleEndNegotiation}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-400 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
            >
              <XCircle size={16} /> End Negotiation
            </button>
            <button
              onClick={handleAcceptOffer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <CheckCircle2 size={16} /> Accept & Hire
            </button>
          </div>

          {/* Note */}
          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pb-2">
            <Lock size={11} /> Only accepted freelancer will be able to start the project.
          </p>

        </div>
      </div>
    </div>
  );
};

// ─── Main NegotiationSection ──────────────────────────────────────────────────
const NegotiationSection = ({ jobId, selectedApplication: propSelected, onClearSelection }) => {
  const [selectedApplication, setSelectedApplication] = useState(propSelected || null);

  // Sync when parent passes a new application (from Applications tab)
  useEffect(() => {
    if (propSelected) setSelectedApplication(propSelected);
  }, [propSelected]);

  return (
    <div className="flex h-[620px] border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <NegotiationList
        jobId={jobId}
        selectedId={selectedApplication?._id}
        onSelect={setSelectedApplication}
      />
      <NegotiationDetail
        jobId={jobId}
        selectedApplication={selectedApplication}
        onClearSelection={() => {
          setSelectedApplication(null);
          onClearSelection?.();
        }}
      />
    </div>
  );
};

export default NegotiationSection;