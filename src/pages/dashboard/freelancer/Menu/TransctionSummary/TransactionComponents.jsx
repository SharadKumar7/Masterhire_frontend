import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet, CreditCard, Clock, Lock, ArrowUpCircle, Percent,
  ArrowDownCircle, ArrowUpRight, RefreshCw, CheckCircle,
  TrendingUp, TrendingDown, Minus, ChevronRight, Building2,
} from 'lucide-react';

// ─── Formatters ───────────────────────────────────────────────────────────────
export const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

// ─── Icon Map ─────────────────────────────────────────────────────────────────
export const ICON_MAP = {
  wallet: Wallet,
  creditCard: CreditCard,
  clock: Clock,
  lock: Lock,
  arrowUp: ArrowUpCircle,
  arrowDown: ArrowDownCircle,
  percent: Percent,
  refresh: RefreshCw,
  checkCircle: CheckCircle,
  bank: Building2,
  arrowUpRight: ArrowUpRight,
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Paid:      'bg-teal-100 text-teal-700 border border-teal-200',
  Completed: 'bg-blue-100 text-blue-700 border border-blue-200',
  Deducted:  'bg-amber-100 text-amber-700 border border-amber-200',
  Refunded:  'bg-rose-100 text-rose-700 border border-rose-200',
  Pending:   'bg-slate-100 text-slate-600 border border-slate-200',
};

export function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>
      {status}
    </span>
  );
}

// ─── Transaction Type Icon ────────────────────────────────────────────────────
const TYPE_ICON_STYLES = {
  arrowDown: 'bg-teal-50 text-teal-600',
  arrowUp:   'bg-rose-50 text-rose-500',
  percent:   'bg-amber-50 text-amber-600',
  refresh:   'bg-purple-50 text-purple-500',
};

export function TxTypeIcon({ typeIcon }) {
  const Icon = ICON_MAP[typeIcon] || ArrowDownCircle;
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_ICON_STYLES[typeIcon] || 'bg-slate-100 text-slate-500'}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
const METRIC_ICON_COLORS = {
  teal:  'bg-teal-600 text-white',
  blue:  'bg-blue-500 text-white',
  amber: 'bg-amber-500 text-white',
  cyan:  'bg-cyan-500 text-white',
  rose:  'bg-rose-500 text-white',
};

export function MetricCard({ label, value, subLabel, subType, icon, color }) {
  const Icon = ICON_MAP[icon] || Wallet;
  const subColor = {
    positive: 'text-teal-600',
    negative: 'text-rose-500',
    warning:  'text-amber-500',
    neutral:  'text-slate-500',
  }[subType];
  const SubIcon = subType === 'positive' ? TrendingUp : subType === 'negative' ? TrendingDown : Minus;

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

// ─── SVG Area Chart ───────────────────────────────────────────────────────────
export function EarningsChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const W = 600, H = 200, PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = 0;

  const xScale = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v) => PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.value), ...d }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${PAD.top + innerH} L ${points[0].x} ${PAD.top + innerH} Z`;

  const yTicks = [0, 10000, 20000, 30000];

  return (
    <div className="relative w-full" style={{ paddingBottom: '36%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y-axis ticks */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={PAD.left} y1={yScale(t)}
              x2={PAD.left + innerW} y2={yScale(t)}
              stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4"
            />
            <text x={PAD.left - 8} y={yScale(t) + 4} textAnchor="end"
              fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
              ₹{t === 0 ? '0' : t / 1000 + 'K'}
            </text>
          </g>
        ))}

        {/* X-axis labels — show every 3rd */}
        {points.filter((_, i) => i % 2 === 0).map(p => (
          <text key={p.label} x={p.x} y={H - 8} textAnchor="middle"
            fontSize="9" fill="#94a3b8" fontFamily="sans-serif">
            {p.label}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Interactive points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r="5"
            fill="white" stroke="#0d9488" strokeWidth="2.5"
            className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            onMouseEnter={() => setTooltip(p)}
          />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + innerH}
              stroke="#0d9488" strokeWidth="1" strokeDasharray="4 3" />
            <rect
              x={Math.min(tooltip.x - 52, W - 120)} y={tooltip.y - 42}
              width="110" height="36" rx="8"
              fill="white" stroke="#ccfbf1" strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }}
            />
            <text x={Math.min(tooltip.x - 52, W - 120) + 55} y={tooltip.y - 26}
              textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="sans-serif">
              {tooltip.label}
            </text>
            <text x={Math.min(tooltip.x - 52, W - 120) + 55} y={tooltip.y - 12}
              textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f766e" fontFamily="sans-serif">
              {formatINR(tooltip.value)}
            </text>
            <circle cx={tooltip.x} cy={tooltip.y} r="5"
              fill="white" stroke="#0d9488" strokeWidth="2.5" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
export function DonutChart({ data, total }) {
  const [hovered, setHovered] = useState(null);
  const R = 70, CX = 90, CY = 90, STROKE = 22;
  const circumference = 2 * Math.PI * R;

  let cumulative = 0;
  const segments = data.map(d => {
    const dash = (d.pct / 100) * circumference;
    const offset = circumference - cumulative;
    cumulative += dash;
    return { ...d, dash, offset };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* bg ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={hovered === i ? STROKE + 4 : STROKE}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${CX} ${CY})`}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize="15" fontWeight="800"
            fill="#0f172a" fontFamily="sans-serif">{formatINR(total)}</text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10"
            fill="#94a3b8" fontFamily="sans-serif">Total</text>
        </svg>
      </div>

      <div className="space-y-2 flex-1">
        {data.map((d, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-150 cursor-default ${hovered === i ? 'bg-slate-50' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
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

// ─── Transaction Row ──────────────────────────────────────────────────────────
export function TransactionRow({ tx }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-teal-50/40 transition-colors rounded-lg px-2 -mx-2 cursor-default group">
      <TxTypeIcon typeIcon={tx.typeIcon} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 truncate">{tx.type}</span>
        </div>
        <div className="text-[10px] text-slate-400 truncate">{tx.description}</div>
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

// ─── Payment Flow Step ────────────────────────────────────────────────────────
const FLOW_COLORS = {
  teal:  'bg-teal-600 text-white',
  blue:  'bg-blue-500 text-white',
  amber: 'bg-amber-500 text-white',
};

export function FlowStep({ step, isLast }) {
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
      {!isLast && (
        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mb-5" />
      )}
    </div>
  );
}