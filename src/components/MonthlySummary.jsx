import React from 'react';
import { CalendarRange, TrendingUp, FileDown, ArrowUpRight } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

export const MonthlySummary = ({ monthlySummary, formatINR }) => {
  const handleExportCSV = () => {
    const headers = ['Month', 'Income', 'Needs', 'Wants', 'Savings', 'Net Cash Flow', 'Net Worth'];
    const rows = monthlySummary.map(m => [
      m.month,
      m.income,
      m.needs,
      m.wants,
      m.savings,
      m.netFlow,
      m.netWorth
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Monthly_Finance_Summary_12M.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">12-Month Financial Summary</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Historical income, expenses, cash flow surplus and long-term net worth trajectory.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export 12M Summary CSV</span>
          </button>
        </div>
      </div>

      {/* Net Worth Trajectory Area Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Net Worth Growth Trajectory</h2>
            <p className="text-xs text-slate-400">Total Asset appreciation and liability reduction</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            +₹4,03,100 (12M Growth)
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySummary} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val) => formatINR(val)}
              />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#netWorthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12-Month Matrix Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Month</th>
                <th className="py-3.5 px-4 text-right">Income</th>
                <th className="py-3.5 px-4 text-right">Needs</th>
                <th className="py-3.5 px-4 text-right">Wants</th>
                <th className="py-3.5 px-4 text-right">Savings</th>
                <th className="py-3.5 px-4 text-right">Net Cash Flow</th>
                <th className="py-3.5 px-4 text-right">Net Worth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {monthlySummary.map(row => (
                <tr key={row.month} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">{row.month}</td>
                  <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">{formatINR(row.income)}</td>
                  <td className="py-3.5 px-4 text-right text-blue-400">{formatINR(row.needs)}</td>
                  <td className="py-3.5 px-4 text-right text-amber-400">{formatINR(row.wants)}</td>
                  <td className="py-3.5 px-4 text-right text-purple-400">{formatINR(row.savings)}</td>
                  <td className={`py-3.5 px-4 text-right font-bold ${row.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatINR(row.netFlow, true)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-100 font-bold">{formatINR(row.netWorth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
