import React from 'react';
import {
  LayoutDashboard, Activity, Wallet, BarChart3, User,
  Plus, ChevronLeft, ChevronRight, Cloud
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'activity', label: 'Activity Log', Icon: Activity     },
  { id: 'accounts', label: 'Cards & Accounts', Icon: Wallet   },
  { id: 'insights', label: 'Analytics', Icon: BarChart3       },
  { id: 'me',       label: 'Settings & Profile', Icon: User   },
];

export const Sidebar = ({
  activeTab, setActiveTab, onOpenAddModal,
  collapsed, setCollapsed, profile
}) => {
  const initials = profile?.name
    ? profile.name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')
    : 'FT';

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between h-screen sticky top-0 bg-neo-surface/95 backdrop-blur-xl border-r border-neo-border transition-all duration-300 z-30 ${
        collapsed ? 'w-20 px-3 py-5' : 'w-64 px-4 py-5'
      }`}
    >
      {/* Top Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-neo-emerald to-neo-cyan p-[1.5px] shadow-neo-glow-green flex-shrink-0">
              <div className="w-full h-full bg-neo-card rounded-[14px] flex items-center justify-center">
                <span className="text-white font-black text-sm">FT</span>
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">FinTrack</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-neo-emerald/15 text-neo-neonGreen border border-neo-emerald/30 rounded-full">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-neo-muted truncate">Cloud Edition</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-neo-muted hover:text-white hover:bg-neo-card rounded-xl transition-all"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* + New Entry Primary Action Button */}
        <button
          onClick={() => onOpenAddModal()}
          className={`w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-neo-emerald to-neo-neonGreen hover:opacity-90 text-black font-extrabold rounded-2xl shadow-neo-glow-green transition-all active:scale-95 text-xs ${
            collapsed ? 'px-0' : 'px-4'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          {!collapsed && <span>New Transaction</span>}
        </button>

        {/* Navigation Menu */}
        <nav className="space-y-1 pt-2">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  collapsed ? 'justify-center px-0' : 'px-3.5'
                } ${
                  active
                    ? 'bg-neo-card text-neo-neonGreen border border-neo-emerald/30 shadow-sm'
                    : 'text-neo-muted hover:text-white hover:bg-neo-card/60'
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-neo-neonGreen' : 'text-neo-muted'}`} />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User & Cloud Sync Info */}
      <div className="space-y-3 pt-4 border-t border-neo-border/60">
        {!collapsed && (
          <div className="flex items-center gap-1.5 text-[10px] text-neo-neonGreen font-semibold px-2">
            <Cloud className="w-3.5 h-3.5" /> <span>Turso Cloud Synced</span>
          </div>
        )}

        <div
          onClick={() => setActiveTab('me')}
          className={`flex items-center gap-3 p-1.5 rounded-2xl hover:bg-neo-card cursor-pointer transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neo-purple to-neo-blue flex items-center justify-center text-white font-black text-xs flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{profile?.name || 'Account'}</div>
              <div className="text-[10px] text-neo-muted truncate">{profile?.currencyCode || 'INR'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
