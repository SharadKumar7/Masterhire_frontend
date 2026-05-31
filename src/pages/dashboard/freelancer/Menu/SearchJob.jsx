import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Search, X, SlidersHorizontal, Briefcase, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import formatTimeAgo from "../../../../components/dashboard/formatTimeAgo";
const apiUrl = import.meta.env.VITE_API_URL;

const CATEGORY_MAP = [
  "Mobile & Web Development",
  "DevOps",
  "Design",
  "Data Entry",
  "Virtual Assistant",
  "Content Writing",
];

const DEFAULT_FILTERS = {
  category: "All",
  subcategory: "All",
  experience: "All",
  clientHistory: "All",
  price: "All",
  projectLength: "All",
  consultation: false,
};

// ─── FilterGroup ──────────────────────────────────────────────────────────────
const FilterGroup = ({
  label, options, activeValue, onSelect,
  variant = "square", openFilter, setOpenFilter, defaultValue,
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
    const baseStyle = "w-5 h-5 flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0";
    if (variant === "none") {
      return active ? (
        <Check size={16} className="text-teal-600 flex-shrink-0" />
      ) : (
        <div className="w-4 flex-shrink-0" />
      );
    }
    return (
      <div className={`${baseStyle} ${variant === "circle" ? "rounded-full" : "rounded-md"} ${active ? "bg-teal-600 border-teal-600" : "bg-white border-slate-300"}`}>
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
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
          <span className={`text-xs font-semibold truncate max-w-[110px] ${isActive ? "text-teal-700" : "text-slate-600"}`}>
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
                onClick={() => { onSelect(opt); setOpenFilter(null); }}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeValue === opt ? "bg-teal-50 text-teal-700" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                {renderIcon(activeValue === opt)}
                <span className={`flex-1 truncate text-xs font-medium ${activeValue === opt ? "font-semibold text-teal-700" : ""}`}>
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
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center ${
        checked ? "bg-teal-600 border-teal-600" : "border-slate-300 bg-white group-hover:border-teal-400"
      }`}>
        {checked && <Check className="text-white w-3.5 h-3.5" strokeWidth={3} />}
      </div>
    </div>
    <span className={`select-none text-xs font-semibold transition-colors ${checked ? "text-teal-700" : "text-slate-600 group-hover:text-slate-800"}`}>
      {label}
    </span>
  </label>
);

// ─── Filter Chip ──────────────────────────────────────────────────────────────
const FilterChip = ({ label, value, onRemove }) => (
  <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
    <span className="text-teal-400">{label}:</span>
    <span>{value}</span>
    <button onClick={onRemove} className="ml-0.5 hover:text-teal-900 transition-colors">
      <X size={11} strokeWidth={2.5} />
    </button>
  </div>
);

// ─── SearchJob ────────────────────────────────────────────────────────────────
const SearchJob = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ── same fetch logic as original ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          if (value === true) params.append(key, "true");
          return;
        }
        if (key === "price") {
          const priceMap = {
            "Less than Rs1,000": { max: 1000 },
            "Rs1,000 - Rs5,000": { min: 1000, max: 5000 },
            "Rs5,000 - Rs10,000": { min: 5000, max: 10000 },
            "Rs10,000+": { min: 10000 },
          };
          const selected = priceMap[value];
          if (selected?.min) params.append("minBudget", selected.min);
          if (selected?.max) params.append("maxBudget", selected.max);
          return;
        }
        if (value && value !== "All") params.append(key, value);
      });

      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      try {
        const response = await fetch(`${apiUrl}/api/jobs/search?${params.toString()}`);
        const data = await response.json();
        console.log("API DATA:", data);
        setItems(data.jobs || []);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [filters, searchQuery]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const isFiltersDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS) && !searchQuery;

  const activeChips = [
    filters.category !== "All"      && { key: "category",      label: "Category",    value: filters.category      },
    filters.experience !== "All"    && { key: "experience",    label: "Experience",  value: filters.experience    },
    filters.clientHistory !== "All" && { key: "clientHistory", label: "Client",      value: filters.clientHistory },
    filters.price !== "All"         && { key: "price",         label: "Budget",      value: filters.price         },
    filters.projectLength !== "All" && { key: "projectLength", label: "Length",      value: filters.projectLength },
    filters.consultation            && { key: "consultation",  label: "Needs",       value: "Consultations"       },
  ].filter(Boolean);

  const removeChip = (key) => {
    if (key === "consultation") {
      setFilters(prev => ({ ...prev, consultation: false }));
    } else {
      setFilters(prev => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
    }
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
  };

  const handleCategoryClick = (cat) => {
    setFilters((prev) => ({ ...prev, category: cat, subcategory: "All" }));
  };

  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(items) ? items.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages   = Math.ceil(items.length / itemsPerPage);
  const filterGroupProps = { openFilter, setOpenFilter };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Find Jobs</h1>
            <p className="text-slate-500 mt-1 text-sm">Browse projects that match your skills and expertise.</p>
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
            placeholder="Search by title, skill, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <X size={11} className="text-slate-600" />
            </button>
          )}
        </div>

        {/* ── Filter Panel ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          {/* Toggle header */}
          <button
            onClick={() => setFiltersVisible(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors rounded-2xl"
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

          {/* Filter body */}
          {filtersVisible && (
            <div className="px-6 pb-6 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-5">

                {/* Category */}
                <div>
                  <FilterGroup
                    label="Category" variant="none"
                    options={["All", ...Object.values(CATEGORY_MAP)]}
                    activeValue={filters.category} defaultValue="All"
                    onSelect={handleCategoryClick}
                    {...filterGroupProps}
                  />
                </div>

                {/* Experience + Client History */}
                <div className="space-y-3">
                  <FilterGroup
                    label="Experience level" variant="square"
                    options={["All", "Entry", "Intermediate", "Expert"]}
                    activeValue={filters.experience} defaultValue="All"
                    onSelect={(val) => setFilters((prev) => ({ ...prev, experience: val }))}
                    {...filterGroupProps}
                  />
                  <FilterGroup
                    label="Client history" variant="circle"
                    options={["All", "No hires", "1 to 9 hires", "10+ hires"]}
                    activeValue={filters.clientHistory} defaultValue="All"
                    onSelect={(val) => setFilters((prev) => ({ ...prev, clientHistory: val }))}
                    {...filterGroupProps}
                  />
                </div>

                {/* Price */}
                <div>
                  <FilterGroup
                    label="Price ranges" variant="circle"
                    options={["All", "Less than Rs1,000", "Rs1,000 - Rs5,000", "Rs5,000 - Rs10,000", "Rs10,000+"]}
                    activeValue={filters.price} defaultValue="All"
                    onSelect={(val) => setFilters((prev) => ({ ...prev, price: val }))}
                    {...filterGroupProps}
                  />
                </div>

                {/* Project Length */}
                <div>
                  <FilterGroup
                    label="Project length" variant="square"
                    options={["All", "Less than 1 week", "Less than 1 month", "1 to 3 months", "3 to 6 months", "More than 6 months"]}
                    activeValue={filters.projectLength} defaultValue="All"
                    onSelect={(val) => setFilters((prev) => ({ ...prev, projectLength: val }))}
                    {...filterGroupProps}
                  />
                </div>

                {/* Checkbox */}
                <div className="flex flex-col gap-4 pt-1">
                  <CustomCheckbox
                    label="Need consultations"
                    checked={filters.consultation}
                    onChange={(val) => setFilters((prev) => ({ ...prev, consultation: val }))}
                  />
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ── Active Filter Chips ───────────────────────────────────── */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active:</span>
            {activeChips.map(chip => (
              <FilterChip key={chip.key} label={chip.label} value={chip.value}
                onRemove={() => removeChip(chip.key)} />
            ))}
            <button onClick={resetAllFilters}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-600 transition-colors flex items-center gap-1 ml-1">
              <X size={11} /> Clear all
            </button>
          </div>
        )}

        {/* ── Results Count ─────────────────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Briefcase size={15} className="text-teal-500" />
              <span>
                <span className="font-bold text-slate-800">{items.length}</span> job{items.length !== 1 ? "s" : ""} found
              </span>
            </div>
            {items.length > 0 && (
              <span className="text-xs text-slate-400">
                Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, items.length)} of {items.length}
              </span>
            )}
          </div>
        )}

        {/* ── Skeleton Loading ──────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-3 bg-slate-100 rounded-full w-24" />
                  <div className="h-4 bg-slate-100 rounded-full w-64" />
                  <div className="h-3 bg-slate-100 rounded-full w-full" />
                  <div className="h-3 bg-slate-100 rounded-full w-4/5" />
                  <div className="flex gap-2 mt-3">
                    {[1, 2, 3].map(j => <div key={j} className="h-6 w-16 bg-slate-100 rounded-full" />)}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-100">
                    <div className="h-3 bg-slate-100 rounded-full w-40" />
                    <div className="h-3 bg-slate-100 rounded-full w-24" />
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
                key={item._id}
                onClick={() => navigate(`/freelancer/dashboard/applications/${item._id}`)}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group"
              >
                {/* Posted time */}
                <p className="text-[10px] text-slate-400 font-medium mb-2">
                  Posted {formatTimeAgo(item.createdAt) || "recently"}
                </p>

                {/* Title */}
                <h3 className="text-sm font-black text-slate-900 mb-1.5 group-hover:text-teal-700 transition-colors">
                  {item.title || "Project Title"}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {item.description || "No description provided."}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[11px] font-bold text-slate-400">Skills:</span>
                  {item.skills?.map((skill, index) => (
                    <span key={index}
                      className="px-3 py-0.5 bg-teal-50 text-teal-700 text-[11px] font-semibold rounded-full border border-teal-100">
                      {skill}
                    </span>
                  )) || <span className="text-xs text-slate-400">No skills listed</span>}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>
                      Est. budget:{" "}
                      <span className="font-bold text-slate-800">₹{item.budget || "__"}</span>
                    </span>
                    <span>
                      Est. time:{" "}
                      <span className="font-bold text-slate-800">{item.deadline || "__-__-__"}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Proposals:{" "}
                    <span className="font-bold text-slate-800">{item.proposals || "__"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── No Results ────────────────────────────────────────────── */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">No jobs found.</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search query.</p>
            {!isFiltersDefault && (
              <button onClick={resetAllFilters}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors mx-auto">
                <RotateCcw size={12} /> Reset Filters
              </button>
            )}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pb-6">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button key={pageNum}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-teal-50 border border-slate-200 hover:border-teal-300"
                }`}>
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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

export default SearchJob;