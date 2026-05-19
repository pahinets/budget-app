import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

const mockData = [
  { name: "Day 1", income: 4000, expense: 2400 },
  { name: "Day 2", income: 3000, expense: 1398 },
  { name: "Day 3", income: 2000, expense: 9800 },
  { name: "Day 4", income: 2780, expense: 3908 },
  { name: "Day 5", income: 1890, expense: 4800 },
  { name: "Day 6", income: 2390, expense: 3800 },
  { name: "Day 7", income: 3490, expense: 4300 },
];

export default function Dashboard() {
  const [stats] = useState({
    totalBalance: 12450.50,
    monthlyIncome: 5200.00,
    monthlyExpense: 3100.25,
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Welcome back, let's look at your finances.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Balance"
          value={`$${stats.totalBalance.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-indigo-600" />}
          change="+12.5%"
          isNeutral
        />
        <StatCard
          title="Monthly Income"
          value={`$${stats.monthlyIncome.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          change="+8.2%"
          isPositive
        />
        <StatCard
          title="Monthly Expense"
          value={`$${stats.monthlyExpense.toLocaleString()}`}
          icon={<TrendingDown className="w-6 h-6 text-rose-600" />}
          change="-4.5%"
          isPositive={false}
        />
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Cash Flow Trends</h3>
          <select className="chart-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        <div style={{ height: "350px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, change, isPositive, isNeutral }: any) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon">
          {icon}
        </div>
        {!isNeutral && (
          <div className={`stat-badge ${isPositive ? "positive" : "negative"}`}>
            {isPositive ? <ArrowUpRight style={{width: 12, height: 12, marginRight: 4}} /> : <ArrowDownRight style={{width: 12, height: 12, marginRight: 4}} />}
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
