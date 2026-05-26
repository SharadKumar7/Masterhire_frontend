import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;

const CATEGORY_MAP = {
  "Accounting & Consulting": [
    "Personal & Professional Coaching",
    "Accounting & Book-keeping",
    "Financial Planning",
    "Recruiting & Human Resources",
    "Management Consulting",
    "Other - Accounting & Consulting",
  ],
  "Admin Support": [
    "Data Entry & Transcription Services",
    "Virtual Assistance",
    "Project Management",
    "Market Research & Product Reviews",
  ],
  "Data Science & Analytics": [
    "Data Analysis & Reporting",
    "Data Extraction/ETL",
    "Data Mining & Management",
    "AI & Machine Learning",
  ],
  "Design & Creativity": [
    "Art & Illustration",
    "Branding & Logo Design",
    "NFT, AR/VR & Game Art",
    "Graphic, Editorial & Presentation Design",
    "Photography",
    "Product Design",
    "Video & Animation",
  ],
  "IT & Networking": [
    "Database Management & Administration",
    "ERP/CRM Software",
    "Information Security & Compliance",
    "Network & System Administration",
    "DevOps & Solution Architecture",
  ],
  "Sales Marketing": [
    "Digital Marketing",
    "Lead Generation & Telemarketing",
    "Marketing, PR & Brand Strategy",
  ],
  "Web, Mobile & Software Dev": [
    "Blockchain, NFT & Cryptocurrency",
    "AI Apps & Integration",
    "Desktop Application Development",
    "Ecommerce Development",
    "Game Design & Development",
    "Mobile Development",
    "Other-Software Development",
    "QA Testing",
    "Web & Mobile Design",
    "Web Development",
  ],
};

const DEFAULT_FILTERS = {
  category: "All",
  subcategory: "All",
  rating: "All",
  language: "All",
  success: "Any job success",
  english: "Any level",
  skill: "All",
  available: false,
  consultation: false,
};

// ─── FilterGroup ─────────────────────────────────────────────────────────────
const FilterGroup = ({
  label,
  options,
  activeValue,
  onSelect,
  variant = "square",
  openFilter,
  setOpenFilter,
  defaultValue,
}) => {
  const isOpen = openFilter === label;
  const containerRef = useRef(null);
  const isActive = activeValue !== defaultValue;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, setOpenFilter]);

  const renderIcon = (active) => {
    const baseStyle =
      "w-5 h-5 flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0";
    if (variant === "none") {
      return active ? (
        <Check size={16} className="text-teal-600 flex-shrink-0" />
      ) : (
        <div className="w-4 flex-shrink-0" />
      );
    }
    return (
      <div
        className={`${baseStyle} ${
          variant === "circle" ? "rounded-full" : "rounded-md"
        } ${active ? "bg-teal-600 border-teal-600" : "bg-white border-gray-300"}`}
      >
        {active && <Check size={14} className="text-white" strokeWidth={3} />}
      </div>
    );
  };

  return (
    <div
      className="mb-4 border-b border-gray-100 pb-2 relative"
      ref={containerRef}
    >
      <button
        onClick={() => setOpenFilter(isOpen ? null : label)}
        className="flex items-center justify-between w-full py-2"
      >
        <div className="flex flex-col items-start leading-tight">
          <span
            className={`text-sm font-semibold ${isOpen ? "text-teal-500" : "text-gray-800"}`}
          >
            {label}
          </span>
          {/* ✅ NEW: active selection shown below label */}
          {isActive && (
            <span className="text-xs text-teal-600 font-medium mt-0.5 truncate max-w-[110px]">
              {activeValue}
            </span>
          )}
        </div>
        <ChevronDown
          className={`transition-transform duration-300 flex-shrink-0 ml-1 ${
            isOpen ? "rotate-180 text-teal-500" : "rotate-0 text-gray-400"
          }`}
          size={16}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 w-full min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-xl mt-1">
          <div className="flex flex-col gap-0.5 p-1.5 max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpenFilter(null);
                }}
                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                  activeValue === opt ? "bg-teal-50" : "hover:bg-gray-50"
                }`}
              >
                {renderIcon(activeValue === opt)}
                {/* ✅ NEW: plain option name only, no extra detail */}
                <span
                  className={`flex-1 truncate text-sm ${
                    activeValue === opt
                      ? "text-gray-900 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {opt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CustomCheckbox ───────────────────────────────────────────────────────────
const CustomCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`w-6 h-6 border-2 rounded transition-all ${
          checked ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"
        } group-hover:border-teal-400`}
      >
        {checked && (
          <Check
            className="text-white w-5 h-5 animate-in fade-in zoom-in duration-200"
            strokeWidth={3}
          />
        )}
      </div>
    </div>
    <span className="text-gray-700 select-none font-semibold text-sm">
      {label}
    </span>
  </label>
);

