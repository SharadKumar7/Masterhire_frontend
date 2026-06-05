import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase, CheckCircle, Clock, XCircle,
  Wallet, Calendar, Star, ArrowUpDown,
  ChevronDown, Loader2,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

export default function ContractHistory() {
  const [contracts, setContracts]       = useState([]);
  const [metrics, setMetrics]           = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy]             = useState('recent');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res  = await fetch(`${BASE_URL}/api/freelancer/contracts`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setContracts(data.contracts || []);
        setMetrics(data.metrics    || {});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSortedContracts = useMemo(() => {
    let result = [...contracts];
    if (activeFilter !== 'All') {
      // Match both "Ongoing" and "Active" under one filter
      if (activeFilter === 'Ongoing') {
        result = result.filter(c => ['Ongoing', 'Active'].includes(c.status));
      } else {
        result = result.filter(c => c.status === activeFilter);
      }
    }
    if (sortBy === 'recent')          result.sort((a, b) => b.timestamp - a.timestamp);
    else if (sortBy === 'highest-earning') result.sort((a, b) => b.amount - a.amount);
    else if (sortBy === 'lowest-earning')  result.sort((a, b) => a.amount - b.amount);
    return result;
  }, [contracts, activeFilter, sortBy]);

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
        <div>
          <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Contract History</h1>
          <p className="text-slate-500 mt-1 text-sm">Track your past projects, earnings, and client feedback.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-teal-50 rounded-lg text-teal-600"><Briefcase className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.total || 0}</div>
              <div className="text-xs font-semibold text-slate-600">Total Contracts</div>
              <div className="text-[10px] text-slate-400">All time projects</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.completed || 0}</div>
              <div className="text-xs font-semibold text-slate-600">Completed</div>
              <div className="text-[10px] text-emerald-600 font-medium">Successfully delivered</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.ongoing || 0}</div>
              <div className="text-xs font-semibold text-slate-600">Ongoing</div>
              <div className="text-[10px] text-amber-600 font-medium">Currently in progress</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600"><XCircle className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.cancelled || 0}</div>
              <div className="text-xs font-semibold text-slate-600">Cancelled</div>
              <div className="text-[10px] text-rose-400">Not completed</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-md col-span-2 md:col-span-1 flex items-center space-x-4 bg-gradient-to-br from-teal-50 to-white">
            <div className="p-3 bg-teal-600 rounded-lg text-white"><Wallet className="w-6 h-6" /></div>
            <div>
              <div className="text-xl font-black text-teal-950">{formatCurrency(metrics.earnings)}</div>
              <div className="text-xs font-bold text-teal-800">Total Earnings</div>
              <div className="text-[10px] text-teal-600">From all contracts</div>
            </div>
          </div>
        </div>

        {/* Filter & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div className="flex bg-slate-200/70 p-1 rounded-lg max-w-max">
            {['All', 'Completed', 'Ongoing', 'Cancelled'].map((tab) => (
              <button key={tab} onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeFilter === tab ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}>
                {tab === 'All' ? 'All Contracts' : tab}
              </button>
            ))}
          </div>

          <div className="relative flex items-center space-x-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer">
              <option value="recent">Recent</option>
              <option value="highest-earning">Highest Earning</option>
              <option value="lowest-earning">Lowest Earning</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Contract Cards */}
        <div className="space-y-4">
          {filteredAndSortedContracts.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
              No project records matching your selected filter.
            </div>
          ) : (
            filteredAndSortedContracts.map((contract) => {
              const statusColors = {
                Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
                Ongoing:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
                Active:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    dot: 'bg-teal-500'    },
                Cancelled: { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500'    },
              }[contract.status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };

              const progressPct = contract.totalMilestones > 0
                ? Math.round((contract.completedMilestones / contract.totalMilestones) * 100)
                : contract.status === 'Completed' ? 100 : 50;

              return (
                <div key={contract.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-start gap-4">

                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${statusColors.dot}`} />

                  {/* Left: Title, status, client, tech stack */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{contract.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                        {contract.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>{contract.client}</span>
                      {contract.isVerified && (
                        <span className="text-teal-600 font-medium flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(contract.techStack || []).map((tech, i) => (
                        <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Middle: Dates & milestones */}
                  <div className="min-w-[180px] space-y-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {contract.startDate ? formatDate(contract.startDate) : ''}
                        {contract.endDate ? ` – ${formatDate(contract.endDate)}` : ' – Ongoing'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{contract.durationText}</div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-medium text-slate-600">
                        <span>{contract.completedMilestones}/{contract.totalMilestones} Milestones</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount, rating, CTA */}
                  <div className="min-w-[130px] flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">
                        {contract.status === 'Completed' ? 'Total Earned' : 'Agreed Price'}
                      </div>
                      <div className="text-base font-black text-slate-900">{formatCurrency(contract.amount)}</div>
                    </div>

                    <div className="text-xs text-slate-500">
                      {contract.status === 'Completed' && contract.rating ? (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-slate-700">{contract.rating}</span>
                          <span className="text-slate-400">({contract.reviewsCount} reviews)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {contract.status === 'Cancelled' ? 'No reviews' : 'No reviews yet'}
                        </span>
                      )}
                    </div>

                    <button
                      disabled={contract.status === 'Cancelled'}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition-colors ${
                        contract.status === 'Cancelled'
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                          : 'text-teal-600 border-teal-200 hover:bg-teal-50'
                      }`}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}