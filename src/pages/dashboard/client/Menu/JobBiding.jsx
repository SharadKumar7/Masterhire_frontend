import React, { useState } from "react";
import {
  Users, Star, UserCheck, XCircle, MessageSquare, ExternalLink,
  ChevronDown, ChevronUp, SlidersHorizontal, UserPlus, Send,
  LayoutGrid, Settings, HelpCircle, Headphones, ArrowLeft, ArrowRight,
  Briefcase, Clock, Calendar, CheckCircle2, X,
} from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const PROJECT = {
  title: "E-commerce Website Development",
  status: "Active",
  postedOn: "20 May, 2026",
  budgetMin: 50000,
  budgetMax: 80000,
  deliveryMin: 20,
  deliveryMax: 30,
  image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=80&h=60&fit=crop",
};

const BIDS = [
  {
    id: 1, name: "Sharad Kumar", role: "Full Stack Developer",
    badge: "Top Rated", badgeColor: "bg-teal-600",
    avatar: "https://i.pravatar.cc/80?img=11",
    rating: 4.8, reviews: 32, projects: 12, jobSuccess: 98,
    bidAmount: 25000, deliveryDays: 20, appliedAgo: "2 Days Ago",
    proposal: "I can build a modern, responsive and user-friendly e-commerce website with complete functionality. I have 6+ years of experience in building scalable web applications...",
    status: "new",
  },
  {
    id: 2, name: "Rohit Verma", role: "Full Stack Developer",
    badge: "Pro", badgeColor: "bg-violet-600",
    avatar: "https://i.pravatar.cc/80?img=12",
    rating: 4.9, reviews: 48, projects: 30, jobSuccess: 100,
    bidAmount: 28000, deliveryDays: 25, appliedAgo: "3 Days Ago",
    proposal: "Hi Ankit, I have carefully reviewed your requirements and I'm confident to deliver a high-quality solution that matches your vision. I'll ensure clean code and timely delivery...",
    status: "new",
  },
  {
    id: 3, name: "Neha Sharma", role: "Frontend Developer",
    badge: null,
    avatar: "https://i.pravatar.cc/80?img=5",
    rating: 4.6, reviews: 16, projects: 8, jobSuccess: 95,
    bidAmount: 22500, deliveryDays: 18, appliedAgo: "5 Days Ago",
    proposal: "I can create a beautiful and fully responsive e-commerce website using latest technologies. I focus on performance, SEO and excellent user experience...",
    status: "shortlisted",
  },
];

const COMPARED = [
  { id: 1, name: "Sharad", avatar: "https://i.pravatar.cc/80?img=11", bidAmount: 25000, deliveryDays: 20, rating: 4.8, projects: 12, jobSuccess: 98 },
  { id: 2, name: "Rohit",  avatar: "https://i.pravatar.cc/80?img=12", bidAmount: 28000, deliveryDays: 25, rating: 4.9, projects: 30, jobSuccess: 100 },
];

const PREVIOUS_FREELANCER = {
  name: "Pooja Singh", rating: 4.7, projects: 2,
  avatar: "https://i.pravatar.cc/80?img=9",
};

const STATS = [
  { icon: Users,     iconBg: "bg-teal-50 text-teal-600",      value: 28, label: "Total Bids",  sub: "All time"            },
  { icon: Send,      iconBg: "bg-blue-50 text-blue-600",       value: 8,  label: "New Bids",    sub: "Recently received", subColor: "text-blue-500" },
  { icon: Star,      iconBg: "bg-amber-50 text-amber-500",     value: 6,  label: "Shortlisted", sub: "Freelancers"         },
  { icon: UserCheck, iconBg: "bg-emerald-50 text-emerald-600", value: 2,  label: "Hired",        sub: "This project", highlight: true },
  { icon: XCircle,   iconBg: "bg-rose-50 text-rose-500",       value: 12, label: "Rejected",    sub: "Bids"                },
];

const TABS = [
  { key: "all",         label: "All Bids",    count: 28 },
  { key: "new",         label: "New",         count: 8  },
  { key: "shortlisted", label: "Shortlisted", count: 6  },
  { key: "interview",   label: "Interview",   count: 2  },
  { key: "hired",       label: "Hired",       count: 2  },
  { key: "rejected",    label: "Rejected",    count: 12 },
];

