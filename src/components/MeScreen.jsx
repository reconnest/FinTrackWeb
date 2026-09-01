import React, { useState } from 'react';
import { User, Download, FileJson, Pencil, Check, X, LogOut, ShieldCheck, Database, Cloud } from 'lucide-react';
import { exportBackupJSON } from '../utils/backup';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)', country: 'IN' },
  { code: 'USD', label: 'US Dollar ($)',     country: 'US' },
  { code: 'EUR', label: 'Euro (€)',          country: 'EU' },
  { code: 'GBP', label: 'British Pound (£)', country: 'GB' },
  { code: 'AED', label: 'UAE Dirham',        country: 'AE' },
  { code: 'SGD', label: 'Singapore Dollar',  country: 'SG' },
];

export const MeScreen = ({
  profile, authUser, transactions, accounts, incomeCategories, expenseCategories,
  onUpdateProfile, onSignOut, setActiveTab
}) => {
  const toast   = useToast();
  const confirm = useConfirm();
  const [editing,  setEditing]  = useState(false);
  const [name,     setName]     = useState(profile?.name || '');
  const [currency, setCurrency] = useState(profile?.currencyCode || 'INR');
  const [err,      setErr]      = useState('');

  const startEdit  = () => { setName(profile?.name || ''); setCurrency(profile?.currencyCode || 'INR'); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setErr(''); };
  const saveEdit   = async () => {
    if (!name.trim()) { setErr('Name cannot be empty.'); return; }
    const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    await onUpdateProfile({ name: name.trim(), currencyCode: cur.code, countryCode: cur.country });
    toast.success('Profile updated.');
    setEditing(false);
  };

  const handleExport = () => {
    exportBackupJSON({ profile, transactions, accounts, incomeCategories, expenseCategories });
    toast.success('Backup JSON downloaded.');
  };

  const handleSignOut = async () => {
    const ok = await confirm('Sign out of your account? Your data is safely stored in the cloud.', { title: 'Sign Out', danger: false });
    if (ok) onSignOut();
  };

  const initials = profile?.name
    ? profile.name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0,2).join('')
    : 'FT';

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Account & Settings</h1>
        <p className="text-xs text-neo-muted">Profile and cloud storage controls</p>
      </div>

      {/* User Profile Bento Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neo-card to-neo-surface border border-neo-border rounded-3xl p-6 shadow-neo-card space-y-4">
        {editing ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-neo-muted uppercase tracking-wider">Edit Profile Details</p>
            <div>
              <label className="block text-[11px] text-neo-muted mb-1 font-semibold">Your Name</label>
              <input
                autoFocus type="text" value={name} onChange={e => { setName(e.target.value); setErr(''); }}
                className="w-full bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-neo-neonGreen"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neo-muted mb-1 font-semibold">Base Currency</label>
              <select
                value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-neo-neonGreen"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            {err && <p className="text-neo-coral text-[11px] font-medium">{err}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-neo-emerald to-neo-neonGreen text-black text-xs font-bold rounded-xl shadow-sm">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 text-neo-muted bg-neo-bg border border-neo-border rounded-xl text-xs hover:text-white">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-neo-purple to-neo-blue p-[2px] shadow-neo-glow-purple flex-shrink-0">
                <div className="w-full h-full bg-neo-surface rounded-[22px] flex items-center justify-center text-white font-black text-xl">
                  {initials}
                </div>
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">{profile?.name || 'FinTrack User'}</div>
                <div className="text-xs text-neo-muted">{authUser?.email || 'Logged in with Google'}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-neo-neonGreen/10 border border-neo-neonGreen/20 text-neo-neonGreen rounded-full flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Turso Cloud Connected
                  </span>
                  <span className="text-[11px] text-neo-muted font-mono">{profile?.currencyCode}</span>
                </div>
              </div>
            </div>
            <button
              onClick={startEdit}
              className="p-2 text-neo-muted hover:text-neo-neonGreen hover:bg-neo-bg rounded-xl transition-all"
              title="Edit Profile"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cloud & Data Management Section */}
      <div className="bg-neo-card border border-neo-border rounded-3xl divide-y divide-neo-border/50 overflow-hidden shadow-neo-card">
        <div className="px-5 py-3 bg-neo-surface">
          <span className="text-[10px] font-bold text-neo-muted uppercase tracking-wider">Features & Preferences</span>
        </div>

        <button
          onClick={() => setActiveTab('categories')}
          className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-neo-surface transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-neo-cyan/10 border border-neo-cyan/25 text-neo-cyan flex items-center justify-center flex-shrink-0">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-neo-cyan transition-colors">Manage Category Hub</div>
            <div className="text-[11px] text-neo-muted">Configure custom icons, tags & categories</div>
          </div>
        </button>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-neo-surface transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-neo-emerald/10 border border-neo-emerald/25 text-neo-neonGreen flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-neo-neonGreen transition-colors">Download JSON Backup</div>
            <div className="text-[11px] text-neo-muted">Save an offline snapshot of your complete database</div>
          </div>
        </button>
      </div>

      {/* Sign Out Card */}
      <div className="bg-neo-card border border-neo-crimson/20 rounded-3xl overflow-hidden shadow-neo-card">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-neo-crimson/10 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-neo-crimson/15 border border-neo-crimson/30 text-neo-coral flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-neo-coral">Sign Out</div>
            <div className="text-[11px] text-neo-muted">Securely end session on this device</div>
          </div>
        </button>
      </div>

      <p className="text-center text-[11px] text-neo-muted/60">
        FinTrack Web Pro · Powered by Turso LibSQL & React
      </p>
    </div>
  );
};
