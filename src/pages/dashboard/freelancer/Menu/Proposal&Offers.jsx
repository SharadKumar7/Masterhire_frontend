import React, { useState, useEffect, useMemo } from "react";
import {
  Send, Mail, Star, Users, UserCheck, Clock, ChevronDown,
  MoreVertical, Calendar, IndianRupee, Timer, ArrowRight,
  CheckCircle2, XCircle, Eye, Hourglass, BadgeCheck,
  AlertCircle, Loader2,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

// ── Status Config ─────────────────────────────────────────────────────────────
const PROPOSAL_STATUS = {
  Pending:     { color: "bg-slate-50 text-slate-500 border-slate-200",       icon: Clock      },
  Viewed:      { color: "bg-blue-50 text-blue-600 border-blue-200",          icon: Eye        },
  Shortlisted: { color: "bg-amber-50 text-amber-600 border-amber-200",       icon: Star       },
  Rejected:    { color: "bg-rose-50 text-rose-500 border-rose-200",          icon: XCircle    },
  Hired:       { color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: BadgeCheck },
};

const OFFER_STATUS = {
  Pending:  { color: "bg-violet-50 text-violet-600 border-violet-200",   icon: Hourglass    },
  Accepted: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  Expired:  { color: "bg-slate-50 text-slate-400 border-slate-200",      icon: AlertCircle  },
  Rejected: { color: "bg-rose-50 text-rose-500 border-rose-200",         icon: XCircle      },
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, value, label, sub, highlight }) => (
  <div className={`bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all ${
    highlight ? "border-teal-200 bg-gradient-to-br from-teal-50 to-white col-span-2 md:col-span-1" : "border-slate-100"
  }`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className={`text-2xl font-black leading-none ${highlight ? "text-teal-950" : "text-slate-900"}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${highlight ? "text-teal-800" : "text-slate-600"}`}>{label}</p>
      <p className={`text-[10px] ${highlight ? "text-teal-600" : "text-slate-400"}`}>{sub}</p>
    </div>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status, map }) => {
  const cfg  = map[status] || map.Pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon size={10} strokeWidth={2.5} />
      {status}
    </span>
  );
};

