import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Wallet, BarChart3, User,
  Plus, Eye, EyeOff, Search, Command
} from 'lucide-react';

const TABS = [
  { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/activity',  label: 'Activity',  Icon: Activity        },
  { path: '/accounts',  label: 'Cards & Accounts', Icon: Wallet   },
  { path: '/insights',  label: 'Analytics', Icon: BarChart3       },
  { path: '/settings',  label: 'Profile',   Icon: User            },
];

export const Navbar = ({
  onOpenAddModal, onOpenCmdPalette, profileName,
  isMasked, onToggleMask
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const initials = profileName
    ? profileName.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')
    : 'FT';

  return (
    <header className="sticky top-0 z-40 bg-neo-bg/90 backdrop-blur-xl border-b border-neo-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard')}>
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
            </div>
          </div>

          {/* Interactive Top Bar Search with ⌘K Badge */}
          <div className="flex-1 max-w-md mx-1 sm:mx-4">
            <div
              onClick={onOpenCmdPalette}
              className="relative flex items-center bg-neo-surface border border-neo-border hover:border-neo-borderLight focus-within:border-neo-neonGreen/60 rounded-2xl px-3.5 py-2 transition-all shadow-inner cursor-pointer group"
            >
              <Search className="w-4 h-4 text-neo-muted group-hover:text-white mr-2.5 flex-shrink-0 transition-colors" />
              <input
                type="text"
                placeholder="Search transactions, categories, commands..."
                className="w-full bg-transparent text-xs text-white placeholder-neo-muted/60 focus:outline-none cursor-pointer"
                onClick={onOpenCmdPalette}
                onFocus={onOpenCmdPalette}
                readOnly
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCmdPalette();
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-neo-card border border-neo-border hover:border-neo-cyan/50 text-neo-muted hover:text-white rounded-lg transition-all ml-1.5 flex-shrink-0"
                title="Open Command Palette (⌘K / Ctrl+K)"
              >
                <Command className="w-3 h-3 text-neo-cyan" />
                <span>K</span>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Privacy Mask Toggle */}
            <button
              onClick={onToggleMask}
              className="p-2 text-neo-muted hover:text-white bg-neo-surface border border-neo-border hover:border-neo-borderLight rounded-xl transition-all"
              title={isMasked ? 'Show amounts' : 'Hide amounts (Privacy Mode)'}
            >
              {isMasked ? <EyeOff className="w-4 h-4 text-neo-coral" /> : <Eye className="w-4 h-4 text-neo-emerald" />}
            </button>

            {/* Desktop New Entry Button */}
            <button
              onClick={() => onOpenAddModal()}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-neo-emerald to-neo-neonGreen hover:from-neo-neonGreen hover:to-neo-emerald text-black rounded-xl shadow-neo-glow-green transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Entry</span>
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => navigate('/settings')}
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

        {/* Tablet Capsule Navigation Bar */}
        <nav className="hidden sm:flex lg:hidden items-center gap-1.5 pb-2.5 pt-0.5 border-t border-neo-border/50">
          {TABS.map(({ path, label, Icon }) => {
            const active = location.pathname === path || (path === '/dashboard' && location.pathname === '/');
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
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
