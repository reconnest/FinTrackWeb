import React from 'react';

export const LoadingScreen = ({ message = 'Loading your data...' }) => (
  <div className="min-h-screen bg-ft-bg flex flex-col items-center justify-center gap-5">
    <div className="w-16 h-16 rounded-2xl bg-ft-primary flex items-center justify-center shadow-xl border border-ft-green/20">
      <span className="text-white font-black text-xl">FT</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <div className="w-6 h-6 border-2 border-ft-green border-t-transparent rounded-full animate-spin" />
      <p className="text-ft-muted text-xs">{message}</p>
    </div>
  </div>
);
