import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight,
  ArrowDownLeft, Sparkles, Wallet, CreditCard, ChevronRight as ChevronRightIcon,
  Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { accountNetPosition, netWorth as calcNetWorth } from '../utils/financeCalculator';
import { formatCurrency, formatCompact, formatDate, monthLabel, getMonthBounds } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categoryIcons';

function categoryControlTip(category) {
  const n = category.toLowerCase();
  if (n.includes('rent') || n.includes('housing')) return 'Review recurring housing charges and negotiate on renewal.';
  if (n.includes('food') || n.includes('dining'))  return 'Set a weekly dining cap and compare delivery vs cooking.';
  if (n.includes('grocery')) return 'Plan groceries in bulk to avoid repeat unplanned trips.';
  if (n.includes('transport') || n.includes('fuel')) return 'Optimize commute routes or mix in public transit.';
  if (n.includes('shopping')) return 'Try a 48-hour cool-off rule before purchasing non-essentials.';
  if (n.includes('entertainment')) return 'Audit subscriptions for maximum value.';
  return 'Set a realistic baseline budget for this category next month.';
}

function spendingSuggestionCandidates(monthExpense, catPatterns, historicalCats, hasHistoricalData, money) {
  const spending = catPatterns.filter(([,c]) => c > 0);
  const highest = spending[0];
  if (!highest) return [{ type: 'EMPTY', text: 'Log daily expenses to unlock smart AI spending suggestions.' }];
  const meaningful = Math.max(500, monthExpense * 0.03);
  const candidates = [];

  if (hasHistoricalData) {
    const newSpend = spending.find(([cat, c, [l]]) => !historicalCats.has(cat) && l === 0 && c >= meaningful);
    if (newSpend) candidates.push({
      type: 'NEW_EXPENSE',
      text: `${newSpend[0]} is a new spend at ${money(newSpend[1])}. ${categoryControlTip(newSpend[0])}`
    });

    const spikes = spending.filter(([,c,[l,pct]]) => l > 0 && c - l >= meaningful && pct >= 10);
    const spike = spikes.sort((a,b) => (b[1]-b[2][0]) - (a[1]-a[2][0]))[0];
    if (spike) candidates.push({
      type: 'BIGGEST_SPIKE',
      text: `${spike[0]} spiked most: +${money(spike[1]-spike[2][0])} (${Math.round(spike[2][1])}%) vs last month. ${categoryControlTip(spike[0])}`
    });
  }

  const [cat, curr, [prev]] = highest;
  const share = monthExpense > 0 ? Math.round(curr / monthExpense * 100) : 0;
  candidates.push({
    type: 'HIGHEST_SPEND',
    text: `${cat} is your top spend at ${money(curr)} (${share}% of spend). ${categoryControlTip(cat)}`
  });

  return candidates;
}

