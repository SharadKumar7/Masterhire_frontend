import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, ChevronDown, ChevronRight, ArrowUpDown,
  Download, Filter, X, Search, TrendingUp, TrendingDown,
  Minus, Wallet, CreditCard, Clock, Lock, ArrowUpCircle,
  Percent, ArrowDownCircle, RefreshCw, CheckCircle,
  Building2, IndianRupee,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const DATE_RANGES = [
  'May 01 - May 31, 2024',
  'Apr 01 - Apr 30, 2024',
  'Mar 01 - Mar 31, 2024',
  'Jan 01 - Dec 31, 2024',
];

const TX_TYPES    = ['All', 'Milestone Release', 'Escrow Deposit', 'Wallet Top-up', 'Platform Fee', 'Refund Received'];
const TX_STATUSES = ['All', 'Released', 'Held', 'Completed', 'Deducted', 'Refunded'];

const PAYMENT_FLOW = [
  { label: 'Add Funds',  sub: 'to Wallet',     icon: 'creditCard',  color: 'teal'  },
  { label: 'Deposit',    sub: 'into Escrow',   icon: 'lock',        color: 'blue'  },
  { label: 'Milestone',  sub: 'Gets Approved', icon: 'checkCircle', color: 'amber' },
  { label: 'Freelancer', sub: 'Gets Paid',     icon: 'arrowUp',     color: 'teal'  },
];

