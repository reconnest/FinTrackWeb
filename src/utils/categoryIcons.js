import {
  Utensils, ShoppingCart, Car, ShoppingBag, Film, HeartPulse,
  Zap, Home, Briefcase, RefreshCw, Layers, Award, Coffee,
  Smartphone, Plane, Dumbbell, BookOpen, Gift, HelpCircle
} from 'lucide-react';

const CATEGORY_MAP = {
  food: { emoji: '🍔', icon: Utensils, bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', glow: '#F59E0B' },
  dining: { emoji: '🍕', icon: Utensils, bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', glow: '#F59E0B' },
  restaurant: { emoji: '🍷', icon: Utensils, bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', glow: '#F59E0B' },
  coffee: { emoji: '☕', icon: Coffee, bg: 'bg-amber-600/10', border: 'border-amber-600/25', text: 'text-amber-400', glow: '#D97706' },
  groceries: { emoji: '🛒', icon: ShoppingCart, bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', glow: '#10B981' },
  grocery: { emoji: '🥦', icon: ShoppingCart, bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', glow: '#10B981' },
  transport: { emoji: '🚗', icon: Car, bg: 'bg-sky-500/10', border: 'border-sky-500/25', text: 'text-sky-400', glow: '#0EA5E9' },
  fuel: { emoji: '⛽', icon: Car, bg: 'bg-sky-500/10', border: 'border-sky-500/25', text: 'text-sky-400', glow: '#0EA5E9' },
  travel: { emoji: '✈️', icon: Plane, bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', text: 'text-cyan-400', glow: '#06B6D4' },
  cab: { emoji: '🚕', icon: Car, bg: 'bg-amber-400/10', border: 'border-amber-400/25', text: 'text-amber-300', glow: '#FBBF24' },
  shopping: { emoji: '🛍️', icon: ShoppingBag, bg: 'bg-pink-500/10', border: 'border-pink-500/25', text: 'text-pink-400', glow: '#EC4899' },
  clothes: { emoji: '👕', icon: ShoppingBag, bg: 'bg-pink-500/10', border: 'border-pink-500/25', text: 'text-pink-400', glow: '#EC4899' },
  gift: { emoji: '🎁', icon: Gift, bg: 'bg-rose-500/10', border: 'border-rose-500/25', text: 'text-rose-400', glow: '#F43F5E' },
  entertainment: { emoji: '🎬', icon: Film, bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400', glow: '#8B5CF6' },
  movie: { emoji: '🍿', icon: Film, bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400', glow: '#8B5CF6' },
  subscriptions: { emoji: '📱', icon: Smartphone, bg: 'bg-violet-500/10', border: 'border-violet-500/25', text: 'text-violet-400', glow: '#8B5CF6' },
  subscription: { emoji: '📺', icon: Smartphone, bg: 'bg-violet-500/10', border: 'border-violet-500/25', text: 'text-violet-400', glow: '#8B5CF6' },
  health: { emoji: '💊', icon: HeartPulse, bg: 'bg-rose-500/10', border: 'border-rose-500/25', text: 'text-rose-400', glow: '#F43F5E' },
  fitness: { emoji: '🏋️', icon: Dumbbell, bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400', glow: '#F97316' },
  utilities: { emoji: '💡', icon: Zap, bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', text: 'text-yellow-400', glow: '#EAB308' },
  utility: { emoji: '⚡', icon: Zap, bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', text: 'text-yellow-400', glow: '#EAB308' },
  rent: { emoji: '🏠', icon: Home, bg: 'bg-indigo-500/10', border: 'border-indigo-500/25', text: 'text-indigo-400', glow: '#6366F1' },
  housing: { emoji: '🏡', icon: Home, bg: 'bg-indigo-500/10', border: 'border-indigo-500/25', text: 'text-indigo-400', glow: '#6366F1' },
  education: { emoji: '📚', icon: BookOpen, bg: 'bg-teal-500/10', border: 'border-teal-500/25', text: 'text-teal-400', glow: '#14B8A6' },
  salary: { emoji: '💼', icon: Briefcase, bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', glow: '#10B981' },
  freelance: { emoji: '💻', icon: Briefcase, bg: 'bg-teal-500/10', border: 'border-teal-500/25', text: 'text-teal-400', glow: '#14B8A6' },
  bonus: { emoji: '🏆', icon: Award, bg: 'bg-yellow-400/10', border: 'border-yellow-400/25', text: 'text-yellow-300', glow: '#FACC15' },
  interest: { emoji: '📈', icon: Layers, bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400', glow: '#3B82F6' },
  transfer: { emoji: '⇆', icon: RefreshCw, bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', text: 'text-cyan-400', glow: '#00D2FF' },
};

const DEFAULT_META = {
  emoji: '🏷️',
  icon: Layers,
  bg: 'bg-slate-500/10',
  border: 'border-slate-500/25',
  text: 'text-slate-300',
  glow: '#94A3B8'
};

export function getCategoryMeta(categoryName) {
  if (!categoryName) return DEFAULT_META;
  const key = categoryName.trim().toLowerCase();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];

  for (const [k, v] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(k)) return v;
  }
  return DEFAULT_META;
}