// ── Proposal Card ─────────────────────────────────────────────────────────────
const ProposalCard = ({ item }) => (
  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 group">
    <div className="flex">
      {/* Thumbnail placeholder */}
      <div className="w-44 shrink-0 hidden sm:flex items-center justify-center bg-teal-50">
        <Send size={32} className="text-teal-300" />
      </div>

      {/* Content */}
      <div className="flex-1 p-5 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 text-sm leading-tight group-hover:text-teal-700 transition-colors line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">
                Client: <span className="font-semibold text-slate-700">{item.client}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                {item.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={item.status} map={PROPOSAL_STATUS} />
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreVertical size={14} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="text-teal-500" /> Applied on {item.appliedOn}
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee size={11} className="text-teal-500" /> ₹{(item.budget || 0).toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1.5">
            <Timer size={11} className="text-teal-500" /> {item.days} Days
          </span>
        </div>

        {/* Proposal snippet */}
        {item.proposal && (
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 italic">"{item.proposal}"</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Last updated <span className="font-semibold text-slate-600">{item.lastUpdated}</span>
          </p>
          <button className="text-xs font-bold text-teal-600 border border-teal-200 hover:bg-teal-600 hover:text-white px-3 py-1.5 rounded-lg transition-all">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Offer Card ────────────────────────────────────────────────────────────────
const OfferCard = ({ item }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 group">
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
        {item.initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 text-sm group-hover:text-teal-700 transition-colors line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">
                Client: <span className="font-semibold text-slate-700">{item.client}</span>
              </span>
              {(item.tags || []).map(tag => (
                <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  tag === "Repeat Client"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-violet-50 text-violet-600 border-violet-200"
                }`}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={item.status} map={OFFER_STATUS} />
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreVertical size={14} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="text-teal-500" /> Offered on {item.offeredOn}
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee size={11} className="text-teal-500" /> ₹{(item.budget || 0).toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1.5">
            <Timer size={11} className="text-teal-500" /> {item.days} Days
          </span>
        </div>

        {/* Message */}
        {item.message && (
          <div className="mt-2 flex items-start gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <Mail size={11} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-500 italic line-clamp-1">"{item.message}"</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 gap-3 flex-wrap">
          <div className="text-[11px]">
            {item.status === "Pending" && item.expiresIn && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Clock size={11} /> Expires in {item.expiresIn}
              </span>
            )}
            {item.status === "Accepted" && (
              <span className="text-emerald-600 font-semibold">Accepted on {item.acceptedOn}</span>
            )}
            {item.status === "Expired" && (
              <span className="text-slate-400">Expired on {item.expiredOn}</span>
            )}
          </div>
          <div className="flex gap-2">
            {item.status === "Pending" && (
              <>
                <button className="text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all">
                  View Offer
                </button>
                <button className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                  Accept Offer
                </button>
              </>
            )}
            {item.status === "Accepted" && (
              <button className="text-xs font-bold text-teal-600 border border-teal-200 hover:bg-teal-600 hover:text-white px-3 py-1.5 rounded-lg transition-all">
                View Contract
              </button>
            )}
            {(item.status === "Expired" || item.status === "Rejected") && (
              <button className="text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const ProposalsOffers = () => {
  const [activeTab, setActiveTab]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy]             = useState("Newest First");

  const [proposals, setProposals]       = useState([]);
  const [offers, setOffers]             = useState([]);
  const [stats, setStats]               = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [propRes, offerRes] = await Promise.all([
          fetch(`${BASE_URL}/api/freelancer/proposals`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          fetch(`${BASE_URL}/api/freelancer/offers`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        const propData  = await propRes.json();
        const offerData = await offerRes.json();

        if (!propRes.ok)  throw new Error(propData.message);
        if (!offerRes.ok) throw new Error(offerData.message);

        setProposals(propData.proposals || []);
        setOffers(offerData.offers      || []);
        setStats(propData.stats         || {});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter + sort proposals
  const filteredProposals = useMemo(() => {
    let r = [...proposals];
    if (statusFilter !== "All Status") r = r.filter(p => p.status === statusFilter);
    if (sortBy === "Newest First")     r.sort((a, b) => b.timestamp - a.timestamp);
    if (sortBy === "Oldest First")     r.sort((a, b) => a.timestamp - b.timestamp);
    if (sortBy === "Highest Budget")   r.sort((a, b) => b.budget - a.budget);
    return r;
  }, [proposals, statusFilter, sortBy]);

  // Filter + sort offers
  const filteredOffers = useMemo(() => {
    let r = [...offers];
    if (statusFilter !== "All Status") r = r.filter(o => o.status === statusFilter);
    if (sortBy === "Newest First")     r.sort((a, b) => b.timestamp - a.timestamp);
    if (sortBy === "Oldest First")     r.sort((a, b) => a.timestamp - b.timestamp);
    if (sortBy === "Highest Budget")   r.sort((a, b) => b.budget - a.budget);
    return r;
  }, [offers, statusFilter, sortBy]);

  const totalCount = proposals.length + offers.length;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-rose-500 font-medium">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Proposals & Offers</h1>
          <p className="text-slate-500 mt-1 text-sm">Track all proposals you've sent and offers you've received.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={Send}      iconBg="bg-teal-50 text-teal-600"       value={stats.sent        || 0} label="Proposals Sent"  sub="All time"     />
          <StatCard icon={Mail}      iconBg="bg-violet-50 text-violet-600"   value={offers.length     || 0} label="Offers Received" sub="All time"     />
          <StatCard icon={Star}      iconBg="bg-amber-50 text-amber-500"     value={stats.shortlisted || 0} label="Shortlisted"     sub="Proposals"    />
          <StatCard icon={UserCheck} iconBg="bg-emerald-50 text-emerald-600" value={stats.hired       || 0} label="Hired"           sub="From Offers"  highlight />
          <StatCard icon={Users}     iconBg="bg-rose-50 text-rose-500"       value={stats.rejected    || 0} label="Rejected"        sub="Proposals"    />
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-slate-200/70 p-1 rounded-lg gap-0.5">
            {[
              { key: "all",       label: `All (${totalCount})`           },
              { key: "proposals", label: `Proposals (${proposals.length})` },
              { key: "offers",    label: `Offers (${offers.length})`      },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === tab.key ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {[
              {
                value: statusFilter,
                options: ["All Status", "Pending", "Viewed", "Shortlisted", "Rejected", "Hired", "Accepted", "Expired"],
                set: setStatusFilter,
              },
              {
                value: sortBy,
                options: ["Newest First", "Oldest First", "Highest Budget"],
                set: setSortBy,
              },
            ].map((dd, i) => (
              <div key={i} className="relative">
                <select value={dd.value} onChange={e => dd.set(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer">
                  {dd.options.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Proposals Section */}
        {(activeTab === "all" || activeTab === "proposals") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send size={15} className="text-teal-600" />
                <h2 className="text-base font-black text-slate-900">
                  Proposals <span className="text-slate-400 font-semibold text-sm">({filteredProposals.length})</span>
                </h2>
                <span className="text-xs text-slate-400 hidden sm:block">Jobs you've applied for</span>
              </div>
            </div>
            {filteredProposals.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
                No proposals match the selected filter.
              </div>
            ) : (
              filteredProposals.map(item => <ProposalCard key={item.id} item={item} />)
            )}
          </section>
        )}

        {/* Offers Section */}
        {(activeTab === "all" || activeTab === "offers") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-teal-600" />
                <h2 className="text-base font-black text-slate-900">
                  Offers <span className="text-slate-400 font-semibold text-sm">({filteredOffers.length})</span>
                </h2>
                <span className="text-xs text-slate-400 hidden sm:block">Jobs that clients offered to you</span>
              </div>
            </div>
            {filteredOffers.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
                No offers match the selected filter.
              </div>
            ) : (
              filteredOffers.map(item => <OfferCard key={item.id} item={item} />)
            )}
          </section>
        )}

      </div>
    </div>
  );
};

export default ProposalsOffers;