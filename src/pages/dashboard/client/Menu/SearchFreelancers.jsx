import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronDown,
  Heart,
  Search,
  X,
  SlidersHorizontal,
  Users,
  RotateCcw,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

// ─── FilterGroup ──────────────────────────────────────────────────────────────
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
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpenFilter(null);
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
        className={`${baseStyle} ${variant === "circle" ? "rounded-full" : "rounded-md"} ${active ? "bg-teal-600 border-teal-600" : "bg-white border-slate-300"}`}
      >
        {active && <Check size={14} className="text-white" strokeWidth={3} />}
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpenFilter(isOpen ? null : label)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl border transition-all duration-200 ${
          isActive
            ? "border-teal-400 bg-teal-50 text-teal-700"
            : isOpen
              ? "border-teal-300 bg-white text-slate-700 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-slate-50"
        }`}
      >
        <div className="flex flex-col items-start leading-tight min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <span
            className={`text-xs font-semibold truncate max-w-[110px] ${isActive ? "text-teal-700" : "text-slate-600"}`}
          >
            {activeValue}
          </span>
        </div>
        <ChevronDown
          className={`transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? "rotate-180 text-teal-500" : "text-slate-400"}`}
          size={14}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 w-full min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl mt-1.5 overflow-hidden">
          <div className="flex flex-col gap-0.5 p-1.5 max-h-56 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpenFilter(null);
                }}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeValue === opt
                    ? "bg-teal-50 text-teal-700"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                {renderIcon(activeValue === opt)}
                <span
                  className={`flex-1 truncate text-xs font-medium ${activeValue === opt ? "font-semibold text-teal-700" : ""}`}
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
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center ${
          checked
            ? "bg-teal-600 border-teal-600"
            : "border-slate-300 bg-white group-hover:border-teal-400"
        }`}
      >
        {checked && (
          <Check className="text-white w-3.5 h-3.5" strokeWidth={3} />
        )}
      </div>
    </div>
    <span
      className={`select-none text-xs font-semibold transition-colors ${checked ? "text-teal-700" : "text-slate-600 group-hover:text-slate-800"}`}
    >
      {label}
    </span>
  </label>
);

