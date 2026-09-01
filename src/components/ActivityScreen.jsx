import React, { useState, useMemo } from 'react';
import { Search, FileDown, Trash2, Copy, Edit2, X } from 'lucide-react';
import { formatDate, formatCompact } from '../utils/formatters';
import { exportCSV } from '../utils/backup';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

export const ActivityScreen = ({
  transactions, accounts, incomeCategories, expenseCategories,
  onDelete, onBulkDelete, onEdit, onCopy, profile
}) => {
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterAccount, setFilterAccount] = useState('ALL');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [selected, setSelected]     = useState(new Set());

  const currency = profile?.currencyCode || 'INR';
  const toast   = useToast();
  const confirm = useConfirm();
  const fmt = v => formatCompact(v, currency);
  const accountNames = useMemo(() => ['ALL', ...accounts.map(a => a.name)], [accounts]);

  const filtered = useMemo(() => {
    const q   = search.toLowerCase();
    const tsFrom = dateFrom ? new Date(dateFrom).getTime() : null;
    const tsTo   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null;
    return transactions
      .filter(t => {
        const matchSearch  = !q || t.note?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.account.toLowerCase().includes(q);
        const matchType    = filterType === 'ALL'    || t.type    === filterType;
        const matchAccount = filterAccount === 'ALL' || t.account === filterAccount;
        const matchFrom    = !tsFrom || t.date >= tsFrom;
        const matchTo      = !tsTo   || t.date <= tsTo;
        return matchSearch && matchType && matchAccount && matchFrom && matchTo;
      })
      .sort((a, b) => b.date - a.date);
  }, [transactions, search, filterType, filterAccount, dateFrom, dateTo]);

  const hasDateFilter = dateFrom || dateTo;

  const clearFilters = () => {
    setSearch(''); setFilterType('ALL'); setFilterAccount('ALL');
    setDateFrom(''); setDateTo(''); setSelected(new Set());
  };

  const toggleSelect = id => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(t => t.id)));

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    const ok = await confirm(`Permanently delete ${selected.size} transaction(s)? This cannot be undone.`, { title: 'Delete Transactions' });
    if (ok) { onBulkDelete([...selected]); setSelected(new Set()); toast.success(`Deleted ${selected.size} transaction(s).`); }
  };

  const TypeBadge = ({ type }) => (
    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded ${
      type === 'Income'   ? 'bg-ft-green/10 text-ft-green' :
      type === 'Transfer' ? 'bg-ft-blue/10  text-ft-blue'  :
      'bg-ft-red/10 text-ft-red'
    }`}>{type}</span>
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Activity</h1>
          <p className="text-ft-muted text-xs">{filtered.length} of {transactions.length} transactions</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-ft-red bg-ft-red/10 border border-ft-red/20 rounded-xl hover:bg-ft-red/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Delete {selected.size}
            </button>
          )}
          <button onClick={() => exportCSV(filtered, currency)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-ft-text bg-ft-card border border-ft-border rounded-xl hover:bg-ft-border/30 transition-all">
            <FileDown className="w-3.5 h-3.5 text-ft-green" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Row 1: Search + Type + Account */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ft-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search note, category, account..."
              className="w-full bg-ft-card border border-ft-border rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-ft-border focus:outline-none focus:border-ft-green" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-ft-card border border-ft-border rounded-xl px-3 py-2 text-xs text-ft-text focus:outline-none focus:border-ft-green">
            <option value="ALL">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="Transfer">Transfer</option>
          </select>
          <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)}
            className="bg-ft-card border border-ft-border rounded-xl px-3 py-2 text-xs text-ft-text focus:outline-none focus:border-ft-green">
            {accountNames.map(n => <option key={n} value={n}>{n === 'ALL' ? 'All Accounts' : n}</option>)}
          </select>
        </div>

        {/* Row 2: Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-ft-card border border-ft-border rounded-xl px-3 py-1.5">
            <label className="text-[10px] font-semibold text-ft-muted uppercase tracking-wide whitespace-nowrap">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent text-xs text-ft-text focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 bg-ft-card border border-ft-border rounded-xl px-3 py-1.5">
            <label className="text-[10px] font-semibold text-ft-muted uppercase tracking-wide whitespace-nowrap">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-transparent text-xs text-ft-text focus:outline-none" />
          </div>
          {(search || filterType !== 'ALL' || filterAccount !== 'ALL' || hasDateFilter) && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-ft-muted bg-ft-card border border-ft-border rounded-xl hover:text-white transition-all">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
          {hasDateFilter && (
            <span className="text-[10px] text-ft-green font-medium">
              📅 Date filter active
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-ft-card border border-ft-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 border-b border-ft-border bg-ft-surface text-[10px] font-bold text-ft-muted uppercase tracking-wider">
          <input type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={toggleAll}
            className="w-3.5 h-3.5 accent-ft-green" />
          <span>Description</span>
          <span className="hidden sm:block">Account</span>
          <span className="hidden sm:block text-center">Type</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState type="transactions" title="No transactions found" subtitle="Try adjusting your filters, or add your first transaction." />
        ) : (
          <div className="divide-y divide-ft-border">
            {filtered.map(tx => (
              <div key={tx.id}
                className={`grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] items-center gap-3 px-4 py-3 group hover:bg-ft-border/10 transition-all ${selected.has(tx.id) ? 'bg-ft-primary/5' : ''}`}>
                <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggleSelect(tx.id)}
                  className="w-3.5 h-3.5 accent-ft-green" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-ft-text truncate">{tx.note || tx.category}</div>
                  <div className="text-[10px] text-ft-muted">{tx.category} · {formatDate(tx.date)}</div>
                </div>
                <div className="hidden sm:block text-xs text-ft-muted truncate">
                  {tx.account}{tx.toAccount ? ' → ' + tx.toAccount : ''}
                </div>
                <div className="hidden sm:flex justify-center"><TypeBadge type={tx.type} /></div>
                <div className={`text-right font-mono font-bold text-xs ${
                  tx.type==='Income' ? 'text-ft-green' : tx.type==='Transfer' ? 'text-ft-blue' : 'text-ft-text'
                }`}>
                  {tx.type==='Income' ? '+' : tx.type==='Transfer' ? '' : '-'}{fmt(tx.amount)}
                </div>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onCopy(tx)} title="Duplicate"
                    className="p-1 text-ft-muted hover:text-white hover:bg-ft-border/40 rounded-lg transition-all">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onEdit(tx)} title="Edit"
                    className="p-1 text-ft-muted hover:text-ft-green hover:bg-ft-green/10 rounded-lg transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={async () => { if (await confirm('Delete this transaction?', { title: 'Delete Transaction' })) { onDelete(tx.id); toast.success('Transaction deleted.'); } }} title="Delete"
                    className="p-1 text-ft-muted hover:text-ft-red hover:bg-ft-red/10 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
