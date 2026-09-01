import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { Navbar }                 from './components/Navbar';
import { BottomNav }              from './components/BottomNav';
import { SignInScreen }           from './components/SignInScreen';
import { ProfileSetupScreen }     from './components/ProfileSetupScreen';
import { LoadingScreen }          from './components/LoadingScreen';
import { Dashboard }              from './components/Dashboard';
import { ActivityScreen }         from './components/ActivityScreen';
import { Accounts }               from './components/Accounts';
import { InsightsScreen }         from './components/InsightsScreen';
import { MeScreen }               from './components/MeScreen';
import { ManageCategoriesScreen } from './components/ManageCategoriesScreen';
import { AddTransactionModal }    from './components/AddTransactionModal';
import { ToastProvider }          from './components/Toast';
import { ConfirmProvider }        from './components/ConfirmDialog';
import { netWorth as calcNetWorth } from './utils/financeCalculator';
import { formatCurrency }         from './utils/formatters';
import { api }                    from './services/api';
import { useToast }               from './components/Toast';

function AppInner() {
  const toast = useToast();

  // ── Auth state ───────────────────────────────────────────────────────────
  const [jwt,       setJwt]       = useState(() => localStorage.getItem('fintrack_jwt'));
  const [authUser,  setAuthUser]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // ── Data state ───────────────────────────────────────────────────────────
  const [profile,   setProfile]   = useState(null);
  const [accounts,  setAccounts]  = useState([]);
  const [transactions, setTx]     = useState([]);
  const [incCats,   setIncCats]   = useState([]);
  const [expCats,   setExpCats]   = useState([]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTx,       setEditTx]       = useState(null);

  // ── Load all data from API ─────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [user, accs, txns, cats] = await Promise.all([
        api.getUser(), api.getAccounts(), api.getTransactions(), api.getCategories(),
      ]);
      setAuthUser(user);
      setProfile({ name: user.name, currencyCode: user.currencyCode, countryCode: user.countryCode });
      setAccounts(accs);
      setTx(txns);
      setIncCats(cats.income);
      setExpCats(cats.expense);
    } catch (err) {
      console.error('Load error:', err);
      localStorage.removeItem('fintrack_jwt');
      setJwt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (jwt) loadAll();
    else setLoading(false);
  }, [jwt]);

  // ── Sign-in handler ────────────────────────────────────────────────────────
  const handleSignIn = useCallback((token, user, newUser) => {
    localStorage.setItem('fintrack_jwt', token);
    setJwt(token);
    setIsNewUser(newUser);
  }, []);

  // ── Sign-out ───────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(() => {
    localStorage.removeItem('fintrack_jwt');
    setJwt(null);
    setAuthUser(null);
    setProfile(null);
    setAccounts([]);
    setTx([]);
    setIncCats([]);
    setExpCats([]);
    setActiveTab('home');
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────────
  const nw     = useMemo(() => calcNetWorth(accounts, transactions), [accounts, transactions]);
  const fmtCur = useCallback(v => formatCurrency(v, profile?.currencyCode || 'INR'), [profile]);

  // ── Transaction handlers (optimistic) ─────────────────────────────────────
  const handleSaveTx = useCallback(async (tx) => {
    setTx(prev => {
      const idx = prev.findIndex(t => t.id === tx.id);
      return idx >= 0 ? prev.map(t => t.id === tx.id ? tx : t) : [...prev, tx];
    });
    try { await api.saveTransaction(tx); }
    catch { toast.error('Failed to save transaction.'); await loadAll(); }
  }, [loadAll]);

  const handleDeleteTx = useCallback(async (id) => {
    setTx(prev => prev.filter(t => t.id !== id));
    try { await api.deleteTransaction(id); }
    catch { toast.error('Failed to delete transaction.'); await loadAll(); }
  }, [loadAll]);

  const handleBulkDelete = useCallback(async (ids) => {
    const s = new Set(ids);
    setTx(prev => prev.filter(t => !s.has(t.id)));
    try { await api.bulkDelete(ids); }
    catch { toast.error('Failed to delete transactions.'); await loadAll(); }
  }, [loadAll]);

  const handleCopyTx = useCallback(async (tx) => {
    const copy = { ...tx, id: Date.now(), date: Date.now(), note: tx.note ? 'Copy of ' + tx.note : '' };
    setTx(prev => [...prev, copy]);
    try { await api.saveTransaction(copy); }
    catch { toast.error('Failed to duplicate transaction.'); await loadAll(); }
  }, [loadAll]);

  const openEdit  = useCallback(tx => { setEditTx(tx); setShowAddModal(true); }, []);
  const openAdd   = useCallback(() => { setEditTx(null); setShowAddModal(true); }, []);
  const closeModal = useCallback(() => { setShowAddModal(false); setEditTx(null); }, []);

  // ── Account handlers ───────────────────────────────────────────────────────
  const handleAddAccount = useCallback(async acc => {
    setAccounts(prev => [...prev, acc]);
    try { await api.addAccount(acc); }
    catch { toast.error('Failed to add account.'); await loadAll(); }
  }, [loadAll]);

  const handleEditAccount = useCallback(async (updated, oldName) => {
    setAccounts(prev => prev.map(a => a.name === oldName ? updated : a));
    if (updated.name !== oldName)
      setTx(prev => prev.map(t => ({
        ...t,
        account:   t.account   === oldName ? updated.name : t.account,
        toAccount: t.toAccount === oldName ? updated.name : t.toAccount,
      })));
    try { await api.editAccount(oldName, updated); }
    catch { toast.error('Failed to update account.'); await loadAll(); }
  }, [loadAll]);

  const handleDeleteAccount = useCallback(async name => {
    setAccounts(prev => prev.filter(a => a.name !== name));
    setTx(prev => prev.filter(t => t.account !== name && t.toAccount !== name));
    try { await api.deleteAccount(name); }
    catch { toast.error('Failed to delete account.'); await loadAll(); }
  }, [loadAll]);

  // ── Category handlers ──────────────────────────────────────────────────────
  const handleAddIncomeCat    = useCallback(async cat => { setIncCats(p => [...p, cat]); try { await api.addCategory('income', cat); } catch { toast.error('Failed.'); } }, []);
  const handleDelIncomeCat    = useCallback(async cat => { setIncCats(p => p.filter(c => c !== cat)); try { await api.deleteCategory('income', cat); } catch { toast.error('Failed.'); } }, []);
  const handleRenameIncomeCat = useCallback(async (old, nw) => {
    setIncCats(p => p.map(c => c === old ? nw : c));
    setTx(p => p.map(t => t.type === 'Income' && t.category === old ? { ...t, category: nw } : t));
    try { await api.renameCategory('income', old, nw); } catch { toast.error('Failed.'); }
  }, []);

  const handleAddExpenseCat    = useCallback(async cat => { setExpCats(p => [...p, cat]); try { await api.addCategory('expense', cat); } catch { toast.error('Failed.'); } }, []);
  const handleDelExpenseCat    = useCallback(async cat => { setExpCats(p => p.filter(c => c !== cat)); try { await api.deleteCategory('expense', cat); } catch { toast.error('Failed.'); } }, []);
  const handleRenameExpenseCat = useCallback(async (old, nw) => {
    setExpCats(p => p.map(c => c === old ? nw : c));
    setTx(p => p.map(t => t.type === 'Expense' && t.category === old ? { ...t, category: nw } : t));
    try { await api.renameCategory('expense', old, nw); } catch { toast.error('Failed.'); }
  }, []);

  // ── Profile update ─────────────────────────────────────────────────────────
  const handleUpdateProfile = useCallback(async updated => {
    setProfile(updated);
    try { await api.updateUser(updated); }
    catch { toast.error('Failed to update profile.'); }
  }, []);

  // ── Gates ──────────────────────────────────────────────────────────────────
  if (!jwt) return <SignInScreen onSuccess={handleSignIn} />;
  if (loading) return <LoadingScreen />;

  // New user: show profile setup to confirm name & set currency
  if (isNewUser) return (
    <ProfileSetupScreen
      defaultName={authUser?.name || ''}
      onComplete={async p => {
        setProfile(p);
        setIsNewUser(false);
        try { await api.updateUser(p); } catch {}
      }}
    />
  );

  // ── Screen renderer ────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard accounts={accounts} transactions={transactions} profile={profile} setActiveTab={setActiveTab} />;
      case 'activity':
        return <ActivityScreen transactions={transactions} accounts={accounts}
          incomeCategories={incCats} expenseCategories={expCats} profile={profile}
          onDelete={handleDeleteTx} onBulkDelete={handleBulkDelete}
          onEdit={openEdit} onCopy={handleCopyTx} />;
      case 'accounts':
        return <Accounts accounts={accounts} transactions={transactions} profile={profile}
          onAddAccount={handleAddAccount} onEditAccount={handleEditAccount} onDeleteAccount={handleDeleteAccount} />;
      case 'insights':
        return <InsightsScreen transactions={transactions} profile={profile} />;
      case 'me':
        return <MeScreen profile={profile} authUser={authUser} transactions={transactions}
          accounts={accounts} incomeCategories={incCats} expenseCategories={expCats}
          onUpdateProfile={handleUpdateProfile} onSignOut={handleSignOut} setActiveTab={setActiveTab} />;
      case 'categories':
        return <ManageCategoriesScreen
          incomeCategories={incCats} expenseCategories={expCats}
          onAddIncome={handleAddIncomeCat}     onDeleteIncome={handleDelIncomeCat}     onRenameIncome={handleRenameIncomeCat}
          onAddExpense={handleAddExpenseCat}   onDeleteExpense={handleDelExpenseCat}   onRenameExpense={handleRenameExpenseCat}
          DEFAULT_INCOME={['Salary','Freelance','Interest','Bonus','Other']}
          DEFAULT_EXPENSE={['Food','Groceries','Transport','Shopping','Entertainment','Health','Utilities','Rent','Education','Travel','Subscriptions','Other']} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-ft-bg">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab}
        onOpenAddModal={openAdd} profileName={profile?.name}
        formatCurrency={fmtCur} netWorth={nw} />
      <main className="max-w-5xl mx-auto px-4 py-5 pb-28 sm:pb-10">
        <div key={activeTab} className="animate-slideIn">{renderScreen()}</div>
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <button onClick={openAdd}
        className="sm:hidden fixed bottom-20 right-5 z-50 w-14 h-14 flex items-center justify-center bg-ft-primary hover:bg-ft-green text-white rounded-full shadow-2xl shadow-ft-green/30 transition-all active:scale-90 border-2 border-ft-green/30">
        <PlusCircle className="w-7 h-7" />
      </button>
      <AddTransactionModal isOpen={showAddModal} onClose={closeModal} onSave={handleSaveTx}
        accounts={accounts} incomeCategories={incCats} expenseCategories={expCats} editTx={editTx} />
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
