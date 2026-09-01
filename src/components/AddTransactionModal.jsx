import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const TYPES = ['Expense', 'Income', 'Transfer'];

export const AddTransactionModal = ({ isOpen, onClose, onSave, accounts, incomeCategories, expenseCategories, editTx }) => {
  const isEdit = !!editTx;

  const [type, setType]         = useState('Expense');
  const [amount, setAmount]     = useState('');
  const [account, setAccount]   = useState(accounts[0]?.name || '');
  const [toAccount, setToAccount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate]         = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote]         = useState('');

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmount(String(editTx.amount));
      setAccount(editTx.account);
      setToAccount(editTx.toAccount || '');
      setCategory(editTx.category);
      setNote(editTx.note || '');
      setDate(new Date(editTx.date).toISOString().slice(0, 10));
    } else {
      setType('Expense');
      setAmount('');
      setAccount(accounts[0]?.name || '');
      setToAccount('');
      setCategory(expenseCategories[0] || '');
      setNote('');
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [editTx, isOpen]);

  useEffect(() => {
    if (!editTx) {
      if (type === 'Income') setCategory(incomeCategories[0] || '');
      else if (type === 'Expense') setCategory(expenseCategories[0] || '');
      else setCategory('');
    }
  }, [type]);

  if (!isOpen) return null;

  const cats = type === 'Income' ? incomeCategories : type === 'Expense' ? expenseCategories : [];
  const otherAccounts = accounts.filter(a => a.name !== account);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (type === 'Transfer' && !toAccount) return;

    const tx = {
      id: editTx ? editTx.id : Date.now(),
      amount: parseFloat(amount),
      category: type === 'Transfer' ? 'Transfer' : category,
      account,
      type,
      date: new Date(date).getTime(),
      note: note.trim(),
      toAccount: type === 'Transfer' ? toAccount : '',
    };
    onSave(tx);
    onClose();
  };

  const typeColors = { Expense: 'bg-ft-red text-white', Income: 'bg-ft-green text-white', Transfer: 'bg-ft-blue text-white' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-ft-surface border border-ft-border rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="p-1.5 text-ft-muted hover:text-white rounded-lg hover:bg-ft-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-1.5 bg-ft-bg p-1 rounded-xl border border-ft-border">
            {TYPES.map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`py-2 rounded-lg font-bold transition-all ${type === t ? typeColors[t] : 'text-ft-muted hover:text-ft-text'}`}>
                {t === 'Expense' ? '💸 Expense' : t === 'Income' ? '💰 Income' : '⇄ Transfer'}
              </button>
            ))}
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ft-muted font-medium mb-1">Amount</label>
              <input type="number" step="any" min="0.01" required
                placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-ft-green" />
            </div>
            <div>
              <label className="block text-ft-muted font-medium mb-1">Date</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green" />
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-ft-muted font-medium mb-1">{type === 'Transfer' ? 'From Account' : 'Account'}</label>
            <select value={account} onChange={e => setAccount(e.target.value)}
              className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green">
              {accounts.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
            </select>
          </div>

          {/* To Account (transfer) */}
          {type === 'Transfer' && (
            <div>
              <label className="block text-ft-muted font-medium mb-1">To Account</label>
              <select required value={toAccount} onChange={e => setToAccount(e.target.value)}
                className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green">
                <option value="">Select destination...</option>
                {otherAccounts.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
              </select>
            </div>
          )}

          {/* Category */}
          {type !== 'Transfer' && (
            <div>
              <label className="block text-ft-muted font-medium mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green">
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-ft-muted font-medium mb-1">Note / Merchant (optional)</label>
            <input type="text" placeholder="e.g. Swiggy order, Salary credit..."
              value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-ft-green" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-ft-muted bg-ft-card border border-ft-border rounded-xl hover:text-white">Cancel</button>
            <button type="submit"
              className="px-5 py-2 bg-ft-primary hover:bg-ft-green text-white font-bold rounded-xl shadow-md">
              {isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
