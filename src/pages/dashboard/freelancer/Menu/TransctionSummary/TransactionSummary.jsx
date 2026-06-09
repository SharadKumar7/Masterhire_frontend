import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronRight, ArrowUpDown, Download, Filter, X, Search } from 'lucide-react';
import {
  MetricCard, EarningsChart, DonutChart,
  TransactionRow, FlowStep, formatINR,
} from './TransactionComponents';

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

// ✅ Payment API helper
const paymentApi = async (path, method = "GET", body = null) => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}/api/payment${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

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

// ✅ Build metrics from wallet + transactions
const buildMetrics = (wallet, transactions) => {
  const totalEarned    = wallet?.totalEarned    || 0;
  const balance        = wallet?.balance        || 0;
  const totalWithdrawn = wallet?.totalWithdrawn || 0;
  const platformFees   = wallet?.platformFeesPaid || 0;
  const pendingRelease = wallet?.pendingRelease || 0;

  const refunds = transactions
    .filter(t => t.type === 'Refund')
    .reduce((s, t) => s + t.amount, 0);

  return [
    { id: 1, label: 'Total Earned',    value: totalEarned,    subLabel: 'All time earnings',        subType: 'positive', icon: 'arrowDown', color: 'teal'  },
    { id: 2, label: 'Available',       value: balance,        subLabel: 'Ready to withdraw',         subType: 'positive', icon: 'wallet',    color: 'blue'  },
    { id: 3, label: 'Withdrawn',       value: totalWithdrawn, subLabel: 'Transferred to bank',       subType: 'neutral',  icon: 'arrowUp',   color: 'amber' },
    { id: 4, label: 'Pending Release', value: pendingRelease, subLabel: 'Awaiting client approval',  subType: 'warning',  icon: 'clock',     color: 'cyan'  },
    { id: 5, label: 'Platform Fees',   value: platformFees,   subLabel: '10% per milestone',         subType: 'negative', icon: 'percent',   color: 'rose'  },
    { id: 6, label: 'Refunds',         value: refunds,        subLabel: 'Returned to client',        subType: 'neutral',  icon: 'refresh',   color: 'amber' },
  ];
};

// ✅ Build chart data from transactions
const buildChartData = (transactions, monthOffset = 0) => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() - monthOffset;
  const days  = new Date(year, month + 1, 0).getDate();

  const dayMap = {};
  transactions
    .filter(t => {
      if (!t.isCredit) return false; // only incoming
      const d = new Date(t.dateValue || t.createdAt);
      return d.getMonth() === ((month + 12) % 12) && d.getFullYear() === year;
    })
    .forEach(t => {
      const day = new Date(t.dateValue || t.createdAt).getDate();
      dayMap[day] = (dayMap[day] || 0) + t.amount;
    });

  return Array.from({ length: Math.ceil(days / 5) }, (_, i) => {
    const day = (i + 1) * 5;
    return {
      label: `${day} ${now.toLocaleString('en-IN', { month: 'short' })}`,
      value: dayMap[day] || 0,
    };
  });
};

// ✅ Build donut breakdown
const buildBreakdown = (transactions) => {
  const groups = {
    'Milestone Payment': { label: 'Milestone Payments', color: '#0d9488', value: 0 },
    'Platform Fee':      { label: 'Platform Fees',       color: '#f59e0b', value: 0 },
    'Withdrawal':        { label: 'Withdrawals',          color: '#6366f1', value: 0 },
    'Refund':            { label: 'Refunds',              color: '#f43f5e', value: 0 },
  };

  transactions.forEach(t => {
    if (groups[t.type]) groups[t.type].value += t.amount;
  });

  const total = Object.values(groups).reduce((s, g) => s + g.value, 0);
  return {
    breakdown: Object.values(groups)
      .filter(g => g.value > 0)
      .map(g => ({ ...g, pct: total > 0 ? Math.round((g.value / total) * 100) : 0 })),
    total,
  };
};

// ─── Date Range Picker — SAME ─────────────────────────────────────────────────
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

