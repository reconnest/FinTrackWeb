import React, { useState } from 'react';
import { PieChart as ChartIcon, TrendingUp, TrendingDown, Layers, Target, DollarSign } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const CategoryAnalysis = ({ transactions, categories, formatINR }) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  // Filter transactions for selected month
  const monthTxs = transactions.filter(t => t.date.startsWith(selectedMonth));

  // Compute spend per category
  const categoryStats = categories.map(cat => {
    const spent = monthTxs
      .filter(t => t.category === cat.name && t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const isOverBudget = cat.budget > 0 && spent > cat.budget;
    const budgetPct = cat.budget > 0 ? Math.round((spent / cat.budget) * 100) : 0;

    return {
      ...cat,
      spent,
      isOverBudget,
      budgetPct
    };
  }).filter(c => c.group !== 'Income' && c.group !== 'Transfer');

  // Groups Summary (Needs, Wants, Savings)
  const groupStats = ['Needs', 'Wants', 'Savings'].map(group => {
    const spent = monthTxs
      .filter(t => t.group === group && t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: group,
      spent,
      color: group === 'Needs' ? '#3b82f6' : group === 'Wants' ? '#f59e0b' : '#8b5cf6'
    };
  });

  const totalSpent = groupStats.reduce((sum, g) => sum + g.spent, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Category & Budget Analysis</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Month-over-month variance, budget utilization and Needs/Wants/Savings grouping master.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
          </select>
        </div>
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {groupStats.map(g => {
          const pct = totalSpent > 0 ? Math.round((g.spent / totalSpent) * 100) : 0;
          return (
            <div key={g.name} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{g.name} Group</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {pct}% of Total
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {formatINR(g.spent)}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: g.color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Categories Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Budget Matrix */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Category Spending vs Target Budgets</h2>
          
          <div className="space-y-4">
            {categoryStats.map(cat => (
              <div key={cat.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({cat.group})</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-100">{formatINR(cat.spent)}</span>
                    {cat.budget > 0 && (
                      <span className="text-slate-400 text-[11px] ml-1">/ {formatINR(cat.budget)}</span>
                    )}
                  </div>
                </div>

                {cat.budget > 0 ? (
                  <div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${cat.isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(cat.budgetPct, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1">
                      <span className={cat.isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                        {cat.isOverBudget ? `Over budget by ${formatINR(cat.spent - cat.budget)}` : `${formatINR(cat.budget - cat.spent)} left`}
                      </span>
                      <span className="text-slate-400 font-mono">{cat.budgetPct}%</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 italic">No budget cap set</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Group Distribution Donut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Group Distribution</h2>
            <p className="text-xs text-slate-400 mb-4">Proportion of Needs, Wants, and Savings for {selectedMonth}</p>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={groupStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="spent"
                  >
                    {groupStats.map((entry, index) => (
                      <Cell key={`group-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val) => formatINR(val)}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            {groupStats.map(g => (
              <div key={g.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }}></div>
                  <span className="text-slate-300 font-medium">{g.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-100">{formatINR(g.spent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
