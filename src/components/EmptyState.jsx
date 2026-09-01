import React from 'react';

const ILLUSTRATIONS = {
  transactions: (
    <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto mb-4 opacity-30">
      <rect x="15" y="20" width="90" height="60" rx="8" fill="none" stroke="#2E7D32" strokeWidth="2"/>
      <rect x="25" y="35" width="40" height="4" rx="2" fill="#2E7D32"/>
      <rect x="25" y="47" width="28" height="4" rx="2" fill="#414942"/>
      <rect x="25" y="59" width="35" height="4" rx="2" fill="#414942"/>
      <rect x="75" y="33" width="20" height="8" rx="4" fill="#C62828" opacity="0.6"/>
      <rect x="75" y="45" width="20" height="8" rx="4" fill="#2E7D32" opacity="0.6"/>
    </svg>
  ),
  accounts: (
    <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto mb-4 opacity-30">
      <rect x="10" y="25" width="100" height="50" rx="10" fill="none" stroke="#2E7D32" strokeWidth="2"/>
      <rect x="10" y="40" width="100" height="10" fill="#2E7D32" opacity="0.2"/>
      <circle cx="30" cy="62" r="5" fill="#414942"/>
      <rect x="45" y="58" width="30" height="4" rx="2" fill="#414942"/>
    </svg>
  ),
  insights: (
    <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto mb-4 opacity-30">
      <rect x="10" y="70" width="20" height="20" rx="3" fill="#2E7D32" opacity="0.5"/>
      <rect x="35" y="50" width="20" height="40" rx="3" fill="#2E7D32" opacity="0.7"/>
      <rect x="60" y="35" width="20" height="55" rx="3" fill="#2E7D32"/>
      <rect x="85" y="55" width="20" height="35" rx="3" fill="#C62828" opacity="0.6"/>
    </svg>
  ),
  categories: (
    <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto mb-4 opacity-30">
      <circle cx="60" cy="50" r="30" fill="none" stroke="#2E7D32" strokeWidth="2"/>
      <circle cx="60" cy="50" r="15" fill="none" stroke="#414942" strokeWidth="2"/>
      <line x1="60" y1="20" x2="60" y2="50" stroke="#2E7D32" strokeWidth="2"/>
      <line x1="60" y1="50" x2="85" y2="68" stroke="#C62828" strokeWidth="2"/>
    </svg>
  ),
};

export const EmptyState = ({ type = 'transactions', title, subtitle, action, onAction }) => (
  <div className="py-16 text-center">
    {ILLUSTRATIONS[type] || ILLUSTRATIONS.transactions}
    <h3 className="text-sm font-bold text-ft-text mb-1">{title}</h3>
    <p className="text-xs text-ft-muted mb-5 max-w-[220px] mx-auto leading-relaxed">{subtitle}</p>
    {action && onAction && (
      <button onClick={onAction}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-ft-primary hover:bg-ft-green text-white text-xs font-bold rounded-xl shadow-md transition-all">
        {action}
      </button>
    )}
  </div>
);
