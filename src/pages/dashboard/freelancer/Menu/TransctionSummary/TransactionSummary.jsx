import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronRight, ArrowUpDown, Download, Filter, X, Search } from 'lucide-react';
import {
  MetricCard, EarningsChart, DonutChart,
  TransactionRow, FlowStep, formatINR,
} from './TransactionComponents';

const BASE_URL   = import.meta.env.VITE_API_URL;
const getToken   = () => localStorage.getItem("token");

const DATE_RANGES = [
  'May 01 - May 31, 2024',
  'Apr 01 - Apr 30, 2024',
  'Mar 01 - Mar 31, 2024',
  'Jan 01 - Dec 31, 2024',
];

const PAYMENT_FLOW = [
  { label: 'Work Done',   sub: 'Milestone submitted', icon: 'checkCircle', color: 'teal'  },
  { label: 'Approved',    sub: 'Client approves',     icon: 'arrowDown',   color: 'blue'  },
  { label: 'Released',    sub: 'Funds released',       icon: 'arrowUp',     color: 'amber' },
  { label: 'Withdraw',    sub: 'To your bank',         icon: 'wallet',      color: 'teal'  },
];

const TX_TYPES    = ['All', 'Milestone Payment', 'Project Payment', 'Withdrawal', 'Platform Fee', 'Refund'];
const TX_STATUSES = ['All', 'Paid', 'Completed', 'Deducted', 'Refunded'];

// ─── Date Range Picker ────────────────────────────────────────────────────────
function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-teal-400 hover:shadow-md transition-all">
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
      r = r.filter(t =>
        t.type.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q)
      );
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
    a.download = 'transactions.csv';
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
            {(typeFilter !== 'All' || statusFilter !== 'All') && (
              <span className="w-4 h-4 bg-white text-teal-700 rounded-full text-[9px] font-black flex items-center justify-center">
                {(typeFilter !== 'All' ? 1 : 0) + (statusFilter !== 'All' ? 1 : 0)}
              </span>
            )}
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
            <input type="text" placeholder="Search transactions..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>}
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

// ─── Withdraw Modal ───────────────────────────────────────────────────────────
function WithdrawModal({ onClose, availableBalance, onSuccess }) {
  const [amount, setAmount]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    const val = Number(amount);
    if (!val || val <= 0 || val > availableBalance) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/freelancer/withdraw`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ amount: val }),
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
          <h3 className="text-base font-black text-slate-900">Withdraw Funds</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {!submitted ? (
          <>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-700 font-medium">
              Available balance: <span className="font-black">{formatINR(availableBalance)}</span>
            </div>
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</label>
              <input type="number" placeholder="Enter amount" value={amount}
                onChange={e => setAmount(e.target.value)} max={availableBalance}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400" />
              {amount && Number(amount) > availableBalance && (
                <p className="text-[10px] text-rose-500 font-medium">Amount exceeds available balance.</p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              {[5000, 10000, 20000].map(q => (
                <button key={q} onClick={() => setAmount(String(q))}
                  className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:border-teal-400 hover:text-teal-600 transition-all">
                  {formatINR(q)}
                </button>
              ))}
            </div>
            <button onClick={handleSubmit}
              disabled={!amount || Number(amount) <= 0 || Number(amount) > availableBalance || submitting}
              className="w-full py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? 'Processing...' : 'Withdraw Funds'}
            </button>
          </>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
              <ChevronRight className="w-7 h-7 text-teal-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Withdrawal Initiated!</p>
            <p className="text-xs text-slate-500">Your request for {formatINR(Number(amount))} has been submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TransactionSummary() {
  const [dateRange, setDateRange]   = useState(DATE_RANGES[0]);
  const [chartTab, setChartTab]     = useState('this');
  const [showWithdraw, setShowWithdraw] = useState(false);

  // API state
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [metrics, setMetrics]       = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartThisMonth, setChartThisMonth] = useState([]);
  const [chartLastMonth, setChartLastMonth] = useState([]);
  const [breakdown, setBreakdown]   = useState([]);
  const [totalBreakdown, setTotalBreakdown] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  const fetchData = async (range) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${BASE_URL}/api/freelancer/transactions?range=${encodeURIComponent(range)}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMetrics(data.metrics             || []);
      setTransactions(data.transactions   || []);
      setChartThisMonth(data.chartDataThisMonth || []);
      setChartLastMonth(data.chartDataLastMonth || []);
      setBreakdown(data.breakdown         || []);
      setTotalBreakdown(data.totalForBreakdown || 0);
      setAvailableBalance(data.availableBalance || 0);
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
              <span className="text-teal-600 font-semibold">earnings</span>,{' '}
              <span className="text-blue-500 font-semibold">payments</span> and{' '}
              <span className="text-purple-500 font-semibold">withdrawals</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <button onClick={() => setShowWithdraw(true)}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
              Withdraw
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
              <h2 className="text-base font-black text-slate-900">Earnings Overview</h2>
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
            <h2 className="text-base font-black text-slate-900 mb-5">Earnings Breakdown</h2>
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
              <h2 className="text-sm font-black text-slate-900">How Payments Flow</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Understanding the escrow process</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PAYMENT_FLOW.map((step, i) => (
                <FlowStep key={i} step={step} isLast={i === PAYMENT_FLOW.length - 1} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {showWithdraw && (
        <WithdrawModal
          onClose={() => setShowWithdraw(false)}
          availableBalance={availableBalance}
          onSuccess={(newBal) => {
            setAvailableBalance(newBal);
            fetchData(dateRange);
          }}
        />
      )}
    </div>
  );
}