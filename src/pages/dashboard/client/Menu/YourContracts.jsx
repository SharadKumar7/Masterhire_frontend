import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase, CheckCircle, Clock, XCircle, Wallet,
  Calendar, Timer, IndianRupee, Star, ArrowUpDown,
  ChevronDown, MoreHorizontal, Eye, FileText,
  AlertCircle, MessageSquare, Ban, Headphones,
  Bell, Search, Loader2,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Active:        { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    bar: 'bg-teal-500',    dot: 'bg-teal-500'    },
  'In Progress': { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    bar: 'bg-blue-500',    dot: 'bg-blue-500'    },
  Ongoing:       { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    bar: 'bg-blue-500',    dot: 'bg-blue-500'    },
  Completed:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  Cancelled:     { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    bar: 'bg-rose-400',    dot: 'bg-rose-400'    },
};

const CAT_CFG = {
  'Web Development': 'bg-teal-50 text-teal-700 border-teal-200',
  'Mobile App':      'bg-blue-50 text-blue-700 border-blue-200',
  'UI/UX Design':    'bg-violet-50 text-violet-700 border-violet-200',
  'Web Design':      'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const THUMB_CFG = {
  ecommerce: { bg: 'from-rose-100 to-orange-50',   text: 'text-rose-400',   label: 'E-COM'  },
  fitness:   { bg: 'from-purple-100 to-violet-50', text: 'text-purple-400', label: 'FIT'    },
  dashboard: { bg: 'from-blue-100 to-indigo-50',   text: 'text-blue-400',   label: 'DASH'   },
  brand:     { bg: 'from-slate-100 to-zinc-50',    text: 'text-slate-500',  label: 'BRAND'  },
  landing:   { bg: 'from-teal-100 to-cyan-50',     text: 'text-teal-400',   label: 'PAGE'   },
};

