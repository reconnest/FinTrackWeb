import React from 'react';
import { LayoutDashboard, Activity, Wallet, BarChart3, User, PlusCircle } from 'lucide-react';

const TABS = [
  { id: 'home',     label: 'Home',     Icon: LayoutDashboard },
  { id: 'activity', label: 'Activity', Icon: Activity        },
  { id: 'accounts', label: 'Accounts', Icon: Wallet          },
  { id: 'insights', label: 'Insights', Icon: BarChart3       },
  { id: 'me',       label: 'Me',       Icon: User            },
];

export const Navbar = ({ activeTab, setActiveTab, onOpenAddModal, profileName, formatCurrency, netWorth }) => (
  <header className="sticky top-0 z-40 bg-ft-bg/95 backdrop-blur-md border-b border-ft-border">
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ft-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm tracking-tight">FT</span>
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">FinTrack</span>
          <span className="hidden sm:inline-flex ml-1 px-2 py-0.5 text-[10px] font-bold bg-ft-green/10 text-ft-green border border-ft-green/20 rounded-full">
            Web
          </span>
          <span className="hidden lg:inline-block ml-3 pl-3 border-l border-ft-border text-xs text-ft-muted">
            Net Worth: <span className="font-mono font-bold text-white">{formatCurrency(netWorth)}</span>
          </span>
        </div>
        {/* Desktop Add button */}
        <button onClick={onOpenAddModal}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-ft-primary hover:bg-ft-green text-white rounded-xl shadow-md transition-all active:scale-95">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Transaction</span>
        </button>
      </div>
      {/* Desktop tab row — hidden on mobile (BottomNav handles mobile) */}
      <nav className="hidden sm:flex gap-1 overflow-x-auto pb-2">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-ft-primary/20 text-ft-green border border-ft-primary/30'
                  : 'text-ft-muted hover:text-ft-text hover:bg-ft-card'
              }`}>
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-ft-green' : ''}`} />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  </header>
);
