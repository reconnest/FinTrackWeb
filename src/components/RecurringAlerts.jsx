import React, { useState } from 'react';
import { 
  BellRing, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

export const RecurringAlerts = ({ recurringAlerts, onMarkAsPaid, onAddRecurringAlert, formatINR }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Utilities & WiFi',
    amount: '',
    dueDay: 1,
    frequency: 'Monthly'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    onAddRecurringAlert({
      id: 'rec-' + Date.now(),
      name: formData.name,
      category: formData.category,
      amount: Number(formData.amount) || 0,
      dueDay: Number(formData.dueDay) || 1,
      frequency: formData.frequency,
      status: 'Upcoming',
      autoPay: false
    });

    setShowModal(false);
    setFormData({ name: '', category: 'Utilities & WiFi', amount: '', dueDay: 1, frequency: 'Monthly' });
  };

  const currentDay = new Date().getDate();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Recurring Bills & Alerts</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Subscriptions, credit card payment deadlines, and automated warning notifications.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recurring Bill</span>
          </button>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringAlerts.map(alert => {
          const daysDiff = alert.dueDay - currentDay;
          const isOverdue = daysDiff < 0 && alert.status !== 'Paid';
          const isDueSoon = daysDiff >= 0 && daysDiff <= 5 && alert.status !== 'Paid';
          const isPaid = alert.status === 'Paid';

          return (
            <div 
              key={alert.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isOverdue ? 'border-rose-500/50 bg-rose-950/10' :
                isDueSoon ? 'border-amber-500/50 bg-amber-950/10' :
                'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2.5 rounded-xl ${
                      isOverdue ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      isDueSoon ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{alert.name}</h3>
                      <span className="text-[11px] text-slate-400">{alert.category}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400">Due Schedule</span>
                    <div className="text-xs font-semibold text-slate-200">
                      Day {alert.dueDay} of each month ({alert.frequency})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Amount</span>
                    <div className="text-sm font-bold font-mono text-white">
                      {formatINR(alert.amount)}
                    </div>
                  </div>
                </div>

                {/* Urgency Badge */}
                <div className="mt-3">
                  {isPaid ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Settled & Paid</span>
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Overdue by {Math.abs(daysDiff)} days</span>
                    </span>
                  ) : isDueSoon ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3 h-3" />
                      <span>Due in {daysDiff} days</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      <Clock className="w-3 h-3" />
                      <span>Upcoming in {daysDiff} days</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                {!isPaid ? (
                  <button
                    onClick={() => onMarkAsPaid(alert.id)}
                    className="w-full py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-all flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Paid & Record Entry</span>
                  </button>
                ) : (
                  <div className="text-center text-[11px] text-slate-500 font-medium py-1.5">
                    ✅ Recorded in August Ledger
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Add Recurring Bill</h2>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Wifi, Home Loan EMI"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="1500"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formData.dueDay}
                    onChange={(e) => setFormData({...formData, dueDay: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
