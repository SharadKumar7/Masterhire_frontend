import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
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

// ─── FilterGroup ──────────────────────────────────────────────────────────────
const FilterGroup = ({
  label,
  options,
  activeValue,
  onSelect,
  variant = "square",
  openFilter,
  setOpenFilter,
  defaultValue, // ✅ NEW: to detect if an option is selected
}) => {
  const isOpen = openFilter === label;
  const containerRef = useRef(null);
  const isActive = activeValue !== defaultValue; // ✅ NEW

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, setOpenFilter]);

  const renderIcon = (isActive) => {
    const baseStyle =
      "w-5 h-5 flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0";
    if (variant === "none") {
      return isActive ? (
        <Check size={16} className="text-teal-600 flex-shrink-0" />
      ) : (
        <div className="w-4 flex-shrink-0" />
      );
    }
    return (
      <div
        className={`${baseStyle} ${
          variant === "circle" ? "rounded-full" : "rounded-md"
        } ${isActive ? "bg-teal-600 border-teal-600" : "bg-white border-gray-300"}`}
      >
        {isActive && <Check size={14} className="text-white" strokeWidth={3} />}
      </div>
    );
  };

  return (
    <div
      className="mb-6 border-b border-gray-100 pb-2 relative"
      ref={containerRef}
    >
      <button
        onClick={() => setOpenFilter(isOpen ? null : label)}
        className="flex items-center justify-between w-full py-2"
      >
        {/* ✅ NEW: label + selected value shown below */}
        <div className="flex flex-col items-start leading-tight">
          <span
            className={`text-sm font-semibold ${isOpen ? "text-teal-500" : "text-gray-900"}`}
          >
            {label}
          </span>
          {isActive && (
            <span className="text-xs text-teal-600 font-medium mt-0.5 truncate max-w-[130px]">
              {activeValue}
            </span>
          )}
        </div>

        <ChevronDown
          className={`transition-transform duration-300 flex-shrink-0 ${
            isOpen ? "rotate-180 text-teal-500" : "rotate-0 text-gray-500"
          }`}
          size={20}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-xl mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1 p-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpenFilter(null);
                }}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-md transition-colors group overflow-hidden min-w-0 ${
                  activeValue === opt ? "bg-teal-50" : "hover:bg-gray-50"
                }`}
              >
                {renderIcon(activeValue === opt)}
                <span
                  className={`flex-1 truncate text-sm transition-colors ${
                    activeValue === opt
                      ? "text-gray-900 font-semibold"
                      : "text-gray-600 group-hover:text-gray-900"
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
    <span className="text-gray-700 font-semibold text-sm select-none">{label}</span>
  </label>
);

// ─── SearchJob ────────────────────────────────────────────────────────────────
const SearchJob = () => {
  const navigate = useNavigate(); // ✅ NEW
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(null);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    category: "All",
    subcategory: "All",
    experience: "All",
    clientHistory: "All",
    price: "All",
    projectLength: "All",
    consultation: false,
  });

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      // ✅ BOOLEAN (only true send)
      if (typeof value === "boolean") {
        if (value === true) {
          params.append(key, "true");
        }
        return;
      }

      // 💰 PRICE MAPPING (IMPORTANT)
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

      // ✅ NORMAL FILTER
      if (value && value !== "All") {
        params.append(key, value);
      }
    });

    try {
      const response = await fetch(
        `${apiUrl}/api/jobs/search?${params.toString()}`
      );

      const data = await response.json();

      console.log("API DATA:", data); // 🔥 debug

      // ✅ FIX RESPONSE
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
}, [filters]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(items)
    ? items.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handleCategoryClick = (cat) => {
    setFilters((prev) => ({ ...prev, category: cat, subcategory: "All" }));
  };

  const filterGroupProps = { openFilter, setOpenFilter };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FILTER PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">
            Find Job
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <FilterGroup
                label="Category"
                variant="none"
                options={["All", ...Object.values(CATEGORY_MAP)]}
                activeValue={filters.category}
                defaultValue="All"
                onSelect={handleCategoryClick}
                {...filterGroupProps}
              />
            </div>

            <div>
              <FilterGroup
                label="Experience level"
                variant="square"
                options={["All", "Entry", "Intermediate", "Expert"]}
                activeValue={filters.experience}
                defaultValue="All"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, experience: val }))
                }
                {...filterGroupProps}
              />
              <FilterGroup
                label="Client history"
                variant="circle"
                options={["All", "No hires", "1 to 9 hires", "10+ hires"]}
                activeValue={filters.clientHistory}
                defaultValue="All"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, clientHistory: val }))
                }
                {...filterGroupProps}
              />
            </div>
            <div>
              <FilterGroup
                label="Price ranges"
                variant="circle"
                options={[
                  "All",
                  "Less than Rs1,000",
                  "Rs1,000 - Rs5,000",
                  "Rs5,000 - Rs10,000",
                  "Rs10,000+",
                ]}
                activeValue={filters.price}
                defaultValue="All"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, price: val }))
                }
                {...filterGroupProps}
              />
            </div>
            <div>
              <FilterGroup
                label="Project length"
                variant="square"
                options={[
                  "All",
                  "Less than 1 week",
                  "Less than 1 month",
                  "1 to 3 months",
                  "3 to 6 months",
                  "More than 6 months",
                ]}
                activeValue={filters.projectLength}
                defaultValue="All"
                onSelect={(val) =>
                  setFilters((prev) => ({ ...prev, projectLength: val }))
                }
                {...filterGroupProps}
              />
            </div>
            <div className="flex flex-col gap-6 py-4">
              <CustomCheckbox
                label="Need consultations"
                checked={filters.consultation}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, consultation: val }))
                }
              />
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        )}

        {/* RESULTS — ✅ NEW: each card is clickable → /details/:id */}
        {!loading && (
          <div className="space-y-4">
            {currentItems.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/freelancer/dashboard/applications/${item._id}`)} // ✅ NEW
                className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer" // ✅ NEW: cursor + hover border
              >
                <p className="text-[10px] text-gray-400 font-medium mb-2">
                  Posted {formatTimeAgo(item.createdAt) || "recently "}
                </p>

                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {item.title || "Project Title"}
                </h3>

                <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
                  {item.description || "No description provided."}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[12px] font-semibold text-gray-400">
                    Skills:
                  </span>
                  {item.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-0.5 bg-[#E6F7F6] text-[#00A9A5] text-[11px] font-bold rounded-full"
                    >
                      {skill}
                    </span>
                  )) || (
                    <span className="text-xs text-gray-400">
                      No skills listed
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex gap-4 text-[12px] text-gray-500">
                    <span>
                      Est. budget:{" "}
                      <span className="font-bold text-gray-800">
                        ₹{item.budget || "__"}
                      </span>
                    </span>
                    <span>
                      Est. time:{" "}
                      <span className="font-bold text-gray-800">
                        {item.deadline || "__-__-__"}
                      </span>
                    </span>
                  </div>
                  <div className="text-[12px] font-bold text-gray-800">
                    Proposals:{" "}
                    <span className="font-normal text-gray-500">
                      {item.proposals || "__"}
                    </span>
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
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click firing
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

export default SearchJob;
