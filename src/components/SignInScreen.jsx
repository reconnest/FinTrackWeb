import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Shield, BarChart3, Wallet, Activity } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './Toast';

const FEATURES = [
  { Icon: BarChart3, text: 'Smart insights & spending patterns' },
  { Icon: Wallet,    text: 'Live balance across all accounts' },
  { Icon: Activity,  text: 'Full activity log with filters' },
  { Icon: Shield,    text: 'Data synced to cloud, private to you' },
];

export const SignInScreen = ({ onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true);
    try {
      const { token, user } = await api.signIn(credential);
      onSuccess(token, user);
    } catch (err) {
      toast.error('Sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ft-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-ft-primary flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-ft-green/20 border border-ft-green/20">
            <span className="text-white font-black text-3xl tracking-tight">FT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">FinTrack Web</h1>
          <p className="text-ft-muted text-sm mt-1">Your personal finance, in the cloud</p>
        </div>

        {/* Feature list */}
        <div className="space-y-3">
          {FEATURES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-3 bg-ft-card border border-ft-border rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-ft-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-ft-green" />
              </div>
              <span className="text-xs text-ft-text font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* Google Sign-in */}
        <div className="flex flex-col items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2 text-ft-muted text-sm">
              <div className="w-4 h-4 border-2 border-ft-green border-t-transparent rounded-full animate-spin" />
              Signing you in...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-in failed. Please try again.')}
              theme="filled_black"
              shape="pill"
              size="large"
              text="continue_with"
              width="280"
            />
          )}
          <p className="text-[11px] text-ft-border text-center px-4">
            Your data is stored privately in the cloud and never shared.
          </p>
        </div>
      </div>
    </div>
  );
};
