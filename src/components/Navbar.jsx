import React from 'react';
import { LayoutDashboard, Activity, Wallet, BarChart3, User, Plus, Eye, EyeOff, Sparkles } from 'lucide-react';

const TABS = [
  { id: 'home',     label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'activity', label: 'Activity',  Icon: Activity        },
  { id: 'accounts', label: 'Cards & Accounts', Icon: Wallet   },
  { id: 'insights', label: 'Analytics', Icon: BarChart3       },
  { id: 'me',       label: 'Profile',   Icon: User            },
];

export const Navbar = ({
  activeTab, setActiveTab, onOpenAddModal, profileName,
  formatCurrency, netWorth, isMasked, onToggleMask
}) => {
  const initials = profileName
    ? profileName.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')
    : 'FT';

  return (
    <header className="sticky top-0 z-40 bg-neo-bg/90 backdrop-blur-xl border-b border-neo-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-neo-emerald to-neo-cyan p-[1px] shadow-neo-glow-green transition-transform active:scale-95">
                <div className="w-full h-full bg-neo-surface rounded-[15px] flex items-center justify-center">
                  <span className="text-white font-black text-sm tracking-tight">FT</span>
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-neo-neonGreen rounded-full border-2 border-neo-bg animate-pulse" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-white tracking-tight">FinTrack</span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-neo-emerald/15 text-neo-neonGreen border border-neo-emerald/30 rounded-full">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-neo-muted hidden sm:inline-block">Cloud Synced · Neo Dashboard</span>
            </div>
          </div>

          {/* Center Net Worth Pill with Privacy Toggle */}
          <div className="flex items-center gap-2 bg-neo-surface border border-neo-border px-3.5 py-1.5 rounded-2xl shadow-inner">
            <div className="flex flex-col text-right sm:text-left">
              <span className="text-[10px] font-semibold text-neo-muted uppercase tracking-wider flex items-center gap-1">
                Net Worth
              </span>
              <span className="text-xs sm:text-sm font-black font-mono text-white tracking-tight">
                {formatCurrency(netWorth, 'INR', isMasked)}
              </span>
            </div>
            <button
              onClick={onToggleMask}
              className="p-1 text-neo-muted hover:text-white hover:bg-neo-card rounded-lg transition-all"
              title={isMasked ? 'Show amounts' : 'Hide amounts (Privacy Mode)'}
            >
              {isMasked ? <EyeOff className="w-3.5 h-3.5 text-neo-coral" /> : <Eye className="w-3.5 h-3.5 text-neo-emerald" />}
            </button>
          </div>

          {/* Right Actions (Desktop Add + Profile Avatar) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAddModal()}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-neo-emerald to-neo-neonGreen hover:from-neo-neonGreen hover:to-neo-emerald text-black rounded-xl shadow-neo-glow-green transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Entry</span>
            </button>

            {/* Profile Avatar Pill */}
            <button
              onClick={() => setActiveTab('me')}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-neo-surface border border-neo-border hover:border-neo-borderLight rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neo-purple to-neo-blue flex items-center justify-center text-white font-black text-xs">
                {initials}
              </div>
              <span className="text-xs font-bold text-white hidden md:inline-block max-w-[90px] truncate">
                {profileName || 'Account'}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Capsule Navigation Bar */}
        <nav className="hidden sm:flex items-center gap-1.5 pb-2.5 pt-0.5 border-t border-neo-border/50">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-neo-card text-neo-neonGreen border border-neo-emerald/30 shadow-sm'
                    : 'text-neo-muted hover:text-white hover:bg-neo-surface'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-neo-neonGreen' : 'text-neo-muted'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