const ACT_CFG = {
  teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   border: 'border-teal-100'   },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100'   },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100'  },
  rose:   { bg: 'bg-rose-50',   icon: 'text-rose-500',   border: 'border-rose-100'   },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, photo, size = 'sm' }) {
  const s = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return photo ? (
    <img src={photo} alt={initials} className={`${s} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${s} rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function Thumbnail({ type }) {
  const c = THUMB_CFG[type] || THUMB_CFG.ecommerce;
  return (
    <div className={`w-full h-full bg-gradient-to-br ${c.bg} flex items-center justify-center`}>
      <span className={`text-lg font-black tracking-widest ${c.text} opacity-40`}>{c.label}</span>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
  const [hovered, setHovered] = useState(null);
  const R = 56, CX = 70, CY = 70, SW = 18;
  const circ = 2 * Math.PI * R;
  let cum = 0;
  const segs = data.map(d => {
    const dash   = (d.pct / 100) * circ;
    const offset = circ - cum;
    cum += dash;
    return { ...d, dash, offset };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW} />
        {segs.map((s, i) => (
          <circle key={i} cx={CX} cy={CY} r={R} fill="none"
            stroke={s.color} strokeWidth={hovered === i ? SW + 3 : SW}
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={s.offset}
            transform={`rotate(-90 ${CX} ${CY})`}
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text x={CX} y={CY - 5} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a" fontFamily="sans-serif">{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">Total</text>
      </svg>
      <div className="space-y-2 flex-1">
        {data.map((d, i) => (
          <div key={i}
            className={`flex items-center justify-between text-xs cursor-default px-1 py-0.5 rounded transition-colors ${hovered === i ? 'bg-slate-50' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-slate-600 font-medium">{d.label}</span>
            </div>
            <span className="font-bold text-slate-800">{d.count} <span className="text-slate-400 font-normal">({d.pct}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contract Card ────────────────────────────────────────────────────────────
function ContractCard({ contract }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const s   = STATUS_CFG[contract.status] || STATUS_CFG['Ongoing'];
  const pct = contract.milestones.total > 0
    ? Math.round((contract.milestones.completed / contract.milestones.total) * 100)
    : contract.progress || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
      <div className="flex flex-col md:flex-row">

        {/* Thumbnail */}
        <div className="w-full md:w-44 h-32 md:h-auto rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden shrink-0">
          <Thumbnail type={contract.thumbnail} />
        </div>

        {/* Left info */}
        <div className="flex-1 p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">{contract.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
              {contract.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar initials={contract.freelancer.avatar} photo={contract.freelancer.photo} />
            <span className="text-xs text-slate-600">
              Freelancer: <span className="font-semibold text-slate-800">{contract.freelancer.name}</span>
            </span>
            {contract.freelancer.rating && (
              <div className="flex items-center gap-1 ml-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-700">{contract.freelancer.rating}</span>
              </div>
            )}
          </div>

          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CAT_CFG[contract.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {contract.category}
          </span>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{formatDate(contract.startDate)}</span>
            <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-slate-400" />{contract.duration}</span>
            <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400" />{formatINR(contract.budget).replace('₹', '')}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>Milestone Progress</span>
              <span className={`font-bold ${s.text}`}>{pct}% ({contract.milestones.completed}/{contract.milestones.total})</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {contract.status === 'Cancelled' && contract.cancelReason && (
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {contract.cancelReason}
            </p>
          )}
        </div>

        {/* Right panel */}
        <div className="md:w-52 p-5 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between gap-4">
          {contract.status === 'Completed' ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed On</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(contract.completedOn)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Total Paid</p>
              <p className="text-base font-black text-teal-600">{formatINR(contract.totalPaid)}</p>
            </div>
          ) : contract.status === 'Cancelled' ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget</p>
              <p className="text-base font-black text-slate-500">{formatINR(contract.budget)}</p>
              <p className="text-[10px] text-rose-400 font-semibold mt-1">Contract ended early</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Milestone</p>
              <p className="text-xs font-bold text-slate-800 leading-snug">{contract.nextMilestone?.title || '—'}</p>
              <p className="text-base font-black text-teal-600">{contract.nextMilestone ? formatINR(contract.nextMilestone.amount) : '—'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Due Date</p>
              <p className="text-xs font-semibold text-slate-700">{contract.nextMilestone ? formatDate(contract.nextMilestone.dueDate) : '—'}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              disabled={contract.status === 'Cancelled'}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                contract.status === 'Cancelled'
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {contract.status === 'Completed' ? 'View Summary' : 'View Details'}
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-teal-300 hover:text-teal-600 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden w-40">
                  {['Message Freelancer', 'Download Files', 'Raise Dispute', 'Cancel Contract'].map((item, i) => (
                    <button key={i} onClick={() => setMenuOpen(false)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                        item === 'Cancel Contract' ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-600'
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function YourContracts() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy]             = useState('recent');
  const [search, setSearch]             = useState('');
  const [contracts, setContracts]       = useState([]);
  const [metrics, setMetrics]           = useState({});
  const [donutData, setDonutData]       = useState([]);
  const [activity, setActivity]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res  = await fetch(`${BASE_URL}/api/client/contracts`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setContracts(data.contracts  || []);
        setMetrics(data.metrics      || {});
        setDonutData(data.donutData  || []);
        setActivity(data.activity    || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayed = useMemo(() => {
    let r = [...contracts];
    if (activeFilter !== 'All') r = r.filter(c => c.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.freelancer.name.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'recent')  r.sort((a, b) => b.timestamp - a.timestamp);
    if (sortBy === 'highest') r.sort((a, b) => b.budget - a.budget);
    if (sortBy === 'lowest')  r.sort((a, b) => a.budget - b.budget);
    return r;
  }, [contracts, activeFilter, sortBy, search]);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Your Contracts</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage all your active, completed and cancelled contracts.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search contracts..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 w-56" />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Contracts',     value: metrics.total,     sub: 'All time',               subColor: 'text-slate-400',   Icon: Briefcase, iconBg: 'bg-teal-50 text-teal-600'   },
            { label: 'Active Contracts',    value: metrics.active,    sub: 'Currently running',      subColor: 'text-teal-600',    Icon: CheckCircle, iconBg: 'bg-teal-50 text-teal-600'  },
            { label: 'Completed',           value: metrics.completed, sub: 'Successfully completed', subColor: 'text-emerald-600', Icon: FileText, iconBg: 'bg-emerald-50 text-emerald-600'},
            { label: 'Cancelled',           value: metrics.cancelled, sub: 'Cancelled',              subColor: 'text-rose-400',    Icon: XCircle, iconBg: 'bg-rose-50 text-rose-500'      },
            { label: 'Total Spent', formatted: formatINR(metrics.totalSpent), sub: 'All time', subColor: 'text-teal-600', Icon: Wallet, iconBg: 'bg-teal-600 text-white', highlight: true },
          ].map((m, i) => {
            const Icon = m.Icon;
            return (
              <div key={i} className={`bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${
                m.highlight ? 'border border-teal-200 bg-gradient-to-br from-teal-50 to-white col-span-2 md:col-span-1' : 'border border-teal-100'
              }`}>
                <div className={`p-3 rounded-lg ${m.iconBg}`}><Icon className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{m.formatted || m.value || 0}</div>
                  <div className="text-xs font-semibold text-slate-600">{m.label}</div>
                  <div className={`text-[10px] font-medium ${m.subColor}`}>{m.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex bg-slate-200/70 p-1 rounded-lg max-w-max">
            {['All', 'Active', 'Ongoing', 'Completed', 'Cancelled'].map(tab => (
              <button key={tab} onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeFilter === tab ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}>
                {tab === 'All' ? 'All Contracts' : tab}
              </button>
            ))}
          </div>
          <div className="relative flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
              <option value="recent">Recent</option>
              <option value="highest">Highest Budget</option>
              <option value="lowest">Lowest Budget</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Contract list */}
          <div className="lg:col-span-2 space-y-4">
            {displayed.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400 text-sm">
                No contracts matching your filter.
              </div>
            ) : (
              displayed.map(c => <ContractCard key={c.id} contract={c} />)
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Donut */}
            {donutData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-sm font-black text-slate-900 mb-4">Contracts Overview</h2>
                <DonutChart data={donutData} total={metrics.total || 0} />
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900">Recent Activity</h2>
              </div>
              {activity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl border bg-teal-50 border-teal-100 flex items-center justify-center shrink-0 text-teal-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-snug">{a.title}</p>
                        <p className="text-[10px] text-slate-400">{a.sub}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {a.amount && <p className="text-xs font-black text-teal-600">{formatINR(a.amount)}</p>}
                        <p className="text-[10px] text-slate-400">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Help */}
            <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-black text-slate-900">Need Help?</h2>
              <p className="text-xs text-slate-500 leading-relaxed">Our support team is here to help you with your contracts.</p>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
                <Headphones className="w-4 h-4" /> Contact Support
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}