import React, { useState, useMemo } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronLeft, ChevronRight, Lightbulb, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { accountNetPosition, netWorth as calcNetWorth } from '../utils/financeCalculator';
import { getMonthBounds, formatDateShort, formatCompact } from '../utils/formatters';

// Port of spendingSuggestionCandidates from HomeScreen.kt
// Returns ranked candidates so we can rotate (never show same tip type twice in a row)
function categoryControlTip(category) {
  const n = category.toLowerCase();
  if (n.includes('rent') || n.includes('housing')) return 'Review add-on housing charges and renegotiate when the lease renews.';
  if (n.includes('food') || n.includes('dining') || n.includes('restaurant')) return 'Set a weekly food limit and compare delivery vs dining costs.';
  if (n.includes('grocery')) return 'Plan purchases before shopping and reduce unplanned repeat trips.';
  if (n.includes('transport') || n.includes('fuel') || n.includes('cab')) return 'Compare public transport and shared rides before the next similar spend.';
  if (n.includes('shopping') || n.includes('clothes')) return 'Use a waiting period and a monthly cap before non-essential purchases.';
  if (n.includes('entertainment') || n.includes('movie')) return 'Set a monthly leisure allowance and choose activities that provide the most value.';
  if (n.includes('subscription') || n.includes('membership')) return 'Check for unused or overlapping subscriptions before the next renewal.';
  if (n.includes('utility') || n.includes('electric') || n.includes('internet')) return 'Compare the bill with previous months and review usage.';
  if (n.includes('health') || n.includes('medical')) return 'Check insurance coverage and review recurring medicine costs.';
  return 'Review the transactions in this category and set a realistic limit for next month.';
}

function spendingSuggestionCandidates(monthExpense, catPatterns, historicalCats, hasHistoricalData, money) {
  const spending = catPatterns.filter(([,c]) => c > 0);
  const highest = spending[0];
  if (!highest) return [{ type: 'EMPTY', text: 'Add expense transactions to receive spending suggestions.' }];
  const meaningful = Math.max(500, monthExpense * 0.03);
  const candidates = [];

  if (hasHistoricalData) {
    // NEW_EXPENSE: a category that never appeared before this month
    const newSpend = spending.find(([cat, c, [l]]) => !historicalCats.has(cat) && l === 0 && c >= meaningful);
    if (newSpend) candidates.push({
      type: 'NEW_EXPENSE',
      text: `${newSpend[0]} is a new expense at ${money(newSpend[1])}. ${categoryControlTip(newSpend[0])}`
    });

    // BIGGEST_SPIKE: largest absolute increase vs last month
    const spikes = spending.filter(([,c,[l,pct]]) => l > 0 && c - l >= meaningful && pct >= 10);
    const spike = spikes.sort((a,b) => (b[1]-b[2][0]) - (a[1]-a[2][0]))[0];
    if (spike) candidates.push({
      type: 'BIGGEST_SPIKE',
      text: `${spike[0]} increased the most: +${money(spike[1]-spike[2][0])} (${Math.round(spike[2][1])}%) from last month. ${categoryControlTip(spike[0])}`
    });
  }

  // HIGHEST_SPEND
  const [cat, curr, [prev]] = highest;
  const share = monthExpense > 0 ? Math.round(curr / monthExpense * 100) : 0;
  const stable = prev > 0 && Math.abs(curr - prev) < meaningful;
  candidates.push({
    type: 'HIGHEST_SPEND',
    text: stable
      ? `${cat} remains your highest spend at ${money(curr)} (${share}%), stable month to month. ${categoryControlTip(cat)}`
      : `${cat} is your highest spend at ${money(curr)} (${share}% of expenses). ${categoryControlTip(cat)}`
  });

  // SECONDARY_FOCUS
  if (spending[1]) {
    const [cat2, amt2] = spending[1];
    const share2 = monthExpense > 0 ? Math.round(amt2 / monthExpense * 100) : 0;
    candidates.push({
      type: 'SECONDARY_FOCUS',
      text: `${cat2} is your next major spend at ${money(amt2)} (${share2}%). ${categoryControlTip(cat2)}`
    });
  }

  // MONTHLY_PLAN
  candidates.push({
    type: 'MONTHLY_PLAN',
    text: `Plan next month's limit for ${cat} using this month's ${money(curr)} as the baseline. ${categoryControlTip(cat)}`
  });

  return candidates;
}

