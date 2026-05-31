import React, { useState, useMemo } from 'react';
import {
  Briefcase, CheckCircle, Clock, XCircle, Star,
  Calendar, ArrowUpDown, ChevronDown, Download,
  ArrowUpRight, MonitorSmartphone, Palette, Smartphone,
  LayoutDashboard,
} from 'lucide-react';

// ─── Demo Data ────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    title: 'Grocery Delivery Web App',
    client: 'FreshCart Solutions',
    category: 'Web Development',
    startDate: '2024-03-10',
    endDate: '2024-04-25',
    duration: '1m 15d',
    techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    status: 'Completed',
    progress: 100,
    amount: 28000,
    rating: 4.9,
    reviewsCount: 18,
    description: 'Full-stack grocery delivery platform with user, rider and admin panels.',
    highlights: ['Real-time order tracking', 'Payment integration (Razorpay)', 'Admin analytics dashboard', 'Rider app'],
    timestamp: 1714003200000,
    thumbnail: 'grocery',
  },
  {
    id: 2,
    title: 'Personal Portfolio Website',
    client: 'Rohan Sharma',
    category: 'Web Design',
    startDate: '2024-05-01',
    endDate: '2024-05-15',
    duration: '15 days',
    techStack: ['Figma', 'HTML', 'CSS', 'JavaScript'],
    status: 'In Progress',
    progress: 75,
    amount: 8500,
    rating: null,
    reviewsCount: 0,
    description: 'Modern and responsive portfolio website for a UI/UX designer.',
    highlights: ['Homepage Design', 'About & Services Section', 'Portfolio Gallery', 'Contact Form'],
    timestamp: 1714608000000,
    thumbnail: 'portfolio',
  },
  {
    id: 3,
    title: 'Fitness Tracker Mobile App',
    client: 'FitLife India',
    category: 'Mobile App',
    startDate: '2024-01-15',
    endDate: '2024-03-05',
    duration: '1m 20d',
    techStack: ['React Native', 'Firebase', 'Redux', 'Expo'],
    status: 'Completed',
    progress: 100,
    amount: 22000,
    rating: 4.7,
    reviewsCount: 12,
    description: 'Cross-platform fitness tracking app with workout plans and progress analytics.',
    highlights: ['Workout Tracking', 'Progress Analytics', 'Diet Planner'],
    timestamp: 1709596800000,
    thumbnail: 'fitness',
  },
  {
    id: 4,
    title: 'E-commerce Admin Dashboard',
    client: 'ShopEase',
    category: 'Web Development',
    startDate: '2023-12-01',
    endDate: '2023-12-20',
    duration: '20 days',
    techStack: ['Vue.js', 'Vuex', 'Chart.js', 'SCSS'],
    status: 'Cancelled',
    progress: 40,
    amount: 5000,
    rating: null,
    reviewsCount: 0,
    description: 'Admin dashboard for managing products, orders and users.',
    highlights: [],
    cancelReason: 'Project cancelled by client',
    timestamp: 1703030400000,
    thumbnail: 'dashboard',
  },
  {
    id: 5,
    title: 'Restaurant Booking Platform',
    client: 'DineEasy Pvt. Ltd.',
    category: 'Web Development',
    startDate: '2024-02-01',
    endDate: '2024-03-10',
    duration: '38 days',
    techStack: ['Next.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
    status: 'Completed',
    progress: 100,
    amount: 35000,
    rating: 5.0,
    reviewsCount: 9,
    description: 'Online table reservation system with real-time availability and email confirmations.',
    highlights: ['Table Availability Calendar', 'SMS & Email Reminders', 'Admin Panel', 'Multi-restaurant support'],
    timestamp: 1710028800000,
    thumbnail: 'restaurant',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Thumbnail Placeholder ────────────────────────────────────────────────────
const THUMB_STYLES = {
  grocery:    { bg: 'from-emerald-100 to-teal-50',    text: 'text-teal-600',   Icon: Briefcase },
  portfolio:  { bg: 'from-blue-100 to-indigo-50',     text: 'text-blue-600',   Icon: Palette },
  fitness:    { bg: 'from-purple-100 to-violet-50',   text: 'text-purple-600', Icon: Smartphone },
  dashboard:  { bg: 'from-rose-100 to-pink-50',       text: 'text-rose-500',   Icon: LayoutDashboard },
  restaurant: { bg: 'from-amber-100 to-orange-50',    text: 'text-amber-600',  Icon: MonitorSmartphone },
};

function Thumbnail({ type }) {
  const s = THUMB_STYLES[type] || THUMB_STYLES.grocery;
  const Icon = s.Icon;
  return (
    <div className={`w-full h-full bg-gradient-to-br ${s.bg} flex items-center justify-center`}>
      <Icon className={`w-10 h-10 ${s.text} opacity-60`} />
    </div>
  );
}

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS = {
  Completed:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  'In Progress': { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   bar: 'bg-amber-400'   },
  Cancelled:   { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    bar: 'bg-rose-400'    },
};

// ─── Category Badge ───────────────────────────────────────────────────────────
const CAT_COLORS = {
  'Web Development': 'bg-teal-50 text-teal-700 border-teal-200',
  'Web Design':      'bg-blue-50 text-blue-700 border-blue-200',
  'Mobile App':      'bg-purple-50 text-purple-700 border-purple-200',
};

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS[project.status];
  const MAX_TECH = 4;
  const extraTech = project.techStack.length - MAX_TECH;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
      <div className="flex flex-col md:flex-row">

        {/* Thumbnail */}
        <div className="w-full md:w-48 h-36 md:h-auto rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden shrink-0">
          <Thumbnail type={project.thumbnail} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 flex flex-col md:flex-row gap-4">

          {/* Left: meta */}
          <div className="flex-1 space-y-2.5">
            {/* Title + status */}
            <div className="flex flex-wrap items-start gap-2">
              <h3 className="text-sm font-black text-slate-900 leading-snug">{project.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                {project.status}
              </span>
            </div>

            {/* Client + category */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Client: <span className="font-semibold text-slate-700">{project.client}</span></span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CAT_COLORS[project.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {project.category}
              </span>
            </div>

            {/* Dates + duration */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{formatDate(project.startDate)} – {project.endDate ? formatDate(project.endDate) : 'Ongoing'}</span>
              <span className="text-slate-300">|</span>
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{project.duration}</span>
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.slice(0, MAX_TECH).map((t, i) => (
                <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
              ))}
              {extraTech > 0 && (
                <span className="text-[10px] font-medium bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full border border-teal-100">+{extraTech}</span>
              )}
            </div>
          </div>

          {/* Middle: description + progress */}
          <div className="md:w-56 space-y-2.5">
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{project.description}</p>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                <span>
                  {project.status === 'In Progress' ? `${project.progress}% Completed` : project.status === 'Cancelled' ? `${project.progress}% done at cancellation` : 'Completed'}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Highlights or cancel reason */}
            {project.status === 'Cancelled' && project.cancelReason ? (
              <p className="text-[10px] text-rose-500 font-semibold">Reason: {project.cancelReason}</p>
            ) : (
              project.highlights.length > 0 && (
                <div className="space-y-0.5">
                  {(expanded ? project.highlights : project.highlights.slice(0, 2)).map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <CheckCircle className="w-3 h-3 text-teal-500 shrink-0" />
                      {h}
                    </div>
                  ))}
                  {project.highlights.length > 2 && (
                    <button
                      onClick={() => setExpanded(e => !e)}
                      className="text-[10px] font-bold text-teal-600 hover:text-teal-800 transition-colors"
                    >
                      {expanded ? '− less' : `+ ${project.highlights.length - 2} more`}
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* Right: amount + rating + actions */}
          <div className="md:w-36 flex flex-col items-start md:items-end gap-2.5">
            <div className="text-right">
              <div className="text-xl font-black text-slate-900">{formatINR(project.amount)}</div>
              <div className="text-[10px] text-slate-400">{project.status === 'Completed' ? 'Total Earnings' : 'Agreed Price'}</div>
            </div>

            {/* Rating */}
            {project.status === 'Completed' && project.rating ? (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-800">{project.rating}</span>
                <span className="text-[10px] text-slate-400">({project.reviewsCount})</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400">
                {project.status === 'Cancelled' ? 'No rating' : 'Awaiting review'}
              </span>
            )}

            {/* Buttons */}
            <button
              disabled={project.status === 'Cancelled'}
              className={`flex items-center gap-1.5 w-full justify-center px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                project.status === 'Cancelled'
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> View Details
            </button>
            <button className="flex items-center gap-1.5 w-full justify-center px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all">
              <Download className="w-3.5 h-3.5" /> Download Files
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectHistory() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  // Metrics
  const metrics = useMemo(() => ({
    total: PROJECTS.length,
    completed: PROJECTS.filter(p => p.status === 'Completed').length,
    inProgress: PROJECTS.filter(p => p.status === 'In Progress').length,
    cancelled: PROJECTS.filter(p => p.status === 'Cancelled').length,
    avgRating: (() => {
      const rated = PROJECTS.filter(p => p.rating);
      return rated.length ? (rated.reduce((s, p) => s + p.rating, 0) / rated.length).toFixed(1) : '—';
    })(),
    totalReviews: PROJECTS.reduce((s, p) => s + p.reviewsCount, 0),
  }), []);

  // Filter + sort
  const displayed = useMemo(() => {
    let r = [...PROJECTS];
    if (activeFilter !== 'All') r = r.filter(p => p.status === activeFilter);
    if (sortBy === 'recent')          r.sort((a, b) => b.timestamp - a.timestamp);
    else if (sortBy === 'highest')    r.sort((a, b) => b.amount - a.amount);
    else if (sortBy === 'lowest')     r.sort((a, b) => a.amount - b.amount);
    else if (sortBy === 'rating')     r.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return r;
  }, [activeFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mb-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-teal-900 tracking-tight">Project History</h1>
          <p className="text-slate-500 mt-1 text-sm">
            All the projects you have worked on.{' '}
            <span className="text-teal-600 font-semibold">Showcase your skills and experience.</span>
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 rounded-lg text-teal-600"><Briefcase className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.total}</div>
              <div className="text-xs font-semibold text-slate-600">Total Projects</div>
              <div className="text-[10px] text-slate-400">All time</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.completed}</div>
              <div className="text-xs font-semibold text-slate-600">Completed</div>
              <div className="text-[10px] text-emerald-600 font-medium">
                {((metrics.completed / metrics.total) * 100).toFixed(1)}% success rate
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.inProgress}</div>
              <div className="text-xs font-semibold text-slate-600">In Progress</div>
              <div className="text-[10px] text-amber-600 font-medium">Currently active</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-lg text-rose-500"><XCircle className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{metrics.cancelled}</div>
              <div className="text-xs font-semibold text-slate-600">Cancelled</div>
              <div className="text-[10px] text-rose-400">Not completed</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-md col-span-2 md:col-span-1 flex items-center gap-4 bg-gradient-to-br from-teal-50 to-white">
            <div className="p-3 bg-teal-600 rounded-lg text-white"><Star className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-black text-teal-950">{metrics.avgRating}</div>
              <div className="text-xs font-bold text-teal-800">Avg. Rating</div>
              <div className="text-[10px] text-teal-600">From {metrics.totalReviews} reviews</div>
            </div>
          </div>
        </div>

        {/* Filter + Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          {/* Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-lg max-w-max">
            {['All', 'Completed', 'In Progress', 'Cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeFilter === tab
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'All Projects' : tab}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="recent">Recent</option>
              <option value="highest">Highest Earning</option>
              <option value="lowest">Lowest Earning</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          {displayed.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
              No projects matching your selected filter.
            </div>
          ) : (
            displayed.map(p => <ProjectCard key={p.id} project={p} />)
          )}
        </div>

      </div>
    </div>
  );
}