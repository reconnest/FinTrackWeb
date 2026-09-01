// Backup export/import and CSV export matching FinTrack format

export function exportBackupJSON({ profile, transactions, accounts, incomeCategories, expenseCategories }) {
  const backup = {
    backupVersion: 3,
    countryCode: profile.countryCode,
    currencyCode: profile.currencyCode,
    transactions,
    accounts,
    incomeCategories,
    expenseCategories
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'FinTrack_Backup_' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCSV(transactions, currencyCode) {
  function escapeCsv(value) {
    const str = String(value ?? '');
    const escaped = str.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
      return '"' + escaped + '"';
    }
    return escaped;
  }
  function formatDate(ts) {
    const d = new Date(ts);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }
  const header = 'Date,Type,Category,Account,To Account,Amount,Currency,Note';
  const rows = transactions.map(t =>
    [
      escapeCsv(formatDate(t.date)),
      escapeCsv(t.type),
      escapeCsv(t.category),
      escapeCsv(t.account),
      escapeCsv(t.toAccount || ''),
      t.amount,
      escapeCsv(currencyCode),
      escapeCsv(t.note || '')
    ].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'FinTrack_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
