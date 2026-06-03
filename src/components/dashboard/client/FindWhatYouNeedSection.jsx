import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  { name: 'Frontend Developer', color: '#5b7cfa', bg: '#eef3ff', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>) },
  { name: 'Backend Developer', color: '#2ec4a9', bg: '#edfff6', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>) },
  { name: 'Full Stack Developer', color: '#7c5cfc', bg: '#f0eeff', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><circle cx="12" cy="10" r="2"/></svg>) },
  { name: 'Mobile App Developer', color: '#f5a623', bg: '#fff8ee', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>) },
  { name: 'WordPress Developer', color: '#2271b1', bg: '#eef5ff', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10"/></svg>) },
  { name: 'UI/UX Designer', color: '#e05c5c', bg: '#fff0f0', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><path d="M12 19l-7-7 7-7"/><path d="M19 12H5"/></svg>) },
  { name: 'Data Analyst', color: '#2ec4a9', bg: '#edfff6', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>) },
  { name: 'Business Consultant', color: '#f07030', bg: '#fff4ee', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>) },
  { name: 'Graphics Designer', color: '#4a9eda', bg: '#f0f8ff', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7"/><circle cx="11" cy="11" r="3"/></svg>) },
  { name: 'SEO Specialist', color: '#d44f7e', bg: '#fff0f5', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>) },
  { name: 'Social Media Manager', color: '#8b5cf6', bg: '#f4eeff', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>) },
  { name: 'Video Editor', color: '#d4a017', bg: '#fffbee', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>) },
  { name: 'Content Writer', color: '#2ec4a9', bg: '#edfff6', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>) },
  { name: 'Illustrator', color: '#5b7cfa', bg: '#eef3ff', icon: (<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72"/></svg>) },
];

const STATS = [
  { val: '10,000+', label: 'Verified freelancers' },
  { val: '100%', label: 'Quality work delivered' },
  { val: '24/7', label: 'Support available' },
  { val: '4.9/5', label: 'Average client rating' },
];

const CountSkeleton = () => (
  <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse mt-1" />
);

const FindWhatYouNeedSection = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/users/category-counts`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setCounts(data.counts || {});
      } catch (err) {
        console.error("Category counts fetch failed", err);
      } finally {
        setCountsLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/client/dashboard/filter?search=${encodeURIComponent(categoryName)}`);
  };

  const CategoryCard = ({ cat }) => {
    const count = counts[cat.name];
    return (
      <div
        onClick={() => handleCategoryClick(cat.name)}
        className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cat.bg, color: cat.color }}
        >
          {cat.icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-800">{cat.name}</div>
          {countsLoading ? (
            <CountSkeleton />
          ) : (
            <div className="text-xs text-gray-400">
              {count !== undefined ? `${count} freelancer${count !== 1 ? 's' : ''}` : '0 freelancers'}
            </div>
          )}
        </div>
        <span className="text-gray-300 group-hover:text-teal-500 transition-colors">→</span>
      </div>
    );
  };

  const mainCategories = CATEGORIES.slice(0, 12);
  const lastTwo = CATEGORIES.slice(12);

  return (
    <section className="bg-white p-6 rounded-2xl shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Find the Right Talent</h2>
        <p className="text-sm text-gray-400 mt-1">
          Pick a category to find skilled freelancers for your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {mainCategories.map((cat, i) => (
          <CategoryCard key={i} cat={cat} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {lastTwo.map((cat, i) => (
          <CategoryCard key={i} cat={cat} />
        ))}
        <div className="flex items-center justify-end">
          <Link
            to="/client/dashboard/filter"
            className="text-teal-500 font-semibold text-sm hover:underline"
          >
            Browse all categories →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
        {STATS.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 stroke-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FindWhatYouNeedSection;