import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Reconciliation = ({ accounts, reconciliations, onUpdateReconciliation, formatINR }) => {
  const [actualBalances, setActualBalances] = useState({});

  const handleBalanceChange = (accountId, val) => {
    setActualBalances(prev => ({
      ...prev,
      [accountId]: val
    }));
  };

  const handleReconcile = (account) => {
    const actual = Number(actualBalances[account.id] !== undefined ? actualBalances[account.id] : account.balance);
    const ledger = account.balance;
    const variance = actual - ledger;
    const isMatched = Math.abs(variance) <= 1; // Within ₹1 threshold rule

    onUpdateReconciliation({
      id: 'rec-st-' + account.id,
      date: new Date().toISOString().slice(0, 10),
      accountId: account.id,
      accountName: account.name,
      actualClosingBalance: actual,
      ledgerClosingBalance: ledger,
      variance: variance,
      status: isMatched ? 'Matched' : 'Flagged for Review'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Statement Reconciliation</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Paste actual closing balances from bank statements. A variance within ₹1 is matched; anything else is flagged for review.
          </p>
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Account Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Ledger Closing Balance</th>
                <th className="py-3.5 px-4 text-right">Actual Statement Balance</th>
                <th className="py-3.5 px-4 text-right">Variance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {accounts.map(acc => {
                const rec = reconciliations.find(r => r.accountId === acc.id);
                const actual = actualBalances[acc.id] !== undefined ? Number(actualBalances[acc.id]) : (rec ? rec.actualClosingBalance : acc.balance);
                const variance = actual - acc.balance;
                const isMatched = Math.abs(variance) <= 1;

                return (
                  <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {acc.name}
                      <span className="text-[10px] text-slate-400 block font-mono">{acc.accountNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{acc.type}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                      {formatINR(acc.balance)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <input
                        type="number"
                        defaultValue={rec ? rec.actualClosingBalance : acc.balance}
                        onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                        className="w-32 text-right bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${Math.abs(variance) <= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatINR(variance, true)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                        isMatched 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                      }`}>
                        {isMatched ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{isMatched ? 'Matched (≤ ₹1)' : 'Flagged (> ₹1)'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleReconcile(acc)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all inline-flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Verify</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">How Statement Reconciliation Works:</p>
          <p>
            When you receive your monthly bank or credit card e-statement, type the closing balance into the "Actual Statement Balance" column. 
            The system instantly calculates variance against all logged transactions. 
            If variance is within ₹1.00, it marks the account as green and verified.
          </p>
        </div>
      </div>
    </div>
  );
};
