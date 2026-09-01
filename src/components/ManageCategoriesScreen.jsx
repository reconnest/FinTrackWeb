import React, { useState } from 'react';
import { Plus, Trash2, Tag, Pencil, Check, X, Sparkles } from 'lucide-react';
import { getCategoryMeta } from '../utils/categoryIcons';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

function CategoryList({ title, categories, onAdd, onDelete, onRename, defaults }) {
  const toast   = useToast();
  const confirm = useConfirm();
  const [input, setInput]           = useState('');
  const [err, setErr]               = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue]   = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    if (categories.some(c => c.toLowerCase() === val.toLowerCase())) {
      setErr('Category already exists.'); return;
    }
    onAdd(val);
    setInput('');
    setErr('');
    toast.success(`"${val}" added.`);
  };

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(categories[idx]);
    setErr('');
  };

  const cancelEdit = () => { setEditingIdx(null); setEditValue(''); };

  const confirmEdit = (idx) => {
    const val = editValue.trim();
    if (!val) { cancelEdit(); return; }
    if (categories.some((c, i) => i !== idx && c.toLowerCase() === val.toLowerCase())) {
      setErr('A category with that name already exists.'); return;
    }
    onRename(categories[idx], val);
    cancelEdit();
    toast.success(`Renamed to "${val}".`);
  };

  return (
    <div className="bg-neo-card border border-neo-border rounded-3xl p-5 space-y-4 shadow-neo-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-neo-cyan" />
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
        <span className="text-[10px] font-bold text-neo-muted bg-neo-surface border border-neo-border px-2 py-0.5 rounded-full">
          {categories.length} items
        </span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text" value={input}
          onChange={e => { setInput(e.target.value); setErr(''); }}
          placeholder={`Add new ${title.toLowerCase().replace(' categories','')} category...`}
          className="flex-1 bg-neo-bg border border-neo-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-neo-muted/60 focus:outline-none focus:border-neo-neonGreen"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-neo-emerald to-neo-neonGreen hover:opacity-90 text-black font-bold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
      </form>
      {err && <p className="text-neo-coral text-[11px] font-medium">{err}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {categories.map((cat, idx) => {
          const isDefault = defaults.includes(cat);
          const isEditing = editingIdx === idx;
          const meta = getCategoryMeta(cat);

          return (
            <div
              key={cat + idx}
              className="flex items-center gap-2.5 px-3.5 py-2.5 bg-neo-surface border border-neo-border/70 rounded-2xl group hover:border-neo-borderLight transition-all"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border ${meta.bg} ${meta.border}`}>
                {meta.emoji}
              </div>

              {isEditing ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => { setEditValue(e.target.value); setErr(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(idx); if (e.key === 'Escape') cancelEdit(); }}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none border-b border-neo-neonGreen pb-0.5"
                  />
                  <button onClick={() => confirmEdit(idx)} className="p-1 text-neo-neonGreen hover:bg-neo-neonGreen/10 rounded-lg">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={cancelEdit} className="p-1 text-neo-muted hover:text-white rounded-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-white font-bold truncate">{cat}</span>
                  {isDefault && <span className="text-[9px] text-neo-muted font-medium mr-1">default</span>}
                  <button onClick={() => startEdit(idx)} className="opacity-90 sm:opacity-0 group-hover:opacity-100 p-1 text-neo-muted hover:text-neo-neonGreen rounded-lg transition-all" title="Rename">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {!isDefault && (
                    <button
                      onClick={async () => {
                        if (await confirm(`Delete category "${cat}"?`, { title: 'Delete Category' })) {
                          onDelete(cat);
                          toast.success(`"${cat}" deleted.`);
                        }
                      }}
                      className="opacity-90 sm:opacity-0 group-hover:opacity-100 p-1 text-neo-muted hover:text-neo-coral rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ManageCategoriesScreen = ({
  incomeCategories, expenseCategories,
  onAddIncome, onDeleteIncome, onRenameIncome,
  onAddExpense, onDeleteExpense, onRenameExpense,
  DEFAULT_INCOME, DEFAULT_EXPENSE
}) => (
  <div className="space-y-6 pb-12">
    <div>
      <h1 className="text-xl font-extrabold text-white tracking-tight">Category Hub</h1>
      <p className="text-xs text-neo-muted">Organize spending & earning categories</p>
    </div>
    <CategoryList
      title="Income Categories" categories={incomeCategories} defaults={DEFAULT_INCOME}
      onAdd={onAddIncome} onDelete={onDeleteIncome} onRename={onRenameIncome}
    />
    <CategoryList
      title="Expense Categories" categories={expenseCategories} defaults={DEFAULT_EXPENSE}
      onAdd={onAddExpense} onDelete={onDeleteExpense} onRename={onRenameExpense}
    />
  </div>
);
