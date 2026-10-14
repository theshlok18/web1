// ============================================
// FINORA — DATA LAYER (localStorage mock DB)
// ============================================

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('finora_' + key) || '[]'); }
    catch { return []; }
  },
  set(key, val) {
    localStorage.setItem('finora_' + key, JSON.stringify(val));
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('finora_current_user')); }
    catch { return null; }
  }
};

// ---- Scoped by user ----
function userKey(key) {
  const u = DB.getUser();
  return u ? key + '_' + u.id : key;
}

// INCOME
function getIncome() { return DB.get(userKey('income')); }
function saveIncomeData(arr) { DB.set(userKey('income'), arr); }
function addIncomeRecord(rec) {
  const arr = getIncome();
  rec.id = 'inc_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  rec.createdAt = new Date().toISOString();
  arr.unshift(rec);
  saveIncomeData(arr);
  return rec;
}
function updateIncomeRecord(id, data) {
  const arr = getIncome().map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r);
  saveIncomeData(arr);
}
function deleteIncomeRecord(id) {
  saveIncomeData(getIncome().filter(r => r.id !== id));
}

// EXPENSES
function getExpenses() { return DB.get(userKey('expenses')); }
function saveExpensesData(arr) { DB.set(userKey('expenses'), arr); }
function addExpenseRecord(rec) {
  const arr = getExpenses();
  rec.id = 'exp_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  rec.createdAt = new Date().toISOString();
  arr.unshift(rec);
  saveExpensesData(arr);
  return rec;
}
function updateExpenseRecord(id, data) {
  const arr = getExpenses().map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r);
  saveExpensesData(arr);
}
function deleteExpenseRecord(id) {
  saveExpensesData(getExpenses().filter(r => r.id !== id));
}

// BUDGETS
function getBudgets() { return DB.get(userKey('budgets')); }
function saveBudgetsData(arr) { DB.set(userKey('budgets'), arr); }
function addBudgetRecord(rec) {
  const arr = getBudgets();
  rec.id = 'bgt_' + Date.now();
  rec.createdAt = new Date().toISOString();
  arr.push(rec);
  saveBudgetsData(arr);
  return rec;
}
function updateBudgetRecord(id, data) {
  const arr = getBudgets().map(r => r.id === id ? { ...r, ...data } : r);
  saveBudgetsData(arr);
}
function deleteBudgetRecord(id) {
  saveBudgetsData(getBudgets().filter(r => r.id !== id));
}

// SAVINGS GOALS
function getGoals() { return DB.get(userKey('goals')); }
function saveGoalsData(arr) { DB.set(userKey('goals'), arr); }
function addGoalRecord(rec) {
  const arr = getGoals();
  rec.id = 'goal_' + Date.now();
  rec.createdAt = new Date().toISOString();
  arr.push(rec);
  saveGoalsData(arr);
  return rec;
}
function updateGoalRecord(id, data) {
  const arr = getGoals().map(r => r.id === id ? { ...r, ...data } : r);
  saveGoalsData(arr);
}
function deleteGoalRecord(id) {
  saveGoalsData(getGoals().filter(r => r.id !== id));
}

// INVESTMENTS
function getInvestments() { return DB.get(userKey('investments')); }
function saveInvestmentsData(arr) { DB.set(userKey('investments'), arr); }
function addInvestmentRecord(rec) {
  const arr = getInvestments();
  rec.id = 'inv_' + Date.now();
  rec.createdAt = new Date().toISOString();
  arr.push(rec);
  saveInvestmentsData(arr);
  return rec;
}
function updateInvestmentRecord(id, data) {
  const arr = getInvestments().map(r => r.id === id ? { ...r, ...data } : r);
  saveInvestmentsData(arr);
}
function deleteInvestmentRecord(id) {
  saveInvestmentsData(getInvestments().filter(r => r.id !== id));
}

// NOTIFICATIONS
function getNotifications() { return DB.get(userKey('notifications')); }
function saveNotificationsData(arr) { DB.set(userKey('notifications'), arr); }
function addNotification(notif) {
  const arr = getNotifications();
  notif.id = 'notif_' + Date.now();
  notif.createdAt = new Date().toISOString();
  notif.read = false;
  arr.unshift(notif);
  saveNotificationsData(arr);
}

