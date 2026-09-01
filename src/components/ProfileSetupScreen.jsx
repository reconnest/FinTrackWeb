import React, { useState } from 'react';
import { User, Globe, DollarSign, ChevronRight } from 'lucide-react';

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)', country: 'IN' },
  { code: 'USD', label: 'US Dollar ($)', country: 'US' },
  { code: 'EUR', label: 'Euro (€)', country: 'EU' },
  { code: 'GBP', label: 'British Pound (£)', country: 'GB' },
  { code: 'AED', label: 'UAE Dirham (د.إ)', country: 'AE' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', country: 'SG' },
];

export const ProfileSetupScreen = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Please enter your name.'); return; }
    const cur = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    onComplete({ name: name.trim(), currencyCode: cur.code, countryCode: cur.country });
  };

  return (
    <div className="min-h-screen bg-ft-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-ft-primary flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-black text-2xl">FT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome to FinTrack</h1>
          <p className="text-ft-muted text-sm mt-1">Set up your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-ft-muted uppercase tracking-wider mb-1.5">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ft-muted" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Sandeep"
                value={name}
                onChange={(e) => { setName(e.target.value); setErr(''); }}
                className="w-full bg-ft-card border border-ft-border rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-ft-border focus:outline-none focus:border-ft-green transition-all"
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-ft-muted uppercase tracking-wider mb-1.5">Home Currency</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ft-muted" />
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full bg-ft-card border border-ft-border rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none focus:border-ft-green appearance-none"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {err && <p className="text-ft-red text-xs font-medium">{err}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-ft-primary hover:bg-ft-green text-white font-bold rounded-xl shadow-lg transition-all active:scale-98 text-sm mt-2"
          >
            <span>Get Started</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-ft-border mt-6">
          All data stored locally on this device. Nothing leaves your browser.
        </p>
      </div>
    </div>
  );
};
