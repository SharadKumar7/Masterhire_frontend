import React, { useState, useEffect, useRef } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobPost } from "../../../context/JobPostContext";
import formatTimeAgo from "../formatTimeAgo";
const apiUrl = import.meta.env.VITE_API_URL;

const JobOverviewSection = () => {
  const navigate = useNavigate();
  const { clearJobData } = useJobPost();

  const [activeTab, setActiveTab] = useState("Assigned");
  const [allJobs, setAllJobs] = useState([]);

  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${apiUrl}/api/jobs/my-jobs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("API RESPONSE:", data);

        const jobsArray = Array.isArray(data) ? data : data.jobs;

        const formattedData = jobsArray.map((item) => {
          let formattedStatus = "Draft";

          if (item.status === "published") {
            formattedStatus = "Published";
          }

          if (
            item.status === "assigned" ||
            item.status === "in_progress"
          ) {
            formattedStatus = "Assigned";
          }

          return {
            ...item,
            status: formattedStatus,
          };
        });

        setAllJobs(formattedData);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchAllJobs();
  }, []);

  const displayJobs = allJobs.filter(
    (job) => job.status === activeTab
  );

  const handlePostJob = () => {
    clearJobData();
    navigate("post-job");
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;

      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <section>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Job overview
          </h2>

          <button
            onClick={handlePostJob}
            className="flex items-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post a job
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {["Assigned", "Published", "Draft"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-6 text-sm font-medium relative transition-all ${
                activeTab === tab
                  ? "text-teal-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}

              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600" />
              )}
            </button>
          ))}
        </div>

        {/* Jobs Slider */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          {/* Scrollable Area */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-6 scroll-smooth no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {displayJobs.length > 0 ? (
              displayJobs.map((job) => (
                <div
                  key={job._id}
                  className="min-w-[320px] max-w-[320px] h-[320px] bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex flex-col flex-grow">
                    {/* Title */}
                    <div className="flex justify-between items-start mb-4 h-[32px]">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight truncate pr-2 w-full">
                        {job.title}
                      </h3>

                      <div className="w-5 h-5 bg-transparent"></div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 mb-5 border border-gray-50 h-[100px]">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mt-auto mb-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            job.status === "Published"
                              ? "bg-emerald-500"
                              : job.status === "Assigned"
                              ? "bg-emerald-700"
                              : "bg-amber-400"
                          }`}
                        ></span>

                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                          {job.status === "Published"
                            ? "Live Post"
                            : job.status === "Assigned"
                            ? "Work Assigned"
                            : "Draft Mode"}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-100/50 px-2 py-1 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>

                        <span className="text-[10px] font-black">
                          {formatTimeAgo(
                            job.createdAt
                          ).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      if (job.status === "Published") {
                        navigate(
                          `/client/dashboard/project-applications/${job._id}`
                        );
                      } else if (
                        job.status === "Assigned"
                      ) {
                        navigate(
                          `/client/dashboard/workspace/${job._id}`
                        );
                      } else {
                        navigate(
                          `/client/dashboard/project-editjob/${job._id}`
                        );
                      }
                    }}
                    className={`w-full py-3.5 rounded-2xl font-bold transition-all duration-200 active:scale-95 ${
                      job.status === "Published"
                        ? "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
                        : job.status === "Assigned"
                        ? "bg-teal-800 text-white hover:bg-teal-700 shadow-md"
                        : "border-2 border-teal-500 text-teal-500 hover:bg-teal-50"
                    }`}
                  >
                    {job.status === "Published"
                      ? "Go to Project"
                      : job.status === "Assigned"
                      ? "Manage Work"
                      : "Edit Draft"}
                  </button>
                </div>
              ))
            ) : (
              <div className="min-w-full text-center py-24 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                  No Jobs Found
                </p>
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default JobOverviewSection;