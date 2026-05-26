// ─── ApplicationsSection.jsx ──────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { Send, X, Check, Briefcase, Loader2 } from "lucide-react";
import { apiFetch, Spinner, ErrorBanner, Avatar } from "./Shared";

const ApplicationsSection = ({ jobId, onNegotiationOpen, onChatOpen }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/client/job-applications/${jobId}`);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // PATCH status + if accepted → mark job as assigned & remove from public
  const handleStatusUpdate = async (applicationId, status, bidAmount = null) => {
    try {
      setActionLoading(applicationId);
      const body = { status };
      if (bidAmount) body.bidAmount = bidAmount;
      // This endpoint handles:
      //   - setting application status
      //   - if status==="accepted": sets job.status="assigned", job.assignedFreelancer, job.isPublic=false
      //   - rejects all other pending applications automatically
      await apiFetch(`/api/client/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await fetchApplications();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNegotiate = (application) => {
    handleStatusUpdate(application._id, "negotiation", application.bidAmount);
    onNegotiationOpen(application);
  };

  if (loading) return <Spinner text="Loading applications..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  const statusColor = {
    pending:     "text-yellow-600 bg-yellow-50 border-yellow-200",
    accepted:    "text-green-600 bg-green-50 border-green-200",
    rejected:    "text-red-500 bg-red-50 border-red-200",
    negotiation: "text-blue-600 bg-blue-50 border-blue-200",
  };

  const isJobAssigned = data.jobStatus === "assigned";

  return (
    <div className="space-y-4">
      {/* Job assigned banner */}
      {isJobAssigned && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-700 font-medium">
          <Check size={16} className="text-blue-500 shrink-0" />
          This job has been assigned. It is no longer visible to other freelancers.
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",    value: data.totalApplications,      color: "text-gray-900" },
          { label: "Pending",  value: data.statusCounts?.pending,  color: "text-yellow-600" },
          { label: "Accepted", value: data.statusCounts?.accepted, color: "text-green-600" },
          { label: "Rejected", value: data.statusCounts?.rejected, color: "text-red-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center"
          >
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value ?? 0}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        {data.totalApplications} application
        {data.totalApplications !== 1 ? "s" : ""} received
      </p>

      {data.applications.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <Briefcase size={36} className="mx-auto mb-3 opacity-30" />
          No applications yet
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.applications.map((app) => {
            const isProcessing = actionLoading === app._id;
            const isHired = app.status === "accepted";
            const isRejected = app.status === "rejected";

            return (
              <div
                key={app._id}
                className={`flex items-center justify-between border rounded-xl p-3 bg-white transition-all ${
                  isRejected
                    ? "border-gray-200 opacity-60"
                    : isHired
                    ? "border-green-300 bg-green-50/30"
                    : "border-teal-500 hover:shadow-sm"
                }`}
              >
                {/* Left: Profile */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar name={app.user?.name} photo={app.user?.photo} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-gray-900 text-sm">{app.user?.name}</h2>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          statusColor[app.status] || statusColor.pending
                        }`}
                      >
                        {app.status}
                      </span>
                      {isHired && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
                          Assigned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{app.user?.email}</p>
                    <div className="flex gap-1.5 items-center mt-1 flex-wrap">
                      {(app.user?.skills || []).slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] rounded-full border border-teal-100"
                        >
                          {skill}
                        </span>
                      ))}
                      {(app.user?.skills?.length || 0) > 3 && (
                        <span className="text-[10px] text-teal-600 font-medium">
                          +{app.user.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Bid & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-semibold text-gray-700 mr-1">
                    ₹{app.bidAmount?.toLocaleString("en-IN")}
                  </p>

                  {isProcessing ? (
                    <Loader2 size={18} className="animate-spin text-teal-600" />
                  ) : isHired ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-semibold px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                        ✓ Hired
                      </span>
                      <button
                        onClick={() => onChatOpen(app)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors"
                      >
                        <Send size={12} /> Message
                      </button>
                    </div>
                  ) : isRejected ? (
                    <span className="text-xs text-red-500 font-semibold px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                      ✗ Rejected
                    </span>
                  ) : isJobAssigned ? (
                    // Job already assigned to someone else — only reject remaining
                    <button
                      onClick={() => handleStatusUpdate(app._id, "rejected")}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                    >
                      <X size={13} strokeWidth={3} /> Reject
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(app._id, "rejected")}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        <X size={13} strokeWidth={3} /> Reject
                      </button>
                      <button
                        onClick={() => handleNegotiate(app)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        Negotiate
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app._id, "accepted")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors"
                      >
                        <Check size={13} strokeWidth={3} /> Hire
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsSection;