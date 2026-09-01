// Data model matches FinTrack Android exactly.
// Accounts identified by name string (not UUID).
// Dates stored as ms timestamps (Long in Kotlin, number in JS).
// No group, no status, no budget, no color on categories.

export const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Interest', 'Bonus', 'Other'];
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food', 'Groceries', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Rent', 'Education', 'Travel', 'Subscriptions', 'Other'
];

export const initialProfile = {
  name: 'User',
  countryCode: 'IN',
  currencyCode: 'INR'
};

// AccountData: name (primary key), type (BANK | CASH_WALLET | CREDIT_CARD),
// openingBalance (for BANK/CASH_WALLET), creditLimit & outstanding (for CREDIT_CARD)
export const initialAccounts = [
  { name: 'Bank',       type: 'BANK',        openingBalance: 245800, creditLimit: 0,      outstanding: 0 },
  { name: 'Cash',       type: 'CASH_WALLET',  openingBalance: 8200,   creditLimit: 0,      outstanding: 0 },
  { name: 'ICICI Save', type: 'BANK',         openingBalance: 520000, creditLimit: 0,      outstanding: 0 },
  { name: 'SBI Card',   type: 'CREDIT_CARD',  openingBalance: 0,      creditLimit: 250000, outstanding: 0 },
  { name: 'Axis Magnus',type: 'CREDIT_CARD',  openingBalance: 0,      creditLimit: 500000, outstanding: 0 },
];

// Transactions: account & toAccount are name strings.
// date is ms timestamp. note (not notes).
const d = (daysAgo) => Date.now() - daysAgo * 86400000;
export const initialTransactions = [
  { id: d(1)+1, amount: 185000, category: 'Salary',         account: 'Bank',       type: 'Income',   date: d(1),  note: 'August Salary Credit',    toAccount: '' },
  { id: d(2)+1, amount: 42000,  category: 'Rent',           account: 'Bank',       type: 'Expense',  date: d(2),  note: 'Flat 402 Aug rent',        toAccount: '' },
  { id: d(3)+1, amount: 4850,   category: 'Groceries',      account: 'SBI Card',   type: 'Expense',  date: d(3),  note: 'Nature Basket',            toAccount: '' },
  { id: d(3)+2, amount: 1240,   category: 'Groceries',      account: 'SBI Card',   type: 'Expense',  date: d(3),  note: 'Blinkit delivery',         toAccount: '' },
  { id: d(4)+1, amount: 5600,   category: 'Food',           account: 'Axis Magnus',type: 'Expense',  date: d(4),  note: 'Team dinner Bombay Canteen',toAccount: '' },
  { id: d(6)+1, amount: 35000,  category: 'Other',          account: 'Bank',       type: 'Expense',  date: d(6),  note: 'Nifty 50 SIP Aug',         toAccount: '' },
  { id: d(7)+1, amount: 8990,   category: 'Shopping',       account: 'Axis Magnus',type: 'Expense',  date: d(7),  note: 'Zara jacket',              toAccount: '' },
  { id: d(9)+1, amount: 3450,   category: 'Utilities',      account: 'Bank',       type: 'Expense',  date: d(9),  note: 'MSEDCL electricity',       toAccount: '' },
  { id: d(11)+1,amount: 45000,  category: 'Other',          account: 'Bank',       type: 'Transfer', date: d(11), note: 'SBI Card bill payment',     toAccount: 'SBI Card' },
  { id: d(13)+1,amount: 48000,  category: 'Freelance',      account: 'Bank',       type: 'Income',   date: d(13), note: 'UI Design project payment', toAccount: '' },
  { id: d(16)+1,amount: 1199,   category: 'Subscriptions',  account: 'SBI Card',   type: 'Expense',  date: d(16), note: 'iCloud 2TB + Apple Music',  toAccount: '' },
  { id: d(19)+1,amount: 1850,   category: 'Transport',      account: 'Bank',       type: 'Expense',  date: d(19), note: 'EV charging highway',       toAccount: '' },
  { id: d(21)+1,amount: 14200,  category: 'Travel',         account: 'Axis Magnus',type: 'Expense',  date: d(21), note: 'MakeMyTrip Goa flight',     toAccount: '' },
  { id: d(26)+1,amount: 4120,   category: 'Interest',       account: 'ICICI Save', type: 'Income',   date: d(26), note: 'Q1 savings interest',       toAccount: '' },
  { id: d(29)+1,amount: 2000,   category: 'Other',          account: 'Bank',       type: 'Transfer', date: d(29), note: 'Pocket cash withdrawal',    toAccount: 'Cash' },
];
