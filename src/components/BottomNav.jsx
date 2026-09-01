import React, { useState } from 'react';
import { LayoutDashboard, Activity, Wallet, BarChart3, User, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, X } from 'lucide-react';

const TABS = [
  { id: 'home',     label: 'Home',     Icon: LayoutDashboard },
  { id: 'activity', label: 'Activity', Icon: Activity        },
  { id: 'accounts', label: 'Accounts', Icon: Wallet          },
  { id: 'insights', label: 'Insights', Icon: BarChart3       },
  { id: 'me',       label: 'Profile',  Icon: User            },
];

export const BottomNav = ({ activeTab, setActiveTab, onOpenAddWithType }) => {
  const [dialOpen, setDialOpen] = useState(false);

  const handleAction = (type) => {
    setDialOpen(false);
    onOpenAddWithType(type);
  };

  return (
    <>
      {/* Neo Backdrop when Dial is Open */}
      {dialOpen && (
        <div
          onClick={() => setDialOpen(false)}
          className="sm:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn"
        />
      )}

      {/* Floating Action Dial Popup (Mobile) */}
      {dialOpen && (
        <div className="sm:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 animate-slideUp">
          <button
            onClick={() => handleAction('Expense')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-neo-surface border border-neo-crimson/30 shadow-neo-card text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-xl bg-neo-crimson/20 text-neo-crimson flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neo-coral">Expense</span>
          </button>

          <button
            onClick={() => handleAction('Transfer')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-neo-surface border border-neo-cyan/30 shadow-neo-card text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-xl bg-neo-cyan/20 text-neo-cyan flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neo-cyan">Transfer</span>
          </button>

          <button
            onClick={() => handleAction('Income')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-neo-surface border border-neo-emerald/30 shadow-neo-card text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-xl bg-neo-emerald/20 text-neo-neonGreen flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neo-neonGreen">Income</span>
          </button>
        </div>
      )}

      {/* Floating Bottom Dock (Mobile) */}
      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-40 bg-neo-surface/95 backdrop-blur-xl border border-neo-border rounded-3xl shadow-neo-card px-2 py-1.5">
        <div className="flex items-center justify-around relative">
          {/* First 2 tabs */}
          {TABS.slice(0, 2).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { setDialOpen(false); setActiveTab(id); }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
                  active ? 'text-neo-neonGreen font-bold' : 'text-neo-muted hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px]">{label}</span>
              </button>
            );
          })}

          {/* Center Elevated Floating Plus Button */}
          <div className="relative -top-5">
            <button
              onClick={() => setDialOpen(!dialOpen)}
              className={`w-13 h-13 p-3.5 rounded-full shadow-neo-glow-green border-2 transition-all active:scale-90 flex items-center justify-center ${
                dialOpen
                  ? 'bg-neo-card border-neo-border text-white rotate-45'
                  : 'bg-gradient-to-tr from-neo-emerald to-neo-neonGreen border-neo-neonGreen/40 text-black'
              }`}
              aria-label="Quick Actions"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Last 3 tabs */}
          {TABS.slice(2).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { setDialOpen(false); setActiveTab(id); }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
                  active ? 'text-neo-neonGreen font-bold' : 'text-neo-muted hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px]">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
