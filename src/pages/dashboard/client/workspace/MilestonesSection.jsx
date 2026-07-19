// ─── MilestonesSection.jsx (CLIENT SIDE) ─────────────────────────────────────
// Client can: review NEW milestone proposals (approve / request changes /
// reject) before work starts, review SUBMITTED work (approve / request
// changes), and pay separately once work is approved.
import React, { useState } from "react";
import {
  Calendar, Clock, DollarSign, Download,
  ChevronDown, ChevronUp, X, Wallet, CreditCard, CheckCircle,
} from "lucide-react";
import { Spinner, ErrorBanner, apiFetch } from "../../shared/workspace/Shared";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const BASE_URL     = import.meta.env.VITE_API_URL;
const getToken     = () => localStorage.getItem("token");

// Fee constants — must match backend (payment.controller.js)
const PLATFORM_FEE_PCT = 5;  // freelancer-side deduction
const GST_PCT          = 18; // GST on the client-side platform fee

// ─── Load Razorpay script ─────────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script    = document.createElement("script");
    script.id       = "razorpay-script";
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });

// ─── Payment Modal ────────────────────────────────────────────────────────────
// ✅ FIX: breakdown now includes platform fee + GST that the client actually
// pays. Prefers the server-provided breakdown (from create-order) once
// available so the UI never drifts from what's actually charged.
const PaymentModal = ({ milestone, walletBalance = 0, projectId, onSuccess, onClose }) => {
  const [payMethod,  setPayMethod]  = useState("razorpay"); // "razorpay" | "wallet"
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [done,       setDone]       = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [breakdown, setBreakdown]   = useState(null); // set once server returns it

  const amount      = milestone.budget;
  const platformFee = breakdown?.platformFee ?? Math.round((amount * PLATFORM_FEE_PCT) / 100);
  const gstOnFee     = breakdown?.gstOnFee     ?? Math.round((platformFee * GST_PCT) / 100);
  const total        = breakdown?.totalPayable ?? (amount + platformFee + gstOnFee);

  // ── Pay via Razorpay ────────────────────────────────────────────────────────
  const handleRazorpayPay = async () => {
    setLoading(true);
    setError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Check your internet.");
      setLoading(false);
      return;
    }

    try {
      // Step 1 — Create order (server returns fee/GST breakdown + amount to charge)
      const res = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ jobId: projectId, milestoneId: milestone._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.breakdown) setBreakdown(data.breakdown); // ✅ sync UI with what's actually charged

      // Step 2 — Open Razorpay
      const options = {
        key:         RAZORPAY_KEY,
        amount:      data.amount,
        currency:    "INR",
        name:        "FreelanceHub",
        description: `Milestone: ${milestone.title}`,
        order_id:    data.orderId,
        handler: async (response) => {
          try {
            // Step 3 — Verify
            const verifyRes = await fetch(`${BASE_URL}/api/payment/verify`, {
              method:  "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
              body:    JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                jobId:               projectId,
                milestoneId:         milestone._id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message);

            // Step 4 — Release payment to freelancer
            await releasePayment();
          } catch (e) {
            setError("Payment verification failed: " + e.message);
            setLoading(false);
          }
        },
        prefill: { name: "", email: "" },
        theme:   { color: "#0d9488" },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // ── Pay via Wallet ──────────────────────────────────────────────────────────
  const handleWalletPay = async () => {
    if (walletBalance < total) {
      setError(`Insufficient wallet balance. Need ₹${total.toLocaleString("en-IN")}, have ₹${walletBalance.toLocaleString("en-IN")}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/api/payment/pay-from-wallet`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ jobId: projectId, milestoneId: milestone._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await releasePayment();
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // ── Release payment to freelancer on backend ────────────────────────────────
  const releasePayment = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/approve-milestone`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ jobId: projectId, milestoneId: milestone._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMessage(data.message || "Payment released to the freelancer successfully.");
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (e) {
      setError("Payment done but release failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-teal-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">Pay milestone</h3>
            <p className="text-teal-200 text-xs mt-0.5">{milestone.title}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Success state */}
          {done ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-teal-600" />
              </div>
              <p className="font-bold text-gray-900">Payment Successful!</p>
              <p className="text-sm text-gray-500">{successMessage || "Payment released to the freelancer."}</p>
            </div>
          ) : (
            <>
              {/* Payment breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Milestone amount</span>
                  <span className="font-semibold text-gray-900">₹{amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Platform fee ({PLATFORM_FEE_PCT}%)</span>
                  <span>+₹{platformFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>GST ({GST_PCT}% on platform fee)</span>
                  <span>+₹{gstOnFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-dashed pt-3 flex justify-between font-bold">
                  <span className="text-gray-900">You pay</span>
                  <span className="text-teal-700 text-base">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-xs text-gray-400">
                  Freelancer receives ₹{(amount - Math.round((amount * PLATFORM_FEE_PCT) / 100)).toLocaleString("en-IN")} after their platform fee
                </p>
              </div>

              {/* Payment method toggle */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Choose payment method
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPayMethod("razorpay")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      payMethod === "razorpay"
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    <CreditCard size={22} className={payMethod === "razorpay" ? "text-teal-600" : "text-gray-400"} />
                    <div className="text-center">
                      <p className={`text-sm font-bold ${payMethod === "razorpay" ? "text-teal-700" : "text-gray-700"}`}>
                        Pay Now
                      </p>
                      <p className="text-[10px] text-gray-400">UPI / Card / Net banking</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPayMethod("wallet")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      payMethod === "wallet"
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    <Wallet size={22} className={payMethod === "wallet" ? "text-teal-600" : "text-gray-400"} />
                    <div className="text-center">
                      <p className={`text-sm font-bold ${payMethod === "wallet" ? "text-teal-700" : "text-gray-700"}`}>
                        Use Wallet
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Balance: ₹{walletBalance.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Wallet insufficient warning */}
                {payMethod === "wallet" && walletBalance < total && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    ⚠️ Insufficient balance. Please top up your wallet or use Pay Now.
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Pay button */}
              <button
                onClick={payMethod === "razorpay" ? handleRazorpayPay : handleWalletPay}
                disabled={loading || (payMethod === "wallet" && walletBalance < total)}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : payMethod === "razorpay"
                    ? `Pay ₹${total.toLocaleString("en-IN")} via Razorpay`
                    : `Pay ₹${total.toLocaleString("en-IN")} from Wallet`
                }
              </button>

              <p className="text-[10px] text-gray-400 text-center">
                🔒 Funds are held in escrow until released
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main MilestonesSection (CLIENT) ──────────────────────────────────────────
const MilestonesSection = ({ data, loading, error, projectId, onMilestoneUpdate }) => {
  const [openMilestoneIdx, setOpenMilestoneIdx] = useState(null);
  const [actionLoading,    setActionLoading]     = useState(null);
  const [reviewNote,       setReviewNote]        = useState("");     // for submitted-work review
  const [proposalNote,     setProposalNote]      = useState("");     // for new-proposal review

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState(null); // { milestone }
  const [walletBalance, setWalletBalance] = useState(0);

  if (loading) return <Spinner text="Loading milestones..." />;
  if (error)   return <ErrorBanner message={error} />;

  const milestonesList    = data?.milestones    || [];
  const summary           = data?.summary       || { totalBudget: 0, totalPaid: 0, totalRemaining: 0, overallProgress: 0, startedOn: "N/A", deadline: "N/A", duration: "N/A" };
  const activityTimeline  = data?.activityLog   || [];

  const toggleMilestone = (index) =>
    setOpenMilestoneIdx(openMilestoneIdx === index ? null : index);

  // ── Proposal-stage actions (pending_approval) ──────────────────────────────
  const handleApproveMilestoneProposal = async (milestoneId) => {
    try {
      setActionLoading(milestoneId);
      await apiFetch(`/api/milestones/${projectId}/${milestoneId}/status`, {
        method: "PATCH",
        body:   JSON.stringify({ action: "approve_milestone" }),
      });
      onMilestoneUpdate?.();
    } catch (e) {
      alert(`Action failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestMilestoneChanges = async (milestoneId) => {
    try {
      setActionLoading(milestoneId);
      await apiFetch(`/api/milestones/${projectId}/${milestoneId}/status`, {
        method: "PATCH",
        body:   JSON.stringify({ action: "request_milestone_changes", reviewNote: proposalNote }),
      });
      setProposalNote("");
      onMilestoneUpdate?.();
    } catch (e) {
      alert(`Action failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectMilestoneProposal = async (milestoneId) => {
    if (!window.confirm("Reject this milestone proposal? The freelancer will need to create a new one.")) return;
    try {
      setActionLoading(milestoneId);
      await apiFetch(`/api/milestones/${projectId}/${milestoneId}/status`, {
        method: "PATCH",
        body:   JSON.stringify({ action: "reject_milestone", reviewNote: proposalNote }),
      });
      setProposalNote("");
      onMilestoneUpdate?.();
    } catch (e) {
      alert(`Action failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Submitted-work-stage actions ────────────────────────────────────────────
  const handleRequestChanges = async (milestoneId) => {
    try {
      setActionLoading(milestoneId);
      await apiFetch(`/api/milestones/${projectId}/${milestoneId}/status`, {
        method: "PATCH",
        body:   JSON.stringify({ action: "request_changes", reviewNote }),
      });
      setReviewNote("");
      onMilestoneUpdate?.();
    } catch (e) {
      alert(`Action failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ CHANGED: "Approve work" only marks the work as approved — no payment yet
  const handleApproveWork = async (milestoneId) => {
    try {
      setActionLoading(milestoneId);
      await apiFetch(`/api/milestones/${projectId}/${milestoneId}/status`, {
        method: "PATCH",
        body:   JSON.stringify({ action: "approve", reviewNote }),
      });
      setReviewNote("");
      onMilestoneUpdate?.();
    } catch (e) {
      alert(`Action failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ "Pay" — separate step, only available once work is approved
  const handleOpenPayment = async (milestone) => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/wallet`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setWalletBalance(data.wallet?.balance || 0);
    } catch {
      setWalletBalance(0);
    }
    setPaymentModal({ milestone });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":          return <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1 rounded-full">✓ Approved</span>;
      case "submitted":         return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">● Submitted</span>;
      case "in progress":       return <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">● In Progress</span>;
      case "changes_requested": return <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full">↩ Changes Requested</span>;
      case "rejected":          return <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full">✗ Rejected</span>;
      case "pending_approval":
      default:                  return <span className="bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full">⏳ New Proposal</span>;
    }
  };

  return (
    <div className="w-full space-y-8">

      {/* ─── Summary ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-100 pb-6 mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">Total budget</p>
            <h3 className="text-2xl font-bold text-gray-900">₹ {summary.totalBudget.toLocaleString("en-IN")}</h3>
          </div>
          <div className="border-l border-gray-100 pl-5">
            <p className="text-xs text-gray-400 mb-1">Total paid</p>
            <h3 className="text-2xl font-bold text-gray-900">₹ {summary.totalPaid.toLocaleString("en-IN")}</h3>
          </div>
          <div className="border-l border-gray-100 pl-5">
            <p className="text-xs text-gray-400 mb-1">Remaining</p>
            <h3 className="text-2xl font-bold text-gray-900">₹ {summary.totalRemaining.toLocaleString("en-IN")}</h3>
          </div>
          <div className="border-l border-gray-100 pl-5">
            <p className="text-xs text-gray-400 mb-2">Progress</p>
            <div className="flex items-center gap-3">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${summary.overallProgress}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-900">{summary.overallProgress}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-2"><Calendar size={14} />Started: <strong className="text-gray-800">{summary.startedOn}</strong></span>
            <span className="flex items-center gap-2"><Clock size={14} />Deadline: <strong className="text-gray-800">{summary.deadline}</strong></span>
            <span className="flex items-center gap-2"><DollarSign size={14} />Duration: <strong className="text-gray-800">{summary.duration}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── Milestones Accordion ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide uppercase text-gray-900">
          Milestones ({milestonesList.length})
        </h3>

        {milestonesList.length === 0 && (
          <div className="py-16 border border-gray-100 rounded-2xl bg-gray-50/50 flex items-center justify-center">
            <p className="text-gray-400 font-medium text-sm">No milestones added yet. The freelancer will propose milestones for this project.</p>
          </div>
        )}

        {milestonesList.map((ms, index) => {
          const isOpen    = openMilestoneIdx === index;
          const isLoading = actionLoading === ms._id;
          const dueDate   = ms.dueDate ? new Date(ms.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
          const submittedOn = ms.submittedOn ? new Date(ms.submittedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
          const platformFee = Math.round((ms.budget * PLATFORM_FEE_PCT) / 100);
          const gstOnFee      = Math.round((platformFee * GST_PCT) / 100);
          const youPay         = ms.budget + platformFee + gstOnFee;
          const freelancerGets = ms.budget - platformFee;

          return (
            <div key={ms._id || index}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isOpen ? "border-teal-200 ring-4 ring-teal-50" : "border-gray-100"}`}>

              {/* Header */}
              <div onClick={() => toggleMilestone(index)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    ms.status === "approved" ? "bg-green-600 text-white"
                    : ms.status === "submitted" ? "bg-blue-500 text-white"
                    : ms.status === "in progress" ? "bg-amber-500 text-white"
                    : ms.status === "changes_requested" ? "bg-red-500 text-white"
                    : ms.status === "rejected" ? "bg-red-400 text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{ms.title}</h4>
                    <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-400">
                      <span>📅 Due: {dueDate}</span>
                      <span>💰 ₹{ms.budget.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(ms.status)}
                  {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="border-t border-gray-100 p-5 bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — Details & Files */}
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs uppercase text-gray-400 font-bold mb-2">Details</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{ms.description || "No description."}</p>
                      </div>
                      {ms.deliverables && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 font-bold mb-2">Expected deliverables</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{ms.deliverables}</p>
                        </div>
                      )}
                      {submittedOn && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 font-bold mb-2">Submitted on</p>
                          <p className="text-sm font-medium text-gray-800">{submittedOn}</p>
                        </div>
                      )}
                      {ms.submittedFiles?.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 font-bold mb-3">Submitted files</p>
                          <div className="space-y-3">
                            {ms.submittedFiles.map((file, fIdx) => (
                              <div key={fIdx} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                  <p className="text-xs text-gray-400">{file.size}</p>
                                </div>
                                <a href={file.url} download target="_blank" rel="noreferrer" className="text-teal-700 hover:text-teal-800">
                                  <Download size={18} />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {ms.reviewNote && (
                        <div className={`rounded-xl p-3 ${["changes_requested", "rejected"].includes(ms.status) ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"}`}>
                          <p className="text-xs text-gray-500 font-bold mb-1">Your note to freelancer</p>
                          <p className="text-sm text-gray-700">{ms.reviewNote}</p>
                        </div>
                      )}
                    </div>

                    {/* Middle — Review */}
                    <div className="border border-gray-100 rounded-2xl p-5">
                      <h4 className="font-bold text-gray-900 mb-4">
                        {ms.status === "pending_approval" ? "Review this milestone" : "Your review"}
                      </h4>

                      {/* ✅ NEW — STAGE 1: freelancer just proposed this milestone.
                          Client discusses / approves / sends back for changes / rejects
                          BEFORE any work starts. */}
                      {ms.status === "pending_approval" && (
                        <>
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Freelancer proposed this milestone. Review the scope, deadline and amount.
                            Approve to let them start work, or ask for changes first.
                          </p>
                          <textarea
                            value={proposalNote}
                            onChange={(e) => setProposalNote(e.target.value)}
                            placeholder="Note for the freelancer (required for 'Request changes' or 'Reject')..."
                            rows={3}
                            className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-teal-400 resize-none mb-4 placeholder:text-gray-300"
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              disabled={isLoading}
                              onClick={() => handleApproveMilestoneProposal(ms._id)}
                              className="bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                              {isLoading ? "..." : "✓ Approve & let freelancer start"}
                            </button>
                            <div className="flex gap-2">
                              <button
                                disabled={isLoading}
                                onClick={() => handleRequestMilestoneChanges(ms._id)}
                                className="flex-1 border border-amber-200 bg-amber-50 text-amber-700 py-2.5 rounded-xl font-semibold hover:bg-amber-100 transition disabled:opacity-50 text-sm"
                              >
                                {isLoading ? "..." : "Request modification"}
                              </button>
                              <button
                                disabled={isLoading}
                                onClick={() => handleRejectMilestoneProposal(ms._id)}
                                className="flex-1 border border-red-200 bg-red-50 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition disabled:opacity-50 text-sm"
                              >
                                {isLoading ? "..." : "Reject"}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {ms.status === "in progress" && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          You approved this milestone. Waiting for the freelancer to submit work.
                        </p>
                      )}

                      {/* STAGE 2: freelancer submitted work — approve work / request changes */}
                      {ms.status === "submitted" && (
                        <>
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Please review the submitted work and either approve it or request changes.
                          </p>
                          <textarea
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="Optional review note..."
                            rows={3}
                            className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-teal-400 resize-none mb-4 placeholder:text-gray-300"
                          />
                          <div className="flex gap-3">
                            <button
                              disabled={isLoading}
                              onClick={() => handleRequestChanges(ms._id)}
                              className="flex-1 border border-red-200 bg-red-50 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {isLoading ? "..." : "Request changes"}
                            </button>
                            {/* ✅ CHANGED: only approves the work — no payment yet */}
                            <button
                              disabled={isLoading}
                              onClick={() => handleApproveWork(ms._id)}
                              className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                              {isLoading ? "..." : "Approve work"}
                            </button>
                          </div>
                        </>
                      )}

                      {ms.status === "changes_requested" && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          You requested changes. Waiting for the freelancer to resubmit.
                        </p>
                      )}

                      {/* STAGE 3: work approved — separate Pay action */}
                      {ms.status === "approved" && !ms.isPaid && (
                        <div>
                          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700 mb-4">
                            ✓ You approved this work. Release payment when ready.
                          </div>
                          <button
                            onClick={() => handleOpenPayment(ms)}
                            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-xl font-semibold transition"
                          >
                            Pay ₹{youPay.toLocaleString("en-IN")}
                          </button>
                        </div>
                      )}

                      {ms.status === "approved" && ms.isPaid && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
                          ✓ Approved and paid.
                        </div>
                      )}

                      {ms.status === "rejected" && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
                          ✗ You rejected this milestone proposal.
                        </div>
                      )}
                    </div>

                    {/* Right — Payment details (5% + GST) */}
                    <div className="border border-gray-100 rounded-2xl p-5">
                      <h4 className="font-bold text-gray-900 mb-5">Payment details</h4>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Milestone amount</span>
                          <span className="font-semibold text-gray-900">₹{ms.budget.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Platform fee ({PLATFORM_FEE_PCT}%)</span>
                          <span>+₹{platformFee.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>GST ({GST_PCT}% on platform fee)</span>
                          <span>+₹{gstOnFee.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="border-t border-dashed pt-4 flex justify-between">
                          <span className="font-semibold text-gray-900">You pay</span>
                          <span className="font-bold text-teal-700">₹{youPay.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
                          Freelancer receives ₹{freelancerGets.toLocaleString("en-IN")} after their platform fee
                        </div>
                        {ms.isPaid && (
                          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 font-semibold">
                            ✓ Paid on {ms.paidAt ? new Date(ms.paidAt).toLocaleDateString("en-IN") : "—"}
                          </div>
                        )}
                        {ms.escrowStatus === "held" && !ms.isPaid && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-semibold">
                            🔒 Funds held in escrow
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Bottom Section ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Activity timeline</h3>
          {activityTimeline.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet.</p>
          ) : (
            <div className="relative border-l border-gray-200 ml-2 space-y-8">
              {activityTimeline.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${item.primary ? "bg-teal-600" : "bg-gray-300"}`} />
                  <h4 className="font-semibold text-gray-900 text-sm">{item.label}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.meta}</p>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {new Date(item.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Payment summary</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total budget</span>
              <span className="font-semibold text-gray-900">₹{summary.totalBudget.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total paid</span>
              <span className="font-semibold text-gray-900">₹{summary.totalPaid.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Remaining</span>
              <span className="font-semibold text-gray-900">₹{summary.totalRemaining.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button className="w-full mt-6 border border-gray-200 hover:bg-gray-50 transition py-3 rounded-xl font-semibold text-gray-700">
            View payment history
          </button>

          <div className="mt-6 bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <h4 className="font-semibold text-teal-800 mb-2">Need help?</h4>
            <p className="text-sm text-teal-700 leading-relaxed">
              If you face any issue with milestones or payment, our support team is here to help.
            </p>
            <button className="mt-4 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              🎧 Contact support
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Payment Modal — only place client interacts with money */}
      {paymentModal && (
        <PaymentModal
          milestone={paymentModal.milestone}
          walletBalance={walletBalance}
          projectId={projectId}
          onSuccess={() => {
            setPaymentModal(null);
            onMilestoneUpdate?.();
          }}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </div>
  );
};

export default MilestonesSection;