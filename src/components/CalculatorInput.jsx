import React from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';

export const CalculatorInput = ({ expression, setExpression, onConfirm }) => {
  const handleKey = (char) => {
    if (char === 'C') {
      setExpression('');
      return;
    }
    if (char === 'BACKSPACE') {
      setExpression(prev => prev.slice(0, -1));
      return;
    }
    if (char === '=') {
      try {
        const safeExpr = expression.replace(/×/g, '*').replace(/÷/g, '/');
        // Basic safe arithmetic parser
        const val = Function(`'use strict'; return (${safeExpr})`)();
        if (!isNaN(val) && isFinite(val)) {
          setExpression(String(Math.round(val * 100) / 100));
        }
      } catch {
        // Invalid expression ignored
      }
      return;
    }

    // Prevent duplicate operators
    const isOp = ['+', '-', '×', '÷'].includes(char);
    const lastChar = expression.slice(-1);
    if (isOp && ['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression(prev => prev.slice(0, -1) + char);
      return;
    }

    setExpression(prev => prev + char);
  };

  const keys = [
    ['C', '÷', '×', 'BACKSPACE'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['00', '0', '.', '=']
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5 p-2 bg-neo-bg border border-neo-border rounded-2xl">
      {/* Row 1 */}
      <button
        type="button" onClick={() => handleKey('C')}
        className="py-2.5 rounded-xl bg-neo-surface border border-neo-border text-neo-coral font-bold text-xs hover:bg-neo-crimson/20 active:scale-95 transition-all"
      >
        C
      </button>
      <button
        type="button" onClick={() => handleKey('÷')}
        className="py-2.5 rounded-xl bg-neo-surface border border-neo-border text-neo-cyan font-bold text-xs hover:bg-neo-cyan/20 active:scale-95 transition-all"
      >
        ÷
      </button>
      <button
        type="button" onClick={() => handleKey('×')}
        className="py-2.5 rounded-xl bg-neo-surface border border-neo-border text-neo-cyan font-bold text-xs hover:bg-neo-cyan/20 active:scale-95 transition-all"
      >
        ×
      </button>
      <button
        type="button" onClick={() => handleKey('BACKSPACE')}
        className="py-2.5 rounded-xl bg-neo-surface border border-neo-border text-neo-muted hover:text-white flex items-center justify-center text-xs active:scale-95 transition-all"
      >
        <Delete className="w-4 h-4" />
      </button>

      {/* Row 2 */}
      {['7','8','9','-'].map(k => (
        <button
          key={k} type="button" onClick={() => handleKey(k)}
          className={`py-2.5 rounded-xl border font-bold text-xs active:scale-95 transition-all ${
            k === '-' ? 'bg-neo-surface border-neo-border text-neo-cyan hover:bg-neo-cyan/20' : 'bg-neo-card border-neo-border/60 text-white hover:bg-neo-surface'
          }`}
        >
          {k}
        </button>
      ))}

      {/* Row 3 */}
      {['4','5','6','+'].map(k => (
        <button
          key={k} type="button" onClick={() => handleKey(k)}
          className={`py-2.5 rounded-xl border font-bold text-xs active:scale-95 transition-all ${
            k === '+' ? 'bg-neo-surface border-neo-border text-neo-cyan hover:bg-neo-cyan/20' : 'bg-neo-card border-neo-border/60 text-white hover:bg-neo-surface'
          }`}
        >
          {k}
        </button>
      ))}

      {/* Row 4 */}
      {['1','2','3'].map(k => (
        <button
          key={k} type="button" onClick={() => handleKey(k)}
          className="py-2.5 rounded-xl bg-neo-card border border-neo-border/60 text-white font-bold text-xs hover:bg-neo-surface active:scale-95 transition-all"
        >
          {k}
        </button>
      ))}
      <button
        type="button" onClick={() => handleKey('=')}
        className="row-span-2 py-2.5 rounded-xl bg-gradient-to-tr from-neo-emerald to-neo-neonGreen text-black font-black text-sm flex items-center justify-center shadow-neo-glow-green active:scale-95 transition-all"
      >
        =
      </button>

      {/* Row 5 */}
      <button
        type="button" onClick={() => handleKey('00')}
        className="py-2.5 rounded-xl bg-neo-card border border-neo-border/60 text-white font-bold text-xs hover:bg-neo-surface active:scale-95 transition-all"
      >
        00
      </button>
      <button
        type="button" onClick={() => handleKey('0')}
        className="py-2.5 rounded-xl bg-neo-card border border-neo-border/60 text-white font-bold text-xs hover:bg-neo-surface active:scale-95 transition-all"
      >
        0
      </button>
      <button
        type="button" onClick={() => handleKey('.')}
        className="py-2.5 rounded-xl bg-neo-card border border-neo-border/60 text-white font-bold text-xs hover:bg-neo-surface active:scale-95 transition-all"
      >
        .
      </button>
    </div>
  );
};
