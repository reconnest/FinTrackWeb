import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, RefreshCw, Calendar, Tag, Wallet, Calculator, Keyboard } from 'lucide-react';
import { getCategoryMeta } from '../utils/categoryIcons';
import { CalculatorInput } from './CalculatorInput';

export const AddTransactionModal = ({
  isOpen, onClose, onSave, accounts, incomeCategories,
  expenseCategories, editTx, initialType = 'Expense'
}) => {
  const [type, setType]           = useState('Expense');
  const [amount, setAmount]       = useState('');
  const [category, setCategory]   = useState('');
  const [account, setAccount]     = useState('');
  const [toAccount, setToAccount] = useState('');
  const [date, setDate]           = useState('');
  const [note, setNote]           = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [err, setErr]             = useState('');

  useEffect(() => {
    if (isOpen) {
      setErr('');
      setShowKeypad(false);
      if (editTx) {
        setType(editTx.type);
        setAmount(String(editTx.amount));
        setCategory(editTx.category || '');
        setAccount(editTx.account || (accounts[0]?.name || ''));
        setToAccount(editTx.toAccount || (accounts[1]?.name || accounts[0]?.name || ''));
        setDate(new Date(editTx.date).toISOString().slice(0, 10));
        setNote(editTx.note || '');
      } else {
        const t = initialType || 'Expense';
        setType(t);
        setAmount('');
        const cats = t === 'Income' ? incomeCategories : expenseCategories;
        setCategory(cats[0] || 'Other');
        setAccount(accounts[0]?.name || '');
        setToAccount(accounts[1]?.name || accounts[0]?.name || '');
        setDate(new Date().toISOString().slice(0, 10));
        setNote('');
      }
    }
  }, [isOpen, editTx, initialType, accounts, incomeCategories, expenseCategories]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const cats = newType === 'Income' ? incomeCategories : expenseCategories;
    if (newType !== 'Transfer') {
      setCategory(cats[0] || 'Other');
    } else {
      setCategory('Transfer');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Evaluate in case an arithmetic expression is left
    let finalAmount = amount;
    try {
      const safeExpr = String(amount).replace(/×/g, '*').replace(/÷/g, '/');
      const evaluated = Function(`'use strict'; return (${safeExpr})`)();
      if (!isNaN(evaluated) && isFinite(evaluated) && evaluated > 0) {
        finalAmount = evaluated;
      }
    } catch {
      // Keep as parsed float
    }

    const num = parseFloat(finalAmount);
    if (!num || num <= 0) { setErr('Please enter a valid positive amount.'); return; }
    if (!account) { setErr('Please select an account.'); return; }
    if (type === 'Transfer' && (!toAccount || toAccount === account)) {
      setErr('Please select a different destination account.'); return;
    }

    const txDate = date ? new Date(date + 'T12:00:00').getTime() : Date.now();

    onSave({
      id: editTx?.id || Date.now(),
      amount: Math.round(num * 100) / 100,
      type,
      category: type === 'Transfer' ? 'Transfer' : (category || 'Other'),
      account,
      toAccount: type === 'Transfer' ? toAccount : '',
      date: txDate,
      note: note.trim(),
    });

    onClose();
  };

  const currentCats = type === 'Income' ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neo-surface border border-neo-border rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-neo-card animate-popIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              {editTx ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <p className="text-xs text-neo-muted">Log transaction with instant cloud sync</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neo-muted hover:text-white rounded-xl hover:bg-neo-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Segmented Pill Bar */}
        <div className="grid grid-cols-3 gap-1.5 bg-neo-bg border border-neo-border rounded-2xl p-1">
          <button
            type="button"
            onClick={() => handleTypeChange('Expense')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'Expense' ? 'bg-neo-crimson text-white shadow-sm' : 'text-neo-muted hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('Income')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'Income' ? 'bg-neo-emerald text-black shadow-sm' : 'text-neo-muted hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('Transfer')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'Transfer' ? 'bg-neo-cyan text-black shadow-sm' : 'text-neo-muted hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" /> Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Amount Box with Calculator Toggle */}
          <div className="bg-neo-bg border border-neo-border rounded-2xl p-3 text-center space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] uppercase font-bold text-neo-muted tracking-wider">Amount (₹)</span>
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                className="flex items-center gap-1 text-[10px] font-bold text-neo-cyan bg-neo-surface px-2 py-0.5 rounded-lg border border-neo-border hover:border-neo-cyan/40 transition-all"
              >
                {showKeypad ? <Keyboard className="w-3 h-3" /> : <Calculator className="w-3 h-3" />}
                <span>{showKeypad ? 'Manual Input' : 'Math Keypad'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-mono text-neo-muted font-bold">₹</span>
              <input
                type="text"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setErr(''); }}
                className="w-full bg-transparent text-center text-3xl font-black font-mono text-white focus:outline-none placeholder-neo-border"
              />
            </div>

            {/* Embedded Math Keypad */}
            {showKeypad && (
              <div className="pt-2 animate-fadeIn">
                <CalculatorInput
                  expression={amount}
                  setExpression={setAmount}
                  onConfirm={() => setShowKeypad(false)}
                />
              </div>
            )}
          </div>

          {/* Category Chip Selector (for Expense & Income) */}
          {type !== 'Transfer' && (
            <div className="space-y-1.5">
              <label className="block text-neo-muted font-semibold">Category</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {currentCats.map(cat => {
                  const meta = getCategoryMeta(cat);
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-neo-card border-neo-neonGreen text-white shadow-sm scale-105'
                          : 'bg-neo-bg border-neo-border text-neo-muted hover:text-white'
                      }`}
                    >
                      <span>{meta.emoji}</span>
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Selectors */}
          {type === 'Transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neo-muted font-semibold mb-1">From Account</label>
                <select
                  value={account} onChange={e => setAccount(e.target.value)}
                  className="w-full bg-neo-bg border border-neo-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen"
                >
                  {accounts.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-neo-muted font-semibold mb-1">To Account</label>
                <select
                  value={toAccount} onChange={e => setToAccount(e.target.value)}
                  className="w-full bg-neo-bg border border-neo-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen"
                >
                  {accounts.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-neo-muted font-semibold mb-1">Paid With / Account</label>
              <select
                value={account} onChange={e => setAccount(e.target.value)}
                className="w-full bg-neo-bg border border-neo-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neo-neonGreen"
              >
                {accounts.map(a => <option key={a.name} value={a.name}>{a.name} ({a.type})</option>)}
              </select>
            </div>
          )}

          {/* Date & Note Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neo-muted font-semibold mb-1">Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-neo-bg border border-neo-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neo-neonGreen"
              />
            </div>
            <div>
              <label className="block text-neo-muted font-semibold mb-1">Note (Optional)</label>
              <input
                type="text" placeholder="e.g. Swiggy party"
                value={note} onChange={e => setNote(e.target.value)}
                className="w-full bg-neo-bg border border-neo-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neo-neonGreen"
              />
            </div>
          </div>

          {err && <p className="text-neo-coral text-[11px] font-medium">{err}</p>}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2.5 text-neo-muted bg-neo-card border border-neo-border rounded-xl hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-neo-emerald to-neo-neonGreen hover:opacity-90 text-black font-bold rounded-xl shadow-neo-glow-green"
            >
              {editTx ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
