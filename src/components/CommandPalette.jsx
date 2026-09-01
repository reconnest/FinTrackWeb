import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, LayoutDashboard, Activity, Wallet, BarChart3, User,
  Plus, ArrowDownLeft, ArrowUpRight, RefreshCw, Eye, EyeOff,
  FileDown, FileJson, X, Command, Tag
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categoryIcons';

export const CommandPalette = ({
  isOpen, onClose, setActiveTab, onOpenAddWithType,
  onToggleMask, isMasked, transactions, onInspectTx, profile
}) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const currency = profile?.currencyCode || 'INR';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
    }
  }, [isOpen]);

  // Command items list
  const commands = useMemo(() => {
    const q = query.trim().toLowerCase();

    const staticItems = [
      // Navigation
      { id: 'nav-home',     type: 'Navigation', title: 'Go to Dashboard', icon: LayoutDashboard, action: () => { setActiveTab('home'); onClose(); } },
      { id: 'nav-activity', type: 'Navigation', title: 'Go to Activity Log', icon: Activity, action: () => { setActiveTab('activity'); onClose(); } },
      { id: 'nav-accounts', type: 'Navigation', title: 'Go to Cards & Accounts', icon: Wallet, action: () => { setActiveTab('accounts'); onClose(); } },
      { id: 'nav-insights', type: 'Navigation', title: 'Go to Analytics', icon: BarChart3, action: () => { setActiveTab('insights'); onClose(); } },
      { id: 'nav-me',       type: 'Navigation', title: 'Go to Settings & Profile', icon: User, action: () => { setActiveTab('me'); onClose(); } },
      { id: 'nav-cats',     type: 'Navigation', title: 'Manage Category Hub', icon: Tag, action: () => { setActiveTab('categories'); onClose(); } },

      // Quick Actions
      { id: 'act-expense',  type: 'Action', title: 'Add New Expense', icon: ArrowDownLeft, action: () => { onOpenAddWithType('Expense'); onClose(); }, color: 'text-neo-coral' },
      { id: 'act-income',   type: 'Action', title: 'Add New Income', icon: ArrowUpRight, action: () => { onOpenAddWithType('Income'); onClose(); }, color: 'text-neo-neonGreen' },
      { id: 'act-transfer', type: 'Action', title: 'Make Account Transfer', icon: RefreshCw, action: () => { onOpenAddWithType('Transfer'); onClose(); }, color: 'text-neo-cyan' },
      { id: 'act-mask',     type: 'Action', title: isMasked ? 'Show Balances (Disable Mask)' : 'Hide Balances (Privacy Mask Mode)', icon: isMasked ? Eye : EyeOff, action: () => { onToggleMask(); onClose(); } },
    ];

    const filteredStatic = staticItems.filter(item =>
      item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
    );

    // Matching transactions
    let matchedTx = [];
    if (q) {
      matchedTx = transactions
        .filter(t => t.note?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.account.toLowerCase().includes(q))
        .slice(0, 5)
        .map(t => {
          const meta = getCategoryMeta(t.category);
          return {
            id: `tx-${t.id}`,
            type: 'Transaction',
            title: t.note || t.category,
            subtitle: `${t.category} · ${t.account} · ${formatDate(t.date)}`,
            amount: formatCurrency(t.amount, currency, isMasked),
            txType: t.type,
            emoji: meta.emoji,
            action: () => { onInspectTx(t); onClose(); }
          };
        });
    }

    return [...filteredStatic, ...matchedTx];
  }, [query, isMasked, transactions, currency, setActiveTab, onOpenAddWithType, onToggleMask, onInspectTx, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(prev => (prev + 1) % (commands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(prev => (prev - 1 + commands.length) % (commands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commands[selectedIdx]) {
          commands[selectedIdx].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commands, selectedIdx, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neo-surface border border-neo-border rounded-3xl max-w-xl w-full shadow-neo-card overflow-hidden animate-popIn">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neo-border">
          <Command className="w-5 h-5 text-neo-cyan" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
            placeholder="Type a command, action, or search transactions..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neo-muted/60 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-neo-muted hover:text-white rounded-lg hover:bg-neo-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-neo-border/30">
          {commands.length === 0 ? (
            <div className="py-10 text-center text-xs text-neo-muted">
              No matching commands or transactions.
            </div>
          ) : (
            commands.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected ? 'bg-neo-card border border-neo-border text-white' : 'text-neo-muted hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.emoji ? (
                      <span className="text-base w-5 text-center">{item.emoji}</span>
                    ) : (
                      Icon && <Icon className={`w-4 h-4 ${item.color || 'text-neo-cyan'}`} />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-neo-muted truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.amount && (
                      <span className={`font-mono text-xs font-bold ${item.txType === 'Income' ? 'text-neo-neonGreen' : 'text-neo-coral'}`}>
                        {item.amount}
                      </span>
                    )}
                    <span className="text-[9px] uppercase font-bold text-neo-muted/60 bg-neo-bg px-2 py-0.5 rounded-md border border-neo-border/50">
                      {item.type}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neo-bg border-t border-neo-border text-[10px] text-neo-muted">
          <div className="flex items-center gap-2">
            <span>Navigate: <kbd className="px-1 py-0.5 bg-neo-card border border-neo-border rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-neo-card border border-neo-border rounded">↓</kbd></span>
            <span>Select: <kbd className="px-1 py-0.5 bg-neo-card border border-neo-border rounded">↵</kbd></span>
          </div>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
