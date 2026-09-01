import React, { useState, useMemo } from 'react';
import { Plus, Wallet, CreditCard, Coins, Trash2, Pencil, X } from 'lucide-react';
import { accountNetPosition } from '../utils/financeCalculator';
import { formatCompact } from '../utils/formatters';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

const TYPE_LABELS = { BANK: 'Bank Account', CASH_WALLET: 'Cash / Wallet', CREDIT_CARD: 'Credit Card' };
const TYPE_ICONS  = { BANK: Wallet, CASH_WALLET: Coins, CREDIT_CARD: CreditCard };

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
    // Check duplicate name (ignore self when editing)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-ft-surface border border-ft-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Account' : 'Add Account'}</h2>
          <button onClick={onClose} className="p-1.5 text-ft-muted hover:text-white rounded-lg hover:bg-ft-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-ft-muted font-medium mb-1">Account Name</label>
            <input type="text" required
              placeholder="e.g. HDFC Bank, Kotak Savings"
              value={form.name}
              onChange={e => { setForm({...form, name: e.target.value}); setErr(''); }}
              className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green"
            />
          </div>

          <div>
            <label className="block text-ft-muted font-medium mb-1">Account Type</label>
            <select value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green">
              <option value="BANK">Bank Account</option>
              <option value="CASH_WALLET">Cash / Wallet</option>
              <option value="CREDIT_CARD">Credit Card</option>
            </select>
          </div>

          {form.type !== 'CREDIT_CARD' ? (
            <div>
              <label className="block text-ft-muted font-medium mb-1">Opening Balance</label>
              <input type="number" min="0" placeholder="0"
                value={form.openingBalance}
                onChange={e => setForm({...form, openingBalance: e.target.value})}
                className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ft-muted font-medium mb-1">Credit Limit</label>
                <input type="number" min="0" placeholder="0"
                  value={form.creditLimit}
                  onChange={e => setForm({...form, creditLimit: e.target.value})}
                  className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green"
                />
              </div>
              <div>
                <label className="block text-ft-muted font-medium mb-1">Opening Outstanding</label>
                <input type="number" min="0" placeholder="0"
                  value={form.outstanding}
                  onChange={e => setForm({...form, outstanding: e.target.value})}
                  className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green"
                />
              </div>
            </div>
          )}

          {err && <p className="text-ft-red text-[11px] font-medium">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-ft-muted bg-ft-card border border-ft-border rounded-xl hover:text-white">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 bg-ft-primary hover:bg-ft-green text-white font-bold rounded-xl shadow-md">
              {isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Accounts = ({ accounts, transactions, profile, onAddAccount, onEditAccount, onDeleteAccount }) => {
  const [modalOpen, setModalOpen]     = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const currency = profile?.currencyCode || 'INR';
  const fmt = v => formatCompact(v, currency);

  const accountsWithPos = useMemo(() =>
    accounts.map(acc => ({ ...acc, position: accountNetPosition(acc, transactions) })),
    [accounts, transactions]
  );
  const totalAssets      = accountsWithPos.filter(a => a.position > 0).reduce((s,a) => s+a.position, 0);
  const totalLiabilities = accountsWithPos.filter(a => a.position < 0).reduce((s,a) => s+Math.abs(a.position), 0);

  const toast   = useToast();
  const confirm = useConfirm();
  const openAdd  = () => { setEditAccount(null); setModalOpen(true); };
  const openEdit = (acc) => { setEditAccount(acc); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditAccount(null); };

  const handleSave = (acc, oldName) => {
    if (oldName) { onEditAccount(acc, oldName); toast.success(`Account "${acc.name}" updated.`); }
    else         { onAddAccount(acc);            toast.success(`Account "${acc.name}" added.`); }
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Accounts</h1>
          <p className="text-ft-muted text-xs">{accounts.length} accounts · balances computed live</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-ft-primary hover:bg-ft-green text-white rounded-xl shadow-md transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5" /> Add Account
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-ft-card border border-ft-border rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-ft-muted uppercase tracking-wider">Total Assets</div>
          <div className="text-xl font-bold font-mono text-ft-green mt-1">{fmt(totalAssets)}</div>
        </div>
        <div className="bg-ft-card border border-ft-border rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-ft-muted uppercase tracking-wider">Total Liabilities</div>
          <div className="text-xl font-bold font-mono text-ft-red mt-1">-{fmt(totalLiabilities)}</div>
        </div>
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accountsWithPos.map(acc => {
          const Icon = TYPE_ICONS[acc.type] || Wallet;
          const isCC = acc.type === 'CREDIT_CARD';
          const liability = isCC ? Math.abs(acc.position) : 0;
          const utilPct   = isCC && acc.creditLimit > 0 ? Math.round(liability / acc.creditLimit * 100) : 0;

          return (
            <div key={acc.name}
              className="bg-ft-card border border-ft-border rounded-2xl p-4 flex flex-col gap-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isCC            ? 'bg-ft-red/10 text-ft-red border-ft-red/20' :
                    acc.type==='CASH_WALLET' ? 'bg-ft-orange/10 text-ft-orange border-ft-orange/20' :
                    'bg-ft-green/10 text-ft-green border-ft-green/20'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{acc.name}</div>
                    <div className="text-[11px] text-ft-muted">{TYPE_LABELS[acc.type]}</div>
                  </div>
                </div>

                {/* Edit + Delete — visible on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(acc)} title="Edit account"
                    className="p-1.5 text-ft-muted hover:text-ft-green hover:bg-ft-green/10 rounded-lg transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => { if (await confirm(`Delete "${acc.name}"? All linked transactions will also be removed.`, { title: 'Delete Account' })) { onDeleteAccount(acc.name); toast.success(`Account "${acc.name}" deleted.`); } }}
                    title="Delete account"
                    className="p-1.5 text-ft-muted hover:text-ft-red hover:bg-ft-red/10 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>

              <div className="border-t border-ft-border pt-3">
                <div className="text-[11px] text-ft-muted mb-0.5">
                  {isCC ? 'Outstanding Balance' : 'Current Balance'}
                </div>
                <div className={`text-xl font-bold font-mono ${acc.position >= 0 ? 'text-ft-green' : 'text-ft-red'}`}>
                  {fmt(acc.position)}
                </div>
                {!isCC && (
                  <div className="text-[11px] text-ft-muted mt-0.5">
                    Opening: {fmt(acc.openingBalance)}
                  </div>
                )}
              </div>

              {isCC && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-ft-muted">
                    <span>Limit: {fmt(acc.creditLimit)}</span>
                    <span className={utilPct > 30 ? 'text-ft-orange font-bold' : ''}>
                      {utilPct}% used
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-ft-border rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full ${utilPct > 30 ? 'bg-ft-orange' : 'bg-ft-green'}`}
                      style={{ width: Math.min(utilPct, 100) + '%' }} />
                  </div>
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
