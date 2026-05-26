// ─── WorkspaceDetailsSection.jsx ─────────────────────────────────────────────
import React from "react";
import { useNavigate } from "react-router-dom";
import { IndianRupee, Clock, User, MessageSquare } from "lucide-react";
import { Spinner, ErrorBanner, Avatar } from "../../shared/workspace/Shared";

const WorkspaceDetailsSection = ({ data, loading, error, onOpenChat }) => {
  const navigate = useNavigate();
  console.log("data :", data);
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
    draft: { label: "Draft", cls: "bg-gray-50 text-gray-600 border-gray-200" },
    published: {
      label: "In Progress",
      cls: "bg-teal-50 text-teal-700 border-teal-200",
    },
    assigned: {
      label: "Assigned",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

  const st = statusConfig[data.status] || statusConfig.published;
  const freelancer = data.assignedFreelancer || null;
  console.log("freelancer :", freelancer);

  return (
    <section className="w-full space-y-6">
      {/* ─── Top Header ───────────────────────── */}
      <div className="w-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {data.title}
            </h1>
            <p className="text-sm text-gray-500">
              Workspace overview and freelancer details
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${st.cls}`}
          >
            ● {st.label}
          </span>
        </div>
      </div>

      {/* ─── Main Grid ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          {/* Summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Project Summary
            </h2>
            <div className="min-h-[180px] max-h-[240px] overflow-y-auto bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {data.description || "No summary available."}
              </p>
            </div>
          </div>

          {/* Budget & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-2xl bg-gray-50/60 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <IndianRupee size={18} className="text-teal-700" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Total Budget
                </p>
                <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                  ₹{(data.budget || 0).toLocaleString("en-IN")}
                </h3>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl bg-gray-50/60 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-teal-700" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Project Deadline
                </p>
                <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                  {deadline}
                </h3>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {(data.skills || []).length > 0 ? (
                data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-xl text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4">
          {freelancer ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                    <User size={17} className="text-teal-700" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Freelancer assigned
                  </h3>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                  <div className="relative shrink-0">
                    <Avatar
                      name={freelancer.name}
                      photo={freelancer.photo}
                      size="md"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-base truncate">
                        {freelancer.name}
                      </h4>
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {freelancer.title || "Freelancer"}
                    </p>
                    {freelancer.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <span className="text-amber-400">★</span>
                        <strong className="text-gray-900">
                          {freelancer.rating}
                        </strong>
                        <span className="text-gray-400">
                          ({freelancer.reviewsCount || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 text-center py-5 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {freelancer.jobsCompleted ?? "—"}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">Jobs done</p>
                  </div>
                  <div className="border-l border-r border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900">
                      {freelancer.onTimeDelivery || "—"}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">On-time</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {freelancer.experienceYears || "—"}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">Level</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="pt-5">
                  <p className="text-xs font-bold text-gray-700 mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(freelancer.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-lg text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 mt-8">
                <button
                  onClick={() => navigate(`/client/dashboard/freelancer-profile/${freelancer._id}`)}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-between px-4 transition"
                >
                  <span className="flex-1 text-center">View full profile</span>
                  <User size={16} />
                </button>

                <button
                  onClick={onOpenChat}
                  className="w-full border border-teal-600 text-teal-700 hover:bg-teal-50 font-bold py-3 rounded-xl text-sm flex items-center justify-between px-4 transition"
                >
                  <span className="flex-1 text-center">Open chat</span>
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <User size={22} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">
                No freelancer assigned yet
              </h3>
              <p className="text-xs text-gray-400 mt-2 max-w-[220px] leading-relaxed">
                Freelancer profile details will appear automatically once
                someone is hired for this project.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkspaceDetailsSection;