// ─── Shared Helpers ───────────────────────────────────────────────────────────
const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const ICON_MAP = {
  wallet: Wallet, creditCard: CreditCard, clock: Clock, lock: Lock,
  arrowUp: ArrowUpCircle, arrowDown: ArrowDownCircle, percent: Percent,
  refresh: RefreshCw, checkCircle: CheckCircle, bank: Building2,
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
const METRIC_ICON_COLORS = {
  teal: 'bg-teal-600 text-white', blue: 'bg-blue-500 text-white',
  amber: 'bg-amber-500 text-white', cyan: 'bg-cyan-500 text-white', rose: 'bg-rose-500 text-white',
};

function MetricCard({ label, value, subLabel, subType, icon, color }) {
  const Icon = ICON_MAP[icon] || Wallet;
  const subColor = { positive: 'text-teal-600', negative: 'text-rose-500', warning: 'text-amber-500', neutral: 'text-slate-500' }[subType];
  const SubIcon  = subType === 'positive' ? TrendingUp : subType === 'negative' ? TrendingDown : Minus;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-teal-200 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${METRIC_ICON_COLORS[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-600 transition-colors">{label}</span>
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(value)}</div>
        <div className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${subColor}`}>
          {subType !== 'neutral' && <SubIcon className="w-3 h-3" />}
          {subLabel}
        </div>
      </div>
    </div>
  );
}

// ─── SVG Chart ────────────────────────────────────────────────────────────────
function EarningsChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const W = 600, H = 200, PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = W - PAD.left - PAD.right, innerH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const xScale = (i) => PAD.left + (i / Math.max(data.length - 1, 1)) * innerW;
  const yScale = (v) => PAD.top + innerH - (v / maxVal) * innerH;
  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.value), ...d }));
  const pathD  = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD  = `${pathD} L ${points[points.length - 1].x} ${PAD.top + innerH} L ${points[0].x} ${PAD.top + innerH} Z`;
  const yTicks = [0, 10000, 20000, 30000, 40000];

  return (
    <div className="relative w-full" style={{ paddingBottom: '36%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="clientAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map(t => (
          <g key={t}>
            <line x1={PAD.left} y1={yScale(t)} x2={PAD.left + innerW} y2={yScale(t)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD.left - 8} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
              ₹{t === 0 ? '0' : t / 1000 + 'K'}
            </text>
          </g>
        ))}
        {points.filter((_, i) => i % 2 === 0).map(p => (
          <text key={p.label} x={p.x} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">{p.label}</text>
        ))}
        <path d={areaD} fill="url(#clientAreaGrad)" />
        <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke="#0d9488" strokeWidth="2.5"
            className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            onMouseEnter={() => setTooltip(p)} />
        ))}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + innerH} stroke="#0d9488" strokeWidth="1" strokeDasharray="4 3" />
            <rect x={Math.min(tooltip.x - 52, W - 120)} y={tooltip.y - 42} width="110" height="36" rx="8"
              fill="white" stroke="#ccfbf1" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }} />
            <text x={Math.min(tooltip.x - 52, W - 120) + 55} y={tooltip.y - 26} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="sans-serif">{tooltip.label}</text>
            <text x={Math.min(tooltip.x - 52, W - 120) + 55} y={tooltip.y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f766e" fontFamily="sans-serif">{formatINR(tooltip.value)}</text>
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="white" stroke="#0d9488" strokeWidth="2.5" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
  const [hovered, setHovered] = useState(null);
  const R = 70, CX = 90, CY = 90, STROKE = 22, circ = 2 * Math.PI * R;
  let cum = 0;
  const segs = data.map(d => {
    const dash = (d.pct / 100) * circ;
    const offset = circ - cum;
    cum += dash;
    return { ...d, dash, offset };
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          {segs.map((s, i) => (
            <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={s.color}
              strokeWidth={hovered === i ? STROKE + 4 : STROKE}
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={s.offset}
              transform={`rotate(-90 ${CX} ${CY})`}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize="15" fontWeight="800" fill="#0f172a" fontFamily="sans-serif">{formatINR(total)}</text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">Total Spent</text>
        </svg>
      </div>
      <div className="space-y-2 flex-1">
        {data.map((d, i) => (
          <div key={i}
            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-150 cursor-default ${hovered === i ? 'bg-slate-50' : ''}`}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-xs font-medium text-slate-600">{d.label}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900">{formatINR(d.value)}</span>
              <span className="text-[10px] text-slate-400 ml-1">({d.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Released:  'bg-teal-100 text-teal-700 border border-teal-200',
  Held:      'bg-blue-100 text-blue-700 border border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Deducted:  'bg-amber-100 text-amber-700 border border-amber-200',
  Refunded:  'bg-rose-100 text-rose-700 border border-rose-200',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
      {status}
    </span>
  );
}

const TYPE_ICON_STYLES = {
  arrowUp:   'bg-rose-50 text-rose-500',
  arrowDown: 'bg-teal-50 text-teal-600',
  percent:   'bg-amber-50 text-amber-600',
  refresh:   'bg-purple-50 text-purple-500',
};

function TxTypeIcon({ typeIcon }) {
  const Icon = ICON_MAP[typeIcon] || ArrowDownCircle;
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_ICON_STYLES[typeIcon] || 'bg-slate-100 text-slate-500'}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

function TransactionRow({ tx }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-teal-50/40 transition-colors rounded-lg px-2 -mx-2 cursor-default">
      <TxTypeIcon typeIcon={tx.typeIcon} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-slate-800 truncate block">{tx.type}</span>
        <span className="text-[10px] text-slate-400 truncate block">{tx.description}</span>
      </div>
      <div className="hidden md:block min-w-[140px] text-xs text-slate-500 truncate">{tx.project}</div>
      <div className={`text-sm font-black min-w-[80px] text-right ${tx.isCredit ? 'text-teal-600' : 'text-rose-500'}`}>
        {tx.isCredit ? '+' : '-'} {formatINR(tx.amount)}
      </div>
      <div className="hidden sm:block min-w-[80px] text-center">
        <StatusBadge status={tx.status} />
      </div>
      <div className="hidden lg:block min-w-[100px] text-right">
        <div className="text-[11px] font-semibold text-slate-600">{tx.date}</div>
        <div className="text-[10px] text-slate-400">{tx.time}</div>
      </div>
    </div>
  );
}

const FLOW_COLORS = { teal: 'bg-teal-600 text-white', blue: 'bg-blue-500 text-white', amber: 'bg-amber-500 text-white' };

function FlowStep({ step, isLast }) {
  const Icon = ICON_MAP[step.icon] || CheckCircle;
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${FLOW_COLORS[step.color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-xs font-semibold text-slate-700 text-center mt-1.5 leading-tight">
          {step.label}
          <div className="text-[10px] font-normal text-slate-400">{step.sub}</div>
        </div>
      </div>
      {!isLast && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mb-5" />}
    </div>
  );
}

function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-teal-400 transition-all">
        <Calendar className="w-3.5 h-3.5 text-teal-600" />
        {value}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[220px]">
          {DATE_RANGES.map(r => (
            <button key={r} onClick={() => { onChange(r); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors ${r === value ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}>
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Funds Modal ──────────────────────────────────────────────────────────
function AddFundsModal({ onClose, onSuccess }) {
  const [amount, setAmount]         = useState('');
  const [method, setMethod]         = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/client/add-funds`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ amount: Number(amount), method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubmitted(true);
      onSuccess(data.newBalance);
      setTimeout(() => onClose(), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">Add Funds to Wallet</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {!submitted ? (
          <>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-700 font-medium">
              Funds go to your wallet and can be used to pay freelancers via escrow.
            </div>
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['upi', 'card', 'netbanking'].map(m => (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`py-2 rounded-xl border text-[11px] font-bold transition-all capitalize ${method === m ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600 hover:border-teal-300'}`}>
                    {m === 'netbanking' ? 'Net Bank' : m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</label>
              <input type="number" placeholder="Enter amount" value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400" />
            </div>
            <div className="flex gap-2">
              {[10000, 25000, 50000].map(q => (
                <button key={q} onClick={() => setAmount(String(q))}
                  className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:border-teal-400 hover:text-teal-600 transition-all">
                  {formatINR(q)}
                </button>
              ))}
            </div>
            <button onClick={handleSubmit}
              disabled={!amount || Number(amount) <= 0 || submitting}
              className="w-full py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? 'Processing...' : 'Add Funds'}
            </button>
          </>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-teal-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Funds Added!</p>
            <p className="text-xs text-slate-500">{formatINR(Number(amount))} has been added to your wallet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transactions Panel ───────────────────────────────────────────────────────
function TransactionsPanel({ transactions }) {
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [sortDir, setSortDir]           = useState('desc');
  const [showAll, setShowAll]           = useState(false);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const filtered = useMemo(() => {
    let r = [...transactions];
    if (typeFilter !== 'All')   r = r.filter(t => t.type === typeFilter);
    if (statusFilter !== 'All') r = r.filter(t => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(t => t.type.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.project.toLowerCase().includes(q));
    }
    r.sort((a, b) => sortDir === 'desc' ? b.id - a.id : a.id - b.id);
    return r;
  }, [transactions, typeFilter, statusFilter, search, sortDir]);

  const displayed = showAll ? filtered : filtered.slice(0, 6);

  const handleExport = () => {
    const csv = [
      ['Type', 'Description', 'Project', 'Amount', 'Status', 'Date', 'Time'],
      ...filtered.map(t => [t.type, t.description, t.project, (t.isCredit ? '+' : '-') + t.amount, t.status, t.date, t.time]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'client-transactions.csv';
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-black text-slate-900">Recent Transactions</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setFiltersOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${filtersOpen ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-teal-400 transition-all bg-white">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortDir === 'desc' ? 'Newest' : 'Oldest'}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400" /></button>}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {TX_TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${typeFilter === t ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</div>
            <div className="flex flex-wrap gap-1.5">
              {TX_STATUSES.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${statusFilter === s ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {(typeFilter !== 'All' || statusFilter !== 'All' || search) && (
            <button onClick={() => { setTypeFilter('All'); setStatusFilter('All'); setSearch(''); }}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1">
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      )}

      <div className="hidden md:grid grid-cols-[1fr_1.2fr_1.2fr_100px_90px_110px] gap-3 px-2 mb-2">
        {['Type', 'Description', 'Contract / Project', 'Amount', 'Status', 'Date'].map(h => (
          <div key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</div>
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {displayed.length === 0
          ? <div className="py-10 text-center text-sm text-slate-400">No transactions match your filters.</div>
          : displayed.map(tx => <TransactionRow key={tx.id} tx={tx} />)
        }
      </div>

      {filtered.length > 6 && (
        <div className="mt-4 flex justify-end">
          <button onClick={() => setShowAll(a => !a)}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">
            {showAll ? 'View Less' : `View all ${filtered.length} Transactions`}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClientTransactionSummary() {
  const [dateRange, setDateRange]       = useState(DATE_RANGES[0]);
  const [chartTab, setChartTab]         = useState('this');
  const [showAddFunds, setShowAddFunds] = useState(false);

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [metrics, setMetrics]           = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartThisMonth, setChartThisMonth] = useState([]);
  const [chartLastMonth, setChartLastMonth] = useState([]);
  const [breakdown, setBreakdown]       = useState([]);
  const [totalBreakdown, setTotalBreakdown] = useState(0);
  const [walletBalance, setWalletBalance]   = useState(0);

  const fetchData = async (range) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${BASE_URL}/api/client/transactions?range=${encodeURIComponent(range)}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMetrics(data.metrics               || []);
      setTransactions(data.transactions     || []);
      setChartThisMonth(data.chartDataThisMonth || []);
      setChartLastMonth(data.chartDataLastMonth || []);
      setBreakdown(data.breakdown           || []);
      setTotalBreakdown(data.totalForBreakdown || 0);
      setWalletBalance(data.walletBalance   || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(dateRange); }, [dateRange]);

  const chartData = chartTab === 'this' ? chartThisMonth : chartLastMonth;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-teal-600 font-bold animate-pulse">Loading transactions...</p>
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
            <h1 className="text-3xl font-black text-teal-900 tracking-tight">Transaction Summary</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Overview of your{' '}
              <span className="text-teal-600 font-semibold">payments</span>,{' '}
              <span className="text-blue-500 font-semibold">escrow</span> and{' '}
              <span className="text-amber-500 font-semibold">spending</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <button onClick={() => setShowAddFunds(true)}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
              + Add Funds
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map(m => <MetricCard key={m.id} {...m} />)}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Spending Overview</h2>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {[['this', 'This Month'], ['last', 'Last Month']].map(([val, label]) => (
                  <button key={val} onClick={() => setChartTab(val)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartTab === val ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length > 0
              ? <EarningsChart data={chartData} />
              : <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data for this period</div>
            }
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-black text-slate-900 mb-5">Spending Breakdown</h2>
            {breakdown.length > 0
              ? <DonutChart data={breakdown} total={totalBreakdown} />
              : <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data</div>
            }
          </div>
        </div>

        {/* Transactions */}
        <TransactionsPanel transactions={transactions} />

        {/* Payment Flow */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">How Payments Work</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Your money is safe in escrow until work is approved</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PAYMENT_FLOW.map((step, i) => (
                <FlowStep key={i} step={step} isLast={i === PAYMENT_FLOW.length - 1} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {showAddFunds && (
        <AddFundsModal
          onClose={() => setShowAddFunds(false)}
          onSuccess={(newBal) => {
            setWalletBalance(newBal);
            fetchData(dateRange);
          }}
        />
      )}
    </div>
  );
}