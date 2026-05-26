import React, { useState, useEffect } from "react";
import { Heart,Save } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import Navigate
import formatTimeAgo from "../../../../components/dashboard/formatTimeAgo";
const apiUrl = import.meta.env.VITE_API_URL;

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. Initialize Navigate
  const isSaved = (jobId) => savedJobs.some((job) => job._id === jobId);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/jobs/freelancer/saved-jobs`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await response.json();

        setSavedJobs(data.data);
        console.log("Fetched saved jobs:", data);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  const handleToggleSave = async (e, jobId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/api/jobs/${jobId}/save`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Toggle save failed");

      if (data.saved) {
        // ✅ SAVED — add to list if not already there
        setSavedJobs((prev) =>
          prev.some((job) => job._id === jobId)
            ? prev
            : [...prev, { _id: jobId }],
        );
      } else {
        // ❌ UNSAVED — remove from list
        setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
      }
    } catch (error) {
      console.error("Failed to toggle save", error);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-teal-600 font-bold">Loading...</div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Saved jobs</h1>

      <div className="space-y-4">
        {savedJobs.map((job) => (
          <div
            key={job._id}
            // 4. Navigate to details page on card click
            onClick={() => navigate(`/freelancer/dashboard/job-details/${job._id}`)}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {/* Unsave Heart Logic */}
            <div className="absolute top-6 right-6 group/heart">
              <button
                onClick={(e) => handleToggleSave(e, job._id)}
                className="p-2 bg-teal-50 rounded-full hover:bg-teal-100 transition-colors"
              >
                <Heart
                  size={20}
                  className={
                    isSaved(job._id) ? "text-teal-600" : "text-teal-600"
                  }
                  fill={isSaved(job._id) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                />
              </button>

              {/* Tooltip Popup */}
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover/heart:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                Unsave job
                <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>

            {/* Job Header */}
            <p className="text-[10px] text-gray-400 mb-1 font-bold">
              Posted {formatTimeAgo(job.postedTime) || "5 hours ago"}
            </p>
            <h2 className="text-lg font-bold text-gray-900 mb-2 pr-12 group-hover:text-teal-700 transition-colors">
              {job.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {job.description}
              <span className="text-teal-600 font-bold ml-1 cursor-pointer">
                See more
              </span>
            </p>

            {/* Skills - Teal & Bold like design */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
              <span className="text-[11px] font-bold text-gray-400">
                Skills:
              </span>
              {job.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold text-teal-600 hover:underline"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Footer with Budget & Proposals */}
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 border-t border-gray-50 pt-4">
              <div className="flex gap-6">
                <span>
                  Est. budget:{" "}
                  <span className="text-gray-900">₹{job.budget}</span>
                </span>
                <span>
                  Est. time:{" "}
                  <span className="text-gray-900">
                    {job.deadline || "2026-03-16"}
                  </span>
                </span>
              </div>
              <div className="text-right">
                Proposals:{" "}
                <span className="text-gray-900">{job.proposals || "03"}</span>
              </div>
            </div>
          </div>
        ))}

        {savedJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-gray-200 rounded-3xl">
            <div className="bg-teal-50 p-5 rounded-full mb-4">
              <Save className="text-teal-600" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No saved jobs</h3>
            <p className="text-gray-500 mb-8 text-center max-w-xs">
              You haven't saved any jobs yet. Start exploring opportunities!
            </p>
            <button 
              onClick={() => navigate("/freelancer/dashboard/filter")} 
              className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;