// ─── HeartButton ──────────────────────────────────────────────────────────────
const HeartButton = ({ profileId, initialSaved = false }) => {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const method = saved ? "DELETE" : "POST";
    try {
      const res = await fetch(`${apiUrl}/api/saved-profiles/${profileId}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) setSaved((prev) => !prev);
    } catch (err) {
      console.error("Save toggle failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove from saved" : "Save profile"}
      className={`relative group/btn transition-all duration-200 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Heart
        size={30}
        className={`transition-all duration-200 ${
          saved
            ? "fill-teal-600 stroke-teal-600 hover:fill-teal-500 hover:stroke-teal-500"
            : "fill-transparent stroke-slate-300 hover:stroke-teal-500"
        }`}
      />
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none">
        {saved ? "Remove from saved" : "Save profile"}
      </span>
    </button>
  );
};

// ─── FilterChip ───────────────────────────────────────────────────────────────
const FilterChip = ({ label, value, onRemove }) => (
  <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
    <span className="text-teal-400">{label}:</span>
    <span>{value}</span>
    <button
      onClick={onRemove}
      className="ml-0.5 hover:text-teal-900 transition-colors"
    >
      <X size={11} strokeWidth={2.5} />
    </button>
  </div>
);

// ─── SearchFreelancer ─────────────────────────────────────────────────────────
const SearchFreelancer = () => {
  const navigate = useNavigate();

  // ── URL se search param read karo (category card click se aata hai) ─────────
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ── URL search param change hone pe searchQuery update karo ─────────────────
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // ── searchQuery change hone pe URL sync karo ─────────────────────────────────
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // ── Fetch freelancers ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          if (value === true) params.append(key, "true");
          return;
        }
        if (
          !value ||
          value === "All" ||
          value === "Any job success" ||
          value === "Any level"
        )
          return;
        if (key === "rating") {
          const num = parseInt(value);
          if (!isNaN(num)) params.append("rating", num);
          return;
        }
        if (key === "jobSuccess") {
          const num = parseInt(value);
          if (!isNaN(num)) params.append("jobSuccess", num);
          return;
        }
        if (key === "english") {
          params.append("englishLevel", value);
          return;
        }
        params.append(key, value);
      });

      // Search bar value backend ko bhejo
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      try {
        const url = `${apiUrl}/api/users/search-freelancers?${params.toString()}`;
        const token = localStorage.getItem("token");

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
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
  }, [filters, searchQuery]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const isFiltersDefault =
    JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS) && !searchQuery;

  const activeChips = [
    filters.category !== "All" && { key: "category", label: "Category", value: filters.category },
    filters.subcategory !== "All" && { key: "subcategory", label: "Sub", value: filters.subcategory },
    filters.skill !== "All" && { key: "skill", label: "Skill", value: filters.skill },
    filters.rating !== "All" && { key: "rating", label: "Rating", value: `${filters.rating}★ & up` },
    filters.success !== "Any job success" && { key: "success", label: "Success", value: filters.success },
    filters.english !== "Any level" && { key: "english", label: "English", value: filters.english },
    filters.language !== "All" && { key: "language", label: "Language", value: filters.language },
    filters.available && { key: "available", label: "Status", value: "Available Now" },
    filters.consultation && { key: "consultation", label: "Offers", value: "Consultations" },
  ].filter(Boolean);

  const removeChip = (key) => {
    if (key === "available" || key === "consultation") {
      setFilters((prev) => ({ ...prev, [key]: false }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
    }
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setSearchParams({});
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(items)
    ? items.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const filterGroupProps = { openFilter, setOpenFilter };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-900 tracking-tight">
              Find Talent
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Discover skilled freelancers for your next project.
            </p>
          </div>
          {!isFiltersDefault && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-50 transition-all shadow-sm"
            >
              <RotateCcw size={13} /> Reset All Filters
            </button>
          )}
        </div>

        {/* ── Search Bar ───────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, skill, title, or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <X size={11} className="text-slate-600" />
            </button>
          )}
        </div>

        {/* ── Filter Panel ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setFiltersVisible((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-teal-600" />
              <span className="text-sm font-bold text-slate-800">Filters</span>
              {activeChips.length > 0 && (
                <span className="w-5 h-5 bg-teal-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </div>
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform duration-200 ${filtersVisible ? "rotate-180" : ""}`}
            />
          </button>

          {filtersVisible && (
            <div className="px-6 pb-6 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-5">

                {/* Category + Subcategory */}
                <div className="space-y-3">
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

                {/* Skills */}
                <div>
                  <FilterGroup
                    label="Skills"
                    variant="square"
                    options={["All", "React", "Node.js", "Python", "Figma", "Marketing"]}
                    activeValue={filters.skill}
                    defaultValue="All"
                    onSelect={(val) =>
                      setFilters((prev) => ({ ...prev, skill: val }))
                    }
                    {...filterGroupProps}
                  />
                </div>

                {/* Rating + Job Success */}
                <div className="space-y-3">
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
                    options={["Any job success", "70% & up", "80% & up", "90% & up"]}
                    activeValue={filters.success}
                    defaultValue="Any job success"
                    onSelect={(val) =>
                      setFilters((prev) => ({ ...prev, success: val }))
                    }
                    {...filterGroupProps}
                  />
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <FilterGroup
                    label="English"
                    variant="square"
                    options={["Any level", "Basic", "Conversational", "Fluent", "Native or bilingual"]}
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
                    options={["All", "Hindi", "Bengali", "Tamil", "Gujarati", "Marathi", "Punjabi", "Kannada"]}
                    activeValue={filters.language}
                    defaultValue="All"
                    onSelect={(val) =>
                      setFilters((prev) => ({ ...prev, language: val }))
                    }
                    {...filterGroupProps}
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-4 pt-1">
                  <CustomCheckbox
                    label="Available Now"
                    checked={filters.available}
                    onChange={(val) =>
                      setFilters((prev) => ({ ...prev, available: val }))
                    }
                  />
                  <CustomCheckbox
                    label="Offer Consultations"
                    checked={filters.consultation}
                    onChange={(val) =>
                      setFilters((prev) => ({ ...prev, consultation: val }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Active Filter Chips ───────────────────────────────────── */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active:
            </span>
            {activeChips.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                value={chip.value}
                onRemove={() => removeChip(chip.key)}
              />
            ))}
            <button
              onClick={resetAllFilters}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-600 transition-colors flex items-center gap-1 ml-1"
            >
              <X size={11} /> Clear all
            </button>
          </div>
        )}

        {/* ── Results Count ─────────────────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={15} className="text-teal-500" />
              <span>
                <span className="font-bold text-slate-800">{items.length}</span>{" "}
                freelancer{items.length !== 1 ? "s" : ""} found
              </span>
            </div>
            {items.length > 0 && (
              <span className="text-xs text-slate-400">
                Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, items.length)} of {items.length}
              </span>
            )}
          </div>
        )}

        {/* ── Loading Skeleton ──────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-100 rounded-full w-48" />
                    <div className="h-3 bg-slate-100 rounded-full w-32" />
                    <div className="h-3 bg-slate-100 rounded-full w-24" />
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-6 w-16 bg-slate-100 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Results ───────────────────────────────────────────────── */}
        {!loading && (
          <div className="space-y-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/client/dashboard/freelancer-profile/${item.id}`)}
                className="relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="absolute top-5 right-5 z-10">
                  <HeartButton profileId={item.id} initialSaved={item.isSaved || false} />
                </div>

                <div className="flex flex-col md:flex-row gap-5 pr-10">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.fullName}
                        className="w-[72px] h-[72px] rounded-2xl object-cover border-2 border-slate-100"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-2xl bg-teal-50 text-teal-600 font-extrabold text-xl flex items-center justify-center border-2 border-teal-100">
                        {item.fullName?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                          {item.fullName}
                        </h2>
                        {item.available && (
                          <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border border-teal-100">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                            Available
                          </span>
                        )}
                        {item.consultation && (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border border-blue-100">
                            Consultations
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5 line-clamp-1">
                        {item.title || "Professional Expert"}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {item.location || "Location Private"}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 mb-4 pb-4 border-b border-slate-100">
                      {[
                        { value: item.totalJobs || "0", label: "Total Jobs" },
                        { value: `${item.jobSuccess || "100"}%`, label: "Job Success" },
                        { value: item.totalEarnings || "₹0", label: "Total Earned" },
                        { value: `${item.rating || "5.0"} ★`, label: "Rating", star: true },
                      ].map((stat, i) => (
                        <div key={i} className="text-center">
                          <p className={`text-sm font-black ${stat.star ? "text-amber-500" : "text-slate-900"}`}>
                            {stat.value}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {(item.skills || ["Expert"]).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[11px] font-semibold border border-teal-100"
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

        {/* ── No Results ────────────────────────────────────────────── */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">No freelancers found.</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search query.</p>
            {!isFiltersDefault && (
              <button
                onClick={resetAllFilters}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors mx-auto"
              >
                <RotateCcw size={12} /> Reset Filters
              </button>
            )}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pb-6">
            <button
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-teal-50 border border-slate-200 hover:border-teal-300"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchFreelancer;