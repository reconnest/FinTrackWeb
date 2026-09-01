import React, { useState } from 'react';
import { Plus, Trash2, Tag, Pencil, Check, X } from 'lucide-react';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

function CategoryList({ title, categories, onAdd, onDelete, onRename, defaults }) {
  const toast   = useToast();
  const confirm = useConfirm();
  const [input, setInput]       = useState('');
  const [err, setErr]           = useState('');
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
    <div className="bg-ft-card border border-ft-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-ft-muted" />
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <span className="text-[10px] text-ft-muted bg-ft-bg border border-ft-border px-1.5 py-0.5 rounded-full">
          {categories.length}
        </span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text" value={input}
          onChange={e => { setInput(e.target.value); setErr(''); }}
          placeholder={`Add ${title.toLowerCase().replace(' categories','')} category...`}
          className="flex-1 bg-ft-bg border border-ft-border rounded-xl px-3 py-2 text-xs text-white placeholder-ft-border focus:outline-none focus:border-ft-green"
        />
        <button type="submit"
          className="px-3 py-2 bg-ft-primary hover:bg-ft-green text-white rounded-xl transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </form>
      {err && <p className="text-ft-red text-[11px]">{err}</p>}

      <div className="space-y-1.5">
        {categories.map((cat, idx) => {
          const isDefault = defaults.includes(cat);
          const isEditing = editingIdx === idx;

          return (
            <div key={cat + idx}
              className="flex items-center gap-2 px-3 py-2 bg-ft-bg border border-ft-border rounded-xl group">

              {isEditing ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => { setEditValue(e.target.value); setErr(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(idx); if (e.key === 'Escape') cancelEdit(); }}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none border-b border-ft-green pb-0.5"
                  />
                  <button onClick={() => confirmEdit(idx)}
                    className="p-1 text-ft-green hover:bg-ft-green/10 rounded-lg transition-all">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={cancelEdit}
                    className="p-1 text-ft-muted hover:text-white hover:bg-ft-card rounded-lg transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-ft-text font-medium">{cat}</span>
                  {isDefault && (
                    <span className="text-[9px] text-ft-border opacity-0 group-hover:opacity-100 mr-1">default</span>
                  )}
                  <button onClick={() => startEdit(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-ft-muted hover:text-ft-green hover:bg-ft-green/10 rounded-lg transition-all"
                    title="Rename">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {!isDefault && (
                    <button onClick={async () => { if (await confirm(`Delete "${cat}"?`, { title: 'Delete Category' })) { onDelete(cat); toast.success(`"${cat}" deleted.`); } }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-ft-muted hover:text-ft-red hover:bg-ft-red/10 rounded-lg transition-all"
                      title="Delete">
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
  <div className="space-y-5 pb-12">
    <div>
      <h1 className="text-lg font-extrabold text-white tracking-tight">Manage Categories</h1>
      <p className="text-ft-muted text-xs mt-0.5">
        Hover a category to rename ✏️ or delete 🗑️
      </p>
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
