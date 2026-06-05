import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Star, UserCheck, XCircle, MessageSquare, ExternalLink,
  ChevronDown, ChevronUp, SlidersHorizontal, UserPlus, Send,
  LayoutGrid, Settings, HelpCircle, Headphones, ArrowLeft, ArrowRight,
  Briefcase, Clock, Calendar, CheckCircle2, X, Loader2,
} from "lucide-react";
import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const formatINR = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:     { label: "New",         bg: "bg-teal-50",    text: "text-teal-700"    },
  negotiation: { label: "Shortlisted", bg: "bg-amber-50",   text: "text-amber-700"   },
  accepted:    { label: "Hired",       bg: "bg-emerald-50", text: "text-emerald-700" },
  rejected:    { label: "Rejected",    bg: "bg-rose-50",    text: "text-rose-600"    },
};

const TABS = [
  { key: "all",         label: "All Bids",    statusKey: null          },
  { key: "new",         label: "New",         statusKey: "pending"     },
  { key: "shortlisted", label: "Shortlisted", statusKey: "negotiation" },
  { key: "hired",       label: "Hired",       statusKey: "accepted"    },
  { key: "rejected",    label: "Rejected",    statusKey: "rejected"    },
];

const QUICK_ACTIONS = [
  { icon: UserPlus,   label: "Invite Freelancers", sub: "Send private invites"         },
  { icon: Send,       label: "Send Private Offer", sub: "Offer to specific freelancer" },
  { icon: LayoutGrid, label: "Compare Bids",       sub: "Compare shortlisted bids"     },
  { icon: Settings,   label: "Project Settings",   sub: "Edit project details"         },
];

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name = "", photo, size = "md" }) {
  const s = size === "sm" ? "w-8 h-8 text-xs" : "w-14 h-14 text-base";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return photo ? (
    <img src={photo} alt={name} className={`${s} rounded-2xl object-cover border-2 border-slate-100 shrink-0`} />
  ) : (
    <div className={`${s} rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, value, label, sub, subColor, highlight }) => (
  <div className={`bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all ${
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
const BidCard = ({ item, isCompared, onToggleCompare, onAction, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CFG[item.status] || STATUS_CFG.pending;

  return (
    <div className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 group">
      {item.status === "pending" && (
        <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 rounded-tr-2xl">
          <div className="absolute top-3 -right-4 bg-teal-600 text-white text-[9px] font-black px-5 py-0.5 rotate-45">New</div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5">
        {/* Freelancer Info */}
        <div className="md:w-48 shrink-0 space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={item.name} photo={item.avatar} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm group-hover:text-teal-700 transition-colors">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{item.role}</p>
            </div>
          </div>
          {item.rating && (
            <div className="flex items-center gap-1.5">
              <Star size={12} className="fill-amber-400 stroke-amber-400" />
              <span className="text-xs font-bold text-slate-800">{item.rating}</span>
              <span className="text-[10px] text-slate-400">({item.reviews})</span>
            </div>
          )}
          <div className="flex gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><Briefcase size={10} className="text-teal-500" /> {item.projects} Projects</span>
            {item.jobSuccess > 0 && <span className="flex items-center gap-1"><Clock size={10} className="text-teal-500" /> {item.jobSuccess}%</span>}
          </div>
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>

        {/* Bid Details */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-4 mb-3">
            {[
              { label: "Bid Amount",    value: formatINR(item.bidAmount)     },
              { label: "Delivery Time", value: `${item.deliveryDays} Days`  },
              { label: "Applied",       value: item.appliedAgo               },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {item.proposal && (
            <>
              <p className={`text-xs text-slate-500 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
                {item.proposal}
              </p>
              <button onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800 mt-1.5 transition-colors">
                {expanded ? "Show Less" : "View Full Proposal"}
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </>
          )}

          <div onClick={onToggleCompare} className="flex items-center gap-2 mt-3 cursor-pointer group/cmp w-fit">
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

        {/* Actions */}
        <div className="flex md:flex-col gap-2 flex-wrap md:w-32 shrink-0 justify-end">
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all w-full">
            <MessageSquare size={13} /> Chat
          </button>

          {item.status === "pending" && (
            <>
              <button onClick={() => onAction(item.id, "shortlist")} disabled={actionLoading === item.id}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-50 transition-all w-full disabled:opacity-50">
                {actionLoading === item.id ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />} Shortlist
              </button>
              <button onClick={() => onAction(item.id, "hire")} disabled={actionLoading === item.id}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm w-full disabled:opacity-50">
                <UserCheck size={13} /> Hire Now
              </button>
              <button onClick={() => onAction(item.id, "reject")} disabled={actionLoading === item.id}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all w-full disabled:opacity-50">
                <X size={13} /> Reject
              </button>
            </>
          )}

          {item.status === "negotiation" && (
            <>
              <button onClick={() => onAction(item.id, "hire")} disabled={actionLoading === item.id}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm w-full disabled:opacity-50">
                <UserCheck size={13} /> Hire Now
              </button>
              <button onClick={() => onAction(item.id, "reject")} disabled={actionLoading === item.id}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all w-full disabled:opacity-50">
                <X size={13} /> Reject
              </button>
            </>
          )}

          {item.status === "accepted" && (
            <span className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200 w-full">
              <UserCheck size={13} /> Hired
            </span>
          )}

          {item.status === "rejected" && (
            <span className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-400 rounded-xl text-xs font-bold border border-rose-200 w-full">
              <X size={13} /> Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ProposalsBids = () => {
  const { jobId } = useParams(); // expects route: /client/proposals/:jobId

  const [activeTab, setActiveTab]     = useState("all");
  const [sortBy, setSortBy]           = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [compared, setCompared]       = useState([]);

  const [bids, setBids]               = useState([]);
  const [stats, setStats]             = useState({});
  const [project, setProject]         = useState({});
  const [pagination, setPagination]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const activeTabCfg = TABS.find(t => t.key === activeTab);

  const fetchData = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const statusParam = activeTabCfg?.statusKey ? `&status=${activeTabCfg.statusKey}` : "";
      const res  = await fetch(
        `${BASE_URL}/api/client/proposals/${jobId}?page=${currentPage}&sort=${sortBy}${statusParam}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBids(data.bids          || []);
      setStats(data.stats        || {});
      setProject(data.project    || {});
      setPagination(data.pagination || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [jobId, activeTab, currentPage, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (applicationId, action) => {
    try {
      setActionLoading(applicationId);
      const res  = await fetch(`${BASE_URL}/api/client/proposals/${applicationId}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchData(); // refresh
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleCompare = (id) => {
    setCompared(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-2));
  };

  const STATS_ROW = [
    { icon: Users,     iconBg: "bg-teal-50 text-teal-600",       value: stats.total || 0,       label: "Total Bids",  sub: "All time"            },
    { icon: Send,      iconBg: "bg-blue-50 text-blue-600",        value: stats.new || 0,         label: "New Bids",    sub: "Recently received", subColor: "text-blue-500" },
    { icon: Star,      iconBg: "bg-amber-50 text-amber-500",      value: stats.shortlisted || 0, label: "Shortlisted", sub: "Freelancers"         },
    { icon: UserCheck, iconBg: "bg-emerald-50 text-emerald-600",  value: stats.hired || 0,       label: "Hired",       sub: "This project", highlight: true },
    { icon: XCircle,   iconBg: "bg-rose-50 text-rose-500",        value: stats.rejected || 0,    label: "Rejected",    sub: "Bids"                },
  ];

  const comparedBids = bids.filter(b => compared.includes(b.id));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10 pt-6">
        <div className="flex gap-6">

          {/* Main Column */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Proposals & Bids</h1>
              <p className="text-slate-500 mt-1 text-sm">Review and manage proposals received for your project.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {STATS_ROW.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Project Banner */}
            {project.title && (
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                    <Briefcase size={20} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm">{project.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1"><Calendar size={10} /> Posted on {project.postedOn}</span>
                      {project.budget && <span>Budget: {formatINR(project.budget)}</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs + Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex bg-slate-200/70 p-1 rounded-lg gap-0.5 flex-wrap">
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                      activeTab === tab.key ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sort by:</span>
                <div className="relative">
                  <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-7 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                    <option value="newest">Newest First</option>
                    <option value="lowest">Lowest Bid</option>
                    <option value="highest">Highest Bid</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bids */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl p-8 text-center text-rose-500">{error}</div>
            ) : bids.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
                No bids matching your filter.
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map(item => (
                  <BidCard key={item.id} item={item}
                    isCompared={compared.includes(item.id)}
                    onToggleCompare={() => toggleCompare(item.id)}
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400">
                  Showing {(currentPage - 1) * (pagination.limit || 6) + 1} to {Math.min(currentPage * (pagination.limit || 6), pagination.total)} of {pagination.total} bids
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white">
                    <ArrowLeft size={14} className="text-slate-500" />
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 3) }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setCurrentPage(n)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === n ? "bg-teal-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-teal-50 hover:border-teal-300"
                      }`}>{n}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white">
                    <ArrowRight size={14} className="text-slate-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
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
              {comparedBids.length > 0 ? (
                <>
                  <div className="flex gap-2 mb-4">
                    {comparedBids.map(c => (
                      <div key={c.id} className="flex-1 flex flex-col items-center gap-1">
                        <div className="relative">
                          <Avatar name={c.name} photo={c.avatar} size="sm" />
                          <button onClick={() => toggleCompare(c.id)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-200 hover:bg-rose-200 rounded-full flex items-center justify-center transition-colors">
                            <X size={8} className="text-slate-600" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700">{c.name.split(" ")[0]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Bid Amount",    vals: comparedBids.map(c => formatINR(c.bidAmount))    },
                      { label: "Delivery Time", vals: comparedBids.map(c => `${c.deliveryDays} Days`)  },
                      { label: "Rating",        vals: comparedBids.map(c => c.rating || "N/A")         },
                      { label: "Projects",      vals: comparedBids.map(c => c.projects)                },
                      { label: "Job Success",   vals: comparedBids.map(c => `${c.jobSuccess}%`)        },
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
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Select bids to compare</p>
              )}
            </div>

            {/* Help */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={14} className="text-teal-600" />
                <h3 className="text-sm font-black text-teal-800">Need Help?</h3>
              </div>
              <p className="text-[11px] text-teal-600 mb-3 leading-relaxed">Our support team is here to help you find the right freelancer.</p>
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