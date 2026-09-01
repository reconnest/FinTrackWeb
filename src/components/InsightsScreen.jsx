import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { getMonthBounds, formatCompact } from '../utils/formatters';

const CHART_COLORS = ['#C62828','#E65100','#F9A825','#6A1B9A','#1565C0','#546E7A'];
const FILTERS = ['All','Income','Expense'];
// ── Top spending days (BiggestDaysCard) ──────────────────────────────────────
function BiggestDaysCard({ days, totalExpense, monthLabel, fmt }) {
  if (!days || days.length === 0) return null;
  return (
    <div className="bg-ft-card border border-ft-border rounded-2xl p-4 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-white">Biggest Spending Days</h2>
        <p className="text-[11px] text-ft-muted mt-0.5">Top 3 highest expense days in {monthLabel}</p>
      </div>
      <div className="space-y-2.5">
        {days.map((d, i) => {
          const pct = totalExpense > 0 ? Math.round(d.amount / totalExpense * 100) : 0;
          const medals = ['🥇','🥈','🥉'];
          return (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-base w-6 text-center">{medals[i]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ft-text">Day {d.day}</span>
                    <span className="text-[10px] text-ft-muted">{d.count} transaction{d.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ft-red">{fmt(d.amount)}</span>
                    <span className="text-[10px] text-ft-muted">{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-ft-border rounded-full overflow-hidden">
                  <div className="h-1.5 bg-ft-red rounded-full"
                    style={{ width: (days[0].amount > 0 ? d.amount / days[0].amount * 100 : 0) + '%' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



function MonthPill({ label, canForward, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-1 bg-ft-card border border-ft-border rounded-2xl px-1 py-0.5">
      <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center text-ft-text hover:text-white">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-xs font-semibold text-ft-text w-24 text-center">{label}</span>
      <button onClick={onNext} disabled={!canForward}
        className={`w-8 h-8 flex items-center justify-center ${canForward ? 'text-ft-text hover:text-white' : 'text-ft-border cursor-default'}`}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export const InsightsScreen = ({ transactions, profile }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [filter, setFilter] = useState('All');
  const currency = profile?.currencyCode || 'INR';
  const fmt = v => formatCompact(v, currency);

  const { start, end, label, month, year } = useMemo(() => getMonthBounds(monthOffset), [monthOffset]);

  const monthTx = useMemo(() =>
    transactions.filter(t => t.date >= start && t.date <= end),
    [transactions, start, end]
  );

  const income  = useMemo(() => monthTx.filter(t => t.type === 'Income').reduce((s,t)=>s+t.amount, 0), [monthTx]);
  const expense = useMemo(() => monthTx.filter(t => t.type === 'Expense').reduce((s,t)=>s+t.amount, 0), [monthTx]);
  const cashFlow = income - expense;

  // Top spending days (port of BiggestDaysCard from InsightsScreen.kt)
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
  const cashFlowRate = income > 0 ? Math.round((cashFlow / income) * 100) : 0;

  const daysInMonth = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    return d.getDate();
  }, [year, month]);

  const dailyAvg = daysInMonth > 0 ? expense / daysInMonth : 0;

  // Daily chart data
  const dailyData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayTx = monthTx.filter(t => {
        const d = new Date(t.date);
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      });
      return {
        day: String(day),
        income:  dayTx.filter(t => t.type === 'Income').reduce((s,t)=>s+t.amount, 0),
        expense: dayTx.filter(t => t.type === 'Expense').reduce((s,t)=>s+t.amount, 0),
      };
    });
  }, [monthTx, daysInMonth, month, year]);

  // Expense slices for donut
  const expenseSlices = useMemo(() => {
    const grouped = {};
    monthTx.filter(t => t.type === 'Expense').forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(grouped).sort((a,b) => b[1]-a[1]);
    const top5 = sorted.slice(0, 5);
    const otherAmt = sorted.slice(5).reduce((s,[,v]) => s+v, 0);
    if (otherAmt > 0) top5.push(['Other', otherAmt]);
    return top5.map(([label, amount]) => ({ label, amount }));
  }, [monthTx]);

  // Drivers (categories) for the selected filter
  const drivers = useMemo(() => {
    const typeFilter = filter === 'All' ? ['Income','Expense'] : [filter];
    const grouped = {};
    monthTx.filter(t => typeFilter.includes(t.type)).forEach(t => {
      const key = t.category || t.type;
      if (!grouped[key]) grouped[key] = { label: key, type: t.type, amount: 0 };
      grouped[key].amount += t.amount;
    });
    return Object.values(grouped).sort((a,b) => b.amount - a.amount);
  }, [monthTx, filter]);

  const topDrivers = drivers.slice(0, 6);
  const maxDriverAmt = topDrivers[0]?.amount || 1;

  const StatCard = ({ label, value, sub, color='text-white' }) => (
    <div className="bg-ft-card border border-ft-border rounded-2xl p-4">
      <div className="text-[11px] font-semibold text-ft-muted uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
      <div className="text-[11px] text-ft-muted mt-0.5">{sub}</div>
    </div>
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-white tracking-tight">Insights</h1>
        <MonthPill label={label} canForward={monthOffset < 0}
          onPrev={() => setMonthOffset(o=>o-1)}
          onNext={() => { if(monthOffset<0) setMonthOffset(o=>o+1); }} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Daily Avg Spend" value={fmt(dailyAvg)} sub={`Across ${daysInMonth} days`} color="text-ft-red" />
        <StatCard
          label={cashFlow >= 0 ? 'Income Kept' : 'Overspent'}
          value={income > 0 ? Math.abs(cashFlowRate)+'%' : '--'}
          sub={cashFlow >= 0 ? 'Of monthly income' : 'Above income'}
          color={cashFlow >= 0 ? 'text-ft-green' : 'text-ft-red'}
        />
        <StatCard label="Transactions" value={monthTx.length.toString()} sub={label} color="text-white" />
        <StatCard
          label="Cash Flow"
          value={(cashFlow > 0 ? '+' : '') + fmt(cashFlow)}
          sub="Income minus Expense"
          color={cashFlow >= 0 ? 'text-ft-green' : 'text-ft-red'}
        />
      </div>

      {/* Top Spending Days */}
      {topSpendingDays.length > 0 && (
        <BiggestDaysCard days={topSpendingDays} totalExpense={expense} monthLabel={label} fmt={fmt} />
      )}

      {/* Expense Donut */}
      {expense > 0 && (
        <div className="bg-ft-card border border-ft-border rounded-2xl p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Expense Mix</h2>
              <p className="text-[11px] text-ft-muted mt-0.5">
                {expenseSlices.slice(0,3).map(s=>s.label).join(', ')} lead spending
              </p>
            </div>
            <span className="font-mono font-bold text-ft-red text-sm">{fmt(expense)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseSlices} dataKey="amount" nameKey="label"
                    cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3}>
                    {expenseSlices.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:'#1C211C', borderColor:'#414942', borderRadius:'8px', fontSize:'11px' }}
                    formatter={v => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {expenseSlices.map((slice, i) => {
                const pct = expense > 0 ? Math.round(slice.amount / expense * 100) : 0;
                return (
                  <div key={slice.label}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-ft-text font-medium truncate max-w-[100px]">{slice.label}</span>
                      </div>
                      <span className="font-mono font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>{pct}%</span>
                    </div>
                    <div className="mt-1 w-full h-1 bg-ft-border rounded-full overflow-hidden">
                      <div className="h-1 rounded-full" style={{ width: pct+'%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Daily Activity Line Chart */}
      <div className="bg-ft-card border border-ft-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Activity</h2>
            <p className="text-[11px] text-ft-muted">Daily totals for {label}</p>
          </div>
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  filter === f ? 'bg-ft-primary text-white' : 'text-ft-muted bg-ft-bg hover:text-white'
                }`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#C1C9C0" fontSize={9} tickLine={false} axisLine={false}
                interval={Math.floor(daysInMonth / 6)} />
              <YAxis stroke="#C1C9C0" fontSize={9} tickFormatter={v => v>0 ? '\u20B9'+(v/1000).toFixed(0)+'k':''} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor:'#1C211C', borderColor:'#414942', borderRadius:'8px', fontSize:'10px' }}
                formatter={v => fmt(v)} />
              {(filter === 'All' || filter === 'Income') &&
                <Line type="monotone" dataKey="income" stroke="#2E7D32" strokeWidth={2} dot={false} name="Income" />}
              {(filter === 'All' || filter === 'Expense') &&
                <Line type="monotone" dataKey="expense" stroke="#C62828" strokeWidth={2} dot={false} name="Expense" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2">
          {(filter==='All'||filter==='Income') && <div className="flex items-center gap-1 text-[10px] text-ft-muted"><span className="w-3 h-0.5 bg-ft-green inline-block" /> Income</div>}
          {(filter==='All'||filter==='Expense') && <div className="flex items-center gap-1 text-[10px] text-ft-muted"><span className="w-3 h-0.5 bg-ft-red inline-block" /> Expense</div>}
        </div>
      </div>

      {/* Top Drivers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Top {filter} Drivers</h2>
            <p className="text-[11px] text-ft-muted">Categories shaping {label}</p>
          </div>
          <span className="text-[11px] text-ft-muted">{topDrivers.length} of {drivers.length} shown</span>
        </div>
        {topDrivers.length === 0 ? (
          <div className="bg-ft-card border border-ft-border rounded-2xl py-8 text-center text-ft-muted text-xs">
            No {filter.toLowerCase()} drivers for {label}.
          </div>
        ) : (
          <div className="bg-ft-card border border-ft-border rounded-2xl divide-y divide-ft-border overflow-hidden">
            {topDrivers.map((d, i) => {
              const pct = maxDriverAmt > 0 ? d.amount / maxDriverAmt : 0;
              return (
                <div key={d.label} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-ft-muted text-[11px] font-mono w-4">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-ft-text truncate">{d.label}</span>
                      <span className={`font-mono font-bold text-xs ${d.type==='Income'?'text-ft-green':'text-ft-red'}`}>{fmt(d.amount)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-ft-border rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${d.type==='Income'?'bg-ft-green':'bg-ft-red'}`} style={{ width: (pct*100)+'%' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
