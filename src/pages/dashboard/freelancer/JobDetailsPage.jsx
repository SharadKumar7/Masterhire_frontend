import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Banknote,
  BarChart3,
  ChevronLeft,
  Pencil,
  X,
} from "lucide-react";
import formatTimeAgo from "../../../components/dashboard/formatTimeAgo";
const apiUrl = import.meta.env.VITE_API_URL;

const JobDetailsPage = () => {
  const { id } = useParams();
  const jobId = id;
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const token = localStorage.getItem("token");

  // 1. Fetch Job Data
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch job");

        const data = await response.json();
        setJob(data.data);
        setIsSaved(data.data?.isSaved || false);
        setBidAmount(data.data?.budget || "");
        setIsApplied(data.data?.isApplied || false);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // 2. ONE API for Save / Unsave toggle
  const handleSave = async () => {
    const prevState = isSaved;
    setIsSaved(!prevState); // optimistic update

    try {
      const response = await fetch(
        `${apiUrl}/api/jobs/${jobId}/save`,
        {
          method: "POST", // backend toggles: saved → unsaved, unsaved → saved
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save toggle failed");

      setIsSaved(data.saved); // sync with backend truth
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(prevState); // revert on failure
    }
  };

  // 3. ONE API for Apply / Unapply toggle
  const handleToggleApplication = async (bidValue) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/jobs/${jobId}/apply`,
        {
          method: "POST", // backend toggles: applied → unapplied, unapplied → applied
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bidAmount: bidValue ?? bidAmount,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Application toggle failed");

      // Sync both local state and job object with backend response
      const newAppliedState = data.applied; // backend returns { applied: true/false }
      setIsApplied(newAppliedState);
      setJob((prev) => ({ ...prev, isApplied: newAppliedState }));

      if (newAppliedState) {
        alert("Application submitted successfully!");
        setShowModal(false);
      } else {
        alert("Application cancelled successfully!");
        setShowCancelModal(false);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // JobDetailsPage.js

useEffect(() => {
  if (!jobId) return;

  const trackView = async () => {
    try {
      await fetch(`${apiUrl}/api/jobs/${jobId}/view`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to track view", error);
    }
  };

  trackView();
}, [jobId]); // ✅ runs once when job page opens

  if (loading)
    return (
      <div className="p-20 text-center text-teal-600 font-bold">
        Loading Job Details...
      </div>
    );
  if (!job) return <div className="p-20 text-center">Job not found.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white min-h-screen relative">
      {/* Back Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-teal-600 mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Title & Time */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 font-medium mb-5">
          Posted {formatTimeAgo(job.postedTime)}
        </p>
        <h1 className="text-2xl font-bold text-gray-800 leading-tight mb-1">
          {job.title}
        </h1>
      </div>

      <div className="space-y-10">
        {/* Summary */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Summary:</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-100">
          <div className="flex items-start gap-3">
            <Banknote className="text-gray-400 mt-1" size={22} />
            <div>
              <p className="text-sm font-bold text-gray-800">
                Budget: ₹{job.budget || "1500"}
              </p>
              <p className="text-xs text-gray-400">Negotiable</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="text-gray-400 mt-1" size={22} />
            <div>
              <p className="text-sm font-bold text-gray-800">
                Est. budget: ₹{job.budget || "1500"}
              </p>
              <p className="text-xs text-gray-400">Negotiable</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart3 className="text-gray-400 mt-1" size={22} />
            <div>
              <p className="text-sm font-bold text-gray-800">
                {job.experienceLevel || "Intermediate"}
              </p>
              <p className="text-xs text-gray-400">Experience Level</p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            Skills and expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.skills?.map((skill, i) => (
              <span
                key={i}
                className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-medium border border-teal-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Activity */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700">
            Activity on this job
          </h2>
          <p className="text-sm text-gray-500">
            Proposal:{" "}
            <span className="text-gray-800 font-medium">
              {job.proposals || 0}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Last viewed by client:{" "}
            <span className="text-gray-800 font-medium">yesterday</span>
          </p>
          <p className="text-sm text-gray-500">
            Interviewing:{" "}
            <span className="text-gray-800 font-medium">
              {job.interviewing || 0}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Invites sent:{" "}
            <span className="text-gray-800 font-medium">
              {job.invitesSent || 0}
            </span>
          </p>
        </section>
      </div>

      {/* Main Action Buttons */}
      <div className="flex justify-center mt-12 gap-2 pt-8 border-t border-gray-50">
        <button
          onClick={() => {
            if (isApplied) {
              setShowCancelModal(true); // show cancel confirmation
            } else {
              setShowModal(true); // show apply modal
            }
          }}
          className={`flex-1 min-w-[160px] m-auto max-w-[260px] font-bold py-3.5 rounded-xl transition-all shadow-lg ${
            isApplied
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100"
          }`}
        >
          {isApplied ? "Cancel Application" : "Apply to the job"}
        </button>
        <button
          onClick={handleSave}
          className={`flex-1 min-w-[160px] m-auto max-w-[260px] border-2 font-bold py-3.5 rounded-xl transition-all ${
            isSaved
              ? "border-teal-600 text-teal-600 bg-teal-50"
              : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {isSaved ? "Job Saved" : "Save job"}
        </button>
      </div>

      {/* APPLY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-150">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-md font-bold text-gray-800">
                  Est. budget: ₹{job.budget || "1500"}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold">
                  {job.isNegotiable ? "(Negotiable)" : "(Fixed Price)"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-300 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold">₹</span>
              </div>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={!job.isNegotiable}
                className={`w-full border-none rounded-xl py-4 pl-8 pr-12 font-bold text-gray-800 text-lg ${
                  job.isNegotiable
                    ? "bg-[#f3f4f6] focus:ring-2 focus:ring-teal-500"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Pencil size={18} className="text-gray-400" />
              </div>
            </div>

            <button
              onClick={() => handleToggleApplication(bidAmount)}
              className="w-full bg-[#1b4b43] hover:bg-[#143a34] text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-sm"
            >
              Submit application
            </button>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-150">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-md font-bold text-gray-800">
                Are you sure you want to cancel your application for this job?
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-300 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-row gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-sm"
              >
                Keep Application
              </button>
              <button
                onClick={() => handleToggleApplication(null)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-sm"
              >
                Cancel Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;