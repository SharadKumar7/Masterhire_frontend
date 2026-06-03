import React, { useEffect, useState } from "react";
import { useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import JobOverviewSection from "../../../components/dashboard/client/JobOverviewSection";
import FindWhatYouNeedSection from "../../../components/dashboard/client/FindWhatYouNeedSection";
import ProfileCard from "../../../components/dashboard/client/ProfileCard";
import ResourceCard from "../../../components/dashboard/ResourceCard";
const apiUrl = import.meta.env.VITE_API_URL;

const FreelancerCarousel = ({ title, type, navigate }) => {
  // type prop add kiya: 'top' ya 'recent'
  const scrollRef = useRef(null);
  const [freelancers, setFreelancers] = useState([]); // Single state for this carousel
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const endpoint =
          type === "top"
            ? `${apiUrl}/api/users/top-freelancers`
            : `${apiUrl}/api/users/recent-freelancers`;

        const res = await fetch(endpoint, { headers });

        if (!res.ok) {
          throw new Error("Failed to fetch freelancers");
        }

        const rawData = await res.json();

        const data =
          type === "top" ? rawData?.freelancers || [] : rawData?.profiles || [];

        const formatted = data.map((f) => ({
          _id: f._id || f.id,

          name: f.fullName || `${f.firstName || ""} ${f.lastName || ""}`.trim(),

          image: f.photo || f.avatar || "https://via.placeholder.com/100",

          location: [f.city, f.state].filter(Boolean).join(", ") || "India",

          successRate: f.jobSuccess
            ? `${f.jobSuccess}% success`
            : "100% success",

          jobsDone: f.totalJobs || 0,

          expertise: f.title || "Unknown Expertise",

          description: f.bio || "unavailable",

          rating: f.rating || 5,

          isSaved: f.isSaved || false,

        }));

        setFreelancers(formatted);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]); // Re-run if type changes

  return (
    <section className="relative group w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          {title}
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-[-25px] top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white border border-gray-100 shadow-xl hover:bg-teal-600 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={scrollRef}
          className="w-full flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading ? (
            <div className="flex-grow min-w-full h-[350px] flex items-center justify-center">
              Loading...
            </div>
          ) : freelancers.length > 0 ? (
            freelancers.map((profile) => (
              <div
                key={profile._id}
                onClick={() => navigate(`/profile/${profile._id}`)}
                className="cursor-pointer min-w-[320px] max-w-[320px] flex-shrink-0"
              >
                <ProfileCard profile={profile} type={type} />
              </div>
            ))
          ) : (
            <div className="flex-grow min-w-full h-[350px] bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                <UserX className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-gray-400 font-bold uppercase text-sm tracking-[0.2em]">
                No Freelancers Found
              </h3>
              <p className="text-gray-300 text-xs mt-2 font-medium">
                Please check back later for updates
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-[-25px] top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white border border-gray-100 shadow-xl hover:bg-teal-600 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};

function MainBody() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 NEW STATES
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [recentFreelancers, setRecentFreelancers] = useState([]);

  // ✅ GET USER NAME
  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setName("User");
        setLoading(false);
        return;
      }

      try {
        // Aapka getMe endpoint (URL apne backend ke hisaab se change karein)
        const response = await axios.get(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`, // Token bhejna zaroori hai
          },
        });

        // Backend se milne wala fullName set karein
        if (response.data && response.data.fullName) {
          setName(response.data.fullName);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setName("User"); // Error aane par default name
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  // ✅ FETCH BOTH APIs

  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-10">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back, {name}
          </h1>

          <JobOverviewSection />
          <FindWhatYouNeedSection />

          {/* 🔥 TOP FREELANCERS */}
          <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Top Consultation Providers */}
            <div className="mb-10">
              <FreelancerCarousel
                title="Top Consultation Providers"
                type="top"
              />
            </div>

            {/* Recently Viewed Profiles */}
            <FreelancerCarousel
              title="Recently Viewed Profiles"
              type="recent"
            />
          </div>

          <ResourceCard />
        </div>
      </main>
    </div>
  );
}

export default MainBody;
