import React, { useState, useMemo } from 'react';
import { Search, FileDown, Trash2, Copy, Edit2, X, Calendar, Filter, Eye } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categoryIcons';
import { exportCSV } from '../utils/backup';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

const GRID_LAYOUT = "grid-cols-[36px_1fr_auto] sm:grid-cols-[36px_minmax(180px,1.5fr)_140px_100px_110px_140px]";

// Swipeable Transaction Row Component
function SwipeableTxRow({ tx, meta, isInc, isTrf, isSel, fmt, onSelect, onInspect, onCopy, onEdit, onDelete }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchOffset, setTouchOffset] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    if (diff > -100 && diff < 100) {
      setTouchOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchOffset < -50) {
      onDelete(tx.id);
    } else if (touchOffset > 50) {
      onCopy(tx);
    }
    setTouchOffset(0);
    setTouchStart(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateX(${touchOffset}px)` }}
      className={`grid ${GRID_LAYOUT} items-center gap-3 px-5 py-3.5 hover:bg-neo-surface/70 transition-transform group cursor-pointer ${
        isSel ? 'bg-neo-surface border-l-2 border-neo-neonGreen' : ''
      }`}
    >
      {/* 1. Checkbox */}
      <input
        type="checkbox"
        checked={isSel}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onSelect(tx.id)}
        className="w-3.5 h-3.5 accent-neo-emerald rounded cursor-pointer"
      />

      {/* 2. Description */}
      <div className="flex items-center gap-3 min-w-0" onClick={() => onInspect(tx)}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border flex-shrink-0 ${meta.bg} ${meta.border}`}>
          {meta.emoji}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-none">{tx.note || tx.category}</div>
          <div className="text-[10px] text-neo-muted truncate">{tx.category} · {formatDate(tx.date)}</div>
        </div>
      </div>

      {/* 3. Account */}
      <div className="hidden sm:block text-xs text-neo-muted truncate font-medium" onClick={() => onInspect(tx)}>
        {tx.account}{tx.toAccount ? ' → ' + tx.toAccount : ''}
      </div>

      {/* 4. Type */}
      <div className="hidden sm:flex justify-center" onClick={() => onInspect(tx)}>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          isInc ? 'bg-neo-neonGreen/10 border-neo-neonGreen/30 text-neo-neonGreen' :
          isTrf ? 'bg-neo-cyan/10 border-neo-cyan/30 text-neo-cyan' :
          'bg-neo-crimson/10 border-neo-crimson/30 text-neo-coral'
        }`}>
          {tx.type}
        </span>
      </div>

      {/* 5. Amount */}
      <div
        onClick={() => onInspect(tx)}
        className={`text-right font-mono font-bold text-xs ${
          isInc ? 'text-neo-neonGreen' : isTrf ? 'text-neo-cyan' : 'text-neo-text'
        }`}
      >
        {isInc ? '+' : isTrf ? '' : '-'}{fmt(tx.amount)}
      </div>

      {/* 6. Actions */}
      <div className="hidden sm:flex items-center justify-end gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onInspect(tx)} title="Inspect Details" className="p-1.5 text-neo-muted hover:text-white bg-neo-surface hover:bg-neo-border rounded-lg transition-all">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onCopy(tx)} title="Duplicate" className="p-1.5 text-neo-muted hover:text-white bg-neo-surface hover:bg-neo-border rounded-lg transition-all">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onEdit(tx)} title="Edit" className="p-1.5 text-neo-muted hover:text-neo-neonGreen bg-neo-surface hover:bg-neo-neonGreen/15 rounded-lg transition-all">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(tx.id)}
          title="Delete"
          className="p-1.5 text-neo-muted hover:text-neo-coral bg-neo-surface hover:bg-neo-crimson/20 rounded-lg transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export const ActivityScreen = ({
  transactions, accounts, incomeCategories, expenseCategories,
  onDelete, onBulkDelete, onEdit, onCopy, onInspect, profile, isMasked
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
  const fmt = v => formatCurrency(v, currency, isMasked);
  const accountNames = useMemo(() => ['ALL', ...accounts.map(a => a.name)], [accounts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
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
    const ok = await confirm(`Permanently delete ${selected.size} transaction(s)?`, { title: 'Bulk Delete' });
    if (ok) { onBulkDelete([...selected]); setSelected(new Set()); toast.success(`Deleted ${selected.size} records`); }
  };

  const handleDeleteSingle = async (id) => {
    if (await confirm('Permanently delete this transaction?', { title: 'Delete Entry' })) {
      onDelete(id);
      toast.success('Transaction deleted');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Activity Log</h1>
          <p className="text-xs text-neo-muted">{filtered.length} of {transactions.length} records shown</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-neo-coral bg-neo-crimson/15 border border-neo-crimson/30 rounded-xl hover:bg-neo-crimson/25 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete {selected.size}
            </button>
          )}
          <button
            onClick={() => exportCSV(filtered, currency)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-neo-surface border border-neo-border hover:border-neo-borderLight rounded-xl shadow-sm transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-neo-neonGreen" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-neo-surface border border-neo-border rounded-3xl p-4 space-y-3 shadow-neo-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neo-muted" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search category, note, account..."
              className="w-full bg-neo-bg border border-neo-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neo-muted/60 focus:outline-none focus:border-neo-neonGreen"
            />
          </div>
          <select
            value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-neo-bg border border-neo-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neo-neonGreen"
          >
            <option value="ALL">All Types</option>
            <option value="Income">Income (+)</option>
            <option value="Expense">Expense (-)</option>
            <option value="Transfer">Transfer (⇆)</option>
          </select>
          <select
            value={filterAccount} onChange={e => setFilterAccount(e.target.value)}
            className="bg-neo-bg border border-neo-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neo-neonGreen"
          >
            {accountNames.map(n => <option key={n} value={n}>{n === 'ALL' ? 'All Accounts' : n}</option>)}
          </select>
        </div>

        {/* Date Row */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-neo-border/50 text-xs">
          <div className="flex items-center gap-2 bg-neo-bg border border-neo-border rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-bold text-neo-muted uppercase">From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-xs text-white focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 bg-neo-bg border border-neo-border rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-bold text-neo-muted uppercase">To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-xs text-white focus:outline-none" />
          </div>
          {(search || filterType !== 'ALL' || filterAccount !== 'ALL' || hasDateFilter) && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 text-xs text-neo-muted hover:text-white bg-neo-card border border-neo-border rounded-xl transition-all">
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
          <span className="text-[10px] text-neo-muted ml-auto hidden sm:inline-block">
            Tip: Click any row to inspect details · Mobile: Swipe 👈 Delete / 👉 Copy
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-neo-card border border-neo-border rounded-3xl overflow-hidden shadow-neo-card">
        {/* Table Header with explicit synced grid dimensions */}
        <div className={`grid ${GRID_LAYOUT} items-center gap-3 px-5 py-3 border-b border-neo-border bg-neo-surface text-[10px] font-extrabold text-neo-muted uppercase tracking-wider`}>
          <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 accent-neo-emerald rounded cursor-pointer" />
          <span>Description</span>
          <span className="hidden sm:block">Account</span>
          <span className="hidden sm:block text-center">Type</span>
          <span className="text-right">Amount</span>
          <span className="hidden sm:block text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState type="transactions" title="No transactions found" subtitle="Try tweaking your filters or create a new entry." />
        ) : (
          <div className="divide-y divide-neo-border/50">
            {filtered.map(tx => {
              const meta = getCategoryMeta(tx.category);
              const isInc = tx.type === 'Income';
              const isTrf = tx.type === 'Transfer';
              const isSel = selected.has(tx.id);

              return (
                <SwipeableTxRow
                  key={tx.id}
                  tx={tx}
                  meta={meta}
                  isInc={isInc}
                  isTrf={isTrf}
                  isSel={isSel}
                  fmt={fmt}
                  onSelect={toggleSelect}
                  onInspect={onInspect}
                  onCopy={onCopy}
                  onEdit={onEdit}
                  onDelete={handleDeleteSingle}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
