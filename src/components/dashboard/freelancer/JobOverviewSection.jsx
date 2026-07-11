import React, { useState, useEffect, useRef } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobPost } from "../../../context/JobPostContext";
const apiUrl = import.meta.env.VITE_API_URL;

const JobOverviewSection = () => {
  const navigate = useNavigate();
  const { clearJobData } = useJobPost();
  const scrollRef = useRef(null);

  const [activeTab, setActiveTab] = useState("current");
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const token = localStorage.getItem("token");

    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const [appliedRes, currentRes] = await Promise.all([
          fetch(`${apiUrl}/api/jobs/freelancer/applied-jobs`, {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${apiUrl}/api/jobs/freelancer/current-job`, {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!appliedRes.ok || !currentRes.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const appliedData = await appliedRes.json();
        const currentData = await currentRes.json();

        // ✅ combine + type add
        const combinedJobs = [
          ...(appliedData.data || []).map((job) => ({
            ...job,
            type: "applied",
          })),
          ...(currentData.data || []).map((job) => ({
            ...job,
            type: "current",
          })),
        ];

        setAllJobs(combinedJobs);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    return () => controller.abort();
  }, []);

  // ✅ filter safely
  const displayJobs = allJobs.filter((job) => job.type === activeTab);

  // Scroll
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleSearchJob = () => {
    clearJobData();
    navigate("/freelancer/dashboard/filter");
  };

  return (
    <section>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Job overview</h2>
          <button
            onClick={handleSearchJob}
            className="flex items-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Browse jobs
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {[
            { label: "Current jobs", value: "current" },
            { label: "Applied jobs", value: "applied" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 px-6 text-sm font-medium relative ${
                activeTab === tab.value
                  ? "text-teal-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600" />
              )}
            </button>
          ))}
        </div>

        {loading && <p>Loading jobs...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Jobs */}
        <div className="relative group">
          {displayJobs.length > 0 && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border rounded-full p-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border rounded-full p-2"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4"
          >
            {displayJobs.length > 0 ? (
              displayJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() =>
                    activeTab === "current"
                      ? navigate(`workspace/${job._id}`)
                      : navigate(`applications/${job._id}`)
                  }
                  className="min-w-[350px] max-w-[350px] h-[330px] flex flex-col border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-teal-200 bg-white"
                >
                  {/* Title: Fixed to 1 line with ellipsis */}
                  <h3 className="font-bold text-gray-800 text-lg mb-3 truncate">
                    {job.title}
                  </h3>

                  {/* Skills: Show 3 and count the rest */}
                  <div className="flex flex-wrap gap-2 mb-4 h-[32px] overflow-hidden">
                    <span className="text-xs text-gray-500 mr-1 mt-2">
                      Skills:
                    </span>
                    {job.skills?.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[10px] font-semibold border border-teal-100 whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills?.length > 3 && (
                      <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Summary: Fixed height for 3 lines with ellipsis */}
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed min-h-[60px]">
                      {job.description}
                    </p>
                  </div>

                  {/* Status & Budget Bar: Always at the bottom */}
                  <div className="flex justify-between items-center text-sm mb-6 pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center text-xs font-semibold text-teal-600">
                      <span className="rounded-full w-4 h-4 flex items-center justify-center text-[10px] mr-1.5 bg-teal-500 text-white">
                        #
                      </span>
                      Job ID: {job.jobId}
                    </div>
                    <span className="font-bold text-gray-800 text-base">
                      ₹
                      {activeTab === "current"
                        ? job.finalBudget || job.budget
                        : job.budget}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      activeTab === "current"
                        ? navigate(`/freelancer/dashboard/workspace/${job._id}`)
                        : navigate(
                            `/freelancer/dashboard/applications/${job._id}`,
                          );
                    }}
                    className="w-full py-3.5 border-2 border-teal-600 rounded-xl text-teal-600 font-bold text-sm transition-all hover:bg-teal-50 active:scale-[0.98]"
                  >
                    {activeTab === "current"
                      ? "Go to workspace"
                      : "See application"}
                  </button>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 text-gray-500">
                No {activeTab} jobs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobOverviewSection;
