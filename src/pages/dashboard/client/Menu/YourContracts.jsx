import React, { useState, useMemo } from 'react';
import {
  Briefcase, CheckCircle, Clock, XCircle, Wallet,
  Calendar, Timer, IndianRupee, Star, ArrowUpDown,
  ChevronDown, MoreHorizontal, Eye, FileText,
  Milestone, AlertCircle, MessageSquare, Ban,
  Headphones, Bell, Search, TrendingUp,
} from 'lucide-react';

// ─── Demo Data ────────────────────────────────────────────────────────────────
const CONTRACTS = [
  {
    id: 1,
    title: 'E-commerce Website',
    status: 'Active',
    category: 'Web Development',
    freelancer: { name: 'Sharad Kumar', avatar: 'SK', rating: 4.9 },
    startDate: '2026-05-15',
    duration: '45 Days',
    budget: 75000,
    milestones: { completed: 3, total: 5 },
    progress: 60,
    nextMilestone: { title: 'Backend Development', amount: 20000, dueDate: '2026-06-10' },
    thumbnail: 'ecommerce',
    timestamp: 1747958400000,
  },
  {
    id: 2,
    title: 'Fitness Tracker Mobile App',
    status: 'In Progress',
    category: 'Mobile App',
    freelancer: { name: 'Pooja Singh', avatar: 'PS', rating: 4.8 },
    startDate: '2026-05-20',
    duration: '30 Days',
    budget: 60000,
    milestones: { completed: 3, total: 4 },
    progress: 75,
    nextMilestone: { title: 'Testing & Bug Fixes', amount: 15000, dueDate: '2026-06-15' },
    thumbnail: 'fitness',
    timestamp: 1748044800000,
  },
  {
    id: 3,
    title: 'Admin Dashboard',
    status: 'Active',
    category: 'Web Development',
    freelancer: { name: 'Rohit Verma', avatar: 'RV', rating: 4.7 },
    startDate: '2026-05-10',
    duration: '25 Days',
    budget: 35000,
    milestones: { completed: 2, total: 5 },
    progress: 40,
    nextMilestone: { title: 'User Management Module', amount: 7000, dueDate: '2026-05-30' },
    thumbnail: 'dashboard',
    timestamp: 1747353600000,
  },
  {
    id: 4,
    title: 'Brand Identity Design',
    status: 'Completed',
    category: 'UI/UX Design',
    freelancer: { name: 'Neha Sharma', avatar: 'NS', rating: 5.0 },
    startDate: '2026-04-05',
    duration: '15 Days',
    budget: 15000,
    milestones: { completed: 3, total: 3 },
    progress: 100,
    nextMilestone: null,
    completedOn: '2026-04-20',
    totalPaid: 15000,
    thumbnail: 'brand',
    timestamp: 1745107200000,
  },
  {
    id: 5,
    title: 'Landing Page Design',
    status: 'Cancelled',
    category: 'Web Design',
    freelancer: { name: 'Amit Joshi', avatar: 'AJ', rating: null },
    startDate: '2026-03-01',
    duration: '10 Days',
    budget: 8000,
    milestones: { completed: 1, total: 3 },
    progress: 30,
    nextMilestone: null,
    cancelReason: 'Project scope changed',
    thumbnail: 'landing',
    timestamp: 1740787200000,
  },
];

