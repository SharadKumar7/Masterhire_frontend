// ─── Metric Cards ────────────────────────────────────────────────────────────
export const METRICS = [
  {
    id: 'total-earnings',
    label: 'Total Earnings',
    value: 124500,
    subLabel: '18.6% vs Apr',
    subType: 'positive',
    icon: 'wallet',
    color: 'teal',
  },
  {
    id: 'available-balance',
    label: 'Available Balance',
    value: 24350,
    subLabel: 'Ready to withdraw',
    subType: 'neutral',
    icon: 'creditCard',
    color: 'blue',
  },
  {
    id: 'pending-payments',
    label: 'Pending Payments',
    value: 18700,
    subLabel: 'From 3 contracts',
    subType: 'warning',
    icon: 'clock',
    color: 'amber',
  },
  {
    id: 'escrow-balance',
    label: 'Escrow Balance',
    value: 32000,
    subLabel: 'In active contracts',
    subType: 'neutral',
    icon: 'lock',
    color: 'cyan',
  },
  {
    id: 'withdrawn',
    label: 'Withdrawn',
    value: 75000,
    subLabel: '12.4% vs Apr',
    subType: 'positive',
    icon: 'arrowUp',
    color: 'teal',
  },
  {
    id: 'platform-fees',
    label: 'Platform Fees',
    value: 6450,
    subLabel: '8.2% vs Apr',
    subType: 'negative',
    icon: 'percent',
    color: 'rose',
  },
];

// ─── Earnings Chart Data ──────────────────────────────────────────────────────
export const CHART_DATA_THIS_MONTH = [
  { label: 'May 01', value: 8000 },
  { label: 'May 04', value: 10500 },
  { label: 'May 07', value: 9200 },
  { label: 'May 10', value: 13000 },
  { label: 'May 13', value: 11500 },
  { label: 'May 16', value: 14200 },
  { label: 'May 19', value: 18450 },
  { label: 'May 22', value: 22000 },
  { label: 'May 25', value: 17500 },
  { label: 'May 28', value: 15000 },
  { label: 'May 31', value: 12000 },
];

export const CHART_DATA_LAST_MONTH = [
  { label: 'Apr 01', value: 6000 },
  { label: 'Apr 04', value: 9000 },
  { label: 'Apr 07', value: 7500 },
  { label: 'Apr 10', value: 11000 },
  { label: 'Apr 13', value: 10200 },
  { label: 'Apr 16', value: 13500 },
  { label: 'Apr 19', value: 15800 },
  { label: 'Apr 22', value: 18000 },
  { label: 'Apr 25', value: 14200 },
  { label: 'Apr 28', value: 11500 },
  { label: 'Apr 30', value: 9800 },
];

// ─── Earnings Breakdown ───────────────────────────────────────────────────────
export const BREAKDOWN_DATA = [
  { label: 'Project Payments', value: 98000, pct: 78.7, color: '#2dd4bf' },  // teal-400
  { label: 'Milestone Payments', value: 18000, pct: 14.5, color: '#60a5fa' }, // blue-400
  { label: 'Bonus / Tips', value: 6500, pct: 5.2, color: '#34d399' },          // emerald-400
  { label: 'Other Earnings', value: 2000, pct: 1.6, color: '#fbbf24' },        // amber-400
];

// ─── Recent Transactions ──────────────────────────────────────────────────────
export const TRANSACTIONS = [
  {
    id: 1,
    type: 'Milestone Payment',
    typeIcon: 'arrowDown',
    description: 'Milestone 3 Approved',
    project: 'E-commerce Website',
    amount: 10000,
    isCredit: true,
    status: 'Paid',
    date: 'May 28, 2024',
    time: '11:30 AM',
  },
  {
    id: 2,
    type: 'Project Payment',
    typeIcon: 'arrowDown',
    description: 'Final Payment Received',
    project: 'Mobile App UI/UX',
    amount: 15000,
    isCredit: true,
    status: 'Paid',
    date: 'May 25, 2024',
    time: '04:20 PM',
  },
  {
    id: 3,
    type: 'Withdrawal',
    typeIcon: 'arrowUp',
    description: 'Bank Transfer to ****4321',
    project: '—',
    amount: 20000,
    isCredit: false,
    status: 'Completed',
    date: 'May 22, 2024',
    time: '09:15 AM',
  },
  {
    id: 4,
    type: 'Milestone Payment',
    typeIcon: 'arrowDown',
    description: 'Milestone 2 Approved',
    project: 'Portfolio Website',
    amount: 5000,
    isCredit: true,
    status: 'Paid',
    date: 'May 20, 2024',
    time: '02:45 PM',
  },
  {
    id: 5,
    type: 'Platform Fee',
    typeIcon: 'percent',
    description: 'Service Fee Deducted',
    project: 'E-commerce Website',
    amount: 850,
    isCredit: false,
    status: 'Deducted',
    date: 'May 20, 2024',
    time: '02:45 PM',
  },
  {
    id: 6,
    type: 'Refund',
    typeIcon: 'refresh',
    description: 'Refund to Client',
    project: 'Logo Design',
    amount: 2000,
    isCredit: false,
    status: 'Refunded',
    date: 'May 18, 2024',
    time: '01:10 PM',
  },
];

// ─── Payment Flow Steps ───────────────────────────────────────────────────────
export const PAYMENT_FLOW = [
  { label: 'Client Pays', sub: 'into Escrow', icon: 'lock', color: 'teal' },
  { label: 'Milestone', sub: 'Approved', icon: 'checkCircle', color: 'blue' },
  { label: 'Amount Added to', sub: 'Your Wallet', icon: 'clock', color: 'amber' },
  { label: 'Withdraw to your', sub: 'Bank Account', icon: 'bank', color: 'teal' },
];