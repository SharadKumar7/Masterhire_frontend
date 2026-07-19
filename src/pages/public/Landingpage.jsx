import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

const apiUrl = import.meta.env.VITE_API_URL;

// ─── Keywords ────────────────────────────────────────────────────────────────
const TALENT_KEYWORDS = [
  "React Developer", "UI/UX Designer", "Node.js", "Flutter",
  "Python", "Figma", "WordPress", "Data Analyst",
];

const JOB_KEYWORDS = [
  "Web Development", "Mobile App", "Logo Design", "SEO",
  "Content Writing", "Data Entry", "Video Editing", "DevOps",
];

const EXPLORE_CATEGORIES = [
  { icon: "💻", label: "Web Design" },
  { icon: "📱", label: "Mobile Apps" },
  { icon: "🎨", label: "UI / UX" },
  { icon: "🐍", label: "Python" },
  { icon: "☕", label: "Java" },
  { icon: "🐘", label: "PHP" },
  { icon: "⚛️", label: "React" },
  { icon: "🟢", label: "Node.js" },
  { icon: "🔍", label: "SEO" },
  { icon: "✍️", label: "Content Writing" },
  { icon: "📣", label: "Marketing" },
  { icon: "🎬", label: "Video Editing" },
  { icon: "📊", label: "Data Science" },
  { icon: "🤖", label: "AI / ML" },
  { icon: "🛠️", label: "DevOps" },
  { icon: "🔐", label: "Cyber Security" },
  { icon: "🧪", label: "Testing" },
  { icon: "⛓️", label: "Blockchain" },
  { icon: "☁️", label: "Cloud" },
  { icon: "🎮", label: "Game Dev" },
  { icon: "⚡", label: "Automation" },
  { icon: "🧩", label: "No-Code" },
  { icon: "📋", label: "Product Mgmt" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Startup Founder, Mumbai",
    text: "MasterHire ne mera kaam badal diya. Maine ek React developer 2 din mein hire kar liya — aur kaam bilkul perfect tha!",
    rating: 5,
    avatar: "PS",
    color: "#2ec4a9",
  },
  {
    name: "Rahul Verma",
    role: "E-commerce Owner, Delhi",
    text: "Pehle Upwork use karta tha, bahut fees lagti thi. Yahan zero platform charges hain — yeh toh ekdum sahi hai mere liye.",
    rating: 5,
    avatar: "RV",
    color: "#5b7cfa",
  },
  {
    name: "Ananya Iyer",
    role: "Marketing Manager, Bangalore",
    text: "Content writers ki badi variety hai. Maine 3 writers hire kiye aur quality se bahut khush hoon. Definitely recommend karunga!",
    rating: 5,
    avatar: "AI",
    color: "#f07030",
  },
  {
    name: "Vikram Patel",
    role: "Tech Lead, Pune",
    text: "Humari company ke liye DevOps engineer dhundhna bahut mushkil tha. MasterHire pe 1 din mein perfect match mil gaya.",
    rating: 5,
    avatar: "VP",
    color: "#8b5cf6",
  },
  {
    name: "Sneha Reddy",
    role: "Designer, Hyderabad",
    text: "Ek freelancer ke taur pe mujhe yahan bahut acche projects mile. Platform bahut easy hai aur payment bhi safe hai.",
    rating: 5,
    avatar: "SR",
    color: "#d44f7e",
  },
  {
    name: "Arjun Nair",
    role: "Agency Owner, Chennai",
    text: "Hamari agency ke liye 10+ freelancers hire kar chuke hain. Sab professionals hain aur kaam time pe deliver karte hain.",
    rating: 5,
    avatar: "AN",
    color: "#2271b1",
  },
];