const LS_INSIGHT_KEY = 'fintrack_last_insight_type';

function pickInsight(monthOffset, monthExpense, lastExpense, catPatterns, lastCatPatterns, historicalCats, prevHistoricalCats) {
  const money = v => '\u20B9' + Math.round(v).toLocaleString('en-IN');

  // Calculate what last month's top insight type was (to avoid repeating it)
  const prevCandidates = spendingSuggestionCandidates(lastExpense, lastCatPatterns, prevHistoricalCats, prevHistoricalCats.size > 0, money);
  const prevType = prevCandidates[0]?.type || null;

  // Get this month's candidates and pick first that differs from last month's top
  const candidates = spendingSuggestionCandidates(monthExpense, catPatterns, historicalCats, historicalCats.size > 0, money);
  if (candidates.length === 0) return null;

  const rotated = candidates.find(c => c.type !== prevType) || candidates[0];
  return rotated.text;
}

function MonthPill({ label, canForward, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-1 bg-ft-card border border-ft-border rounded-2xl px-1 py-0.5">
      <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center text-ft-text hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-xs font-semibold text-ft-text w-24 text-center">{label}</span>
      <button
        onClick={onNext}
        disabled={!canForward}
        className={`w-8 h-8 flex items-center justify-center transition-colors ${canForward ? 'text-ft-text hover:text-white' : 'text-ft-border cursor-default'}`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export const Dashboard = ({ accounts, transactions, profile, setActiveTab }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const fmt = (v) => formatCompact(v, profile?.currencyCode || 'INR');

  const { start, end, label } = useMemo(() => getMonthBounds(monthOffset), [monthOffset]);
  const prevBounds  = useMemo(() => getMonthBounds(monthOffset - 1), [monthOffset]);
  const prevEnd     = prevBounds.end;
  const prevStart   = prevBounds.start;

  const monthTx   = useMemo(() => transactions.filter(t => t.date >= start && t.date <= end), [transactions, start, end]);
  const lastMonTx = useMemo(() => transactions.filter(t => t.date >= prevStart && t.date <= prevEnd), [transactions, prevStart, prevEnd]);
  const txUpToEnd = useMemo(() => transactions.filter(t => t.date <= end), [transactions, end]);
  const txUpToPrevEnd = useMemo(() => transactions.filter(t => t.date <= prevEnd), [transactions, prevEnd]);

  const monthIncome  = useMemo(() => monthTx.filter(t => t.type === 'Income').reduce((s,t) => s+t.amount, 0), [monthTx]);
  const monthExpense = useMemo(() => monthTx.filter(t => t.type === 'Expense').reduce((s,t) => s+t.amount, 0), [monthTx]);
  const lastIncome   = useMemo(() => lastMonTx.filter(t => t.type === 'Income').reduce((s,t) => s+t.amount, 0), [lastMonTx]);
  const lastExpense  = useMemo(() => lastMonTx.filter(t => t.type === 'Expense').reduce((s,t) => s+t.amount, 0), [lastMonTx]);
  const cashFlow     = monthIncome - monthExpense;
  const savingsRate  = monthIncome > 0 ? Math.round((cashFlow / monthIncome) * 100) : 0;

  const currentNW  = useMemo(() => calcNetWorth(accounts, txUpToEnd), [accounts, txUpToEnd]);
  const previousNW = useMemo(() => calcNetWorth(accounts, txUpToPrevEnd), [accounts, txUpToPrevEnd]);
  const nwChange   = currentNW - previousNW;

  // Category patterns for insight (port of expensePatterns())
  const catPatterns = useMemo(() => {
    const curr = {};
    const prev = {};
    monthTx.filter(t => t.type === 'Expense').forEach(t => { curr[t.category] = (curr[t.category]||0) + t.amount; });
    lastMonTx.filter(t => t.type === 'Expense').forEach(t => { prev[t.category] = (prev[t.category]||0) + t.amount; });
    return [...new Set([...Object.keys(curr), ...Object.keys(prev)])]
      .map(cat => {
        const c = curr[cat] || 0;
        const l = prev[cat] || 0;
        const pct = l > 0 ? ((c-l)/l*100) : (c > 0 ? 100 : 0);
        return [cat, c, [l, pct]];
      })
      .sort((a,b) => b[1]-a[1])
      .filter(x => x[1] > 0);
  }, [monthTx, lastMonTx]);

  // Historical categories for rotation context (all expense categories seen before this month)
  const historicalCats = useMemo(() => {
    const cutoff = start;
    return new Set(transactions.filter(t => t.type === 'Expense' && t.date < cutoff).map(t => t.category).filter(Boolean));
  }, [transactions, start]);

  const prevHistoricalCats = useMemo(() => {
    const cutoff = prevStart;
    return new Set(transactions.filter(t => t.type === 'Expense' && t.date < cutoff).map(t => t.category).filter(Boolean));
  }, [transactions, prevStart]);

  const lastCatPatterns = useMemo(() => {
    const curr = {}; const prev = {};
    lastMonTx.filter(t => t.type === 'Expense').forEach(t => { curr[t.category] = (curr[t.category]||0) + t.amount; });
    return [...new Set(Object.keys(curr))].map(cat => {
      const c = curr[cat] || 0;
      return [cat, c, [0, 0]];
    }).sort((a,b) => b[1]-a[1]);
  }, [lastMonTx]);

  const insight = useMemo(() =>
    pickInsight(monthOffset, monthExpense, lastExpense, catPatterns, lastCatPatterns, historicalCats, prevHistoricalCats),
    [monthOffset, monthExpense, lastExpense, catPatterns, lastCatPatterns, historicalCats, prevHistoricalCats]
  );

  const recentTx = useMemo(() => [...monthTx].sort((a,b) => b.date - a.date).slice(0,5), [monthTx]);

  // 12-week bar chart data (last 6 months)
  const barData = useMemo(() => {
    return Array.from({length: 6}, (_, i) => {
      const b = getMonthBounds(monthOffset - 5 + i);
      const tx = transactions.filter(t => t.date >= b.start && t.date <= b.end);
      return {
        month: b.label.split(' ')[0],
        income:  tx.filter(t=>t.type==='Income').reduce((s,t)=>s+t.amount,0),
        expense: tx.filter(t=>t.type==='Expense').reduce((s,t)=>s+t.amount,0),
      };
    });
  }, [transactions, monthOffset]);

  const StatCard = ({ label, value, sub, color = 'text-white', icon: Icon }) => (
    <div className="bg-ft-card border border-ft-border rounded-2xl p-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-ft-muted uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      </div>
      <div className={`text-xl font-bold font-mono tracking-tight ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-ft-muted">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Home</h1>
          <p className="text-ft-muted text-xs">Hi, {profile?.name || 'there'} 👋</p>
        </div>
        <MonthPill
          label={label}
          canForward={monthOffset < 0}
          onPrev={() => setMonthOffset(o => o-1)}
          onNext={() => { if (monthOffset < 0) setMonthOffset(o => o+1); }}
        />
      </div>

      {/* Net Worth hero */}
      <div
        className="bg-ft-primary/20 border border-ft-primary/30 rounded-2xl p-5 cursor-pointer hover:bg-ft-primary/25 transition-all"
        onClick={() => setActiveTab('insights')}
      >
        <div className="flex items-center gap-2 text-ft-muted text-xs font-medium mb-1">
          <Wallet className="w-3.5 h-3.5" />
          <span>Net Worth {monthOffset < 0 ? 'as of ' + label : ''}</span>
        </div>
        <div className={`text-3xl font-black font-mono tracking-tight ${currentNW >= 0 ? 'text-white' : 'text-ft-red'}`}>
          {formatCompact(currentNW, profile?.currencyCode || 'INR')}
        </div>
        {nwChange !== 0 && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${nwChange > 0 ? 'text-ft-green' : 'text-ft-red'}`}>
            {nwChange > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{fmt(Math.abs(nwChange))} vs last month</span>
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Income"   value={fmt(monthIncome)}  color="text-ft-green"  icon={ArrowDownRight} />
        <StatCard label="Expenses" value={fmt(monthExpense)} color="text-ft-red"    icon={ArrowUpRight}   />
        <div className="sm:col-span-1 col-span-2">
          <StatCard
            label="Cash Flow"
            value={(cashFlow >= 0 ? '+' : '') + fmt(cashFlow)}
            sub={`Savings rate: ${savingsRate}%`}
            color={cashFlow >= 0 ? 'text-ft-green' : 'text-ft-red'}
          />
        </div>
      </div>

      {/* Insight card */}
      {insight && (
        <div className="flex items-start gap-3 p-4 bg-ft-card border border-ft-border rounded-2xl">
          <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-ft-text leading-relaxed">{insight}</p>
        </div>
      )}

      {/* 6-month bar chart */}
      <div className="bg-ft-card border border-ft-border rounded-2xl p-4">
        <h2 className="text-xs font-bold text-ft-muted uppercase tracking-wider mb-3">6-Month Overview</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#C1C9C0" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#C1C9C0" fontSize={10} tickFormatter={v => '\u20B9'+(v/1000).toFixed(0)+'k'} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor:'#1C211C', borderColor:'#414942', borderRadius:'10px', fontSize:'11px' }}
                formatter={(v) => formatCompact(v, profile?.currencyCode || 'INR')}
              />
              <Bar dataKey="income"  name="Income"  fill="#2E7D32" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#C62828" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-ft-card border border-ft-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ft-border">
          <h2 className="text-xs font-bold text-ft-muted uppercase tracking-wider">Recent Activity</h2>
          <button onClick={() => setActiveTab('activity')} className="text-xs font-semibold text-ft-green hover:text-white transition-colors">
            View All →
          </button>
        </div>
        {recentTx.length === 0 ? (
          <div className="py-8 text-center text-ft-muted text-xs">No transactions this month.</div>
        ) : (
          <div className="divide-y divide-ft-border">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                    tx.type === 'Income' ? 'bg-ft-green/10 text-ft-green' :
                    tx.type === 'Transfer' ? 'bg-ft-blue/10 text-ft-blue' :
                    'bg-ft-red/10 text-ft-red'
                  }`}>
                    {tx.type === 'Income' ? '+' : tx.type === 'Transfer' ? '⇄' : '−'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ft-text truncate max-w-[180px]">{tx.note || tx.category}</div>
                    <div className="text-[11px] text-ft-muted">{tx.category} · {tx.account}</div>
                  </div>
                </div>
                <div className={`font-mono font-bold text-xs ${tx.type==='Income' ? 'text-ft-green' : tx.type==='Transfer' ? 'text-ft-blue' : 'text-ft-text'}`}>
                  {tx.type === 'Income' ? '+' : tx.type === 'Transfer' ? '' : '-'}{fmt(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account snapshots */}
      <div className="bg-ft-card border border-ft-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ft-border">
          <h2 className="text-xs font-bold text-ft-muted uppercase tracking-wider">Accounts</h2>
          <button onClick={() => setActiveTab('accounts')} className="text-xs font-semibold text-ft-green hover:text-white transition-colors">
            Manage →
          </button>
        </div>
        <div className="divide-y divide-ft-border">
          {accounts.map(acc => {
            const pos = accountNetPosition(acc, txUpToEnd);
            const isCC = acc.type === 'CREDIT_CARD';
            const utilPct = isCC && acc.creditLimit > 0 ? Math.round(Math.abs(pos) / acc.creditLimit * 100) : 0;
            return (
              <div key={acc.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-xs font-semibold text-ft-text">{acc.name}</div>
                  <div className="text-[11px] text-ft-muted">{acc.type === 'BANK' ? 'Bank' : acc.type === 'CASH_WALLET' ? 'Cash / Wallet' : 'Credit Card'}</div>
                  {isCC && acc.creditLimit > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-16 h-1 bg-ft-border rounded-full overflow-hidden">
                        <div className={`h-1 rounded-full ${utilPct > 30 ? 'bg-ft-orange' : 'bg-ft-green'}`} style={{ width: Math.min(utilPct,100)+'%' }} />
                      </div>
                      <span className={`text-[10px] font-mono ${utilPct > 30 ? 'text-ft-orange' : 'text-ft-muted'}`}>{utilPct}%</span>
                    </div>
                  )}
                </div>
                <span className={`font-mono font-bold text-sm ${pos >= 0 ? 'text-ft-green' : 'text-ft-red'}`}>
                  {formatCompact(pos, profile?.currencyCode || 'INR')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
