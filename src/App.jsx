import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navbar }                 from './components/Navbar';
import { Sidebar }                from './components/Sidebar';
import { BottomNav }              from './components/BottomNav';
import { CommandPalette }         from './components/CommandPalette';
import { TransactionDrawer }      from './components/TransactionDrawer';
import { LandingPage }            from './components/LandingPage';
import { ProfileSetupScreen }     from './components/ProfileSetupScreen';
import { LoadingScreen }          from './components/LoadingScreen';
import { Dashboard }              from './components/Dashboard';
import { ActivityScreen }         from './components/ActivityScreen';
import { Accounts }               from './components/Accounts';
import { InsightsScreen }         from './components/InsightsScreen';
import { MeScreen }               from './components/MeScreen';
import { ManageCategoriesScreen } from './components/ManageCategoriesScreen';
import { AddTransactionModal }    from './components/AddTransactionModal';
import { ToastProvider, useToast } from './components/Toast';
import { ConfirmProvider }        from './components/ConfirmDialog';
import { netWorth as calcNetWorth } from './utils/financeCalculator';
import { formatCurrency }         from './utils/formatters';
import { api }                    from './services/api';

function AppInner() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Auth state ───────────────────────────────────────────────────────────
  const [jwt,       setJwt]       = useState(() => localStorage.getItem('fintrack_jwt'));
  const [authUser,  setAuthUser]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // ── Data state ───────────────────────────────────────────────────────────
  const [profile,      setProfile]      = useState(null);
  const [accounts,     setAccounts]     = useState([]);
  const [transactions, setTx]           = useState([]);
  const [incCats,      setIncCats]      = useState([]);
  const [expCats,      setExpCats]      = useState([]);

  // ── UI / Layout state ────────────────────────────────────────────────────
  const [showAddModal,     setShowAddModal]     = useState(false);
  const [initialModalType, setInitialModalType] = useState('Expense');
  const [editTx,           setEditTx]           = useState(null);
  const [inspectTx,        setInspectTx]        = useState(null);
  const [showCmdPalette,   setShowCmdPalette]   = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('fintrack_sidebar_collapsed') === 'true');
  const [isMasked,         setIsMasked]         = useState(() => localStorage.getItem('fintrack_masked') === 'true');
  const [themeMode,        setThemeMode]        = useState(() => localStorage.getItem('fintrack_theme') || 'midnight');

  const toggleMask = useCallback(() => {
    setIsMasked(prev => {
      const next = !prev;
      localStorage.setItem('fintrack_masked', String(next));
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      const next = prev === 'oled' ? 'midnight' : 'oled';
      localStorage.setItem('fintrack_theme', next);
      return next;
    });
  }, []);

  const toggleSidebar = useCallback((val) => {
    setSidebarCollapsed(val);
    localStorage.setItem('fintrack_sidebar_collapsed', String(val));
  }, []);

  useEffect(() => {
    if (themeMode === 'oled') {
      document.body.style.backgroundColor = '#000000';
    } else {
      document.body.style.backgroundColor = '#0B0E14';
    }
  }, [themeMode]);

  // Global Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCmdPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
    navigate('/dashboard');
  }, [navigate]);

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
    navigate('/');
  }, [navigate]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const nw     = useMemo(() => calcNetWorth(accounts, transactions), [accounts, transactions]);
  const fmtCur = useCallback(v => formatCurrency(v, profile?.currencyCode || 'INR', isMasked), [profile, isMasked]);

  // ── Transaction handlers (optimistic) ─────────────────────────────────────
  const handleSaveTx = useCallback(async (tx) => {
    setTx(prev => {
      const idx = prev.findIndex(t => t.id === tx.id);
      return idx >= 0 ? prev.map(t => t.id === tx.id ? tx : t) : [...prev, tx];
    });
    try {
      await api.saveTransaction(tx);
      toast.success(editTx ? 'Transaction updated' : 'Transaction logged');
    } catch {
      toast.error('Failed to save transaction.');
      await loadAll();
    }
  }, [editTx, loadAll]);

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
    try {
      await api.saveTransaction(copy);
      toast.success('Transaction duplicated');
    } catch {
      toast.error('Failed to duplicate transaction.');
      await loadAll();
    }
  }, [loadAll]);

  const openEdit = useCallback(tx => {
    setEditTx(tx);
    setInitialModalType(tx.type);
    setShowAddModal(true);
  }, []);

  const openAdd = useCallback((type = 'Expense') => {
    setEditTx(null);
    setInitialModalType(type);
    setShowAddModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditTx(null);
  }, []);

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

  // ── Auth Loading Gate ──────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  // ── Unauthenticated Visitor: Show Landing Page ────────────────────────────
  if (!jwt) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage onSuccess={handleSignIn} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ── New User Gate (First Setup) ───────────────────────────────────────────
  if (isNewUser) return (
    <ProfileSetupScreen
      defaultName={authUser?.name || ''}
      onComplete={async p => {
        setProfile(p);
        setIsNewUser(false);
        try { await api.updateUser(p); } catch {}
        navigate('/dashboard');
      }}
    />
  );

  // ── Authenticated User App Shell ──────────────────────────────────────────
  return (
    <div className={`min-h-screen text-neo-text flex ${themeMode === 'oled' ? 'bg-black' : 'bg-neo-bg'}`}>
      {/* Collapsible Left Sidebar for Desktop */}
      <Sidebar
        onOpenAddModal={openAdd}
        collapsed={sidebarCollapsed}
        setCollapsed={toggleSidebar}
        profile={profile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenAddModal={openAdd}
          onOpenCmdPalette={() => setShowCmdPalette(true)}
          profileName={profile?.name}
          isMasked={isMasked}
          onToggleMask={toggleMask}
        />

        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-32 sm:pb-12 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <div key={location.pathname} className="animate-slideIn">
                  <Dashboard
                    accounts={accounts}
                    transactions={transactions}
                    profile={profile}
                    onInspectTx={setInspectTx}
                    isMasked={isMasked}
                  />
                </div>
              }
            />
            <Route
              path="/activity"
              element={
                <div key={location.pathname} className="animate-slideIn">
                  <ActivityScreen
                    transactions={transactions}
                    accounts={accounts}
                    incomeCategories={incCats}
                    expenseCategories={expCats}
                    profile={profile}
                    isMasked={isMasked}
                    onDelete={handleDeleteTx}
                    onBulkDelete={handleBulkDelete}
                    onEdit={openEdit}
                    onCopy={handleCopyTx}
                    onInspect={setInspectTx}
                  />
                </div>
              }
            />
            <Route
              path="/accounts"
              element={
                <div key={location.pathname} className="animate-slideIn">
                  <Accounts
                    accounts={accounts}
                    transactions={transactions}
                    profile={profile}
                    isMasked={isMasked}
                    onAddAccount={handleAddAccount}
                    onEditAccount={handleEditAccount}
                    onDeleteAccount={handleDeleteAccount}
                  />
                </div>
              }
            />
            <Route
              path="/insights"
              element={
                <div key={location.pathname} className="animate-slideIn">
                  <InsightsScreen
                    transactions={transactions}
                    profile={profile}
                    isMasked={isMasked}
                  />
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div key={location.pathname} className="animate-slideIn">
                  <MeScreen
                    profile={profile}
                    authUser={authUser}
                    transactions={transactions}
                    accounts={accounts}
                    incomeCategories={incCats}
                    expenseCategories={expCats}
                    onUpdateProfile={handleUpdateProfile}
                    onSignOut={handleSignOut}
                    themeMode={themeMode}
                    onToggleTheme={toggleTheme}
                  />
                </div>
              }
            />
            <Route
              path="/categories"
              element={
                <div key={location.pathname} className="animate-slideIn">
                  <ManageCategoriesScreen
                    incomeCategories={incCats}
                    expenseCategories={expCats}
                    onAddIncome={handleAddIncomeCat}
                    onDeleteIncome={handleDelIncomeCat}
                    onRenameIncome={handleRenameIncomeCat}
                    onAddExpense={handleAddExpenseCat}
                    onDeleteExpense={handleDelExpenseCat}
                    onRenameExpense={handleRenameExpenseCat}
                    DEFAULT_INCOME={['Salary','Freelance','Interest','Bonus','Other']}
                    DEFAULT_EXPENSE={['Food','Groceries','Transport','Shopping','Entertainment','Health','Utilities','Rent','Education','Travel','Subscriptions','Other']}
                  />
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating Bottom Nav for Mobile */}
      <BottomNav onOpenAddWithType={openAdd} />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        onOpenAddWithType={openAdd}
        onToggleMask={toggleMask}
        isMasked={isMasked}
        transactions={transactions}
        onInspectTx={setInspectTx}
        profile={profile}
      />

      {/* Slide-over Transaction Inspector Drawer */}
      <TransactionDrawer
        isOpen={!!inspectTx}
        onClose={() => setInspectTx(null)}
        tx={inspectTx}
        onEdit={openEdit}
        onCopy={handleCopyTx}
        onDelete={handleDeleteTx}
        transactions={transactions}
        profile={profile}
        isMasked={isMasked}
      />

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={closeModal}
        onSave={handleSaveTx}
        accounts={accounts}
        incomeCategories={incCats}
        expenseCategories={expCats}
        editTx={editTx}
        initialType={initialModalType}
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
