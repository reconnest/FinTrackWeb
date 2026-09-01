import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import {
  Shield, BarChart3, Wallet, Activity, Sparkles, ArrowRight,
  Lock, Zap, Cloud, CheckCircle2, ChevronRight, PieChart,
  CreditCard, Command, Calculator, Award
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const LandingPage = ({ onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true);
    try {
      const { token, user, isNewUser } = await api.signIn(credential);
      onSuccess(token, user, isNewUser);
    } catch (err) {
      toast.error('Sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToLogin = () => {
    const el = document.getElementById('hero-google-login');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-neo-bg text-neo-text flex flex-col selection:bg-neo-neonGreen selection:text-black">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-neo-bg/90 backdrop-blur-xl border-b border-neo-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-neo-emerald to-neo-cyan p-[1px] shadow-neo-glow-green">
              <div className="w-full h-full bg-neo-surface rounded-[15px] flex items-center justify-center">
                <span className="text-white font-black text-sm">FT</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight">FinTrack</span>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-neo-emerald/15 text-neo-neonGreen border border-neo-emerald/30 rounded-full">
                PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#features"
              className="hidden sm:inline-block text-xs font-semibold text-neo-muted hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#security"
              className="hidden sm:inline-block text-xs font-semibold text-neo-muted hover:text-white transition-colors"
            >
              Security
            </a>
            <button
              onClick={scrollToLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neo-surface border border-neo-border hover:border-neo-neonGreen/50 text-white hover:text-neo-neonGreen transition-all shadow-sm active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neo-surface border border-neo-border text-xs text-neo-neonGreen font-semibold shadow-sm animate-popIn">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Personal Finance · Edge Cloud Powered</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Smart Money Management, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-neo-neonGreen via-neo-cyan to-neo-emerald bg-clip-text text-transparent">
              Engineered for Speed.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neo-muted leading-relaxed max-w-2xl mx-auto">
            Experience real-time net worth tracking, intelligent spending insights, virtual credit card decks, and encrypted cloud synchronization powered by Turso LibSQL.
          </p>

          {/* Call to Action Google Button */}
          <div id="hero-google-login" className="pt-4 flex flex-col items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-neo-neonGreen text-sm font-semibold py-3">
                <div className="w-5 h-5 border-2 border-neo-neonGreen border-t-transparent rounded-full animate-spin" />
                <span>Signing you in securely...</span>
              </div>
            ) : (
              <div className="rounded-full overflow-hidden p-[2px] bg-gradient-to-r from-neo-emerald/40 to-neo-cyan/40 shadow-neo-glow-green">
                <div className="rounded-full overflow-hidden bg-black flex items-center justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Sign-in failed')}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="continue_with"
                    width="300"
                  />
                </div>
              </div>
            )}
            <span className="text-[11px] text-neo-muted/70 flex items-center gap-1.5 pt-1">
              <Shield className="w-3 h-3 text-neo-neonGreen" />
              <span>1-Click Google Login · Zero Setup · 100% Private Database</span>
            </span>
          </div>
        </div>

        {/* Interactive Hero UI Mockup Card */}
        <div className="relative mx-auto max-w-4xl rounded-3xl p-1 bg-gradient-to-b from-neo-border to-transparent shadow-neo-card">
          <div className="bg-neo-surface rounded-[23px] p-6 sm:p-8 space-y-6 overflow-hidden border border-neo-border/50">
            {/* Top Row: Hero Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 bg-gradient-to-br from-neo-card to-neo-bg border border-neo-border rounded-2xl p-5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neo-muted tracking-wider">Total Net Position</span>
                <div className="text-3xl font-black font-mono text-white">₹4,82,500</div>
                <div className="flex items-center gap-2 text-xs text-neo-neonGreen font-semibold">
                  <span>▲ +₹55,000 this month</span>
                  <span className="text-neo-muted">·</span>
                  <span>45% Savings Rate</span>
                </div>
              </div>
              <div className="bg-neo-card border border-neo-border rounded-2xl p-5 space-y-2 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-neo-purple text-xs font-bold uppercase">
                  <Sparkles className="w-4 h-4" /> AI Insight
                </div>
                <p className="text-xs text-neo-text font-medium leading-relaxed">
                  "Dining dropped by 18% compared to last month. Keep it up!"
                </p>
                <span className="text-[10px] text-neo-muted">Rotates with trends</span>
              </div>
            </div>

            {/* Virtual Card Deck Snippet */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">HDFC Salary</span>
                  <span className="w-2 h-2 rounded-full bg-neo-neonGreen" />
                </div>
                <div className="text-lg font-black font-mono text-neo-neonGreen">₹2,80,000</div>
                <span className="text-[10px] text-neo-muted">Bank Account</span>
              </div>

              <div className="bg-gradient-to-br from-[#1A102F] to-[#090511] border border-purple-800/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Regalia Gold CC</span>
                  <span className="text-[10px] font-bold text-neo-neonGreen bg-neo-neonGreen/10 px-2 py-0.5 rounded-full">14% Limit</span>
                </div>
                <div className="text-lg font-black font-mono text-neo-coral">-₹42,500</div>
                <span className="text-[10px] text-neo-muted">Credit Card</span>
              </div>

              <div className="bg-gradient-to-br from-[#2A1B0E] to-[#0D0A07] border border-amber-800/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Cash & Wallets</span>
                  <span className="w-2 h-2 rounded-full bg-neo-amber" />
                </div>
                <div className="text-lg font-black font-mono text-white">₹15,000</div>
                <span className="text-[10px] text-neo-muted">Liquid Cash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div id="features" className="space-y-8 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Everything You Need to Master Your Finances
            </h2>
            <p className="text-xs sm:text-sm text-neo-muted">
              Built with zero bloat, maximum performance, and instant cloud sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neo-card border border-neo-border rounded-3xl p-6 space-y-3 hover:border-neo-borderLight transition-all">
              <div className="w-10 h-10 rounded-2xl bg-neo-emerald/10 border border-neo-emerald/20 text-neo-neonGreen flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Virtual Card Deck</h3>
              <p className="text-xs text-neo-muted leading-relaxed">
                Visual bank accounts and credit cards with live debt liability meters and limit alerts.
              </p>
            </div>

            <div className="bg-neo-card border border-neo-border rounded-3xl p-6 space-y-3 hover:border-neo-borderLight transition-all">
              <div className="w-10 h-10 rounded-2xl bg-neo-purple/10 border border-neo-purple/20 text-neo-purple flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Smart Analytics</h3>
              <p className="text-xs text-neo-muted leading-relaxed">
                Visual expense donuts, ranked burn days with medals (🥇🥈🥉), and daily cash flow area charts.
              </p>
            </div>

            <div className="bg-neo-card border border-neo-border rounded-3xl p-6 space-y-3 hover:border-neo-borderLight transition-all">
              <div className="w-10 h-10 rounded-2xl bg-neo-cyan/10 border border-neo-cyan/20 text-neo-cyan flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Tactile Math Keypad</h3>
              <p className="text-xs text-neo-muted leading-relaxed">
                Instant arithmetic keypad and mobile touch swipe gestures for split-second logging.
              </p>
            </div>

            <div className="bg-neo-card border border-neo-border rounded-3xl p-6 space-y-3 hover:border-neo-borderLight transition-all">
              <div className="w-10 h-10 rounded-2xl bg-neo-coral/10 border border-neo-coral/20 text-neo-coral flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Turso Edge Cloud</h3>
              <p className="text-xs text-neo-muted leading-relaxed">
                Encrypted LibSQL SQLite running at the edge in Mumbai for sub-millisecond response times.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Cloud Section */}
        <div id="security" className="bg-gradient-to-br from-neo-surface to-neo-card border border-neo-border rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-14 h-14 rounded-3xl bg-neo-neonGreen/10 border border-neo-neonGreen/20 text-neo-neonGreen flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white tracking-tight">Your Data. Completely Private.</h2>
            <p className="text-xs sm:text-sm text-neo-muted leading-relaxed">
              We never sell your data or run third-party trackers. All transactions are securely isolated to your authenticated Google account and stored in encrypted cloud database tables.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-full overflow-hidden bg-black inline-flex items-center justify-center shadow-lg">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Sign-in failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
                width="280"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neo-border py-8 bg-neo-surface/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neo-muted">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">FinTrack Web</span>
            <span>·</span>
            <span>Designed for Neo-Banking Simplicity</span>
          </div>
          <div>
            Powered by Turso LibSQL, React & Google OAuth
          </div>
        </div>
      </footer>
    </div>
  );
};
