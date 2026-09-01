// Exact port of FinanceCalculator.kt

export function assetBalance(account, transactions) {
  return account.openingBalance + transactions.reduce((balance, t) => {
    if (t.type === 'Income'   && t.account   === account.name) return balance + t.amount;
    if (t.type === 'Expense'  && t.account   === account.name) return balance - t.amount;
    if (t.type === 'Transfer' && t.account   === account.name) return balance - t.amount;
    if (t.type === 'Transfer' && t.toAccount === account.name) return balance + t.amount;
    return balance;
  }, 0);
}

export function creditCardLiability(account, transactions) {
  return account.outstanding + transactions.reduce((liability, t) => {
    if (t.type === 'Expense'  && t.account   === account.name) return liability + t.amount;
    if (t.type === 'Income'   && t.account   === account.name) return liability - t.amount;
    if (t.type === 'Transfer' && t.toAccount === account.name) return liability - t.amount;
    if (t.type === 'Transfer' && t.account   === account.name) return liability + t.amount;
    return liability;
  }, 0);
}

export function accountNetPosition(account, transactions) {
  if (account.type === 'CREDIT_CARD') return -creditCardLiability(account, transactions);
  return assetBalance(account, transactions);
}

export function netWorth(accounts, transactions) {
  return accounts.reduce((sum, acc) => sum + accountNetPosition(acc, transactions), 0);
}