const ACTIVITY = [
  { id: 1, type: 'milestone', icon: 'check', color: 'teal', title: 'Milestone completed', sub: 'E-commerce Website', time: '2h ago', amount: null },
  { id: 2, type: 'payment', icon: 'rupee', color: 'blue', title: 'Payment released', sub: 'Fitness Tracker App', time: '1 day ago', amount: 15000 },
  { id: 3, type: 'message', icon: 'message', color: 'violet', title: 'New message', sub: 'From Sharad Kumar', time: '2 days ago', amount: null },
  { id: 4, type: 'due', icon: 'clock', color: 'amber', title: 'Milestone due soon', sub: 'Admin Dashboard', time: '3 days ago', amount: null },
  { id: 5, type: 'cancel', icon: 'ban', color: 'rose', title: 'Contract cancelled', sub: 'Landing Page Design', time: '5 days ago', amount: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Active:      { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',  bar: 'bg-teal-500',   dot: 'bg-teal-500'  },
  'In Progress':{ bg: 'bg-blue-50',   text: 'text-blue-700',    border: 'border-blue-200',  bar: 'bg-blue-500',   dot: 'bg-blue-500'  },
  Completed:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', dot: 'bg-emerald-500'},
  Cancelled:   { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',  bar: 'bg-rose-400',   dot: 'bg-rose-400'  },
};

const CAT_CFG = {
  'Web Development': 'bg-teal-50 text-teal-700 border-teal-200',
  'Mobile App':      'bg-blue-50 text-blue-700 border-blue-200',
  'UI/UX Design':    'bg-violet-50 text-violet-700 border-violet-200',
  'Web Design':      'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const THUMB_CFG = {
  ecommerce: { bg: 'from-rose-100 to-orange-50',   text: 'text-rose-400',   label: 'E-COM' },
  fitness:   { bg: 'from-purple-100 to-violet-50', text: 'text-purple-400', label: 'FIT'   },
  dashboard: { bg: 'from-blue-100 to-indigo-50',   text: 'text-blue-400',   label: 'DASH'  },
  brand:     { bg: 'from-slate-100 to-zinc-50',    text: 'text-slate-500',  label: 'BRAND' },
  landing:   { bg: 'from-teal-100 to-cyan-50',     text: 'text-teal-400',   label: 'PAGE'  },
};

const ACT_CFG = {
  teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   border: 'border-teal-100'   },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100'   },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100'  },
  rose:   { bg: 'bg-rose-50',   icon: 'text-rose-500',   border: 'border-rose-100'   },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 'sm' }) {
  const s = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
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

// ─── Activity Icon ────────────────────────────────────────────────────────────
function ActivityIcon({ type }) {
  const icons = {
    check:   <CheckCircle className="w-4 h-4" />,
    rupee:   <IndianRupee className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
    clock:   <Clock className="w-4 h-4" />,
    ban:     <Ban className="w-4 h-4" />,
  };
  return icons[type] || <Bell className="w-4 h-4" />;
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
  const [hovered, setHovered] = useState(null);
  const R = 56, CX = 70, CY = 70, SW = 18;
  const circ = 2 * Math.PI * R;
  let cum = 0;
  const segs = data.map(d => {
    const dash = (d.pct / 100) * circ;
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
            onMouseLeave={() => setHovered(null)}
          >
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
  const s = STATUS_CFG[contract.status];
  const pct = contract.milestones.completed / contract.milestones.total * 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
      <div className="flex flex-col md:flex-row">

        {/* Thumbnail */}
        <div className="w-full md:w-44 h-32 md:h-auto rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden shrink-0">
          <Thumbnail type={contract.thumbnail} />
        </div>

        {/* Left info */}
        <div className="flex-1 p-5 space-y-3">
          {/* Title + status */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">{contract.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
              {contract.status}
            </span>
          </div>

          {/* Freelancer */}
          <div className="flex items-center gap-2">
            <Avatar initials={contract.freelancer.avatar} />
            <span className="text-xs text-slate-600">Freelancer: <span className="font-semibold text-slate-800">{contract.freelancer.name}</span></span>
            {contract.freelancer.rating && (
              <div className="flex items-center gap-1 ml-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-700">{contract.freelancer.rating}</span>
              </div>
            )}
          </div>

          {/* Category */}
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CAT_CFG[contract.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {contract.category}
          </span>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{formatDate(contract.startDate)}</span>
            <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-slate-400" />{contract.duration}</span>
            <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400" />{formatINR(contract.budget).replace('₹','')}</span>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>Milestone Progress</span>
              <span className={`font-bold ${s.text}`}>{Math.round(pct)}% ({contract.milestones.completed}/{contract.milestones.total})</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Cancel reason */}
          {contract.status === 'Cancelled' && contract.cancelReason && (
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {contract.cancelReason}
            </p>
          )}
        </div>

        {/* Right panel */}
        <div className="md:w-52 p-5 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between gap-4">

          {/* Next milestone or completed info */}
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
              <p className="text-xs font-bold text-slate-800 leading-snug">{contract.nextMilestone?.title}</p>
              <p className="text-base font-black text-teal-600">{formatINR(contract.nextMilestone?.amount)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Due Date</p>
              <p className="text-xs font-semibold text-slate-700">{formatDate(contract.nextMilestone?.dueDate)}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                contract.status === 'Cancelled'
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
              }`}
              disabled={contract.status === 'Cancelled'}
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
                    <button
                      key={i}
                      onClick={() => setMenuOpen(false)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors ${item === 'Cancel Contract' ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-600'}`}
                    >
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
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');

  const metrics = useMemo(() => {
    const total = CONTRACTS.length;
    const active = CONTRACTS.filter(c => c.status === 'Active').length;
    const completed = CONTRACTS.filter(c => c.status === 'Completed').length;
    const cancelled = CONTRACTS.filter(c => c.status === 'Cancelled').length;
    const totalSpent = CONTRACTS.filter(c => c.status === 'Completed').reduce((s, c) => s + c.budget, 0);
    return { total, active, completed, cancelled, totalSpent };
  }, []);

  const donutData = [
    { label: 'Active',      count: metrics.active,    pct: 38.9, color: '#0d9488' },
    { label: 'In Progress', count: 1,                  pct: 22.2, color: '#3b82f6' },
    { label: 'Completed',   count: metrics.completed,  pct: 50.0, color: '#10b981' },
    { label: 'Cancelled',   count: metrics.cancelled,  pct: 11.1, color: '#f43f5e' },
  ];

  const displayed = useMemo(() => {
    let r = [...CONTRACTS];
    if (activeFilter !== 'All') r = r.filter(c => c.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => c.title.toLowerCase().includes(q) || c.freelancer.name.toLowerCase().includes(q));
    }
    if (sortBy === 'recent')   r.sort((a, b) => b.timestamp - a.timestamp);
    if (sortBy === 'highest')  r.sort((a, b) => b.budget - a.budget);
    if (sortBy === 'lowest')   r.sort((a, b) => a.budget - b.budget);
    return r;
  }, [activeFilter, sortBy, search]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Your Contracts</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage all your active, completed and cancelled contracts in one place.</p>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 w-56"
            />
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Contracts', value: metrics.total, sub: 'All time', subColor: 'text-slate-400', icon: Briefcase, iconBg: 'bg-teal-50 text-teal-600' },
            { label: 'Active Contracts', value: metrics.active, sub: 'Currently running', subColor: 'text-teal-600', icon: CheckCircle, iconBg: 'bg-teal-50 text-teal-600' },
            { label: 'Completed Contracts', value: metrics.completed, sub: 'Successfully completed', subColor: 'text-emerald-600', icon: FileText, iconBg: 'bg-emerald-50 text-emerald-600' },
            { label: 'Cancelled Contracts', value: metrics.cancelled, sub: 'Cancelled', subColor: 'text-rose-400', icon: XCircle, iconBg: 'bg-rose-50 text-rose-500' },
            { label: 'Total Spent', value: null, formatted: formatINR(metrics.totalSpent), sub: 'All time', subColor: 'text-teal-600', icon: Wallet, iconBg: 'bg-teal-600 text-white', highlight: true },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className={`bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${m.highlight ? 'border border-teal-200 bg-gradient-to-br from-teal-50 to-white col-span-2 md:col-span-1' : 'border border-teal-100'}`}>
                <div className={`p-3 rounded-lg ${m.iconBg}`}><Icon className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{m.formatted || m.value}</div>
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
            {['All', 'Active', 'In Progress', 'Completed', 'Cancelled'].map(tab => (
              <button key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeFilter === tab ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
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

            {/* Contracts Overview Donut */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-black text-slate-900 mb-4">Contracts Overview</h2>
              <DonutChart data={donutData} total={metrics.total} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900">Recent Activity</h2>
                <button className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">View all</button>
              </div>
              <div className="space-y-3">
                {ACTIVITY.map(a => {
                  const ac = ACT_CFG[a.color];
                  return (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl border ${ac.bg} ${ac.border} flex items-center justify-center shrink-0 ${ac.icon}`}>
                        <ActivityIcon type={a.icon} />
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
                  );
                })}
              </div>
            </div>

            {/* Need Help */}
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