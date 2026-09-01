import React from 'react';
import { LayoutDashboard, Activity, Wallet, BarChart3, User } from 'lucide-react';

const TABS = [
  { id: 'home',     label: 'Home',     Icon: LayoutDashboard },
  { id: 'activity', label: 'Activity', Icon: Activity        },
  { id: 'accounts', label: 'Accounts', Icon: Wallet          },
  { id: 'insights', label: 'Insights', Icon: BarChart3       },
  { id: 'me',       label: 'Me',       Icon: User            },
];

export const BottomNav = ({ activeTab, setActiveTab }) => (
  <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-ft-bg/95 backdrop-blur-md border-t border-ft-border">
    <div className="flex items-stretch">
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all ${
              active ? 'text-ft-green' : 'text-ft-muted hover:text-ft-text'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] font-semibold ${active ? 'text-ft-green' : ''}`}>{label}</span>
            {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-ft-green rounded-full" />}
          </button>
        );
      })}
    </div>
  </nav>
);
