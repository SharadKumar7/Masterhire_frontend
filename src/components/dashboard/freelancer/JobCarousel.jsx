import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;

const JobCarousel = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Fetch recently viewed jobs from new API
  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/jobs/recent/viewed?page=1&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();

        if (data.success) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recently viewed jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  // ✅ Track view + navigate
  const handleJobClick = async (jobId) => {
    try {
      await fetch(`${apiUrl}/api/jobs/${jobId}/view`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to track view", error);
    }
    navigate(`applications/${jobId}`);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -350 : 350,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading jobs...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto font-sans px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Recently viewed jobs
      </h2>

      <div className="relative group">
        {jobs.length > 0 ? (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <span className="text-xl">‹</span>
            </button>

            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {jobs.map((job, index) => (
                <div
                  key={job._id || index} // ✅ _id not id
                  onClick={() => handleJobClick(job._id)} // ✅ track + navigate
                  className="w-[350px] md:w-[350px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer hover:border-teal-500"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4 items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        Skills:
                      </span>
                      {job.skills?.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-teal-100"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 3 && (
                        <span className="text-xs font-bold text-gray-400">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 h-[60px]">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center text-xs font-semibold text-teal-600">
                      <span className="rounded-full w-4 h-4 flex items-center justify-center text-[10px] mr-1.5 bg-teal-500 text-white">
                        #
                      </span>
                      Job ID: {job.jobId}
                    </div>

                    <span className="text-gray-500 text-xs">
                      Proposals: {job.proposals || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <span className="text-xl">›</span>
            </button>
          </>
        ) : (
          <div className="w-full max-w-6xl mx-auto py-16 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center">
            <p className="text-gray-500 font-medium">
              No recently viewed jobs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCarousel;
