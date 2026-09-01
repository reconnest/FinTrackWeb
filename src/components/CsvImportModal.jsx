import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, FileUp, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export const CsvImportModal = ({ isOpen, onClose, onImportTransactions, accounts, categories }) => {
  if (!isOpen) return null;

  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMsg('No readable rows found in CSV.');
          return;
        }

        // Map columns intelligently
        const sample = results.data[0];
        const keys = Object.keys(sample);

        const dateKey = keys.find(k => /date/i.test(k)) || keys[0];
        const descKey = keys.find(k => /desc|particular|narration|details|merchant/i.test(k)) || keys[1];
        const amountKey = keys.find(k => /amount|debit|withdrawal|total|spent/i.test(k)) || keys[2];
        const creditKey = keys.find(k => /credit|deposit/i.test(k));

        const mapped = results.data.map((row, idx) => {
          const rawDate = row[dateKey] || new Date().toISOString().slice(0, 10);
          const rawDesc = row[descKey] || 'Imported Transaction';
          const rawDebit = Number(String(row[amountKey] || '').replace(/[^0-9.-]+/g, '')) || 0;
          const rawCredit = creditKey ? Number(String(row[creditKey] || '').replace(/[^0-9.-]+/g, '')) : 0;

          const isIncome = rawCredit > 0 || /salary|credit|refund|interest/i.test(rawDesc);
          const amount = rawCredit > 0 ? rawCredit : Math.abs(rawDebit);

          // Auto-categorize guess
          let category = 'Groceries & Household';
          let group = 'Needs';

          if (/salary|interest|dividend/i.test(rawDesc)) {
            category = 'Salary'; group = 'Income';
          } else if (/swiggy|zomato|dining|cafe|restaurant/i.test(rawDesc)) {
            category = 'Dining & Food Delivery'; group = 'Wants';
          } else if (/uber|ola|petrol|fuel|metro/i.test(rawDesc)) {
            category = 'Transport & Fuel'; group = 'Needs';
          } else if (/rent|society/i.test(rawDesc)) {
            category = 'Housing & Rent'; group = 'Needs';
          } else if (/netflix|spotify|prime|apple/i.test(rawDesc)) {
            category = 'Entertainment & Subs'; group = 'Wants';
          } else if (/sip|mutual|zerodha|groww/i.test(rawDesc)) {
            category = 'Mutual Funds / SIP'; group = 'Savings';
          }

          return {
            id: 'imp-' + Date.now() + '-' + idx,
            date: rawDate,
            accountId: selectedAccountId,
            description: rawDesc,
            category,
            group,
            type: isIncome ? 'Income' : 'Expense',
            amount: amount || 100,
            status: 'Pending',
            notes: 'Imported from ' + file.name
          };
        }).filter(t => t.amount > 0);

        setParsedData(mapped);
      },
      error: (err) => {
        setErrorMsg('Error parsing CSV: ' + err.message);
      }
    });
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImportTransactions(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Bank Statement (CSV)</h2>
              <span className="text-[11px] text-slate-400">Automatic column detection and smart category assignment</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
              ))}
            </select>
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-950/50 transition-all">
            <input
              type="file"
              accept=".csv"
              id="csvInput"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="csvInput" className="cursor-pointer space-y-2 block">
              <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
              <div className="text-slate-200 font-medium">
                {fileName ? fileName : 'Click to select or drop bank CSV file'}
              </div>
              <p className="text-[10px] text-slate-500">Supports HDFC, ICICI, SBI, Axis, and standard CSV formats</p>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parsed {parsedData.length} transactions successfully</span>
                </span>
              </div>

              {/* Preview mini table */}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 text-[11px] font-mono">
                {parsedData.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-400">{t.date}</span>
                    <span className="text-slate-200 truncate max-w-xs">{t.description}</span>
                    <span className={t.type === 'Income' ? 'text-emerald-400' : 'text-slate-200'}>
                      {t.type === 'Income' ? '+' : '-'}₹{t.amount}
                    </span>
                  </div>
                ))}
                {parsedData.length > 5 && (
                  <div className="text-center text-[10px] text-slate-500 pt-1">
                    + {parsedData.length - 5} more entries ready to import
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-emerald-500/25"
            >
              Import {parsedData.length} Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
