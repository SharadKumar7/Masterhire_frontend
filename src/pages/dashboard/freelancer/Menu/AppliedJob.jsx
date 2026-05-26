import React, { useState, useEffect } from "react";
import { MoreVertical, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import formatTimeAgo from "../../../../components/dashboard/formatTimeAgo";
const apiUrl = import.meta.env.VITE_API_URL;


const AppliedJobsPage = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  // 1. Fetch Applied Jobs from Backend
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${apiUrl}/api/jobs/freelancer/applied-jobs`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch applied jobs");
        }

        const data = await response.json();
        setAppliedJobs(data.data || []); 

      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  // Close menu when clicking anywhere else
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleGoToApplication = (e, id) => {
    e.stopPropagation();
    navigate(`/freelancer/dashboard/application-status/${id}`);
  };

  if (loading) return <div className="p-20 text-center text-teal-600 font-bold">Loading Applied Jobs...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 p-6 min-h-screen">
      {/* 1. Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Applied jobs</h1>

      <div className="space-y-4">
        {appliedJobs.length > 0 ? (
          appliedJobs.map((job) => (
            <div
              key={job._id}
              onClick={() => navigate(`/freelancer/dashboard/job-details/${job._id}`)}
              className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              {/* 2. 3-Dot Menu */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={(e) => handleMenuClick(e, job.id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <MoreVertical size={20} />
                </button>
                
                {openMenuId === job.id && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-10 py-2 animate-in fade-in zoom-in duration-100"
                    onClick={(e) => handleGoToApplication(e, job.id)}
                  >
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium">
                      Go to application
                    </button>
                  </div>
                )}
              </div>

              {/* Job Content Layout */}
              <p className="text-[10px] text-gray-400 mb-1 font-bold">Posted {formatTimeAgo(job.postedTime) || "5 hours ago"}</p>
              <h2 className="text-lg font-bold text-gray-900 mb-2 pr-12 group-hover:text-teal-700 transition-colors">
                {job.title}
              </h2>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed max-w-4xl">
                {job.description}
                <span className="text-teal-600 font-bold ml-1">See more</span>
              </p>

              {/* Skills Row */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 items-center">
                <span className="text-[11px] font-bold text-gray-400">Skills:</span>
                {job.skills?.map((skill, i) => (
                  <span key={i} className="text-[11px] font-bold text-teal-600 hover:underline">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Footer with Budget & Proposals */}
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 border-t border-gray-50 pt-4">
                <div className="flex gap-6">
                  <span>Est. budget: <span className="text-gray-900">₹{job.budget}</span></span>
                  <span>Est. time: <span className="text-gray-900">{job.deadline || "2026-03-16"}</span></span>
                </div>
                <div className="text-right">
                  Proposals: <span className="text-gray-900">{job.proposals || "03"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State: Shown when no jobs are found */
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-gray-200 rounded-3xl">
            <div className="bg-teal-50 p-5 rounded-full mb-4">
              <Briefcase className="text-teal-600" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No applied jobs</h3>
            <p className="text-gray-500 mb-8 text-center max-w-xs">
              You haven't submitted any applications yet. Start exploring opportunities!
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

export default AppliedJobsPage;
