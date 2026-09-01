import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { Navbar }                   from './components/Navbar';
import { BottomNav }                from './components/BottomNav';
import { ProfileSetupScreen }       from './components/ProfileSetupScreen';
import { Dashboard }                from './components/Dashboard';
import { ActivityScreen }           from './components/ActivityScreen';
import { Accounts }                 from './components/Accounts';
import { InsightsScreen }           from './components/InsightsScreen';
import { MeScreen }                 from './components/MeScreen';
import { ManageCategoriesScreen }   from './components/ManageCategoriesScreen';
import { AddTransactionModal }      from './components/AddTransactionModal';
import { ToastProvider }            from './components/Toast';
import { ConfirmProvider }          from './components/ConfirmDialog';
import { netWorth as calcNetWorth } from './utils/financeCalculator';
import { formatCurrency }           from './utils/formatters';
import {
  initialProfile, initialAccounts, initialTransactions,
  DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES
} from './data/initialData';

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const KEYS = {
  profile:  'fintrack_profile',
  accounts: 'fintrack_accounts',
  income:   'fintrack_income_categories',
  expense:  'fintrack_expense_categories',
  txns:     'fintrack',
};

function AppInner() {
  // ── State ────────────────────────────────────────────────────────────────
  const [profile,   setProfile]   = useState(() => LS.get(KEYS.profile, null));
  const [accounts,  setAccounts]  = useState(() => LS.get(KEYS.accounts, initialAccounts));
  const [transactions, setTx]     = useState(() => LS.get(KEYS.txns, initialTransactions));
  const [incCats,   setIncCats]   = useState(() => LS.get(KEYS.income,  DEFAULT_INCOME_CATEGORIES));
  const [expCats,   setExpCats]   = useState(() => LS.get(KEYS.expense, DEFAULT_EXPENSE_CATEGORIES));
  const [activeTab, setActiveTab] = useState('home');
  const [prevTab,   setPrevTab]   = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTx,    setEditTx]    = useState(null);

  // ── Persist ────────────────────────────────────────────────────────────────
  useEffect(() => { if (profile) LS.set(KEYS.profile, profile); }, [profile]);
  useEffect(() => { LS.set(KEYS.accounts, accounts); }, [accounts]);
  useEffect(() => { LS.set(KEYS.txns,     transactions); }, [transactions]);
  useEffect(() => { LS.set(KEYS.income,   incCats); }, [incCats]);
  useEffect(() => { LS.set(KEYS.expense,  expCats); }, [expCats]);

  // ── Tab switch with transition ─────────────────────────────────────────────
  const switchTab = useCallback((tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  }, [activeTab]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const nw     = useMemo(() => calcNetWorth(accounts, transactions), [accounts, transactions]);
  const fmtCur = useCallback((v) => formatCurrency(v, profile?.currencyCode || 'INR'), [profile]);

  // ── Transaction handlers ───────────────────────────────────────────────────
  const handleSaveTransaction = useCallback((tx) => {
    setTx(prev => {
      const idx = prev.findIndex(t => t.id === tx.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = tx; return next; }
      return [...prev, tx];
    });
  }, []);
  const handleDeleteTransaction = useCallback((id) => setTx(prev => prev.filter(t => t.id !== id)), []);
  const handleBulkDelete  = useCallback((ids) => { const s = new Set(ids); setTx(prev => prev.filter(t => !s.has(t.id))); }, []);
  const handleCopyTx      = useCallback((tx) => setTx(prev => [...prev, { ...tx, id: Date.now(), date: Date.now(), note: tx.note ? 'Copy of ' + tx.note : '' }]), []);
  const openEdit          = useCallback((tx) => { setEditTx(tx); setShowAddModal(true); }, []);
  const openAdd           = useCallback(() => { setEditTx(null); setShowAddModal(true); }, []);
  const closeModal        = useCallback(() => { setShowAddModal(false); setEditTx(null); }, []);

  // ── Account handlers ───────────────────────────────────────────────────────
  const handleAddAccount    = useCallback((acc) => setAccounts(prev => [...prev, acc]), []);
  const handleEditAccount   = useCallback((updated, oldName) => {
    setAccounts(prev => prev.map(a => a.name === oldName ? updated : a));
    if (updated.name !== oldName) {
      setTx(prev => prev.map(t => ({
        ...t,
        account:   t.account   === oldName ? updated.name : t.account,
        toAccount: t.toAccount === oldName ? updated.name : t.toAccount,
      })));
    }
  }, []);
  const handleDeleteAccount = useCallback((name) => {
    setAccounts(prev => prev.filter(a => a.name !== name));
    setTx(prev => prev.filter(t => t.account !== name && t.toAccount !== name));
  }, []);

  // ── Category handlers ──────────────────────────────────────────────────────
  const handleAddIncomeCat     = useCallback((cat) => setIncCats(prev => [...prev, cat]), []);
  const handleDelIncomeCat     = useCallback((cat) => setIncCats(prev => prev.filter(c => c !== cat)), []);
  const handleRenameIncomeCat  = useCallback((old, nw) => {
    setIncCats(prev => prev.map(c => c === old ? nw : c));
    setTx(prev => prev.map(t => t.type === 'Income' && t.category === old ? { ...t, category: nw } : t));
  }, []);
  const handleAddExpenseCat    = useCallback((cat) => setExpCats(prev => [...prev, cat]), []);
  const handleDelExpenseCat    = useCallback((cat) => setExpCats(prev => prev.filter(c => c !== cat)), []);
  const handleRenameExpenseCat = useCallback((old, nw) => {
    setExpCats(prev => prev.map(c => c === old ? nw : c));
    setTx(prev => prev.map(t => t.type === 'Expense' && t.category === old ? { ...t, category: nw } : t));
  }, []);

  // ── Profile / Backup ───────────────────────────────────────────────────────
  const handleUpdateProfile = useCallback((updated) => setProfile(updated), []);
  const handleImportBackup  = useCallback((data) => {
    if (data.transactions)      setTx(data.transactions);
    if (data.accounts)          setAccounts(data.accounts);
    if (data.incomeCategories)  setIncCats(data.incomeCategories);
    if (data.expenseCategories) setExpCats(data.expenseCategories);
    if (data.currencyCode && profile) setProfile(p => ({ ...p, currencyCode: data.currencyCode, countryCode: data.countryCode || p.countryCode }));
  }, [profile]);
  const handleResetData = useCallback(() => {
    setTx(initialTransactions);
    setAccounts(initialAccounts);
    setIncCats(DEFAULT_INCOME_CATEGORIES);
    setExpCats(DEFAULT_EXPENSE_CATEGORIES);
  }, []);

  // ── Profile gate ───────────────────────────────────────────────────────────
  if (!profile) return <ProfileSetupScreen onComplete={setProfile} />;

  // ── Screen renderer ────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard accounts={accounts} transactions={transactions} profile={profile} setActiveTab={switchTab} />;
      case 'activity':
        return <ActivityScreen transactions={transactions} accounts={accounts}
          incomeCategories={incCats} expenseCategories={expCats} profile={profile}
          onDelete={handleDeleteTransaction} onBulkDelete={handleBulkDelete}
          onEdit={openEdit} onCopy={handleCopyTx} />;
      case 'accounts':
        return <Accounts accounts={accounts} transactions={transactions} profile={profile}
          onAddAccount={handleAddAccount} onEditAccount={handleEditAccount} onDeleteAccount={handleDeleteAccount} />;
      case 'insights':
        return <InsightsScreen transactions={transactions} profile={profile} />;
      case 'me':
        return <MeScreen profile={profile} transactions={transactions} accounts={accounts}
          incomeCategories={incCats} expenseCategories={expCats}
          onImportBackup={handleImportBackup} onResetData={handleResetData}
          onUpdateProfile={handleUpdateProfile} setActiveTab={switchTab} />;
      case 'categories':
        return <ManageCategoriesScreen
          incomeCategories={incCats} expenseCategories={expCats}
          onAddIncome={handleAddIncomeCat}     onDeleteIncome={handleDelIncomeCat}     onRenameIncome={handleRenameIncomeCat}
          onAddExpense={handleAddExpenseCat}   onDeleteExpense={handleDelExpenseCat}   onRenameExpense={handleRenameExpenseCat}
          DEFAULT_INCOME={DEFAULT_INCOME_CATEGORIES} DEFAULT_EXPENSE={DEFAULT_EXPENSE_CATEGORIES} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-ft-bg">
      <Navbar
        activeTab={activeTab} setActiveTab={switchTab}
        onOpenAddModal={openAdd}
        profileName={profile.name}
        formatCurrency={fmtCur}
        netWorth={nw}
      />

      {/* Main content with slide-in animation per tab */}
      <main className="max-w-5xl mx-auto px-4 py-5 pb-28 sm:pb-10">
        <div key={activeTab} className="animate-slideIn">
          {renderScreen()}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={switchTab} />

      {/* Mobile FAB — fixed bottom-right, above bottom nav */}
      <button
        onClick={openAdd}
        className="sm:hidden fixed bottom-20 right-5 z-50 w-14 h-14 flex items-center justify-center bg-ft-primary hover:bg-ft-green text-white rounded-full shadow-2xl shadow-ft-green/30 transition-all active:scale-90 border-2 border-ft-green/30"
        aria-label="Add transaction"
      >
        <PlusCircle className="w-7 h-7" />
      </button>

      <AddTransactionModal
        isOpen={showAddModal} onClose={closeModal} onSave={handleSaveTransaction}
        accounts={accounts} incomeCategories={incCats} expenseCategories={expCats}
        editTx={editTx}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AppInner />
      </ConfirmProvider>
    </ToastProvider>
  );
}