// ---- SEED DEMO DATA ----
function seedDemoData() {
  const u = DB.getUser();
  if (!u || u.id !== 'demo') return;
  if (getIncome().length > 0) return; // Already seeded

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  // Income
  const incomes = [
    { amount: 85000, source: 'Infosys Ltd', category: 'Salary', date: new Date(y, m, 1).toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: 'Monthly salary' },
    { amount: 25000, source: 'Freelance Project', category: 'Freelancing', date: new Date(y, m, 5).toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: 'Web dev project' },
    { amount: 5000, source: 'Dividend', category: 'Investments', date: new Date(y, m, 10).toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: '' },
    { amount: 85000, source: 'Infosys Ltd', category: 'Salary', date: new Date(y, m-1, 1).toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: '' },
    { amount: 18000, source: 'Freelance Project', category: 'Freelancing', date: new Date(y, m-1, 8).toISOString().split('T')[0], paymentMethod: 'UPI', notes: '' },
    { amount: 85000, source: 'Infosys Ltd', category: 'Salary', date: new Date(y, m-2, 1).toISOString().split('T')[0], paymentMethod: 'Bank Transfer', notes: '' },
    { amount: 12000, source: 'Side Business', category: 'Business', date: new Date(y, m-2, 15).toISOString().split('T')[0], paymentMethod: 'UPI', notes: '' },
  ];
  incomes.forEach(i => addIncomeRecord(i));

  // Expenses
  const expenses = [
    { amount: 18000, description: 'Monthly Rent', category: 'Rent', date: new Date(y, m, 1).toISOString().split('T')[0], paymentMethod: 'Net Banking', notes: '' },
    { amount: 4500, description: 'Groceries', category: 'Food', date: new Date(y, m, 3).toISOString().split('T')[0], paymentMethod: 'UPI', notes: '' },
    { amount: 2200, description: 'Electricity Bill', category: 'Bills', date: new Date(y, m, 5).toISOString().split('T')[0], paymentMethod: 'UPI', notes: '' },
    { amount: 1800, description: 'Petrol', category: 'Transportation', date: new Date(y, m, 6).toISOString().split('T')[0], paymentMethod: 'Cash', notes: '' },
    { amount: 3500, description: 'Amazon Shopping', category: 'Shopping', date: new Date(y, m, 8).toISOString().split('T')[0], paymentMethod: 'Credit Card', notes: '' },
    { amount: 800, description: 'Netflix + Spotify', category: 'Entertainment', date: new Date(y, m, 9).toISOString().split('T')[0], paymentMethod: 'Credit Card', notes: '' },
    { amount: 2800, description: 'Restaurant', category: 'Food', date: new Date(y, m, 11).toISOString().split('T')[0], paymentMethod: 'UPI', notes: '' },
    { amount: 18000, description: 'Monthly Rent', category: 'Rent', date: new Date(y, m-1, 1).toISOString().split('T')[0], paymentMethod: 'Net Banking', notes: '' },
    { amount: 5200, description: 'Groceries', category: 'Food', date: new Date(y, m-1, 4).toISOString().split('T')[0], paymentMethod: 'UPI', notes: '' },
    { amount: 3200, description: 'Doctor visit', category: 'Healthcare', date: new Date(y, m-1, 12).toISOString().split('T')[0], paymentMethod: 'Cash', notes: '' },
    { amount: 12000, description: 'Flight Tickets', category: 'Travel', date: new Date(y, m-1, 20).toISOString().split('T')[0], paymentMethod: 'Credit Card', notes: '' },
    { amount: 18000, description: 'Monthly Rent', category: 'Rent', date: new Date(y, m-2, 1).toISOString().split('T')[0], paymentMethod: 'Net Banking', notes: '' },
    { amount: 4200, description: 'Groceries', category: 'Food', date: new Date(y, m-2, 5).toISOString().split('T')[0], paymentMethod: 'UPI', notes: '' },
    { amount: 6500, description: 'Course fee', category: 'Education', date: new Date(y, m-2, 10).toISOString().split('T')[0], paymentMethod: 'Net Banking', notes: '' },
  ];
  expenses.forEach(e => addExpenseRecord(e));

  // Budgets
  const currentMonth = `${y}-${String(m+1).padStart(2,'0')}`;
  const budgets = [
    { name: 'Overall Monthly', category: 'Overall', limit: 50000, month: currentMonth },
    { name: 'Food Budget', category: 'Food', limit: 8000, month: currentMonth },
    { name: 'Rent', category: 'Rent', limit: 20000, month: currentMonth },
    { name: 'Entertainment', category: 'Entertainment', limit: 2000, month: currentMonth },
    { name: 'Shopping', category: 'Shopping', limit: 5000, month: currentMonth },
  ];
  budgets.forEach(b => addBudgetRecord(b));

  // Savings Goals
  const goals = [
    { name: 'Buy a Laptop', targetAmount: 120000, currentAmount: 75000, targetDate: `${y+1}-03-31`, description: 'MacBook Pro for work', status: 'active' },
    { name: 'Emergency Fund', targetAmount: 300000, currentAmount: 180000, targetDate: `${y+1}-12-31`, description: '6 months expenses', status: 'active' },
    { name: 'Vacation to Goa', targetAmount: 50000, currentAmount: 50000, targetDate: `${y}-12-25`, description: 'Christmas vacation', status: 'completed' },
    { name: 'Buy a Car', targetAmount: 800000, currentAmount: 120000, targetDate: `${y+2}-06-30`, description: 'Tata Nexon EV', status: 'active' },
  ];
  goals.forEach(g => addGoalRecord(g));

  // Investments
  const investments = [
    { name: 'Reliance Industries', type: 'Stocks', investedAmount: 50000, currentValue: 62000, purchaseDate: `${y-1}-04-15`, notes: '' },
    { name: 'Axis Bluechip Fund', type: 'Mutual Funds', investedAmount: 100000, currentValue: 118000, purchaseDate: `${y-1}-01-01`, notes: 'SIP' },
    { name: 'SBI FD', type: 'Fixed Deposits', investedAmount: 200000, currentValue: 214000, purchaseDate: `${y-1}-07-01`, notes: '7.5% p.a.' },
    { name: 'Digital Gold', type: 'Gold', investedAmount: 25000, currentValue: 28500, purchaseDate: `${y}-01-10`, notes: '' },
  ];
  investments.forEach(i => addInvestmentRecord(i));

  // Notifications
  const notifs = [
    { title: 'Budget Alert', message: 'You have used 87% of your Food budget for this month.', type: 'warning', icon: 'fas fa-exclamation-triangle', iconColor: '#f59e0b' },
    { title: 'Savings Milestone!', message: 'Great job! You reached 60% of your Emergency Fund goal.', type: 'success', icon: 'fas fa-trophy', iconColor: '#10b981' },
    { title: 'Investment Update', message: 'Your Reliance Industries stock is up 24% since purchase.', type: 'info', icon: 'fas fa-chart-line', iconColor: '#3b82f6' },
  ];
  notifs.forEach(n => addNotification(n));
}

// ---- UTILITY ----
function formatCurrency(amount, currency) {
  const u = DB.getUser();
  const cur = currency || (u && u.currency) || 'INR';
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[cur] || '₹';
  return sym + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getMonthStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
}

function getLastMonth() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth()-1, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function calcTotalIncome(month) {
  return getIncome()
    .filter(r => !month || getMonthStr(r.date) === month)
    .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
}

function calcTotalExpenses(month) {
  return getExpenses()
    .filter(r => !month || getMonthStr(r.date) === month)
    .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
}

function calcTotalSavings() {
  return getGoals().reduce((s, g) => s + parseFloat(g.currentAmount || 0), 0);
}

function calcTotalBalance() {
  return calcTotalIncome() - calcTotalExpenses();
}

// Category icons and colors
const CATEGORY_META = {
  Salary:        { icon: 'fas fa-briefcase', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Freelancing:   { icon: 'fas fa-laptop-code', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  Business:      { icon: 'fas fa-store', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Investments:   { icon: 'fas fa-chart-line', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Other Income':{ icon: 'fas fa-coins', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  Food:          { icon: 'fas fa-utensils', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  Rent:          { icon: 'fas fa-home', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  Transportation:{ icon: 'fas fa-car', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  Shopping:      { icon: 'fas fa-shopping-bag', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  Bills:         { icon: 'fas fa-file-invoice', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  Healthcare:    { icon: 'fas fa-heartbeat', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  Education:     { icon: 'fas fa-graduation-cap', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  Entertainment: { icon: 'fas fa-film', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Travel:        { icon: 'fas fa-plane', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  Other:         { icon: 'fas fa-ellipsis-h', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  Overall:       { icon: 'fas fa-wallet', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Stocks:        { icon: 'fas fa-chart-bar', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'Mutual Funds':{ icon: 'fas fa-layer-group', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'Fixed Deposits':{ icon: 'fas fa-piggy-bank', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Gold:          { icon: 'fas fa-coins', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Other Assets':{ icon: 'fas fa-box', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
};

function getCatMeta(cat) {
  return CATEGORY_META[cat] || { icon: 'fas fa-circle', color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
}
