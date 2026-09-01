import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, { title = 'Are you sure?', danger = true } = {}) => {
    return new Promise((resolve) => {
      setState({ message, title, danger, resolve });
    });
  }, []);

  const handle = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="bg-ft-surface border border-ft-border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${state.danger ? 'bg-ft-red/10 text-ft-red' : 'bg-ft-blue/10 text-ft-blue'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{state.title}</h3>
                <p className="text-xs text-ft-muted mt-1 leading-relaxed">{state.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => handle(false)}
                className="px-4 py-2 text-xs text-ft-muted bg-ft-card border border-ft-border rounded-xl hover:text-white transition-all">
                Cancel
              </button>
              <button onClick={() => handle(true)}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${state.danger ? 'bg-ft-red hover:bg-red-700' : 'bg-ft-primary hover:bg-ft-green'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
