import React, { useState, useMemo } from 'react';
import { Plus, Wallet, CreditCard, Coins, Trash2, Pencil, X } from 'lucide-react';
import { accountNetPosition } from '../utils/financeCalculator';
import { formatCurrency } from '../utils/formatters';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

const CARD_GRADIENTS = {
  BANK:        'from-[#1E293B] via-[#0F172A] to-[#020617] border-slate-700/60',
  CASH_WALLET: 'from-[#2A1B0E] via-[#1C140D] to-[#0D0A07] border-amber-800/40',
  CREDIT_CARD: 'from-[#1A102F] via-[#120B20] to-[#090511] border-purple-800/50',
};

const EMPTY_FORM = { name:'', type:'BANK', openingBalance:'', creditLimit:'', outstanding:'' };

function AccountFormModal({ isOpen, onClose, onSave, accounts, editAccount }) {
  const isEdit = !!editAccount;
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr]   = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setErr('');
      setForm(editAccount ? {
        name:           editAccount.name,
        type:           editAccount.type,
        openingBalance: editAccount.type !== 'CREDIT_CARD' ? String(editAccount.openingBalance) : '',
        creditLimit:    editAccount.type === 'CREDIT_CARD' ? String(editAccount.creditLimit) : '',
        outstanding:    editAccount.type === 'CREDIT_CARD' ? String(editAccount.outstanding) : '',
      } : EMPTY_FORM);
    }
  }, [isOpen, editAccount]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { setErr('Account name is required.'); return; }
    const duplicate = accounts.find(a =>
      a.name.toLowerCase() === name.toLowerCase() &&
      (!isEdit || a.name !== editAccount.name)
    );
    if (duplicate) { setErr('An account with that name already exists.'); return; }

    onSave({
      name,
      type: form.type,
      openingBalance: form.type !== 'CREDIT_CARD' ? (parseFloat(form.openingBalance) || 0) : 0,
      creditLimit:    form.type === 'CREDIT_CARD'  ? (parseFloat(form.creditLimit)    || 0) : 0,
      outstanding:    form.type === 'CREDIT_CARD'  ? (parseFloat(form.outstanding)    || 0) : 0,
    }, isEdit ? editAccount.name : null);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neo-surface border border-neo-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-neo-card animate-popIn">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Account' : 'Add New Account'}</h2>
            <p className="text-xs text-neo-muted">Configure balance and limits</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neo-muted hover:text-white rounded-xl hover:bg-neo-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neo-muted font-semibold mb-1.5">Account / Card Name</label>
            <input
              type="text" required autoFocus
              placeholder="e.g. HDFC Regalia, Kotak 811"
              value={form.name}
              onChange={e => { setForm({...form, name: e.target.value}); setErr(''); }}
              className="w-full bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen"
            />
          </div>

          <div>
            <label className="block text-neo-muted font-semibold mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen"
            >
              <option value="BANK">Bank Account</option>
              <option value="CASH_WALLET">Cash / Wallet</option>
              <option value="CREDIT_CARD">Credit Card</option>
            </select>
          </div>

          {form.type !== 'CREDIT_CARD' ? (
            <div>
              <label className="block text-neo-muted font-semibold mb-1.5">Opening Balance</label>
              <input
                type="number" min="0" placeholder="0"
                value={form.openingBalance}
                onChange={e => setForm({...form, openingBalance: e.target.value})}
                className="w-full bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen font-mono"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neo-muted font-semibold mb-1.5">Credit Limit</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={form.creditLimit}
                  onChange={e => setForm({...form, creditLimit: e.target.value})}
                  className="w-full bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen font-mono"
                />
              </div>
              <div>
                <label className="block text-neo-muted font-semibold mb-1.5">Initial Debt</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={form.outstanding}
                  onChange={e => setForm({...form, outstanding: e.target.value})}
                  className="w-full bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen font-mono"
                />
              </div>
            </div>
          )}

          {err && <p className="text-neo-coral text-[11px] font-medium">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-neo-muted bg-neo-card border border-neo-border rounded-xl hover:text-white">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-neo-emerald to-neo-neonGreen hover:opacity-90 text-black font-bold rounded-xl shadow-neo-glow-green">
              {isEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Accounts = ({ accounts, transactions, profile, onAddAccount, onEditAccount, onDeleteAccount, isMasked }) => {
  const toast   = useToast();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen]     = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const currency = profile?.currencyCode || 'INR';
  const fmt = v => formatCurrency(v, currency, isMasked);

  const accountsWithPos = useMemo(() =>
    accounts.map(acc => ({ ...acc, position: accountNetPosition(acc, transactions) })),
    [accounts, transactions]
  );

  const totalAssets      = accountsWithPos.filter(a => a.position > 0).reduce((s,a) => s+a.position, 0);
  const totalLiabilities = accountsWithPos.filter(a => a.position < 0).reduce((s,a) => s+Math.abs(a.position), 0);

  const openAdd  = () => { setEditAccount(null); setModalOpen(true); };
  const openEdit = (acc) => { setEditAccount(acc); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditAccount(null); };

  const handleSave = (acc, oldName) => {
    if (oldName) { onEditAccount(acc, oldName); toast.success(`Updated ${acc.name}`); }
    else         { onAddAccount(acc);            toast.success(`Added ${acc.name}`); }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Cards & Accounts</h1>
          <p className="text-xs text-neo-muted">Live asset and liability balance deck</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-neo-emerald to-neo-neonGreen text-black rounded-xl shadow-neo-glow-green transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neo-card border border-neo-border rounded-3xl p-5">
          <div className="text-[11px] font-bold text-neo-muted uppercase tracking-wider">Total Assets (Cash + Bank)</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-neo-neonGreen mt-1">{fmt(totalAssets)}</div>
        </div>
        <div className="bg-neo-card border border-neo-border rounded-3xl p-5">
          <div className="text-[11px] font-bold text-neo-muted uppercase tracking-wider">Total Liabilities (Credit Cards)</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-neo-coral mt-1">-{fmt(totalLiabilities)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountsWithPos.map(acc => {
          const isCC = acc.type === 'CREDIT_CARD';
          const liability = isCC ? Math.abs(acc.position) : 0;
          const utilPct   = isCC && acc.creditLimit > 0 ? Math.round(liability / acc.creditLimit * 100) : 0;
          const grad = CARD_GRADIENTS[acc.type] || CARD_GRADIENTS.BANK;

          return (
            <div key={acc.name} className={`relative overflow-hidden bg-gradient-to-br ${grad} border rounded-3xl p-5 shadow-neo-card flex flex-col justify-between space-y-4 group`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 rounded-md bg-amber-400/30 border border-amber-300/40 flex items-center justify-center">
                    <div className="w-5 h-3 rounded-sm border border-amber-300/60 opacity-80" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">{acc.name}</h3>
                    <span className="text-[10px] text-neo-muted capitalize">{acc.type.replace('_',' ').toLowerCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(acc)} className="p-1.5 text-neo-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      const ok = await confirm(`Delete account "${acc.name}"? Linked transactions will be deleted.`, { title: 'Delete Account' });
                      if (ok) { onDeleteAccount(acc.name); toast.success(`Deleted ${acc.name}`); }
                    }}
                    className="p-1.5 text-neo-muted hover:text-neo-coral bg-white/5 hover:bg-neo-crimson/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="py-2">
                <div className="text-[10px] uppercase font-bold text-neo-muted tracking-wider">
                  {isCC ? 'Current Liability' : 'Available Balance'}
                </div>
                <div className={`text-2xl font-black font-mono mt-0.5 ${acc.position >= 0 ? 'text-neo-neonGreen' : 'text-neo-coral'}`}>
                  {fmt(acc.position)}
                </div>
              </div>

              {isCC ? (
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[10px] text-neo-muted font-medium">
                    <span>Limit: {fmt(acc.creditLimit)}</span>
                    <span className={utilPct > 30 ? 'text-neo-coral font-bold' : 'text-neo-neonGreen font-bold'}>
                      {utilPct}% used
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${utilPct > 30 ? 'bg-neo-coral' : 'bg-neo-neonGreen'}`} style={{ width: Math.min(100, utilPct) + '%' }} />
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-neo-muted pt-2 border-t border-white/10 flex justify-between">
                  <span>Opening: {fmt(acc.openingBalance)}</span>
                  <span className="text-neo-emerald font-semibold">● Active</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AccountFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        accounts={accounts}
        editAccount={editAccount}
      />
    </div>
  );
};