// ─── FreelancerCard ───────────────────────────────────────────────────────────
const FreelancerCard = ({ item, onLoginRedirect }) => (
  <div
    onClick={onLoginRedirect}
    className="bg-[#1a2744] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-900/30 transition-all duration-200 group"
  >
    <div className="flex items-center gap-3 mb-3">
      {item.image ? (
        <img src={item.image} alt={item.fullName}
          className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-400 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-teal-500/20">
          {item.fullName?.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-white text-sm font-bold truncate group-hover:text-teal-300 transition-colors">
          {item.fullName}
        </p>
        <p className="text-gray-400 text-xs truncate">{item.title}</p>
      </div>
    </div>

    <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
      <span className="text-amber-400 font-bold">★ {item.rating || "5.0"}</span>
      {item.location && <span className="truncate">📍 {item.location}</span>}
      {item.available && (
        <span className="flex items-center gap-1 text-teal-400 font-semibold ml-auto flex-shrink-0">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Available
        </span>
      )}
    </div>

    <div className="flex flex-wrap gap-1.5 mb-3">
      {(item.skills || []).slice(0, 3).map((skill, i) => (
        <span key={i} className="bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
          {skill}
        </span>
      ))}
    </div>

    <button
      onClick={onLoginRedirect}
      className="w-full py-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold rounded-xl hover:bg-teal-500/20 transition-colors"
    >
      View Profile →
    </button>
  </div>
);

// ─── JobCard ──────────────────────────────────────────────────────────────────
const JobCard = ({ item, onLoginRedirect }) => (
  <div
    onClick={onLoginRedirect}
    className="bg-[#1a2744] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-900/30 transition-all duration-200 group"
  >
    {item.jobId && (
      <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full mb-2 inline-block">
        {item.jobId}
      </span>
    )}

    <h3 className="text-white text-sm font-bold mb-1.5 line-clamp-1 group-hover:text-teal-300 transition-colors">
      {item.title || "Project Title"}
    </h3>

    <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
      {item.description || "No description provided."}
    </p>

    <div className="flex flex-wrap gap-1.5 mb-3">
      {(item.skills || []).slice(0, 3).map((skill, i) => (
        <span key={i} className="bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
          {skill}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs text-gray-400">
      <span className="font-bold text-white">₹{item.budget || "—"}</span>
      <span>{item.experienceLevel || "Any level"}</span>
    </div>
  </div>
);

// ─── Main Landing Page ────────────────────────────────────────────────────────
const MasterHireLandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("talent");
  const [searchQuery, setSearchQuery] = useState("");

  // Results
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalUsers: null, totalJobs: null });

  // Infinite scroll observer
  const observerRef = useRef(null);
  const lastCardRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${apiUrl}/api/users/stats`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.stats); })
      .catch(() => {});
  }, []);

  // ── Fetch results when page changes ─────────────────────────────────────────
  useEffect(() => {
    if (!searched) return;
    fetchResults(page, page === 1);
  }, [page]);

  const fetchResults = async (pageNum = 1, reset = true, overrideQuery = null) => {
    const q = overrideQuery !== null ? overrideQuery : searchQuery;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: q.trim(),
        page: pageNum,
        limit: 10,
      });

      const url = activeTab === "talent"
        ? `${apiUrl}/api/users/search-freelancers?${params}`
        : `${apiUrl}/api/jobs/search?${params}`;

      const res = await fetch(url);
      const data = await res.json();

      const newItems = activeTab === "talent"
        ? (data.freelancers || [])
        : (data.jobs || []);

      setResults((prev) => reset ? newItems : [...prev, ...newItems]);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setPage(1);
    setSearched(true);
    setResults([]);
    fetchResults(1, true);
  };

  const handleKeyword = (kw) => {
    setSearchQuery(kw);
    setPage(1);
    setSearched(true);
    setResults([]);
    fetchResults(1, true, kw);
  };

  const handleLoginRedirect = (e) => {
    e?.stopPropagation();
    navigate("/login");
  };

  const keywords = activeTab === "talent" ? TALENT_KEYWORDS : JOB_KEYWORDS;

  return (
    <div className="min-h-screen text-white overflow-x-hidden font-sans"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2744 100%)" }}>

      <Header />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <header>
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex justify-between items-center py-20 min-h-[600px]">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              🇮🇳 Made for Indians by Indians
            </div>

            <h1
              className="text-5xl lg:text-6xl leading-tight mb-8 font-black"
              style={{ background: "linear-gradient(135deg, #ffffff, #00ffaa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Where India's Best Talent Meets Real Work
            </h1>

            <div className="space-y-3 mb-8">
              {[
                "Minimal Platform Charges.",
                "10,000+ Verified Indian Freelancers",
                "Pay Only When You're 100% Happy",
                "Any Job You Can Possibly Think Of",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold">✔</span>
                  </div>
                  <p className="text-gray-300 text-sm">{feature}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleLoginRedirect}
              className="bg-gradient-to-br from-cyan-400 to-teal-400 text-[#0a1628] px-10 py-4 rounded-xl text-base font-black cursor-pointer transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl"
              style={{ boxShadow: "0 5px 25px rgba(0, 255, 170, 0.3)" }}
            >
              Post a Project →
            </button>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="relative w-[300px] h-[400px] animate-float-custom">
              <div className="w-[200px] h-[350px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-4 shadow-2xl relative">
                <div className="w-full h-full bg-[#0a1628]/80 rounded-2xl flex flex-col items-center justify-center gap-4 p-4">
                  <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center text-lg">💼</div>
                  <div className="w-full space-y-2">
                    <div className="h-2 bg-white/20 rounded-full w-4/5 mx-auto" />
                    <div className="h-2 bg-white/20 rounded-full w-3/5 mx-auto" />
                    <div className="h-2 bg-teal-400/40 rounded-full w-4/5 mx-auto" />
                  </div>
                  <div className="flex gap-2">
                    {["⚛️", "🎨", "📱"].map((e, i) => (
                      <div key={i} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">{e}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute top-[-30px] right-[-50px] w-[120px] h-[90px] bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg animate-bounce-custom flex items-center justify-center shadow-xl">
                <span className="text-[#0a1628] font-black text-xs text-center">Build<br/>Hire<br/>Succeed</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── FIND TALENT / JOBS ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">

          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Your Next{" "}
              <span style={{ background: "linear-gradient(135deg, #00ffaa, #00b4d8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {activeTab === "talent" ? "Hire" : "Project"}
              </span>{" "}
              Is One Search Away
            </h2>
            <p className="text-gray-400 text-sm">
              {activeTab === "talent"
                ? "Find skilled Indian freelancers across every domain"
                : "Browse thousands of live projects waiting for your skills"}
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#23314f] p-3 rounded-2xl shadow-2xl border border-white/5">

              {/* Tabs */}
              <div className="flex gap-1 mb-3 p-1 bg-[#0a1628]/50 rounded-xl relative">
                <div className={`absolute top-1 bottom-1 bg-teal-500 rounded-lg transition-all duration-300 ease-in-out ${
                  activeTab === "talent" ? "left-1 w-[calc(50%-0.25rem)]" : "left-[calc(50%+0.25rem)] w-[calc(50%-0.25rem)]"
                }`} />
                {[
                  { id: "talent", label: "🧑‍💻 Find Talent" },
                  { id: "jobs", label: "💼 Explore Jobs" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setResults([]); setSearched(false); setSearchQuery(""); }}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg relative z-10 transition-colors duration-200 ${
                      activeTab === tab.id ? "text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={activeTab === "talent"
                    ? "Search by role, skill, or keyword..."
                    : "Search by job title, skill, or Job ID..."}
                  className="flex-1 px-4 py-3 bg-white text-gray-800 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-black rounded-xl transition-colors text-sm"
                >
                  Search
                </button>
              </div>

              {/* Keyword chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-gray-500 text-xs font-medium self-center">Try:</span>
                {keywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleKeyword(kw)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      searchQuery === kw
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-teal-400/50 hover:text-teal-300"
                    }`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {searched && (
              <div className="mt-6">
                {results.length === 0 && !loading && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    No results found. Try a different keyword.
                  </div>
                )}

                {results.length > 0 && (
                  <>
                    <p className="text-gray-400 text-xs mb-4 text-center">
                      Showing results for <span className="text-teal-400 font-bold">"{searchQuery}"</span>
                      {" — "}
                      <button onClick={handleLoginRedirect} className="text-teal-400 underline">
                        Login to see full profiles
                      </button>
                    </p>

                    {/* Scrollable 3-col grid */}
                    <div className="max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {results.map((item, idx) => {
                          const isLast = idx === results.length - 1;
                          return (
                            <div key={item.id || item._id} ref={isLast ? lastCardRef : null}>
                              {activeTab === "talent" ? (
                                <FreelancerCard item={item} onLoginRedirect={handleLoginRedirect} />
                              ) : (
                                <JobCard item={item} onLoginRedirect={handleLoginRedirect} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {loading && (
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#1a2744] rounded-2xl p-4 animate-pulse h-36" />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {loading && results.length === 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-[#1a2744] rounded-2xl p-4 animate-pulse h-36" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── EXPLORE CATEGORIES ─────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">Browse by Category</p>
              <h3 className="text-3xl font-black text-white">Explore 1000+ Categories</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {EXPLORE_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={handleLoginRedirect}
                className="flex flex-col items-center gap-2 p-3 bg-[#0b1437] rounded-xl border border-white/5 hover:border-teal-400/40 hover:bg-[#1a2744] transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-gray-300 text-[11px] font-medium text-center leading-tight group-hover:text-teal-300 transition-colors">
                  {cat.label}
                </span>
              </button>
            ))}

            <button
              onClick={handleLoginRedirect}
              className="flex flex-col items-center gap-2 p-3 bg-teal-500 rounded-xl border border-teal-400 hover:bg-teal-400 transition-all col-span-1"
            >
              <span className="text-2xl">→</span>
              <span className="text-[#0a1628] text-[11px] font-black text-center">Explore More</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="mb-10">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">Real Stories</p>
            <h3 className="text-3xl font-black text-white">What Our Clients Experienced</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-[#1a2744] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                    style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{t.name}</p>
                    <p className="text-gray-500 text-[10px]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-10 max-w-xl mx-auto text-center">
            <div>
              <h4 className="text-5xl font-black mb-2"
                style={{ background: "linear-gradient(135deg, #00ffaa, #00b4d8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stats.totalUsers !== null ? stats.totalUsers.toLocaleString("en-IN") : "—"}
              </h4>
              <p className="text-gray-400 text-sm font-medium">Total Registered Users</p>
            </div>
            <div>
              <h4 className="text-5xl font-black mb-2"
                style={{ background: "linear-gradient(135deg, #00ffaa, #00b4d8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stats.totalJobs !== null ? stats.totalJobs.toLocaleString("en-IN") : "—"}
              </h4>
              <p className="text-gray-400 text-sm font-medium">Total Published Jobs</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MasterHireLandingPage;