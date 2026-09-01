import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    info:    (msg, dur) => show(msg, 'info',     dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast stack — bottom-left on desktop, bottom-center on mobile */}
      <div className="fixed bottom-20 sm:bottom-6 left-1/2 sm:left-6 -translate-x-1/2 sm:translate-x-0 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-80 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl border pointer-events-auto
              animate-[slideUp_0.25s_ease-out]
              ${t.type === 'success' ? 'bg-[#1C2B1C] border-ft-green/30 text-ft-green' :
                t.type === 'error'   ? 'bg-[#2B1C1C] border-ft-red/30  text-ft-red'   :
                'bg-ft-surface border-ft-border text-ft-text'}`}>
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            {t.type === 'error'   && <XCircle      className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            {t.type === 'info'    && <Info         className="w-4 h-4 flex-shrink-0 mt-0.5 text-ft-blue" />}
            <p className="text-xs flex-1 leading-relaxed">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="opacity-50 hover:opacity-100 flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