export const Dashboard = ({ accounts, transactions, profile, setActiveTab, onInspectTx, isMasked }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const currency = profile?.currencyCode || 'INR';

  const fmt = (v) => formatCurrency(v, currency, isMasked);
  const fmtC = (v) => formatCompact(v, currency, isMasked);

  const { start, end } = useMemo(() => getMonthBounds(monthOffset), [monthOffset]);
  const { start: prevStart, end: prevEnd } = useMemo(() => getMonthBounds(monthOffset - 1), [monthOffset]);

  const monthTx = useMemo(() => transactions.filter(t => t.date >= start && t.date <= end), [transactions, start, end]);
  const prevMonthTx = useMemo(() => transactions.filter(t => t.date >= prevStart && t.date <= prevEnd), [transactions, prevStart, prevEnd]);

  const monthIncome = useMemo(() => monthTx.filter(t => t.type === 'Income').reduce((s,t) => s + t.amount, 0), [monthTx]);
  const monthExpense = useMemo(() => monthTx.filter(t => t.type === 'Expense').reduce((s,t) => s + t.amount, 0), [monthTx]);
  const netCashFlow = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? Math.max(0, Math.round((netCashFlow / monthIncome) * 100)) : 0;

  const currentNetWorth = useMemo(() => calcNetWorth(accounts, transactions), [accounts, transactions]);

  const catPatterns = useMemo(() => {
    const curr = {}; const prev = {};
    monthTx.filter(t => t.type === 'Expense').forEach(t => { curr[t.category] = (curr[t.category]||0) + t.amount; });
    prevMonthTx.filter(t => t.type === 'Expense').forEach(t => { prev[t.category] = (prev[t.category]||0) + t.amount; });
    return [...new Set([...Object.keys(curr), ...Object.keys(prev)])].map(cat => {
      const c = curr[cat] || 0;
      const l = prev[cat] || 0;
      const pct = l > 0 ? ((c - l) / l) * 100 : 0;
      return [cat, c, [l, pct]];
    }).sort((a,b) => b[1]-a[1]);
  }, [monthTx, prevMonthTx]);

  const historicalCats = useMemo(() => {
    return new Set(transactions.filter(t => t.type === 'Expense' && t.date < start).map(t => t.category).filter(Boolean));
  }, [transactions, start]);

  const insight = useMemo(() => {
    const moneyStr = (v) => formatCompact(v, currency, isMasked);
    const candidates = spendingSuggestionCandidates(monthExpense, catPatterns, historicalCats, historicalCats.size > 0, moneyStr);
    return candidates[0]?.text || 'Track daily to build your financial intelligence.';
  }, [monthExpense, catPatterns, historicalCats, currency, isMasked]);

  const sixMonthData = useMemo(() => {
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const b = getMonthBounds(monthOffset - i);
      const txs = transactions.filter(t => t.date >= b.start && t.date <= b.end);
      const inc = txs.filter(t => t.type === 'Income').reduce((s,t) => s+t.amount, 0);
      const exp = txs.filter(t => t.type === 'Expense').reduce((s,t) => s+t.amount, 0);
      list.push({
        name: monthLabel(monthOffset - i).split(' ')[0],
        Income: inc,
        Expense: exp,
      });
    }
    return list;
  }, [transactions, monthOffset]);

  const accountsWithPos = useMemo(() => {
    return accounts.map(a => ({ ...a, position: accountNetPosition(a, transactions) }));
  }, [accounts, transactions]);

  const recentTx = useMemo(() => {
    return [...transactions].sort((a, b) => b.date - a.date).slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Month Selector Capsule Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neo-surface border border-neo-border rounded-2xl p-1 shadow-sm">
            <button onClick={() => setMonthOffset(p => p - 1)} className="p-1.5 text-neo-muted hover:text-white hover:bg-neo-card rounded-xl transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-bold text-white tracking-tight">
              {monthLabel(monthOffset)}
            </span>
            <button onClick={() => setMonthOffset(p => p + 1)} className="p-1.5 text-neo-muted hover:text-white hover:bg-neo-card rounded-xl transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {monthOffset !== 0 && (
            <button onClick={() => setMonthOffset(0)} className="px-2.5 py-1.5 text-[10px] font-bold bg-neo-card text-neo-cyan border border-neo-border rounded-xl hover:border-neo-cyan/40 transition-all">
              Current
            </button>
          )}
        </div>
        <div className="text-[11px] font-semibold text-neo-muted">{monthTx.length} items</div>
      </div>

      {/* Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-neo-surface via-neo-card to-[#121927] border border-neo-border rounded-3xl p-6 shadow-neo-card">
          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neo-muted">Total Net Position</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight mt-1">
                  {fmt(currentNetWorth)}
                </div>
              </div>
              <div className="px-3 py-1 bg-neo-neonGreen/10 border border-neo-neonGreen/20 rounded-full flex items-center gap-1.5 text-neo-neonGreen text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{savingsRate}% Saved</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-neo-bg/60 border border-neo-border/80 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-neo-neonGreen text-[11px] font-bold mb-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Income
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-white">{fmt(monthIncome)}</div>
              </div>

              <div className="bg-neo-bg/60 border border-neo-border/80 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-neo-coral text-[11px] font-bold mb-1">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Expense
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-white">{fmt(monthExpense)}</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-neo-muted mb-1.5">
                <span>Monthly Cash Flow: <b className={netCashFlow >= 0 ? 'text-neo-neonGreen' : 'text-neo-coral'}>{fmt(netCashFlow)}</b></span>
                <span>Burn Rate: {monthIncome > 0 ? Math.min(100, Math.round((monthExpense / monthIncome) * 100)) : 0}%</span>
              </div>
              <div className="w-full h-2 bg-neo-border/80 rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-neo-emerald to-neo-neonGreen rounded-full transition-all duration-500" style={{ width: `${Math.min(100, savingsRate)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[#1A162B] to-neo-card border border-neo-purple/30 rounded-3xl p-5 shadow-neo-card flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-2 text-neo-purple text-xs font-black uppercase tracking-wider mb-2.5">
              <Sparkles className="w-4 h-4 text-neo-purple" />
              <span>Smart Insight</span>
            </div>
            <p className="text-xs sm:text-sm text-neo-text font-medium leading-relaxed">
              "{insight}"
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-neo-border/40 flex items-center justify-between">
            <span className="text-[10px] text-neo-muted">Monthly trend</span>
            <button onClick={() => setActiveTab('insights')} className="text-xs font-bold text-neo-purple hover:text-white flex items-center gap-1 transition-colors">
              Analytics <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Account Virtual Card Deck Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-neo-cyan" />
            <h2 className="text-sm font-bold text-white tracking-tight">Cards & Accounts</h2>
          </div>
          <button onClick={() => setActiveTab('accounts')} className="text-xs font-semibold text-neo-cyan hover:underline">
            Manage ({accounts.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accountsWithPos.slice(0, 3).map((acc) => {
            const isCC = acc.type === 'CREDIT_CARD';
            const liability = isCC ? Math.abs(acc.position) : 0;
            const util = isCC && acc.creditLimit > 0 ? Math.round(liability / acc.creditLimit * 100) : 0;

            return (
              <div key={acc.name} className="relative bg-gradient-to-br from-neo-card to-neo-surface border border-neo-border hover:border-neo-borderLight rounded-2xl p-4 shadow-sm transition-all hover:scale-[1.01]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isCC ? 'bg-neo-crimson/15 text-neo-crimson' : acc.type === 'CASH_WALLET' ? 'bg-neo-amber/15 text-neo-amber' : 'bg-neo-cyan/15 text-neo-cyan'
                    }`}>
                      {isCC ? <CreditCard className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{acc.name}</div>
                      <div className="text-[10px] text-neo-muted capitalize">{acc.type.replace('_',' ').toLowerCase()}</div>
                    </div>
                  </div>
                  {isCC && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${util > 30 ? 'bg-neo-coral/15 text-neo-coral' : 'bg-neo-neonGreen/15 text-neo-neonGreen'}`}>
                      {util}% Limit
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-neo-border/50">
                  <span className="text-[10px] text-neo-muted">{isCC ? 'Outstanding' : 'Available Balance'}</span>
                  <div className={`text-lg font-bold font-mono ${acc.position >= 0 ? 'text-neo-neonGreen' : 'text-neo-coral'}`}>
                    {fmt(acc.position)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: 6-Month Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-neo-card border border-neo-border rounded-3xl p-5 shadow-neo-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">6-Month Cash Flow</h3>
              <p className="text-[11px] text-neo-muted">Income vs Expenses history</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-neo-neonGreen font-semibold">
                <span className="w-2 h-2 rounded-full bg-neo-neonGreen" /> Income
              </span>
              <span className="flex items-center gap-1 text-neo-coral font-semibold">
                <span className="w-2 h-2 rounded-full bg-neo-coral" /> Expense
              </span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sixMonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#8E9BAE" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8E9BAE" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtC(v)} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-neo-surface border border-neo-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-neo-neonGreen">Income: {fmt(payload[0]?.value)}</p>
                          <p className="text-neo-coral">Expense: {fmt(payload[1]?.value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Income" fill="#00E676" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Expense" fill="#FF4757" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-neo-card border border-neo-border rounded-3xl p-5 shadow-neo-card flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <button onClick={() => setActiveTab('activity')} className="text-xs font-semibold text-neo-cyan hover:underline">
                View All
              </button>
            </div>
            {recentTx.length === 0 ? (
              <div className="py-12 text-center text-xs text-neo-muted">No transactions logged yet.</div>
            ) : (
              <div className="divide-y divide-neo-border/50">
                {recentTx.map((tx) => {
                  const meta = getCategoryMeta(tx.category);
                  const isInc = tx.type === 'Income';
                  const isTrf = tx.type === 'Transfer';
                  return (
                    <div
                      key={tx.id}
                      onClick={() => onInspectTx && onInspectTx(tx)}
                      className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-neo-surface/80 px-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border ${meta.bg} ${meta.border}`}>
                          {meta.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[180px]">
                            {tx.note || tx.category}
                          </div>
                          <div className="text-[10px] text-neo-muted truncate">
                            {tx.account} · {formatDate(tx.date).split(' ').slice(0,2).join(' ')}
                          </div>
                        </div>
                      </div>
                      <div className={`text-right font-mono font-bold text-xs ${
                        isInc ? 'text-neo-neonGreen' : isTrf ? 'text-neo-cyan' : 'text-neo-text'
                      }`}>
                        {isInc ? '+' : isTrf ? '' : '-'}{fmt(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
