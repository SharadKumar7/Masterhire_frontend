// ─── ProjectDetailsSection.jsx ────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IndianRupee, Clock, X, TriangleAlert } from "lucide-react";
import { apiFetch, Spinner, ErrorBanner, Avatar } from "./Shared";

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    />

    {/* Modal Box */}
    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
      {/* Close (X) button — top right */}
      <button
        onClick={onCancel}
        className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
      >
        <X size={16} />
      </button>

      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 bg-red-50 border border-red-100 rounded-full mx-auto mb-4">
        <TriangleAlert size={22} className="text-red-500" />
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900 text-center mb-1.5">
        Delete this Job?
      </h3>

      {/* Message */}
      <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
        This action is <span className="font-semibold text-gray-700">permanent</span> and cannot be undone.
        All job details will be deleted forever.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ProjectDetailsSection = ({ jobId }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalApplications, setTotalApplications] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [jobRes, appRes] = await Promise.all([
          apiFetch(`/api/job-details/${jobId}`),
          apiFetch(`/api/client/job-applications/${jobId}`).catch(() => ({ totalApplications: 0 })),
        ]);
        setData(jobRes.job);
        setTotalApplications(appRes.totalApplications ?? 0);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const handleDeleteConfirm = async () => {
    try {
      await apiFetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      setShowDeleteModal(false);
      navigate("/client/dashboard");
    } catch (e) {
      setShowDeleteModal(false);
      alert("Failed to delete job. Please try again.");
    }
  };

  if (loading) return <Spinner text="Loading project details..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  const deadline = data.deadline
    ? new Date(data.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const statusConfig = {
    open:      { label: "Open",      cls: "bg-green-50 text-green-700 border-green-200" },
    assigned:  { label: "Assigned",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
    completed: { label: "Completed", cls: "bg-gray-50 text-gray-600 border-gray-200" },
    closed:    { label: "Closed",    cls: "bg-red-50 text-red-600 border-red-200" },
  };
  const st = statusConfig[data.status] || statusConfig.open;

  return (
    <section className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div>
        <div className="flex items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{data.title}</h1>
          <span
            className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${st.cls}`}
          >
            {st.label}
          </span>
        </div>

        {data.status === "assigned" && data.assignedFreelancer && (
          <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 shadow-sm">
            <Avatar
              name={data.assignedFreelancer.name}
              photo={data.assignedFreelancer.photo}
              size="sm"
            />
            <div>
              <p className="text-[11px] text-blue-500 font-semibold uppercase tracking-wider">Assigned to</p>
              <p className="text-sm font-bold text-blue-800">
                {data.assignedFreelancer.name}
              </p>
            </div>
          </div>
        )}
        <hr className="border-gray-100 mt-4" />
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/80">
          {data.description}
        </p>
      </div>

      <div className="grid grid-cols-2 py-4 border-t border-b border-gray-100 bg-gray-50/30 rounded-xl">
        <div className="flex items-center gap-3 justify-center border-r border-gray-100 w-full">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100/50 shadow-sm">
            <IndianRupee size={18} className="text-teal-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Budget</p>
            <p className="font-extrabold text-gray-900 text-base">
              ₹{data.budget?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center w-full">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100/50 shadow-sm">
            <Clock size={18} className="text-teal-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Deadline</p>
            <p className="font-extrabold text-gray-900 text-base">{deadline}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Skills Required</h2>
        <div className="flex flex-wrap gap-2">
          {(data.skills || []).map((skill, idx) => (
            <span
              key={idx}
              className="bg-teal-50/60 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-teal-100/70 shadow-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center items-center mt-8 pt-16 border-t border-gray-100">
        <button
          onClick={() => navigate(`/client/dashboard/project-editjob/${jobId}`, { state: { source: "published" } })}
          className="flex-1 min-w-[140px] max-w-[240px] mx-auto font-bold py-3 rounded-xl transition-all border border-teal-600 text-teal-600 bg-white hover:bg-teal-50 active:scale-[0.98] shadow-sm"
        >
          Edit Details
        </button>

        {/* Delete button */}
        <div className="relative group flex-1 min-w-[140px] mx-auto max-w-[240px]">
          <button
            disabled={totalApplications > 0}
            onClick={() => totalApplications === 0 && setShowDeleteModal(true)}
            className={`w-full font-bold py-3 rounded-xl transition-all text-white shadow-sm border
              ${totalApplications > 0
                ? "bg-red-200 border-red-200 cursor-not-allowed opacity-80"
                : "bg-red-500 border-red-500 hover:bg-red-600 active:scale-[0.98] cursor-pointer"
              }`}
          >
            Delete
          </button>
          {totalApplications > 0 && (
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
              Delete is not available now
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectDetailsSection;