// ─── FreelancerMilestonesSection.jsx ─────────────────────────────────────────
// Freelancer view: PROPOSE milestones, submit work, upload files, view status, wait for approval.
// ✅ FIX: "Add milestone" moved here from the client side. Freelancer creates the
//    milestone and can immediately submit work for it — no client approval step
//    is needed just to create it. Client only approves + pays once work is submitted.
import React, { useState, useRef } from "react";
import {
  Calendar, Clock, DollarSign, Upload, Download,
  ChevronDown, ChevronUp, Loader2, X, File,
} from "lucide-react";
import { Spinner, ErrorBanner, BASE_URL, getToken } from "../../shared/workspace/Shared";
import AddMilestoneModal from "./AddMilestone";

// ✅ FIX: single source of truth for platform fee — matches client side (5%)
const PLATFORM_FEE_PCT = 5;

const FreelancerMilestonesSection = ({ data, loading, error, projectId, onMilestoneUpdate }) => {
  const [openMilestoneIdx, setOpenMilestoneIdx] = useState(null);
  const [submitting, setSubmitting]             = useState(null); // milestoneId
  const [selectedFiles, setSelectedFiles]       = useState([]);
  const [submitNote, setSubmitNote]             = useState("");
  const [dragOver, setDragOver]                 = useState(false);
  const fileInputRef                            = useRef(null);

  // ✅ Add milestone modal state (moved from client side)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingMilestone, setAddingMilestone] = useState(false);

  if (loading) return <Spinner text="Loading milestones..." />;
  if (error)   return <ErrorBanner message={error} />;

  const milestonesList   = data?.milestones   || [];
  const summary          = data?.summary      || { totalBudget: 0, totalPaid: 0, totalRemaining: 0, overallProgress: 0, startedOn: "N/A", deadline: "N/A", duration: "N/A" };
  const activityTimeline = data?.activityLog  || [];

  const toggleMilestone = (index) =>
    setOpenMilestoneIdx(openMilestoneIdx === index ? null : index);

  // ✅ Add milestone — freelancer proposes a milestone for this job.
  // Once created it lands in "pending" / "in progress" status, which `canSubmit`
  // already allows, so the freelancer can submit work for it right away.
  const handleAddMilestone = async (formData) => {
    try {
      setAddingMilestone(true);
      const res = await fetch(`${BASE_URL}/api/job/${projectId}/milestones`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(formData),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.message || "Failed to add milestone");

      setShowAddModal(false);
      onMilestoneUpdate?.();
    } catch (e) {
      alert(`Failed to add milestone: ${e.message}`);
    } finally {
      setAddingMilestone(false);
    }
  };

  // ── Submit milestone ────────────────────────────────────────────────────────
  const handleSubmit = async (milestoneId) => {
    if (selectedFiles.length === 0) {
      alert("Please attach at least one file before submitting.");
      return;
    }
    try {
      setSubmitting(milestoneId);
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append("files", f));
      if (submitNote.trim()) formData.append("note", submitNote.trim());

      const res = await fetch(
        `${BASE_URL}/api/milestones/${projectId}/${milestoneId}/submit`,
        {
          method:  "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body:    formData,
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Submit failed");
      }
      setSelectedFiles([]);
      setSubmitNote("");
      onMilestoneUpdate?.();
    } catch (e) {
      alert(`Failed to submit: ${e.message}`);
    } finally {
      setSubmitting(null);
    }
  };

  const handleFileSelect = (files) => {
    if (!files) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (idx) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1 rounded-full">✓ Approved & Paid</span>;
      case "submitted":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">⏳ Under Review</span>;
      case "in progress":
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">● In Progress</span>;
      case "changes_requested":
        return <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full">↩ Changes Requested</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full">● Pending</span>;
    }
  };

  // Can freelancer submit? only if pending, in progress, or changes_requested
  // ✅ Newly created milestones default to "pending", so they're immediately submittable — no client approval gate.
  const canSubmit = (status) =>
    ["pending", "in progress", "changes_requested"].includes(status);

  return (
    <div className="w-full space-y-8">

      {/* ─── Summary ───────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-100 pb-6 mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">Total contract</p>
            <h3 className="text-2xl font-bold text-gray-900">₹ {summary.totalBudget.toLocaleString("en-IN")}</h3>
          </div>
          <div className="border-l border-gray-100 pl-5">
            <p className="text-xs text-gray-400 mb-1">Earned so far</p>
            <h3 className="text-2xl font-bold text-green-600">₹ {summary.totalPaid.toLocaleString("en-IN")}</h3>
          </div>
          <div className="border-l border-gray-100 pl-5">
            <p className="text-xs text-gray-400 mb-1">Pending payment</p>
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

        {/* ✅ FIX: "+ Add milestone" now lives here on the freelancer side */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar size={14} />Started: <strong className="text-gray-800">{summary.startedOn}</strong>
            </span>
            <span className="flex items-center gap-2">
              <Clock size={14} />Deadline: <strong className="text-gray-800">{summary.deadline}</strong>
            </span>
            <span className="flex items-center gap-2">
              <DollarSign size={14} />Duration: <strong className="text-gray-800">{summary.duration}</strong>
            </span>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            + Add milestone
          </button>
        </div>
      </div>

      {/* ─── Milestones Accordion ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide uppercase text-gray-900">
          Milestones ({milestonesList.length})
        </h3>

        {milestonesList.length === 0 && (
          <div className="py-16 border border-gray-100 rounded-2xl bg-gray-50/50 flex items-center justify-center">
            <p className="text-gray-400 font-medium text-sm">No milestones yet. Click "+ Add milestone" to propose one.</p>
          </div>
        )}

        {milestonesList.map((ms, index) => {
          const isOpen      = openMilestoneIdx === index;
          const isSubmitting = submitting === ms._id;
          const dueDate     = ms.dueDate
            ? new Date(ms.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "N/A";
          const submittedOn = ms.submittedOn
            ? new Date(ms.submittedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : null;
          const platformFee = Math.round((ms.budget * PLATFORM_FEE_PCT) / 100);

          return (
            <div key={ms._id || index}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                isOpen ? "border-teal-200 ring-4 ring-teal-50" : "border-gray-100"
              }`}
            >
              {/* Header */}
              <div
                onClick={() => toggleMilestone(index)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    ms.status === "approved"          ? "bg-green-600 text-white" :
                    ms.status === "submitted"         ? "bg-blue-500 text-white"  :
                    ms.status === "in progress"       ? "bg-amber-500 text-white" :
                    ms.status === "changes_requested" ? "bg-red-500 text-white"   :
                    "bg-gray-200 text-gray-600"
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

                    {/* Left — Details */}
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs uppercase text-gray-400 font-bold mb-2">What to do</p>
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

                      {/* Already submitted files */}
                      {ms.submittedFiles?.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 font-bold mb-3">Your submitted files</p>
                          <div className="space-y-2">
                            {ms.submittedFiles.map((file, fIdx) => (
                              <div key={fIdx} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <File size={14} className="text-gray-400 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{file.size}</p>
                                  </div>
                                </div>
                                <a href={file.url} download target="_blank" rel="noreferrer"
                                  className="text-teal-700 hover:text-teal-800 shrink-0 ml-2">
                                  <Download size={16} />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Client review note */}
                      {ms.reviewNote && (
                        <div className={`rounded-xl p-3 ${ms.status === "changes_requested" ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"}`}>
                          <p className="text-xs font-bold mb-1 text-gray-600">Client's note</p>
                          <p className="text-sm text-gray-700">{ms.reviewNote}</p>
                        </div>
                      )}
                    </div>

                    {/* Middle — Submit Work */}
                    <div className="border border-gray-100 rounded-2xl p-5">
                      <h4 className="font-bold text-gray-900 mb-4">
                        {ms.status === "approved"  ? "Work approved ✓" :
                         ms.status === "submitted" ? "Submitted — awaiting review" :
                         ms.status === "changes_requested" ? "Resubmit your work" :
                         "Submit your work"}
                      </h4>

                      {ms.status === "approved" && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
                          ✓ This milestone has been approved by the client. Payment will be processed soon.
                        </div>
                      )}

                      {ms.status === "submitted" && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                          ⏳ Your work is under review. The client will approve or request changes soon.
                        </div>
                      )}

                      {canSubmit(ms.status) && (
                        <>
                          {/* Drag & drop */}
                          <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition mb-4 ${
                              dragOver ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                            }`}
                          >
                            <Upload size={20} className="text-teal-500" />
                            <p className="text-xs font-semibold text-gray-700">
                              {dragOver ? "Drop files here" : "Drag & drop or click to upload"}
                            </p>
                            <p className="text-[10px] text-gray-400">PDF, Images, Videos, Docs up to 50MB</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files)}
                          />

                          {/* Selected files list */}
                          {selectedFiles.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {selectedFiles.map((f, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                                  <File size={13} className="text-gray-400 shrink-0" />
                                  <p className="text-xs text-gray-700 truncate flex-1">{f.name}</p>
                                  <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 transition">
                                    <X size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Optional note */}
                          <textarea
                            value={submitNote}
                            onChange={(e) => setSubmitNote(e.target.value)}
                            placeholder="Add a note for the client (optional)..."
                            rows={3}
                            className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-teal-400 resize-none mb-4 placeholder:text-gray-300"
                          />

                          <button
                            disabled={isSubmitting || selectedFiles.length === 0}
                            onClick={() => handleSubmit(ms._id)}
                            className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                          >
                            {isSubmitting
                              ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                              : ms.status === "changes_requested"
                              ? "Resubmit work"
                              : "Submit for review"
                            }
                          </button>
                        </>
                      )}
                    </div>

                    {/* Right — Payment */}
                    <div className="border border-gray-100 rounded-2xl p-5">
                      <h4 className="font-bold text-gray-900 mb-5">Payment details</h4>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Milestone amount</span>
                          <span className="font-semibold text-gray-900">₹{ms.budget.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Platform fee ({PLATFORM_FEE_PCT}%)</span>
                          <span className="font-semibold text-red-500">- ₹{platformFee.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="border-t border-dashed pt-4 flex justify-between">
                          <span className="font-semibold text-gray-900">You receive</span>
                          <span className="font-bold text-teal-700">₹{(ms.budget - platformFee).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
                          Payment released after client approves this milestone.
                        </div>
                        {ms.isPaid && (
                          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 font-semibold">
                            ✓ Paid on {ms.paidAt ? new Date(ms.paidAt).toLocaleDateString("en-IN") : "—"}
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

      {/* ─── Bottom Section ────────────────────────────────────────────────── */}
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

        {/* Earnings Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Earnings summary</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total contract</span>
              <span className="font-semibold text-gray-900">₹{summary.totalBudget.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Earned</span>
              <span className="font-semibold text-green-600">₹{summary.totalPaid.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pending</span>
              <span className="font-semibold text-gray-900">₹{summary.totalRemaining.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="mt-6 bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <h4 className="font-semibold text-teal-800 mb-2">Need help?</h4>
            <p className="text-sm text-teal-700 leading-relaxed">
              If you face any issue with milestones or payments, contact support.
            </p>
            <button className="mt-4 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              🎧 Contact support
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Add Milestone Modal — freelancer proposes new milestones here */}
      <AddMilestoneModal
        isOpen={showAddModal}
        onClose={() => !addingMilestone && setShowAddModal(false)}
        onSubmit={handleAddMilestone}
      />
    </div>
  );
};

export default FreelancerMilestonesSection;