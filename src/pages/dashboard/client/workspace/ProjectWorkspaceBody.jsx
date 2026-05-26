// ─── ProjectWorkspace.jsx ────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { apiFetch, Spinner, ErrorBanner } from "../../shared/workspace/Shared";
import { useWorkspaceSocket } from "../../shared/workspace/UseWorkspaceSocket";

import WorkspaceDetailsSection   from "./WorkspaceDetailsSection";
import MilestonesSection         from "./MilestonesSection";
import FilesSection              from "../../shared/workspace/FilesSection";
import WorkspaceMessagesSection  from "../../shared/workspace/MessagesSection";

const TABS = [
  { key: "details",    label: "Project details" },
  { key: "milestones", label: "Milestones" },
  { key: "files",      label: "Files and attachments" },
  { key: "messages",   label: "Messages" },
];

const ProjectWorkspace = () => {
  const { id: projectId }           = useParams();
  const [activeTab, setActiveTab]   = useState("details");
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const freelancer   = data?.assignedFreelancer || null;

  // ── Socket at workspace level — always connected ──────────────────────────
  const { socketRef, incomingCall, clearIncomingCall } = useWorkspaceSocket({
    projectId,
    freelancerId: freelancer?._id,
    onSwitchToMessages: () => setActiveTab("messages"), // auto switch on incoming call
  });

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/job-details/${projectId}`);
      setData({ ...res.job });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleRefresh = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/job-details/${projectId}`);
      setData({ ...res.job });
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error("Refresh failed:", e.message);
    }
  }, [projectId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === tab.key
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {/* Incoming call badge on messages tab */}
            {tab.key === "messages" && incomingCall && (
              <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            )}
          </button>
        ))}
      </div>

      {error && !loading && <ErrorBanner message={error} />}

      <div>
        {activeTab === "details" && (
          <WorkspaceDetailsSection
            key={`details-${refreshKey}`}
            data={data} loading={loading} error={error}
            onOpenChat={() => setActiveTab("messages")}
          />
        )}
        {activeTab === "milestones" && (
          <MilestonesSection
            key={`milestones-${refreshKey}`}
            data={data} loading={loading} error={error}
            projectId={projectId}
            onMilestoneUpdate={handleRefresh}
          />
        )}
        {activeTab === "files" && (
          <FilesSection
            key={`files-${refreshKey}`}
            role="client"
            data={data} loading={loading} error={error}
            projectId={projectId}
            onUploadSuccess={handleRefresh}
          />
        )}
        {activeTab === "messages" && (
          <WorkspaceMessagesSection
            role="client"
            projectId={projectId}
            freelancer={freelancer}
            sharedSocket={socketRef}
            incomingCallFromParent={incomingCall}
            onIncomingCallHandled={clearIncomingCall}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspace;