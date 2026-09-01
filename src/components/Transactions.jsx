import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FileDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const Transactions = ({ 
  transactions, 
  accounts, 
  categories, 
  onDeleteTransaction, 
  onOpenAddModal, 
  onOpenImportModal, 
  formatINR, 
  formatDate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  // Filter logic
  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAccount = selectedAccount === 'ALL' || t.accountId === selectedAccount;
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesType = selectedType === 'ALL' || t.type === selectedType;
    const matchesGroup = selectedGroup === 'ALL' || t.group === selectedGroup;

    return matchesSearch && matchesAccount && matchesCategory && matchesType && matchesGroup;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Account', 'Description', 'Category', 'Group', 'Type', 'Amount', 'Status', 'Notes'];
    const rows = filtered.map(t => {
      const acc = accounts.find(a => a.id === t.accountId)?.name || t.accountId;
      return [
        t.date,
        `"${acc}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.group}"`,
        t.type,
        t.amount,
        t.status,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transactions_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Transaction Ledger</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Automatic classification, transfer matching and issue detection. Showing {filtered.length} of {transactions.length} records.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenImportModal}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Import CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, category, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Groups</option>
              <option value="Needs">Needs</option>
              <option value="Wants">Wants</option>
              <option value="Savings">Savings</option>
              <option value="Income">Income</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="Income">Income (+)</option>
              <option value="Expense">Expense (-)</option>
              <option value="Transfer">Transfer (⇄)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Description & Notes</th>
                <th className="py-3.5 px-4">Category & Group</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const account = accounts.find(a => a.id === tx.accountId);
                  const isIncome = tx.type === 'Income';
                  const isTransfer = tx.type === 'Transfer';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatDate(tx.date)}
                      </td>

                      {/* Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-200 block">{account ? account.name : 'Unknown Account'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{account?.accountNumber}</span>
                      </td>

                      {/* Description & Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-100 truncate">{tx.description}</div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 italic truncate mt-0.5">{tx.notes}</div>
                        )}
                      </td>

                      {/* Category & Group */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-medium text-slate-200">{tx.category}</span>
                        </div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-semibold rounded ${
                          tx.group === 'Needs' ? 'bg-blue-500/15 text-blue-300' :
                          tx.group === 'Wants' ? 'bg-amber-500/15 text-amber-300' :
                          tx.group === 'Savings' ? 'bg-purple-500/15 text-purple-300' :
                          tx.group === 'Income' ? 'bg-emerald-500/15 text-emerald-300' :
                          'bg-slate-700/50 text-slate-300'
                        }`}>
                          {tx.group}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold">
                        <span className={isIncome ? 'text-emerald-400' : isTransfer ? 'text-indigo-400' : 'text-slate-100'}>
                          {isIncome ? '+' : isTransfer ? '' : '-'}{formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          tx.status === 'Reconciled' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {tx.status === 'Reconciled' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
