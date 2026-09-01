import React from 'react';
import {
  X, Edit2, Copy, Trash2, Calendar, Tag, Wallet, ArrowUpRight,
  ArrowDownLeft, RefreshCw, Layers, Sparkles
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categoryIcons';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

export const TransactionDrawer = ({
  isOpen, onClose, tx, onEdit, onCopy, onDelete,
  transactions, profile, isMasked
}) => {
  const toast   = useToast();
  const confirm = useConfirm();

  if (!isOpen || !tx) return null;

  const currency = profile?.currencyCode || 'INR';
  const meta = getCategoryMeta(tx.category);
  const isInc = tx.type === 'Income';
  const isTrf = tx.type === 'Transfer';

  // Related transactions in the same category
  const related = transactions
    .filter(t => t.id !== tx.id && t.category === tx.category)
    .slice(0, 4);

  const handleDelete = async () => {
    if (await confirm('Permanently delete this transaction?', { title: 'Delete Entry' })) {
      onDelete(tx.id);
      toast.success('Transaction deleted');
      onClose();
    }
  };

  const handleCopy = () => {
    onCopy(tx);
    onClose();
  };

  const handleEdit = () => {
    onEdit(tx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neo-surface border-l border-neo-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideIn">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neo-muted bg-neo-bg border border-neo-border px-2.5 py-1 rounded-full">
                Transaction Inspector
              </span>
              <button
                onClick={onClose}
                className="p-1.5 text-neo-muted hover:text-white rounded-xl hover:bg-neo-card transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Amount Card */}
            <div className="bg-neo-bg border border-neo-border rounded-3xl p-5 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl border shadow-sm bg-neo-card border-neo-border">
                {meta.emoji}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neo-muted uppercase">{tx.category}</span>
                <div className={`text-3xl font-black font-mono ${
                  isInc ? 'text-neo-neonGreen' : isTrf ? 'text-neo-cyan' : 'text-white'
                }`}>
                  {isInc ? '+' : isTrf ? '' : '-'}{formatCurrency(tx.amount, currency, isMasked)}
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-neo-surface border-neo-border">
                {isInc ? <ArrowUpRight className="w-3.5 h-3.5 text-neo-neonGreen" /> : isTrf ? <RefreshCw className="w-3.5 h-3.5 text-neo-cyan" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-neo-coral" />}
                <span className={isInc ? 'text-neo-neonGreen' : isTrf ? 'text-neo-cyan' : 'text-neo-coral'}>{tx.type}</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-neo-card border border-neo-border rounded-3xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-neo-border/50">
                <span className="text-neo-muted font-semibold flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-neo-cyan" /> Date
                </span>
                <span className="font-bold text-white">{formatDate(tx.date)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-neo-border/50">
                <span className="text-neo-muted font-semibold flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-neo-cyan" /> Account
                </span>
                <span className="font-bold text-white">
                  {tx.account}{tx.toAccount ? ' → ' + tx.toAccount : ''}
                </span>
              </div>

              {tx.note && (
                <div className="py-1.5 space-y-1">
                  <span className="text-neo-muted font-semibold block">Notes & Details</span>
                  <p className="text-neo-text font-medium bg-neo-surface p-2.5 rounded-xl border border-neo-border/50">
                    {tx.note}
                  </p>
                </div>
              )}
            </div>

            {/* Category History */}
            {related.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neo-purple" /> More in {tx.category}
                </span>
                <div className="space-y-1.5">
                  {related.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2.5 bg-neo-card border border-neo-border/50 rounded-xl text-xs">
                      <span className="text-neo-muted truncate max-w-[160px]">{r.note || formatDate(r.date)}</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(r.amount, currency, isMasked)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neo-border/60">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-neo-card border border-neo-border hover:border-neo-borderLight text-xs font-bold text-white rounded-2xl transition-all"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-neo-card border border-neo-emerald/30 hover:bg-neo-emerald/10 text-xs font-bold text-neo-neonGreen rounded-2xl transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-neo-crimson/15 border border-neo-crimson/30 hover:bg-neo-crimson/25 text-xs font-bold text-neo-coral rounded-2xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
