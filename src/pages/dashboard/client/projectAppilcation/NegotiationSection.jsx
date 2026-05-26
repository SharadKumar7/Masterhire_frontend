// ─── NegotiationSection.jsx ───────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { Send, PencilIcon, ChevronRight, Loader2 } from "lucide-react";
import { apiFetch, Spinner, ErrorBanner, Avatar } from "./Shared";

const NegotiationSection = ({ jobId, selectedApplication, onClearSelection }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proposedAmount, setProposedAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
    }
  }, [selectedApplication, fetchHistory]);

  const handleSubmitNegotiation = async (e) => {
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
          applicationId: selectedApplication._id,
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
    try {
      // Accepting from negotiation also triggers job assignment
      await apiFetch(`/api/client/${selectedApplication._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "accepted" }),
      });
      alert("Application accepted! Freelancer has been hired and job is now assigned.");
      onClearSelection();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  if (!selectedApplication) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChevronRight size={24} className="opacity-40" />
        </div>
        <p className="text-sm font-medium">No active negotiation</p>
        <p className="text-xs mt-1">
          Go to Applications tab and click "Negotiate" on an application
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar
            name={selectedApplication.user?.name}
            photo={selectedApplication.user?.photo}
          />
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

      {/* Offer Cards */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Your offer</p>
            {editMode ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  value={proposedAmount}
                  onChange={(e) => setProposedAmount(e.target.value)}
                  className="w-28 border border-teal-400 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setEditMode(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ₹
                  {Number(
                    proposedAmount || selectedApplication.bidAmount
                  ).toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1 text-teal-600 text-xs font-medium"
                >
                  <PencilIcon size={13} /> Edit
                </button>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Freelancer's bid</p>
            <span className="text-xl font-bold text-gray-900">
              ₹{selectedApplication.bidAmount?.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* History */}
      {loading ? (
        <Spinner text="Loading negotiation history..." />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : (
        history.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Negotiation History ({history.length} round
              {history.length !== 1 ? "s" : ""})
            </h3>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className={`flex ${
                    item.proposedBy === "client" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      item.proposedBy === "client"
                        ? "bg-teal-600 text-white rounded-tr-none"
                        : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p className="font-bold text-xs mb-1 opacity-75">
                      {item.proposedBy === "client"
                        ? "You"
                        : selectedApplication.user?.name}
                    </p>
                    <p className="font-bold">
                      ₹{item.proposedAmount?.toLocaleString("en-IN")}
                    </p>
                    {item.message && (
                      <p className="text-xs mt-1 opacity-80">{item.message}</p>
                    )}
                    <p
                      className={`text-[10px] mt-1.5 ${
                        item.proposedBy === "client"
                          ? "text-teal-100"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(item.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Send offer form */}
      <form
        onSubmit={handleSubmitNegotiation}
        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3"
      >
        <h3 className="text-sm font-semibold text-gray-700">Send Counter Offer</h3>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
            ₹
          </span>
          <input
            type="number"
            value={proposedAmount}
            onChange={(e) => setProposedAmount(e.target.value)}
            placeholder="Your proposed amount"
            className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
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
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {submitting ? "Sending..." : "Send Offer"}
        </button>
      </form>

      <div className="flex gap-3">
        <button
          onClick={handleEndNegotiation}
          className="flex-1 px-4 py-2.5 border border-red-400 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
        >
          End Negotiation
        </button>
        <button
          onClick={handleAcceptOffer}
          className="flex-1 px-4 py-2.5 bg-teal-800 text-white rounded-xl text-sm font-bold hover:bg-teal-900 transition-colors"
        >
          Accept & Hire
        </button>
      </div>
    </div>
  );
};

export default NegotiationSection;