const QUICK_ACTIONS = [
  { icon: UserPlus,   label: "Invite Freelancers", sub: "Send private invites"         },
  { icon: Send,       label: "Send Private Offer", sub: "Offer to specific freelancer" },
  { icon: LayoutGrid, label: "Compare Bids",        sub: "Compare shortlisted bids"    },
  { icon: Settings,   label: "Project Settings",   sub: "Edit project details"         },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, value, label, sub, subColor, highlight }) => (
  <div className={`bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-teal-200 transition-all ${
    highlight
      ? "border border-teal-200 bg-gradient-to-br from-teal-50 to-white col-span-2 md:col-span-1"
      : "border border-slate-100"
  }`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className={`text-2xl font-black leading-none ${highlight ? "text-teal-950" : "text-slate-900"}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${highlight ? "text-teal-800" : "text-slate-600"}`}>{label}</p>
      <p className={`text-[10px] font-medium ${subColor || (highlight ? "text-teal-600" : "text-slate-400")}`}>{sub}</p>
    </div>
  </div>
);

// ── Bid Card ──────────────────────────────────────────────────────────────────
const BidCard = ({ item, isCompared, onToggleCompare }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 group">

      {/* New ribbon */}
      {item.status === "new" && (
        <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 rounded-tr-2xl">
          <div className="absolute top-3 -right-4 bg-teal-600 text-white text-[9px] font-black px-5 py-0.5 rotate-45">
            New
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5">

        {/* ── Left: Freelancer Info ── */}
        <div className="md:w-48 shrink-0 space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={item.avatar} alt={item.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-slate-900 text-sm group-hover:text-teal-700 transition-colors">{item.name}</h3>
                {item.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{item.role}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star size={12} className="fill-amber-400 stroke-amber-400" />
            <span className="text-xs font-bold text-slate-800">{item.rating}</span>
            <span className="text-[10px] text-slate-400">({item.reviews})</span>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Briefcase size={10} className="text-teal-500" /> {item.projects} Projects
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} className="text-teal-500" /> {item.jobSuccess}%
            </span>
          </div>

          <button className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">
            View Profile
          </button>
        </div>

        {/* ── Middle: Bid Details ── */}
        <div className="flex-1 min-w-0">
          {/* Bid stats */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            {[
              { label: "Bid Amount",    value: `₹${item.bidAmount.toLocaleString("en-IN")}` },
              { label: "Delivery Time", value: `${item.deliveryDays} Days` },
              { label: "Applied",       value: item.appliedAgo },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Proposal text */}
          <p className={`text-xs text-slate-500 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {item.proposal}
          </p>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800 mt-1.5 transition-colors"
          >
            {expanded ? "Show Less" : "View Full Proposal"}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Compare toggle */}
          <div
            onClick={onToggleCompare}
            className="flex items-center gap-2 mt-3 cursor-pointer group/cmp w-fit"
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              isCompared ? "bg-teal-600 border-teal-600" : "border-slate-300 group-hover/cmp:border-teal-400"
            }`}>
              {isCompared && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 group-hover/cmp:text-slate-800 transition-colors">
              Add to Compare
            </span>
          </div>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex md:flex-col gap-2 flex-wrap md:w-32 shrink-0 justify-end">
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all w-full">
            <MessageSquare size={13} /> Chat
          </button>
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-50 transition-all w-full">
            <Star size={13} /> Shortlist
          </button>
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm w-full">
            <UserCheck size={13} /> Hire Now
          </button>
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all w-full">
            <X size={13} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ProposalsBids = () => {
  const [activeTab, setActiveTab]             = useState("all");
  const [sortBy, setSortBy]                   = useState("Newest First");
  const [currentPage, setCurrentPage]         = useState(1);
  const [compared, setCompared]               = useState([1, 2]);
  const [projectExpanded, setProjectExpanded] = useState(true);
  const totalPages = 5;

  const toggleCompare = (id) => {
    setCompared(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-2)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10 pt-6">
        <div className="flex gap-6">

          {/* ── Main Column ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Proposals & Bids</h1>
              <p className="text-slate-500 mt-1 text-sm">Review and manage proposals received for your project.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {STATS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Project Banner */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <img src={PROJECT.image} alt={PROJECT.title}
                  className="w-16 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-900 text-sm">{PROJECT.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {PROJECT.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-3">
                    <span className="flex items-center gap-1"><Calendar size={10} /> Posted on {PROJECT.postedOn}</span>
                    <span>Budget: ₹{PROJECT.budgetMin.toLocaleString("en-IN")} – ₹{PROJECT.budgetMax.toLocaleString("en-IN")}</span>
                    <span>Delivery: {PROJECT.deliveryMin}–{PROJECT.deliveryMax} Days</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-teal-200 text-teal-600 rounded-xl text-xs font-bold hover:bg-teal-600 hover:text-white transition-all">
                    <ExternalLink size={12} /> View Project
                  </button>
                  <button
                    onClick={() => setProjectExpanded(v => !v)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${projectExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs + Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex bg-slate-200/70 p-1 rounded-lg gap-0.5 flex-wrap">
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}>
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sort by:</span>
                <div className="relative">
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-7 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                    {["Newest First", "Lowest Bid", "Highest Rated", "Fastest Delivery"].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all">
                  <SlidersHorizontal size={12} /> Filters
                </button>
              </div>
            </div>

            {/* Bid Cards */}
            <div className="space-y-4">
              {BIDS.map(item => (
                <BidCard
                  key={item.id}
                  item={item}
                  isCompared={compared.includes(item.id)}
                  onToggleCompare={() => toggleCompare(item.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">Showing 1 to 6 of 28 bids</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white">
                  <ArrowLeft size={14} className="text-slate-500" />
                </button>
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setCurrentPage(n)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === n
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-teal-50 hover:border-teal-300"
                    }`}>{n}
                  </button>
                ))}
                <span className="text-slate-400 text-xs px-1">...</span>
                <button onClick={() => setCurrentPage(totalPages)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    currentPage === totalPages
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-teal-50 hover:border-teal-300"
                  }`}>{totalPages}
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white">
                  <ArrowRight size={14} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="w-64 shrink-0 space-y-4 hidden lg:block">

            {/* Quick Actions */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-3">Quick Actions</h3>
              <div className="space-y-1">
                {QUICK_ACTIONS.map((a, i) => (
                  <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-left group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors shrink-0">
                      <a.icon size={14} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{a.label}</p>
                      <p className="text-[10px] text-slate-400">{a.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bid Comparison */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">Bid Comparison</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-600 text-white">
                  {compared.length} Selected
                </span>
              </div>

              {compared.length > 0 ? (
                <>
                  <div className="flex gap-2 mb-4">
                    {COMPARED.filter(c => compared.includes(c.id)).map(c => (
                      <div key={c.id} className="flex-1 flex flex-col items-center gap-1">
                        <div className="relative">
                          <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-xl object-cover border-2 border-teal-100" />
                          <button onClick={() => toggleCompare(c.id)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-200 hover:bg-rose-200 rounded-full flex items-center justify-center transition-colors">
                            <X size={8} className="text-slate-600" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700">{c.name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: "Bid Amount",         vals: COMPARED.filter(c => compared.includes(c.id)).map(c => `₹${c.bidAmount.toLocaleString("en-IN")}`) },
                      { label: "Delivery Time",      vals: COMPARED.filter(c => compared.includes(c.id)).map(c => `${c.deliveryDays} Days`) },
                      { label: "Rating",             vals: COMPARED.filter(c => compared.includes(c.id)).map(c => c.rating) },
                      { label: "Projects",           vals: COMPARED.filter(c => compared.includes(c.id)).map(c => c.projects) },
                      { label: "Job Success",        vals: COMPARED.filter(c => compared.includes(c.id)).map(c => `${c.jobSuccess}%`) },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center">
                        <p className="text-[10px] text-slate-400 w-24 shrink-0">{row.label}</p>
                        <div className="flex flex-1 gap-2">
                          {row.vals.map((v, j) => (
                            <p key={j} className="flex-1 text-[11px] font-bold text-slate-800 text-center">{v}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                    View Detailed Comparison
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Select bids to compare</p>
              )}
            </div>

            {/* Invite Again */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900">Invite Again</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 mb-3">Worked with you on 2 projects</p>
              <div className="flex items-center gap-2.5 mb-3">
                <img src={PREVIOUS_FREELANCER.avatar} alt={PREVIOUS_FREELANCER.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-slate-100" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{PREVIOUS_FREELANCER.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="fill-amber-400 stroke-amber-400" />
                    <span className="text-[10px] font-semibold text-amber-500">{PREVIOUS_FREELANCER.rating}</span>
                    <span className="text-[10px] text-slate-400">· {PREVIOUS_FREELANCER.projects} Projects</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-all">
                  Hire Again
                </button>
                <button className="flex-1 py-2 border border-teal-200 text-teal-600 text-[11px] font-bold rounded-xl hover:bg-teal-600 hover:text-white transition-all">
                  Send Offer
                </button>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={14} className="text-teal-600" />
                <h3 className="text-sm font-black text-teal-800">Need Help?</h3>
              </div>
              <p className="text-[11px] text-teal-600 mb-3 leading-relaxed">
                Our support team is here to help you find the right freelancer.
              </p>
              <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">
                <Headphones size={12} /> Contact Support
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsBids;