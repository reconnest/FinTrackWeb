import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import { ChevronLeft, ChevronRight, PieChart as PieIcon, TrendingUp, Sparkles, Award } from 'lucide-react';
import { formatCurrency, formatCompact, monthLabel, getMonthBounds } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categoryIcons';

const CHART_COLORS = ['#00E676', '#00D2FF', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#14B8A6', '#6366F1'];
const FILTERS = ['All', 'Income', 'Expense'];

function BiggestDaysCard({ days, totalExpense, monthLabel, fmt }) {
  if (!days || days.length === 0) return null;
  const medals = ['🥇','🥈','🥉'];

  return (
    <div className="bg-neo-card border border-neo-border rounded-3xl p-5 shadow-neo-card space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-neo-gold" />
        <div>
          <h2 className="text-sm font-bold text-white">Biggest Spending Days</h2>
          <p className="text-[11px] text-neo-muted">Top 3 highest burn days in {monthLabel}</p>
        </div>
      </div>

      <div className="space-y-3">
        {days.map((d, i) => {
          const pct = totalExpense > 0 ? Math.round(d.amount / totalExpense * 100) : 0;
          return (
            <div key={d.day} className="flex items-center gap-3 bg-neo-surface border border-neo-border/60 rounded-2xl p-3">
              <span className="text-xl w-7 text-center">{medals[i] || '•'}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Day {d.day}</span>
                    <span className="text-[10px] text-neo-muted">({d.count} txns)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-neo-coral">{fmt(d.amount)}</span>
                    <span className="text-[10px] text-neo-muted">({pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-neo-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neo-crimson to-neo-coral rounded-full"
                    style={{ width: `${days[0].amount > 0 ? (d.amount / days[0].amount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const InsightsScreen = ({ transactions, profile, isMasked }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');

  const currency = profile?.currencyCode || 'INR';
  const fmt = (v) => formatCurrency(v, currency, isMasked);
  const fmtC = (v) => formatCompact(v, currency, isMasked);

  const { start, end } = useMemo(() => getMonthBounds(monthOffset), [monthOffset]);
  const label = useMemo(() => monthLabel(monthOffset), [monthOffset]);

  const monthTx = useMemo(() => transactions.filter(t => t.date >= start && t.date <= end), [transactions, start, end]);

  const income  = useMemo(() => monthTx.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const expense = useMemo(() => monthTx.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

  // Top spending days
  const topSpendingDays = useMemo(() => {
    const byDay = {};
    monthTx.filter(t => t.type === 'Expense').forEach(t => {
      const day = new Date(t.date).getDate();
      if (!byDay[day]) byDay[day] = { day, amount: 0, count: 0 };
      byDay[day].amount += t.amount;
      byDay[day].count  += 1;
    });
    return Object.values(byDay).sort((a,b) => b.amount - a.amount).slice(0, 3);
  }, [monthTx]);

  // Donut category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    monthTx.filter(t => t.type === 'Expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value], i) => ({
        name,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
        pct: expense > 0 ? Math.round((value / expense) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthTx, expense]);

  // Daily Activity area chart data
  const daysInMonth = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
    return d.getDate();
  }, [monthOffset]);

  const dailyData = useMemo(() => {
    const arr = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const txs = monthTx.filter(t => new Date(t.date).getDate() === day);
      const inc = txs.filter(t => t.type === 'Income').reduce((s,t) => s+t.amount, 0);
      const exp = txs.filter(t => t.type === 'Expense').reduce((s,t) => s+t.amount, 0);
      arr.push({ day: String(day), Income: inc, Expense: exp, Net: inc - exp });
    }
    return arr;
  }, [monthTx, daysInMonth]);

  return (
    <div className="space-y-6 pb-12">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Spending Analytics</h1>
          <p className="text-xs text-neo-muted">Insights & category intelligence</p>
        </div>

        <div className="flex items-center bg-neo-surface border border-neo-border rounded-2xl p-1 shadow-sm">
          <button onClick={() => setMonthOffset(p => p - 1)} className="p-1.5 text-neo-muted hover:text-white hover:bg-neo-card rounded-xl transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs sm:text-sm font-bold text-white tracking-tight">{label}</span>
          <button onClick={() => setMonthOffset(p => p + 1)} className="p-1.5 text-neo-muted hover:text-white hover:bg-neo-card rounded-xl transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neo-card border border-neo-border rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-neo-muted">Total Income</span>
          <div className="text-lg font-black font-mono text-neo-neonGreen mt-1">{fmt(income)}</div>
        </div>
        <div className="bg-neo-card border border-neo-border rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-neo-muted">Total Expense</span>
          <div className="text-lg font-black font-mono text-neo-coral mt-1">{fmt(expense)}</div>
        </div>
        <div className="bg-neo-card border border-neo-border rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-neo-muted">Savings Rate</span>
          <div className="text-lg font-black font-mono text-neo-cyan mt-1">{savingsRate}%</div>
        </div>
        <div className="bg-neo-card border border-neo-border rounded-2xl p-4">
          <span className="text-[10px] uppercase font-bold text-neo-muted">Net Cash Flow</span>
          <div className={`text-lg font-black font-mono mt-1 ${(income - expense) >= 0 ? 'text-neo-neonGreen' : 'text-neo-coral'}`}>
            {fmt(income - expense)}
          </div>
        </div>
      </div>

      {/* Top Spending Days */}
      {topSpendingDays.length > 0 && (
        <BiggestDaysCard days={topSpendingDays} totalExpense={expense} monthLabel={label} fmt={fmt} />
      )}

      {/* Expense Donut & Category Mix */}
      {expense > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Donut Chart */}
          <div className="bg-neo-card border border-neo-border rounded-3xl p-5 shadow-neo-card space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-neo-purple" /> Expense Mix
            </h3>
            <div className="h-60 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={90}
                    paddingAngle={3} dataKey="value" stroke="#131822" strokeWidth={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-neo-surface border border-neo-border rounded-xl p-3 shadow-2xl text-xs space-y-1">
                            <p className="font-bold text-white">{data.name}</p>
                            <p className="font-mono text-neo-neonGreen">{fmt(data.value)} ({data.pct}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-neo-muted">Total Burn</span>
                <span className="text-base font-black font-mono text-white">{fmt(expense)}</span>
              </div>
            </div>
          </div>

          {/* Category Ranked Drivers */}
          <div className="bg-neo-card border border-neo-border rounded-3xl p-5 shadow-neo-card space-y-3">
            <h3 className="text-sm font-bold text-white">Top Spending Categories</h3>
            <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
              {categoryData.map((c) => {
                const meta = getCategoryMeta(c.name);
                return (
                  <div key={c.name} className="bg-neo-surface border border-neo-border/60 rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{meta.emoji}</span>
                        <span className="font-bold text-white">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{fmt(c.value)}</span>
                        <span className="text-[10px] text-neo-muted">({c.pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-neo-bg rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neo-card border border-neo-border rounded-3xl p-12 text-center text-xs text-neo-muted">
          No expense records logged in {label} to generate category donut breakdown.
        </div>
      )}

      {/* Daily Cash Flow Area Chart */}
      <div className="bg-neo-card border border-neo-border rounded-3xl p-5 shadow-neo-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Daily Cashflow Trend</h3>
            <p className="text-[11px] text-neo-muted">Day-by-day activity for {label}</p>
          </div>
          <div className="flex items-center gap-1 bg-neo-surface border border-neo-border rounded-xl p-1">
            {FILTERS.map(f => (
              <button
                key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeFilter === f ? 'bg-neo-card text-neo-neonGreen shadow-sm' : 'text-neo-muted hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E676" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4757" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF4757" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#8E9BAE" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#8E9BAE" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtC(v)} />
              <Tooltip
                content={({ active, payload, label: dayLabel }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-neo-surface border border-neo-border rounded-xl p-3 shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-white">Day {dayLabel} {label}</p>
                        {payload.map(p => (
                          <p key={p.name} style={{ color: p.color }} className="font-mono">
                            {p.name}: {fmt(p.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(activeFilter === 'All' || activeFilter === 'Income') && (
                <Area type="monotone" dataKey="Income" stroke="#00E676" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
              )}
              {(activeFilter === 'All' || activeFilter === 'Expense') && (
                <Area type="monotone" dataKey="Expense" stroke="#FF4757" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