// ─── SearchFreelancer ─────────────────────────────────────────────────────────
const SearchFreelancer = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(null);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        // ✅ BOOLEAN
        if (typeof value === "boolean") {
          if (value === true) params.append(key, "true");
          return;
        }

        // ❌ SKIP DEFAULT VALUES
        if (
          !value ||
          value === "All" ||
          value === "Any job success" ||
          value === "Any level"
        ) {
          return;
        }

        // ⭐ RATING FIX (e.g. "4 & above" → 4)
        if (key === "rating") {
          const num = parseInt(value);
          if (!isNaN(num)) params.append("rating", num);
          return;
        }

        // 📊 JOB SUCCESS FIX (e.g. "80% & above" → 80)
        if (key === "jobSuccess") {
          const num = parseInt(value);
          if (!isNaN(num)) params.append("jobSuccess", num);
          return;
        }

        // 🌐 ENGLISH LEVEL
        if (key === "english") {
          params.append("englishLevel", value);
          return;
        }

        // 🧠 SKILL (rename if needed)
        if (key === "skill") {
          params.append("skill", value);
          return;
        }

        // 🟢 AVAILABLE
        if (key === "available") {
          params.append("available", "true");
          return;
        }

        // 🤝 CONSULTATION
        if (key === "consultation") {
          params.append("consultation", "true");
          return;
        }

        // ✅ DEFAULT
        params.append(key, value);
      });

      try {
        const url = params.toString()
          ? `${apiUrl}/api/users/search-freelancers?${params.toString()}`
          : `${apiUrl}/api/users/search-freelancers`;

        const response = await fetch(url);

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();

        console.log("API DATA:", data); // 🔥 debug

        // ✅ FIX RESPONSE
        setItems(data.freelancers || []);

        setCurrentPage(1);
      } catch (error) {
        console.error("Search fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [filters]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(items)
    ? items.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const filterGroupProps = { openFilter, setOpenFilter };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FILTER PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">
            Find Talent
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <FilterGroup
                label="Category"
                variant="none"
                options={["All", ...Object.keys(CATEGORY_MAP)]}
                activeValue={filters.category}
                defaultValue="All"
                onSelect={(cat) =>
                  setFilters((prev) => ({
                    ...prev,
                    category: cat,
                    subcategory: "All",
                  }))
                }
                {...filterGroupProps}
              />
              {filters.category !== "All" && (
                <FilterGroup
                  label="Sub-Category"
                  variant="none"
                  options={["All", ...CATEGORY_MAP[filters.category]]}
                  activeValue={filters.subcategory}
                  defaultValue="All"
                  onSelect={(val) =>
                    setFilters((prev) => ({ ...prev, subcategory: val }))
                  }
                  {...filterGroupProps}
                />
              )}
            </div>

            <div>
              <FilterGroup
                label="Skills"
                variant="square"
                options={[
                  "All",
                  "React",
                  "Node.js",
                  "Python",
                  "Figma",
                  "Marketing",
                ]}
                activeValue={filters.skill}
                defaultValue="All"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, skill: val }))
                }
                {...filterGroupProps}
              />
            </div>

            <div>
              <FilterGroup
                label="Rating"
                variant="circle"
                options={["All", "5", "4", "3"]}
                activeValue={filters.rating}
                defaultValue="All"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, rating: val }))
                }
                {...filterGroupProps}
              />
              <FilterGroup
                label="Job Success"
                variant="circle"
                options={[
                  "Any job success",
                  "70% & up",
                  "80% & up",
                  "90% & up",
                ]}
                activeValue={filters.success}
                defaultValue="Any job success"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, success: val }))
                }
                {...filterGroupProps}
              />
            </div>

            <div>
              <FilterGroup
                label="English"
                variant="square"
                options={[
                  "Any level",
                  "Basic",
                  "Conversational",
                  "Fluent",
                  "Native or bilingual",
                ]}
                activeValue={filters.english}
                defaultValue="Any level"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, english: val }))
                }
                {...filterGroupProps}
              />
              <FilterGroup
                label="Other Language"
                variant="square"
                options={[
                  "All",
                  "Hindi",
                  "Bengali",
                  "Tamil",
                  "Gujarati",
                  "Marathi",
                  "Punjabi",
                  "Kannada",
                ]}
                activeValue={filters.language}
                defaultValue="All"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, language: val }))
                }
                {...filterGroupProps}
              />
            </div>

            {/* ✅ FIXED checkboxes */}
            <div className="flex flex-col gap-6 p-4">
              <CustomCheckbox
                label="Offer Consultations"
                checked={filters.consultation}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, consultation: val }))
                }
              />
              <CustomCheckbox
                label="Available Now"
                checked={filters.available}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, available: val }))
                }
              />
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        )}

        {/* ✅ RESULTS — clickable cards navigating to /details/:id */}
        {!loading && (
          <div className="space-y-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/client/dashboard/freelancer-profile/${item.id}`)}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 1. Avatar Section */}
                  <div className="shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.fullName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-50"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-600 font-extrabold text-xl flex items-center justify-center border-2 border-teal-100">
                        {item.fullName?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* 2. Content Section */}
                  <div className="flex-grow">
                    {/* Name & Title */}
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {item.fullName}
                      </h2>
                      <h3 className="text-[16px] font-semibold text-gray-700 mt-1 line-clamp-1">
                        {item.title || "Professional Expert"}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        {item.location || "Location Private"}
                      </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-6 border-b border-gray-50 pb-5">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {item.totalJobs || "0"}
                        </p>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">
                          Total jobs
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {item.jobSuccess || "100"}%
                        </p>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">
                          Job success
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {item.totalEarnings || "₹0"}
                        </p>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">
                          Total earnings
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                          {item.rating || "5.0"}{" "}
                          <span className="text-yellow-400 text-sm">★</span>
                        </p>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">
                          Rating
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 md:ml-auto">
                        {item.available && (
                          <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[11px] font-black uppercase border border-teal-100">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                            Available now
                          </span>
                        )}
                        {item.consultation && (
                          <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[11px] font-black uppercase border border-teal-100">
                            Offers consultations
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Skills/Tags Section */}
                    <div className="flex flex-wrap gap-2">
                      {(item.skills || ["Expert"]).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-cyan-50/50 text-cyan-700 px-4 py-1 rounded-full text-[12px] font-bold border border-cyan-100/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10 pb-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-teal-50 border border-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No freelancers found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFreelancer;
