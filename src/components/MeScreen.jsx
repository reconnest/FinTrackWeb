import React, { useState } from 'react';
import { User, Download, Upload, RefreshCw, FileJson, Pencil, Check, X } from 'lucide-react';
import { exportBackupJSON } from '../utils/backup';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)', country: 'IN' },
  { code: 'USD', label: 'US Dollar ($)', country: 'US' },
  { code: 'EUR', label: 'Euro (€)', country: 'EU' },
  { code: 'GBP', label: 'British Pound (£)', country: 'GB' },
  { code: 'AED', label: 'UAE Dirham', country: 'AE' },
  { code: 'SGD', label: 'Singapore Dollar', country: 'SG' },
];

export const MeScreen = ({
  profile, transactions, accounts, incomeCategories, expenseCategories,
  onImportBackup, onResetData, onUpdateProfile, setActiveTab
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(profile?.name || '');
  const [currency, setCurrency] = useState(profile?.currencyCode || 'INR');
  const [err, setErr]         = useState('');

  const toast   = useToast();
  const confirm = useConfirm();
  const handleExportJSON = () => {
    exportBackupJSON({ profile, transactions, accounts, incomeCategories, expenseCategories });
    toast.success('Backup downloaded successfully.');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { onImportBackup(JSON.parse(ev.target.result)); toast.success('Backup restored successfully!'); }
      catch { toast.error('Invalid backup file. Please use a valid FinTrack JSON.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startEdit = () => {
    setName(profile?.name || '');
    setCurrency(profile?.currencyCode || 'INR');
    setErr('');
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setErr(''); };

  const saveEdit = () => {
    const n = name.trim();
    if (!n) { setErr('Name cannot be empty.'); return; }
    const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    onUpdateProfile({ name: n, currencyCode: cur.code, countryCode: cur.country });
    setEditing(false);
    setErr('');
  };

  const initials = profile?.name
    ? profile.name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0,2).join('')
    : 'U';

  return (
    <div className="space-y-5 pb-12">
      {/* Profile card */}
      <div className="bg-ft-card border border-ft-border rounded-2xl p-5">
        {editing ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-ft-muted uppercase tracking-wider">Edit Profile</p>
            <div>
              <label className="block text-[11px] text-ft-muted mb-1">Your Name</label>
              <input autoFocus type="text" value={name} onChange={e => { setName(e.target.value); setErr(''); }}
                className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-ft-green" />
            </div>
            <div>
              <label className="block text-[11px] text-ft-muted mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full bg-ft-bg border border-ft-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-ft-green">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            {err && <p className="text-ft-red text-[11px]">{err}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={saveEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-ft-primary hover:bg-ft-green text-white text-xs font-bold rounded-xl transition-all">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={cancelEdit}
                className="flex items-center gap-1.5 px-4 py-2 text-ft-muted bg-ft-bg border border-ft-border rounded-xl text-xs hover:text-white transition-all">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-ft-primary flex items-center justify-center text-white font-black text-xl border border-ft-green/20">
                {initials}
              </div>
              <div>
                <div className="text-base font-bold text-white">{profile?.name || 'User'}</div>
                <div className="text-xs text-ft-muted">{profile?.currencyCode || 'INR'} · {profile?.countryCode || 'IN'}</div>
                <div className="text-[11px] text-ft-muted mt-0.5">
                  {transactions.length} transactions · {accounts.length} accounts
                </div>
              </div>
            </div>
            <button onClick={startEdit}
              className="p-2 text-ft-muted hover:text-ft-green hover:bg-ft-green/10 rounded-xl transition-all"
              title="Edit profile">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Data management */}
      <div className="bg-ft-card border border-ft-border rounded-2xl divide-y divide-ft-border overflow-hidden">
        <div className="px-4 py-2.5">
          <span className="text-[10px] font-bold text-ft-muted uppercase tracking-wider">Data Management</span>
        </div>
        <button onClick={handleExportJSON}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-ft-border/10 transition-all text-left">
          <div className="w-9 h-9 rounded-xl bg-ft-green/10 text-ft-green border border-ft-green/20 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ft-text">Export Backup (JSON)</div>
            <div className="text-[11px] text-ft-muted">Download all data as a JSON file</div>
          </div>
        </button>
        <label className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-ft-border/10 transition-all cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-ft-blue/10 text-ft-blue border border-ft-blue/20 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ft-text">Import Backup (JSON)</div>
            <div className="text-[11px] text-ft-muted">Restore from a FinTrack JSON backup</div>
          </div>
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
        <button onClick={() => setActiveTab('categories')}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-ft-border/10 transition-all text-left">
          <div className="w-9 h-9 rounded-xl bg-ft-orange/10 text-ft-orange border border-ft-orange/20 flex items-center justify-center">
            <FileJson className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ft-text">Manage Categories</div>
            <div className="text-[11px] text-ft-muted">Add, rename or remove categories</div>
          </div>
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-ft-card border border-ft-red/20 rounded-2xl divide-y divide-ft-border overflow-hidden">
        <div className="px-4 py-2.5">
          <span className="text-[10px] font-bold text-ft-red uppercase tracking-wider">Danger Zone</span>
        </div>
        <button
          onClick={() => { if (window.confirm('Reset all data to sample data? This cannot be undone.')) onResetData(); }}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-ft-red/5 transition-all text-left">
          <div className="w-9 h-9 rounded-xl bg-ft-red/10 text-ft-red border border-ft-red/20 flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ft-red">Reset to Demo Data</div>
            <div className="text-[11px] text-ft-muted">Clears all entries and restores sample data</div>
          </div>
        </button>
      </div>

      <p className="text-center text-[11px] text-ft-border">FinTrack Web Prototype · All data stored locally</p>
    </div>
  );
};
