import React, { useState, useCallback, useEffect } from "react";
import {
  Clock, Briefcase, CheckCircle2, Loader2, Send,
  BadgeCheck, Ban, ArrowLeftRight, PencilIcon, Lock,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

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

const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-teal-600">
    <Loader2 size={28} className="animate-spin" />
    <p className="text-sm font-medium text-gray-400">{text}</p>
  </div>
);

const ErrorBanner = ({ message }) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">
    <span>{message}</span>
  </div>
);

const ApplicationTab = ({ jobId }) => {
  const [application, setApplication] = useState(null);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [proposedAmount, setProposedAmount] = useState("");
  const [editMode, setEditMode]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/freelancer/application/${jobId}`);
      setApplication(res.application);
      setProposedAmount(res.application?.bidAmount?.toString() || "");

      // Load negotiation history if in negotiation
      if (res.application?.status === "negotiation") {
        try {
          const negRes = await apiFetch(`/api/freelancer/negotiation/${res.application._id}`);
          setHistory(negRes.history || []);
        } catch (_) {}
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposedAmount || isNaN(Number(proposedAmount))) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      setSubmitting(true);
      await apiFetch(`/api/freelancer/application/${application._id}/negotiate`, {
        method: "PATCH",
        body: JSON.stringify({ bidAmount: Number(proposedAmount) }),
      });
      setSuccessMsg("Counter offer sent successfully!");
      setEditMode(false);
      await loadData();
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

  const canNegotiate  = ["pending", "negotiation"].includes(application.status);
  const isNegotiating = application.status === "negotiation";
  const counterCount  = history.filter((h) => h.proposedBy === "client").length;
  const clientLatest  = [...history].reverse().find((h) => h.proposedBy === "client");
  const myLatest      = [...history].reverse().find((h) => h.proposedBy === "freelancer");

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Success msg */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* ── Status Card ── */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Application Status</p>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            application.status === "pending"     ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
            application.status === "negotiation" ? "bg-blue-50 text-blue-600 border-blue-200"       :
            application.status === "accepted"    ? "bg-green-50 text-green-600 border-green-200"    :
            "bg-red-50 text-red-500 border-red-200"
          }`}>
            {application.status === "pending"     ? "Pending Review"  :
             application.status === "negotiation" ? "In Negotiation"  :
             application.status === "accepted"    ? "Accepted"        :
             "Rejected"}
          </span>
        </div>
        {application.updatedAt && (
          <p className="text-[11px] text-gray-400">
            Updated {formatDateTime(application.updatedAt)}
          </p>
        )}
      </div>

      {/* ── Current Offers — only in negotiation ── */}
      {isNegotiating && (
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
                  <button onClick={() => setEditMode(false)} className="text-[10px] text-gray-400 ml-1">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-gray-900">
                    ₹{Number(proposedAmount || application.bidAmount).toLocaleString("en-IN")}
                  </p>
                  {canNegotiate && (
                    <button onClick={() => setEditMode(true)}
                      className="flex items-center gap-1 text-teal-600 text-xs font-medium hover:text-teal-700">
                      <PencilIcon size={12} /> Edit
                    </button>
                  )}
                </div>
              )}
              {myLatest && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Last updated: {formatDateTime(myLatest.createdAt)}
                </p>
              )}
            </div>

            {/* Counter info */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <p className="text-[10px] text-gray-400 font-medium">Counter</p>
              <ArrowLeftRight size={20} className="text-teal-500" />
              <p className="text-[10px] text-gray-500 font-semibold">
                {counterCount} time{counterCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Client's Offer */}
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Client's Offer</p>
              <p className="text-2xl font-black text-gray-900">
                ₹{(clientLatest?.proposedAmount || application.bidAmount)?.toLocaleString("en-IN")}
              </p>
              {clientLatest && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Last updated: {formatDateTime(clientLatest.createdAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bid Card — when not negotiating ── */}
      {!isNegotiating && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Your Bid</p>
          <p className="text-3xl font-bold text-gray-900">
            ₹{application.bidAmount?.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400 mt-1">Proposed amount</p>
        </div>
      )}

      {/* ── Pending state ── */}
      {application.status === "pending" && (
        <div className="w-full py-5 px-6 border border-gray-100 bg-gray-50 text-center rounded-xl shadow-sm">
          <Clock size={20} className="mx-auto text-yellow-400 mb-2" />
          <p className="text-sm text-gray-500 italic">The client is yet to review your application</p>
        </div>
      )}

      {/* ── Accepted ── */}
      {application.status === "accepted" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
          <BadgeCheck size={32} className="text-green-500 shrink-0" />
          <div>
            <p className="font-bold text-green-700 text-sm">Congratulations! You've been hired.</p>
            <p className="text-xs text-green-500 mt-0.5">The client has accepted your application.</p>
          </div>
        </div>
      )}

      {/* ── Rejected ── */}
      {application.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <Ban size={28} className="text-red-400 shrink-0" />
          <div>
            <p className="font-bold text-red-600 text-sm">Application Rejected</p>
            <p className="text-xs text-red-400 mt-0.5">The client has rejected your application.</p>
          </div>
        </div>
      )}

      {/* ── Negotiation History ── */}
      {isNegotiating && history.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Negotiation History</h3>
          <div className="space-y-1">
            {history.map((item, idx) => {
              const isMe = item.proposedBy === "freelancer";
              return (
                <div key={item._id || idx} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isMe ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {isMe ? "Y" : "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">
                      {isMe ? "You sent an offer" : "Client sent a counter offer"}
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
        </div>
      )}

      {/* ── Counter Offer Form — only when negotiating ── */}
      {isNegotiating && (
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
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? "Sending..." : "Send Counter Offer"}
          </button>
        </form>
      )}

      {/* ── Proposal ── */}
      {application.proposal && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Your Proposal</p>
          <p className="text-sm text-gray-600 leading-relaxed">{application.proposal}</p>
        </div>
      )}

      {/* Note */}
      {isNegotiating && (
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 pb-2">
          <Lock size={11} /> Only accepted freelancer will be able to start the project.
        </p>
      )}
    </div>
  );
};

export default ApplicationTab;