// ─── Transactions Panel — SAME design, fixed sort ────────────────────────────
function TransactionsPanel({ transactions }) {
  const [typeFilter,   setTypeFilter]   = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search,       setSearch]       = useState('');
  const [sortDir,      setSortDir]      = useState('desc');
  const [showAll,      setShowAll]      = useState(false);
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  const filtered = useMemo(() => {
    let r = [...transactions];
    if (typeFilter !== 'All')   r = r.filter(t => t.type === typeFilter);
    if (statusFilter !== 'All') r = r.filter(t => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(t =>
        t.type.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.project || '').toLowerCase().includes(q)
      );
    }
    // ✅ Fixed: sort by date not id
    r.sort((a, b) => {
      const da = new Date(a.dateValue || a.createdAt);
      const db = new Date(b.dateValue || b.createdAt);
      return sortDir === 'desc' ? db - da : da - db;
    });
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
          : displayed.map((tx, i) => <TransactionRow key={tx._id || i} tx={tx} />)
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

// ─── Withdraw Modal — ✅ Updated: payment API + UPI/Bank ──────────────────────
function WithdrawModal({ onClose, availableBalance, upiId, onSuccess }) {
  const [amount,      setAmount]      = useState('');
  const [method,      setMethod]      = useState('upi');
  const [upiInput,    setUpiInput]    = useState(upiId || '');
  const [accountNo,   setAccountNo]   = useState('');
  const [ifsc,        setIfsc]        = useState('');
  const [accountName, setAccountName] = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async () => {
    const val = Number(amount);
    if (!val || val <= 0)                               { setError('Enter a valid amount'); return; }
    if (val > availableBalance)                         { setError('Amount exceeds available balance'); return; }
    if (method === 'upi' && !upiInput)                 { setError('Enter your UPI ID'); return; }
    if (method === 'bank' && (!accountNo || !ifsc || !accountName)) {
      setError('Fill all bank details'); return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = await paymentApi('/withdraw', 'POST', {
        amount: val,
        method,
        upiId:       method === 'upi'  ? upiInput   : undefined,
        bankDetails: method === 'bank' ? { accountNumber: accountNo, ifsc, accountName } : undefined,
      });
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

            {/* ✅ Method toggle */}
            <div className="grid grid-cols-2 gap-2">
              {['upi', 'bank'].map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    method === m ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600 hover:border-teal-300'
                  }`}>
                  {m === 'upi' ? '📱 UPI' : '🏦 Bank Transfer'}
                </button>
              ))}
            </div>

            {/* UPI field */}
            {method === 'upi' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">UPI ID</label>
                <input value={upiInput} onChange={e => setUpiInput(e.target.value)}
                  placeholder="name@upi"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
            )}

            {/* Bank fields */}
            {method === 'bank' && (
              <div className="space-y-2">
                <input value={accountName} onChange={e => setAccountName(e.target.value)}
                  placeholder="Account Holder Name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                <input value={accountNo} onChange={e => setAccountNo(e.target.value)}
                  placeholder="Account Number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                <input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())}
                  placeholder="IFSC Code"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
            )}

            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</label>
              <input type="number" placeholder="Enter amount" value={amount}
                onChange={e => { setAmount(e.target.value); setError(''); }} max={availableBalance}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400" />
              {amount && Number(amount) > availableBalance && (
                <p className="text-[10px] text-rose-500 font-medium">Amount exceeds available balance.</p>
              )}
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 pt-1">
              {[100, 500, 1000].map(q => (
                <button key={q} onClick={() => setAmount(String(Math.min(q, availableBalance)))}
                  className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:border-teal-400 hover:text-teal-600 transition-all">
                  ₹{q}
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
  const [dateRange,    setDateRange]    = useState(DATE_RANGES[0]);
  const [chartTab,     setChartTab]     = useState('this');
  const [showWithdraw, setShowWithdraw] = useState(false);

  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [metrics,          setMetrics]          = useState([]);
  const [transactions,     setTransactions]     = useState([]);
  const [chartThisMonth,   setChartThisMonth]   = useState([]);
  const [chartLastMonth,   setChartLastMonth]   = useState([]);
  const [breakdown,        setBreakdown]        = useState([]);
  const [totalBreakdown,   setTotalBreakdown]   = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [upiId,            setUpiId]            = useState('');

  // ✅ Fetch from payment API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [walletRes, txRes] = await Promise.all([
        paymentApi('/wallet'),
        paymentApi('/transactions'),
      ]);

      const wallet       = walletRes.wallet;
      const transactions = txRes.transactions || [];

      // Build all data on frontend
      const builtMetrics          = buildMetrics(wallet, transactions);
      const { breakdown, total }  = buildBreakdown(transactions);
      const thisMonthChart        = buildChartData(transactions, 0);
      const lastMonthChart        = buildChartData(transactions, 1);

      setAvailableBalance(wallet?.balance || 0);
      setUpiId(wallet?.upiId || '');
      setMetrics(builtMetrics);
      setTransactions(transactions);
      setChartThisMonth(thisMonthChart);
      setChartLastMonth(lastMonthChart);
      setBreakdown(breakdown);
      setTotalBreakdown(total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

      {/* ✅ Withdraw Modal — payment API */}
      {showWithdraw && (
        <WithdrawModal
          onClose={() => setShowWithdraw(false)}
          availableBalance={availableBalance}
          upiId={upiId}
          onSuccess={(newBal) => {
            setAvailableBalance(newBal);
            fetchData();
          }}
        />
      )}
    </div>
  );
}