// ─── ProjectApplication.jsx ───────────────────────────────────────────────────
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import ProjectDetailsSection from "./ProjectDetailsSection";
import ApplicationsSection   from "./AppicationsSection";
import NegotiationSection    from "./NegotiationSection";
import MessagesSection       from "./MessagesSection";

const ProjectApplication = () => {
  const { id: jobId } = useParams();
  const [activeTab, setActiveTab]                   = useState("details");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [chatInitUser, setChatInitUser]             = useState(null);
  const [negotiationCount, setNegotiationCount]     = useState(0);

  const tabs = [
    { key: "details",      label: "Project Details" },
    { key: "applications", label: "Applications" },
    { key: "negotiation",  label: "Negotiation" },
    { key: "messages",     label: "Messages" },
  ];

  const handleNegotiationOpen = (application) => {
    setSelectedApplication(application);
    setActiveTab("negotiation");
    setNegotiationCount((prev) => Math.max(prev, 1));
  };

  const handleChatOpen = (application) => {
    setChatInitUser(application);
    setActiveTab("messages");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {/* Negotiation badge — shows count */}
            {tab.key === "negotiation" && negotiationCount > 0 && (
              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {negotiationCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "details" && (
          <ProjectDetailsSection jobId={jobId} />
        )}

        {activeTab === "applications" && (
          <ApplicationsSection
            jobId={jobId}
            onNegotiationOpen={handleNegotiationOpen}
            onChatOpen={handleChatOpen}
          />
        )}

        {activeTab === "negotiation" && (
          <NegotiationSection
            jobId={jobId}
            selectedApplication={selectedApplication}
            onClearSelection={() => {
              setSelectedApplication(null);
              setNegotiationCount(0);
              setActiveTab("applications");
            }}
          />
        )}

        {activeTab === "messages" && (
          <MessagesSection
            jobId={jobId}
            initialChatUser={chatInitUser}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectApplication;