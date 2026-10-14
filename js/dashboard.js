// ============================================
// FINORA — DASHBOARD CONTROLLER
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Auth guard
  const user = DB.getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  // Seed demo data
  seedDemoData();

  // Set user info
  initUserInfo(user);

  // Navigation
  initNavigation();

  // Load initial section
  loadSection('overview');

  // Sidebar toggle
  document.getElementById('menuToggle')?.addEventListener('click', openSidebar);
  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // Notification button
  document.getElementById('notifBtn')?.addEventListener('click', () => showSection('notifications'));

  // Global search
  document.getElementById('globalSearch')?.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    if (q.length > 1) showSection('transactions');
    if (document.getElementById('txnSearch')) document.getElementById('txnSearch').value = this.value;
    if (typeof renderTransactionsTable === 'function') renderTransactionsTable();
  });

  // Export buttons
  document.getElementById('exportTxnBtn')?.addEventListener('click', exportTransactionsCSV);
  document.getElementById('exportReportBtn')?.addEventListener('click', exportFullReport);

  // Mark all notifications read
  document.getElementById('markAllReadBtn')?.addEventListener('click', markAllNotifRead);

  // Settings panels
  document.querySelectorAll('.settings-menu-item').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.settings-menu-item').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const panel = this.dataset.panel;
      document.querySelectorAll('[id^="panel-"]').forEach(p => p.style.display = 'none');
      const el = document.getElementById('panel-' + panel);
      if (el) el.style.display = 'block';
    });
  });

  // Preset today's date in forms
  setDefaultDates();

  // Analytics year selector
  populateYearSelector();
  document.getElementById('analyticsYear')?.addEventListener('change', renderAnalyticsCharts);
  document.getElementById('analyticsView')?.addEventListener('change', renderAnalyticsCharts);

  // Set profile fields
  const u = DB.getUser();
  if (u) {
    const pn = document.getElementById('profileName'); if (pn) pn.value = u.name || '';
    const pe = document.getElementById('profileEmail'); if (pe) pe.value = u.email || '';
    const pc = document.getElementById('profileCurrency'); if (pc) pc.value = u.currency || 'INR';
  }
});

// --- User Info ---
function initUserInfo(user) {
  const avatar = (user.avatar || user.name.substring(0,2)).toUpperCase();
  ['sidebarAvatar','topAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = avatar;
  });
  const sn = document.getElementById('sidebarName'); if (sn) sn.textContent = user.name;
  const se = document.getElementById('sidebarEmail'); if (se) se.textContent = user.email;
  const tn = document.getElementById('topName'); if (tn) tn.textContent = user.name.split(' ')[0];
  const gn = document.getElementById('greetName'); if (gn) gn.textContent = user.name.split(' ')[0];
  const cm = document.getElementById('currentMonth'); if (cm) {
    cm.textContent = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }
}

// --- Navigation ---
function initNavigation() {
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', function() {
      const section = this.dataset.section;
      showSection(section);
      closeSidebar();
    });
  });
}

function showSection(name) {
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === name);
  });
  document.querySelectorAll('.dashboard-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === 'section-' + name);
  });
  const titles = { overview:'Overview', transactions:'Transactions', income:'Income', expenses:'Expenses', budgets:'Budgets', savings:'Savings Goals', investments:'Investments', analytics:'Analytics', notifications:'Notifications', settings:'Settings' };
  const title = document.getElementById('topNavTitle');
  if (title) title.textContent = titles[name] || name;
  loadSection(name);
  closeSidebar();
}

function loadSection(name) {
  switch(name) {
    case 'overview':     renderOverview(); break;
    case 'transactions': renderTransactionsTable(); break;
    case 'income':       renderIncomeSection(); break;
    case 'expenses':     renderExpensesSection(); break;
    case 'budgets':      renderBudgets(); break;
    case 'savings':      renderGoals(); break;
    case 'investments':  renderInvestments(); break;
    case 'analytics':    renderAnalyticsCharts(); break;
    case 'notifications':renderNotifications(); break;
    case 'settings':     break;
  }
}

// --- Sidebar ---
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Logout ---
function logout() {
  localStorage.removeItem('finora_current_user');
  window.location.href = 'login.html';
}

// --- Set default dates ---
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const curMonth = getCurrentMonth();
  ['incomeDate','expDate'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = today;
  });
  ['incomeMonthFilter','expMonthFilter','txnMonthFilter'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = curMonth;
  });
  const bm = document.getElementById('budgetMonth'); if (bm) bm.value = curMonth;
}

// --- OVERVIEW ---
function renderOverview() {
  const curMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  const incCur = calcTotalIncome(curMonth);
  const incLast = calcTotalIncome(lastMonth);
  const expCur = calcTotalExpenses(curMonth);
  const expLast = calcTotalExpenses(lastMonth);
  const bal = calcTotalBalance();
  const sav = calcTotalSavings();

  setText('totalBalance', formatCurrency(bal));
  setText('totalIncome', formatCurrency(incCur));
  setText('totalExpenses', formatCurrency(expCur));
  setText('totalSavings', formatCurrency(sav));

  const incCount = getIncome().filter(r => getMonthStr(r.date) === curMonth).length;
  const expCount = getExpenses().filter(r => getMonthStr(r.date) === curMonth).length;
  setText('incomeCount', incCount + ' entries this month');
  setText('expenseCount', expCount + ' entries this month');

  // Trends
  if (incLast > 0) {
    const pct = (((incCur - incLast) / incLast) * 100).toFixed(1);
    const el = document.getElementById('incomeTrend');
    if (el) { el.textContent = (pct >= 0 ? '+' : '') + pct + '%'; el.className = 'card-trend ' + (pct >= 0 ? 'up' : 'down'); }
  }
  if (expLast > 0) {
    const pct = (((expCur - expLast) / expLast) * 100).toFixed(1);
    const el = document.getElementById('expenseTrend');
    if (el) { el.textContent = (pct >= 0 ? '+' : '') + pct + '%'; el.className = 'card-trend ' + (pct >= 0 ? 'down' : 'up'); }
  }

  // Notification badge
  const unread = getNotifications().filter(n => !n.read).length;
  updateNotifBadge(unread);

  // Recent transactions
  renderRecentTransactions();

  // Charts
  renderOverviewCharts();
}

function renderRecentTransactions() {
  const container = document.getElementById('recentTransactionsList');
  if (!container) return;
  const incomes = getIncome().slice(0,5).map(r => ({...r, type:'income'}));
  const expenses = getExpenses().slice(0,5).map(r => ({...r, type:'expense', source: r.description}));
  const all = [...incomes, ...expenses].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,8);
  if (!all.length) { container.innerHTML = emptyState('fa-exchange-alt','No transactions yet','Add income or expenses to see them here'); return; }
  container.innerHTML = buildTransactionTable(all, false);
}

// --- ALL TRANSACTIONS ---
let txnPage = 1;
const TXN_PER_PAGE = 10;

function renderTransactionsTable() {
  const search = (document.getElementById('txnSearch')?.value || '').toLowerCase();
  const typeF = document.getElementById('txnTypeFilter')?.value || '';
  const catF = document.getElementById('txnCategoryFilter')?.value || '';
  const monthF = document.getElementById('txnMonthFilter')?.value || '';

  const incomes = getIncome().map(r => ({...r, type:'income', source: r.source}));
  const expenses = getExpenses().map(r => ({...r, type:'expense', source: r.description}));
  let all = [...incomes, ...expenses].sort((a,b) => new Date(b.date) - new Date(a.date));

  // Populate category filter
  const catSel = document.getElementById('txnCategoryFilter');
  if (catSel && catSel.options.length <= 1) {
    const cats = [...new Set(all.map(r => r.category))];
    cats.forEach(c => { const o = new Option(c, c); catSel.add(o); });
  }

  if (search) all = all.filter(r => (r.source||'').toLowerCase().includes(search) || (r.category||'').toLowerCase().includes(search) || String(r.amount).includes(search));
  if (typeF) all = all.filter(r => r.type === typeF);
  if (catF) all = all.filter(r => r.category === catF);
  if (monthF) all = all.filter(r => getMonthStr(r.date) === monthF);

  const total = all.length;
  const pages = Math.ceil(total / TXN_PER_PAGE) || 1;
  if (txnPage > pages) txnPage = 1;
  const slice = all.slice((txnPage-1)*TXN_PER_PAGE, txnPage*TXN_PER_PAGE);

  const container = document.getElementById('transactionsTableContainer');
  if (container) container.innerHTML = total ? buildTransactionTable(slice, true) : emptyState('fa-exchange-alt','No transactions found','Try adjusting your filters');
  buildPagination('txnPagination', txnPage, pages, function(p) { txnPage = p; renderTransactionsTable(); });

  // Attach filter events once
  ['txnSearch','txnTypeFilter','txnCategoryFilter','txnMonthFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._listenerAdded) {
      el.addEventListener('input', () => { txnPage = 1; renderTransactionsTable(); });
      el.addEventListener('change', () => { txnPage = 1; renderTransactionsTable(); });
      el._listenerAdded = true;
    }
  });
}

function buildTransactionTable(records, showActions) {
  if (!records.length) return emptyState('fa-exchange-alt','No records','');
  let rows = records.map(r => {
    const meta = getCatMeta(r.category);
    const isIncome = r.type === 'income';
    const amtClass = isIncome ? 'amount-positive' : 'amount-negative';
    const amtSign = isIncome ? '+' : '-';
    const actions = showActions ? `
      <td><div class="action-btns">
        <button class="action-btn edit" onclick="editRecord('${r.id}','${r.type}')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="action-btn delete" onclick="confirmDelete('${r.id}','${r.type}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div></td>` : '';
    return `<tr>
      <td><div class="td-main">
        <div class="td-icon" style="background:${meta.bg}"><i class="${meta.icon}" style="color:${meta.color}"></i></div>
        <div><div class="td-title">${escHtml(r.source || r.description || 'Unnamed')}</div><div class="td-sub">${escHtml(r.category)}</div></div>
      </div></td>
      <td>${formatDate(r.date)}</td>
      <td><span class="badge ${isIncome ? 'badge-green' : 'badge-red'}">${isIncome ? 'Income' : 'Expense'}</span></td>
      <td class="${amtClass}">${amtSign}${formatCurrency(r.amount)}</td>
      <td><span class="badge badge-blue">${escHtml(r.paymentMethod || 'N/A')}</span></td>
      ${actions}
    </tr>`;
  }).join('');
  return `<div class="data-table-wrapper"><table class="data-table"><thead><tr>
    <th>Description</th><th>Date</th><th>Type</th><th>Amount</th><th>Payment</th>
    ${showActions ? '<th>Actions</th>' : ''}
  </tr></thead><tbody>${rows}</tbody></table></div>`;
}

// --- INCOME SECTION ---
let incPage = 1;
const INC_PER_PAGE = 10;

function renderIncomeSection() {
  const curMonth = getCurrentMonth();
  const lastMonth = getLastMonth();
  setText('incomeThisMonth', formatCurrency(calcTotalIncome(curMonth)));
  setText('incomeLastMonth', formatCurrency(calcTotalIncome(lastMonth)));
  setText('incomeTotalAllTime', formatCurrency(calcTotalIncome()));
  renderIncomeTable();
}

function renderIncomeTable() {
  const search = (document.getElementById('incomeSearch')?.value || '').toLowerCase();
  const catF = document.getElementById('incomeCategoryFilter')?.value || '';
  const monthF = document.getElementById('incomeMonthFilter')?.value || '';

  let data = getIncome();
  if (search) data = data.filter(r => (r.source||'').toLowerCase().includes(search) || (r.category||'').toLowerCase().includes(search));
  if (catF) data = data.filter(r => r.category === catF);
  if (monthF) data = data.filter(r => getMonthStr(r.date) === monthF);

  const pages = Math.ceil(data.length / INC_PER_PAGE) || 1;
  if (incPage > pages) incPage = 1;
  const slice = data.slice((incPage-1)*INC_PER_PAGE, incPage*INC_PER_PAGE);
  const container = document.getElementById('incomeTableContainer');
  if (!container) return;
  if (!data.length) { container.innerHTML = emptyState('fa-arrow-up','No income records','Add your first income entry'); return; }
  let rows = slice.map(r => {
    const meta = getCatMeta(r.category);
    return `<tr>
      <td><div class="td-main">
        <div class="td-icon" style="background:${meta.bg}"><i class="${meta.icon}" style="color:${meta.color}"></i></div>
        <div><div class="td-title">${escHtml(r.source)}</div><div class="td-sub">${r.notes ? escHtml(r.notes).substring(0,40) : ''}</div></div>
      </div></td>
      <td><span class="badge badge-green">${escHtml(r.category)}</span></td>
      <td>${formatDate(r.date)}</td>
      <td class="amount-positive">+${formatCurrency(r.amount)}</td>
      <td><span class="badge badge-blue">${escHtml(r.paymentMethod)}</span></td>
      <td><div class="action-btns">
        <button class="action-btn edit" onclick="editRecord('${r.id}','income')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="action-btn delete" onclick="confirmDelete('${r.id}','income')" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div></td>
    </tr>`;
  }).join('');
  container.innerHTML = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>Source</th><th>Category</th><th>Date</th><th>Amount</th><th>Payment</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  buildPagination('incomePagination', incPage, pages, function(p) { incPage = p; renderIncomeTable(); });

  ['incomeSearch','incomeCategoryFilter','incomeMonthFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._li) { el.addEventListener('input', () => { incPage=1; renderIncomeTable(); }); el.addEventListener('change', () => { incPage=1; renderIncomeTable(); }); el._li = true; }
  });
}

// --- EXPENSES SECTION ---
let expPage = 1;
const EXP_PER_PAGE = 10;

function renderExpensesSection() {
  const curMonth = getCurrentMonth();
  const lastMonth = getLastMonth();
  setText('expThisMonth', formatCurrency(calcTotalExpenses(curMonth)));
  setText('expLastMonth', formatCurrency(calcTotalExpenses(lastMonth)));
  // Top category
  const cats = {};
  getExpenses().filter(r => getMonthStr(r.date) === curMonth).forEach(r => { cats[r.category] = (cats[r.category] || 0) + parseFloat(r.amount); });
  const top = Object.entries(cats).sort((a,b) => b[1]-a[1])[0];
  setText('expTopCategory', top ? top[0] : '—');
  renderExpenseTable();
}

function renderExpenseTable() {
  const search = (document.getElementById('expSearch')?.value || '').toLowerCase();
  const catF = document.getElementById('expCategoryFilter')?.value || '';
  const monthF = document.getElementById('expMonthFilter')?.value || '';
  let data = getExpenses();
  if (search) data = data.filter(r => (r.description||'').toLowerCase().includes(search) || (r.category||'').toLowerCase().includes(search));
  if (catF) data = data.filter(r => r.category === catF);
  if (monthF) data = data.filter(r => getMonthStr(r.date) === monthF);

  const pages = Math.ceil(data.length / EXP_PER_PAGE) || 1;
  if (expPage > pages) expPage = 1;
  const slice = data.slice((expPage-1)*EXP_PER_PAGE, expPage*EXP_PER_PAGE);
  const container = document.getElementById('expenseTableContainer');
  if (!container) return;
  if (!data.length) { container.innerHTML = emptyState('fa-arrow-down','No expense records','Add your first expense entry'); return; }
  let rows = slice.map(r => {
    const meta = getCatMeta(r.category);
    return `<tr>
      <td><div class="td-main">
        <div class="td-icon" style="background:${meta.bg}"><i class="${meta.icon}" style="color:${meta.color}"></i></div>
        <div><div class="td-title">${escHtml(r.description)}</div><div class="td-sub">${r.notes ? escHtml(r.notes).substring(0,40) : ''}</div></div>
      </div></td>
      <td><span class="badge badge-red">${escHtml(r.category)}</span></td>
      <td>${formatDate(r.date)}</td>
      <td class="amount-negative">-${formatCurrency(r.amount)}</td>
      <td><span class="badge badge-blue">${escHtml(r.paymentMethod)}</span></td>
      <td><div class="action-btns">
        <button class="action-btn edit" onclick="editRecord('${r.id}','expense')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="action-btn delete" onclick="confirmDelete('${r.id}','expense')" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div></td>
    </tr>`;
  }).join('');
  container.innerHTML = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th>Payment</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  buildPagination('expensePagination', expPage, pages, function(p) { expPage = p; renderExpenseTable(); });

  ['expSearch','expCategoryFilter','expMonthFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._li) { el.addEventListener('input', () => { expPage=1; renderExpenseTable(); }); el.addEventListener('change', () => { expPage=1; renderExpenseTable(); }); el._li = true; }
  });
}

// --- BUDGETS ---
function renderBudgets() {
  const curMonth = getCurrentMonth();
  const budgets = getBudgets().filter(b => b.month === curMonth || !b.month);
  const container = document.getElementById('budgetGrid');
  if (!container) return;

  const totalBudgetLim = budgets.reduce((s, b) => b.category === 'Overall' ? s + parseFloat(b.limit) : s, 0);
  const totalExp = calcTotalExpenses(curMonth);
  const totalBudget2 = budgets.reduce((s, b) => s + parseFloat(b.limit || 0), 0);

  setText('totalBudget', formatCurrency(totalBudget2));
  setText('totalSpent', formatCurrency(totalExp));
  setText('totalRemaining', formatCurrency(Math.max(0, totalBudget2 - totalExp)));

  if (!budgets.length) { container.innerHTML = emptyState('fa-sliders-h','No budgets yet','Create a budget to start tracking your spending'); return; }

  const expByCat = {};
  getExpenses().filter(r => getMonthStr(r.date) === curMonth).forEach(r => { expByCat[r.category] = (expByCat[r.category] || 0) + parseFloat(r.amount); });

  container.innerHTML = budgets.map(b => {
    const spent = b.category === 'Overall' ? totalExp : (expByCat[b.category] || 0);
    const limit = parseFloat(b.limit || 0);
    const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
    const meta = getCatMeta(b.category);
    let warnClass = '';
    let fillClass = '';
    if (pct >= 100) { warnClass = 'danger'; fillClass = 'danger'; }
    else if (pct >= 75) { warnClass = 'warning'; fillClass = 'warning'; }
    return `<div class="budget-card">
      <div class="budget-card-header">
        <div class="budget-info">
          <div class="budget-icon" style="background:${meta.bg};color:${meta.color}"><i class="${meta.icon}"></i></div>
          <div><div class="budget-name">${escHtml(b.name)}</div><div class="budget-period">${escHtml(b.month || curMonth)}</div></div>
        </div>
        <div class="action-btns">
          <button class="action-btn delete" onclick="confirmDelete('${b.id}','budget')" title="Delete"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
      <div class="budget-amounts">
        <span class="budget-spent">${formatCurrency(spent)} spent</span>
        <span class="budget-limit">of ${formatCurrency(limit)}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
      <div class="budget-percent ${warnClass}">${pct.toFixed(1)}% used${pct >= 100 ? ' — Over budget!' : pct >= 75 ? ' — Warning!' : ''}</div>
    </div>`;
  }).join('');
}

// --- SAVINGS GOALS ---
function renderGoals() {
  const goals = getGoals();
  const container = document.getElementById('goalsGrid');
  if (!container) return;
  if (!goals.length) { container.innerHTML = emptyState('fa-piggy-bank','No savings goals','Create your first savings goal'); return; }

  const RING_COLORS = { active: '#10b981', completed: '#3b82f6', paused: '#f59e0b' };

  container.innerHTML = goals.map(g => {
    const target = parseFloat(g.targetAmount || 1);
    const current = parseFloat(g.currentAmount || 0);
    const pct = Math.min(100, (current / target) * 100);
    const status = g.status || 'active';
    const color = RING_COLORS[status] || '#10b981';
    const circumference = 2 * Math.PI * 44;
    const offset = circumference - (pct / 100) * circumference;
    return `<div class="goal-card">
      <div class="goal-ring">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle class="ring-bg" cx="50" cy="50" r="44"/>
          <circle class="ring-fill" cx="50" cy="50" r="44" stroke="${color}"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="ring-text">
          <span class="ring-percent" style="color:${color}">${Math.round(pct)}%</span>
          <span class="ring-label">Complete</span>
        </div>
      </div>
      <span class="goal-status-badge ${status}">${status.charAt(0).toUpperCase()+status.slice(1)}</span>
      <div class="goal-name">${escHtml(g.name)}</div>
      <div class="goal-amounts">${formatCurrency(current)} <span>/ ${formatCurrency(target)}</span></div>
      ${g.targetDate ? `<div class="goal-date"><i class="fas fa-calendar-alt"></i> Target: ${formatDate(g.targetDate)}</div>` : ''}
      <div class="goal-actions">
        <button class="btn-ghost" style="font-size:0.78rem;padding:0.4rem 0.75rem" onclick="openContrib('${g.id}','${escAttr(g.name)}')"><i class="fas fa-plus"></i> Add</button>
        <button class="action-btn delete" onclick="confirmDelete('${g.id}','goal')" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>`;
  }).join('');
}

// --- INVESTMENTS ---
function renderInvestments() {
  const invs = getInvestments();
  const container = document.getElementById('investmentStats');
  const tableContainer = document.getElementById('investmentTableContainer');

  const totalInvested = invs.reduce((s, i) => s + parseFloat(i.investedAmount || 0), 0);
  const totalCurrent = invs.reduce((s, i) => s + parseFloat(i.currentValue || 0), 0);
  const gainLoss = totalCurrent - totalInvested;
  const pct = totalInvested > 0 ? ((gainLoss / totalInvested) * 100).toFixed(2) : 0;

  if (container) {
    container.innerHTML = [
      { label: 'Total Invested', value: formatCurrency(totalInvested), sub: '', color: '' },
      { label: 'Current Value', value: formatCurrency(totalCurrent), sub: '', color: '' },
      { label: 'Gain / Loss', value: (gainLoss >= 0 ? '+' : '') + formatCurrency(gainLoss), sub: (pct >= 0 ? '+' : '') + pct + '%', color: gainLoss >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
      { label: 'Holdings', value: invs.length, sub: 'active positions', color: '' },
    ].map(s => `<div class="invest-stat-card">
      <div class="label">${s.label}</div>
      <div class="value" style="color:${s.color || 'var(--text-primary)'}">${s.value}</div>
      ${s.sub ? `<div class="sub" style="color:${s.color || 'var(--text-muted)'}">${s.sub}</div>` : ''}
    </div>`).join('');
  }

  if (tableContainer) {
    if (!invs.length) { tableContainer.innerHTML = emptyState('fa-chart-pie','No investments yet','Add your first investment to track performance'); return; }
    const rows = invs.map(i => {
      const invested = parseFloat(i.investedAmount || 0);
      const current = parseFloat(i.currentValue || 0);
      const gl = current - invested;
      const glPct = invested > 0 ? ((gl / invested) * 100).toFixed(1) : 0;
      const meta = getCatMeta(i.type);
      return `<tr>
        <td><div class="td-main">
          <div class="td-icon" style="background:${meta.bg}"><i class="${meta.icon}" style="color:${meta.color}"></i></div>
          <div><div class="td-title">${escHtml(i.name)}</div><div class="td-sub">${i.notes ? escHtml(i.notes).substring(0,40) : ''}</div></div>
        </div></td>
        <td><span class="badge badge-purple">${escHtml(i.type)}</span></td>
        <td>${formatDate(i.purchaseDate)}</td>
        <td>${formatCurrency(invested)}</td>
        <td>${formatCurrency(current)}</td>
        <td class="${gl >= 0 ? 'amount-positive' : 'amount-negative'}">${gl >= 0 ? '+' : ''}${formatCurrency(gl)} (${glPct}%)</td>
        <td><div class="action-btns">
          <button class="action-btn delete" onclick="confirmDelete('${i.id}','investment')" title="Delete"><i class="fas fa-trash-alt"></i></button>
        </div></td>
      </tr>`;
    }).join('');
    tableContainer.innerHTML = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>Name</th><th>Type</th><th>Purchase</th><th>Invested</th><th>Current</th><th>Gain/Loss</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  // Render investment charts
  if (typeof renderInvestmentCharts === 'function') renderInvestmentCharts();
}

// --- NOTIFICATIONS ---
function renderNotifications() {
  const notifs = getNotifications();
  const container = document.getElementById('notifList');
  if (!container) return;
  if (!notifs.length) { container.innerHTML = emptyState('fa-bell','No notifications','You\'re all caught up!'); return; }
  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" id="notif-${n.id}">
      <div class="notif-icon" style="background:rgba(255,255,255,0.06);color:${n.iconColor || 'var(--accent-green)'}"><i class="${n.icon || 'fas fa-bell'}"></i></div>
      <div class="notif-body">
        <div class="notif-title">${escHtml(n.title)}</div>
        <div class="notif-message">${escHtml(n.message)}</div>
        <div class="notif-time">${timeAgo(n.createdAt)}</div>
      </div>
      <div class="notif-actions">
        ${!n.read ? `<span class="notif-dot" title="Unread"></span>` : ''}
        <button class="action-btn delete" onclick="dismissNotif('${n.id}')" title="Dismiss"><i class="fas fa-times"></i></button>
      </div>
    </div>`).join('');
  updateNotifBadge(notifs.filter(n => !n.read).length);
}

function markAllNotifRead() {
  const notifs = getNotifications().map(n => ({ ...n, read: true }));
  saveNotificationsData(notifs);
  renderNotifications();
  updateNotifBadge(0);
}

function dismissNotif(id) {
  saveNotificationsData(getNotifications().filter(n => n.id !== id));
  renderNotifications();
}

function updateNotifBadge(count) {
  ['notifBadge','topNotifBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = count; el.style.display = count > 0 ? '' : 'none'; }
  });
}

// --- SAVE RECORDS ---
function saveIncome() {
  const amount = parseFloat(document.getElementById('incomeAmount').value);
  const source = document.getElementById('incomeSource').value.trim();
  const category = document.getElementById('incomeCategory').value;
  const date = document.getElementById('incomeDate').value;
  const paymentMethod = document.getElementById('incomePayment').value;
  const notes = document.getElementById('incomeNotes').value.trim();

  if (!amount || amount <= 0) { showToast('Please enter a valid amount','error'); return; }
  if (!source) { showToast('Please enter an income source','error'); return; }
  if (!date) { showToast('Please select a date','error'); return; }

  addIncomeRecord({ amount, source, category, date, paymentMethod, notes });
  closeModal('addIncomeModal');
  showToast('Income added successfully','success');
  checkBudgetAfterChange();
  const sec = currentSection();
  if (sec === 'income') renderIncomeSection();
  else if (sec === 'transactions') renderTransactionsTable();
  else renderOverview();
}

function saveExpense() {
  const amount = parseFloat(document.getElementById('expAmount').value);
  const description = document.getElementById('expDesc').value.trim();
  const category = document.getElementById('expCategory').value;
  const date = document.getElementById('expDate').value;
  const paymentMethod = document.getElementById('expPayment').value;
  const notes = document.getElementById('expNotes').value.trim();

  if (!amount || amount <= 0) { showToast('Please enter a valid amount','error'); return; }
  if (!description) { showToast('Please enter a description','error'); return; }
  if (!date) { showToast('Please select a date','error'); return; }

  addExpenseRecord({ amount, description, category, date, paymentMethod, notes });
  closeModal('addExpenseModal');
  showToast('Expense added successfully','success');
  checkBudgetAfterChange();
  loadSection(currentSection());
  if (currentSection() === 'overview') renderOverview();
}

function saveBudget() {
  const name = document.getElementById('budgetName').value.trim();
  const category = document.getElementById('budgetCategory').value;
  const limit = parseFloat(document.getElementById('budgetLimit').value);
  const month = document.getElementById('budgetMonth').value;

  if (!name) { showToast('Please enter a budget name','error'); return; }
  if (!limit || limit <= 0) { showToast('Please enter a valid limit','error'); return; }

  // Check duplicate
  const existing = getBudgets().find(b => b.category === category && b.month === month);
  if (existing) { showToast('A budget for this category and month already exists','error'); return; }

  addBudgetRecord({ name, category, limit, month });
  closeModal('addBudgetModal');
  showToast('Budget created','success');
  renderBudgets();
}

function saveGoal() {
  const name = document.getElementById('goalName').value.trim();
  const targetAmount = parseFloat(document.getElementById('goalTarget').value);
  const currentAmount = parseFloat(document.getElementById('goalCurrent').value) || 0;
  const targetDate = document.getElementById('goalDate').value;
  const status = document.getElementById('goalStatus').value;
  const description = document.getElementById('goalDesc').value.trim();

  if (!name) { showToast('Please enter a goal name','error'); return; }
  if (!targetAmount || targetAmount <= 0) { showToast('Please enter a valid target amount','error'); return; }
  if (currentAmount > targetAmount) { showToast('Current amount cannot exceed target','error'); return; }

  addGoalRecord({ name, targetAmount, currentAmount, targetDate, status, description });
  closeModal('addGoalModal');
  showToast('Savings goal created!','success');
  renderGoals();
  if (currentAmount >= targetAmount) {
    addNotification({ title: 'Goal Achieved!', message: `Congratulations! You've reached your goal: ${name}`, type: 'success', icon: 'fas fa-trophy', iconColor: '#10b981' });
  }
}

function openContrib(goalId, goalName) {
  document.getElementById('contribGoalId').value = goalId;
  document.getElementById('contribGoalName').value = goalName;
  document.getElementById('contribAmount').value = '';
  showModal('addContribModal');
}

function saveContribution() {
  const id = document.getElementById('contribGoalId').value;
  const amount = parseFloat(document.getElementById('contribAmount').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount','error'); return; }
  const goal = getGoals().find(g => g.id === id);
  if (!goal) return;
  const newAmount = Math.min(parseFloat(goal.targetAmount), parseFloat(goal.currentAmount || 0) + amount);
  const isComplete = newAmount >= parseFloat(goal.targetAmount);
  updateGoalRecord(id, { currentAmount: newAmount, status: isComplete ? 'completed' : goal.status });
  closeModal('addContribModal');
  showToast(isComplete ? '🎉 Goal Achieved!' : 'Contribution added!', 'success');
  if (isComplete) addNotification({ title: 'Goal Achieved!', message: `You reached your goal: ${goal.name}`, type: 'success', icon: 'fas fa-trophy', iconColor: '#10b981' });
  renderGoals();
}

function saveInvestment() {
  const name = document.getElementById('invName').value.trim();
  const type = document.getElementById('invType').value;
  const investedAmount = parseFloat(document.getElementById('invAmount').value);
  const currentValue = parseFloat(document.getElementById('invCurrent').value);
  const purchaseDate = document.getElementById('invDate').value;
  const notes = document.getElementById('invNotes').value.trim();

  if (!name) { showToast('Enter investment name','error'); return; }
  if (!investedAmount || investedAmount <= 0) { showToast('Enter valid invested amount','error'); return; }
  if (!currentValue || currentValue < 0) { showToast('Enter valid current value','error'); return; }

  addInvestmentRecord({ name, type, investedAmount, currentValue, purchaseDate, notes });
  closeModal('addInvestmentModal');
  showToast('Investment added','success');
  renderInvestments();
}

// --- EDIT RECORD ---
function editRecord(id, type) {
  if (type === 'income') {
    const r = getIncome().find(x => x.id === id);
    if (!r) return;
    document.getElementById('incomeAmount').value = r.amount;
    document.getElementById('incomeSource').value = r.source;
    document.getElementById('incomeCategory').value = r.category;
    document.getElementById('incomeDate').value = r.date;
    document.getElementById('incomePayment').value = r.paymentMethod;
    document.getElementById('incomeNotes').value = r.notes || '';
    showModal('addIncomeModal');
    // Override save button
    const btn = document.querySelector('#addIncomeModal .btn-primary:last-of-type');
    if (btn) { btn.onclick = () => { updateIncome(id); }; }
  } else if (type === 'expense') {
    const r = getExpenses().find(x => x.id === id);
    if (!r) return;
    document.getElementById('expAmount').value = r.amount;
    document.getElementById('expDesc').value = r.description;
    document.getElementById('expCategory').value = r.category;
    document.getElementById('expDate').value = r.date;
    document.getElementById('expPayment').value = r.paymentMethod;
    document.getElementById('expNotes').value = r.notes || '';
    showModal('addExpenseModal');
    const btn = document.querySelector('#addExpenseModal .btn-primary:last-of-type');
    if (btn) { btn.onclick = () => { updateExpense(id); }; }
  }
}

function updateIncome(id) {
  const amount = parseFloat(document.getElementById('incomeAmount').value);
  if (!amount || amount <= 0) { showToast('Invalid amount','error'); return; }
  updateIncomeRecord(id, {
    amount, source: document.getElementById('incomeSource').value.trim(),
    category: document.getElementById('incomeCategory').value,
    date: document.getElementById('incomeDate').value,
    paymentMethod: document.getElementById('incomePayment').value,
    notes: document.getElementById('incomeNotes').value.trim()
  });
  closeModal('addIncomeModal');
  showToast('Income updated','success');
  loadSection(currentSection());
  // Restore save button
  const btn = document.querySelector('#addIncomeModal .btn-primary:last-of-type');
  if (btn) btn.onclick = saveIncome;
}

function updateExpense(id) {
  const amount = parseFloat(document.getElementById('expAmount').value);
  if (!amount || amount <= 0) { showToast('Invalid amount','error'); return; }
  updateExpenseRecord(id, {
    amount, description: document.getElementById('expDesc').value.trim(),
    category: document.getElementById('expCategory').value,
    date: document.getElementById('expDate').value,
    paymentMethod: document.getElementById('expPayment').value,
    notes: document.getElementById('expNotes').value.trim()
  });
  closeModal('addExpenseModal');
  showToast('Expense updated','success');
  loadSection(currentSection());
  const btn = document.querySelector('#addExpenseModal .btn-primary:last-of-type');
  if (btn) btn.onclick = saveExpense;
}

// --- DELETE ---
let _deleteCallback = null;
function confirmDelete(id, type) {
  const msgs = { income: 'Delete this income record?', expense: 'Delete this expense?', budget: 'Delete this budget?', goal: 'Delete this savings goal?', investment: 'Delete this investment?' };
  const msgEl = document.getElementById('confirmMsg');
  if (msgEl) msgEl.textContent = msgs[type] || 'Delete this record? This cannot be undone.';
  _deleteCallback = () => { doDelete(id, type); closeModal('confirmModal'); };
  const btn = document.getElementById('confirmDeleteBtn');
  if (btn) btn.onclick = _deleteCallback;
  showModal('confirmModal');
}

function doDelete(id, type) {
  if (type === 'income') deleteIncomeRecord(id);
  else if (type === 'expense') deleteExpenseRecord(id);
  else if (type === 'budget') deleteBudgetRecord(id);
  else if (type === 'goal') deleteGoalRecord(id);
  else if (type === 'investment') deleteInvestmentRecord(id);
  showToast('Record deleted','success');
  loadSection(currentSection());
  if (currentSection() === 'overview') renderOverview();
}

// --- BUDGET ALERT ---
function checkBudgetAfterChange() {
  const curMonth = getCurrentMonth();
  const budgets = getBudgets().filter(b => b.month === curMonth);
  const expByCat = {};
  getExpenses().filter(r => getMonthStr(r.date) === curMonth).forEach(r => { expByCat[r.category] = (expByCat[r.category] || 0) + parseFloat(r.amount); });
  const totalExp = calcTotalExpenses(curMonth);

  budgets.forEach(b => {
    const spent = b.category === 'Overall' ? totalExp : (expByCat[b.category] || 0);
    const pct = (spent / parseFloat(b.limit)) * 100;
    if (pct >= 100) {
      const exists = getNotifications().find(n => n.title.includes(b.name) && n.message.includes('exceeded'));
      if (!exists) addNotification({ title: `Budget Exceeded: ${b.name}`, message: `You have exceeded your ${b.name} budget of ${formatCurrency(b.limit)}.`, type: 'danger', icon: 'fas fa-exclamation-circle', iconColor: '#ef4444' });
    } else if (pct >= 75) {
      const exists = getNotifications().find(n => n.title.includes(b.name) && n.message.includes('75%'));
      if (!exists) addNotification({ title: `Budget Warning: ${b.name}`, message: `You have used ${pct.toFixed(0)}% of your ${b.name} budget.`, type: 'warning', icon: 'fas fa-exclamation-triangle', iconColor: '#f59e0b' });
    }
  });
  updateNotifBadge(getNotifications().filter(n => !n.read).length);
}

// --- SETTINGS ---
function saveProfile() {
  const name = document.getElementById('profileName').value.trim();
  const currency = document.getElementById('profileCurrency').value;
  const u = DB.getUser();
  if (!u) return;
  const updated = { ...u, name, currency };
  localStorage.setItem('finora_current_user', JSON.stringify(updated));
  initUserInfo(updated);
  showToast('Profile saved','success');
}

function clearUserData() {
  const u = DB.getUser();
  if (!u) return;
  ['income','expenses','budgets','goals','investments','notifications'].forEach(k => {
    localStorage.removeItem('finora_' + k + '_' + u.id);
  });
  showToast('All data cleared','success');
  renderOverview();
}

// --- EXPORT ---
function exportTransactionsCSV() {
  const incomes = getIncome().map(r => ({ Type:'Income', Date:r.date, Description:r.source, Category:r.category, Amount:r.amount, Payment:r.paymentMethod, Notes:r.notes||'' }));
  const expenses = getExpenses().map(r => ({ Type:'Expense', Date:r.date, Description:r.description, Category:r.category, Amount:r.amount, Payment:r.paymentMethod, Notes:r.notes||'' }));
  const data = [...incomes, ...expenses].sort((a,b) => new Date(b.Date)-new Date(a.Date));
  downloadCSV(data, 'finora_transactions.csv');
}

function exportFullReport() {
  const curMonth = getCurrentMonth();
  const data = [
    { Section:'Summary', Item:'Total Income', Value: calcTotalIncome(curMonth) },
    { Section:'Summary', Item:'Total Expenses', Value: calcTotalExpenses(curMonth) },
    { Section:'Summary', Item:'Net Balance', Value: calcTotalBalance() },
    { Section:'Summary', Item:'Total Savings', Value: calcTotalSavings() },
    ...getIncome().map(r => ({ Section:'Income', Item:r.source, Value:r.amount, Category:r.category, Date:r.date })),
    ...getExpenses().map(r => ({ Section:'Expense', Item:r.description, Value:r.amount, Category:r.category, Date:r.date })),
  ];
  downloadCSV(data, 'finora_report.csv');
}

function downloadCSV(data, filename) {
  if (!data.length) { showToast('No data to export','error'); return; }
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${String(row[k]||'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  showToast('Export downloaded','success');
}

// --- POPULATE YEAR SELECTOR ---
function populateYearSelector() {
  const sel = document.getElementById('analyticsYear');
  if (!sel) return;
  const cur = new Date().getFullYear();
  for (let y = cur; y >= cur - 3; y--) {
    const o = new Option(y, y);
    if (y === cur) o.selected = true;
    sel.add(o);
  }
}

// --- MODAL HELPERS ---
function showModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); });
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); });
});

// --- TOAST ---
let _toastTimer;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const msg = document.getElementById('toastMsg');
  if (!toast) return;
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', info: 'fas fa-info-circle' };
  toast.className = 'toast toast-' + type;
  icon.innerHTML = `<i class="${icons[type] || icons.info}"></i>`;
  msg.textContent = message;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- HELPERS ---
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function escHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(str) { return String(str||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if (d > 0) return d + 'd ago'; if (h > 0) return h + 'h ago'; if (m > 0) return m + 'm ago'; return 'Just now';
}
function emptyState(icon, title, desc) {
  return `<div class="empty-state"><i class="${icon}"></i><h4>${title}</h4><p>${desc}</p></div>`;
}
function currentSection() {
  const active = document.querySelector('.sidebar-nav-item.active');
  return active ? active.dataset.section : 'overview';
}

// Pagination uses named callback registry to avoid fragile fn.toString()
const _pageCallbacks = {};
function buildPagination(containerId, page, pages, cb) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (pages <= 1) { container.innerHTML = ''; return; }
  _pageCallbacks[containerId] = cb;
  const cbKey = `_pageCallbacks['${containerId}']`;
  let btns = `<button class="page-btn" ${page===1?'disabled':''} onclick="${cbKey}(${page-1})"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === pages - 2) btns += `<span style="padding:0 0.5rem;color:var(--text-muted)">...</span>`;
      continue;
    }
    btns += `<button class="page-btn ${i===page?'active':''}" onclick="${cbKey}(${i})">${i}</button>`;
  }
  btns += `<button class="page-btn" ${page===pages?'disabled':''} onclick="${cbKey}(${page+1})"><i class="fas fa-chevron-right"></i></button>`;
  btns += `<span class="page-info">${page} of ${pages}</span>`;
  container.innerHTML = btns;
}
