// ============================================
// FINORA — CHARTS (Chart.js)
// ============================================

let _charts = {};

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    textColor: isDark ? '#94a3b8' : '#64748b',
    gridColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    tooltipBg: isDark ? '#0d1628' : '#fff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };
}

function destroyChart(id) {
  if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

function defaultTooltip() {
  const c = getChartColors();
  return {
    backgroundColor: c.tooltipBg,
    borderColor: c.tooltipBorder,
    borderWidth: 1,
    titleColor: '#f1f5f9',
    bodyColor: '#94a3b8',
    padding: 12,
    cornerRadius: 10,
    displayColors: true,
  };
}

function defaultScales() {
  const c = getChartColors();
  return {
    x: { ticks: { color: c.textColor, font: { size: 11 } }, grid: { color: c.gridColor } },
    y: { ticks: { color: c.textColor, font: { size: 11 }, callback: v => '₹' + Number(v).toLocaleString('en-IN') }, grid: { color: c.gridColor } }
  };
}

// ---- OVERVIEW CHARTS ----
function renderOverviewCharts() {
  renderOverviewBar();
  renderExpensePie();
}

function renderOverviewBar() {
  const canvasId = 'overviewBarChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const months = getLast6Months();
  const incomeData = months.map(m => calcTotalIncome(m.key));
  const expData = months.map(m => calcTotalExpenses(m.key));
  const labels = months.map(m => m.label);

  _charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 8, borderSkipped: false },
        { label: 'Expenses', data: expData, backgroundColor: 'rgba(239,68,68,0.65)', borderRadius: 8, borderSkipped: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: getChartColors().textColor, font: { size: 12 } } }, tooltip: defaultTooltip() },
      scales: defaultScales()
    }
  });
}

function renderExpensePie() {
  const canvasId = 'expensePieChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const curMonth = getCurrentMonth();
  const cats = {};
  getExpenses().filter(r => getMonthStr(r.date) === curMonth).forEach(r => { cats[r.category] = (cats[r.category] || 0) + parseFloat(r.amount); });
  const entries = Object.entries(cats).sort((a,b) => b[1]-a[1]);

  if (!entries.length) { canvas.parentElement.innerHTML += '<div class="empty-state" style="padding:2rem"><i class="fas fa-chart-pie"></i><p>No expense data</p></div>'; return; }

  const COLORS = ['#10b981','#ef4444','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#64748b'];

  _charts[canvasId] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{ data: entries.map(e => e[1]), backgroundColor: COLORS.slice(0, entries.length), borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { color: getChartColors().textColor, padding: 12, font: { size: 11 }, boxWidth: 12, borderRadius: 4 } },
        tooltip: { ...defaultTooltip(), callbacks: { label: ctx => ` ${ctx.label}: ₹${Number(ctx.raw).toLocaleString('en-IN')}` } }
      }
    }
  });
}

// ---- INVESTMENT CHARTS ----
function renderInvestmentCharts() {
  renderPortfolioPie();
  renderGainLossBar();
}

function renderPortfolioPie() {
  const canvasId = 'portfolioPieChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const invs = getInvestments();
  if (!invs.length) return;

  const byType = {};
  invs.forEach(i => { byType[i.type] = (byType[i.type] || 0) + parseFloat(i.investedAmount || 0); });
  const entries = Object.entries(byType);
  const COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ec4899'];

  _charts[canvasId] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{ data: entries.map(e => e[1]), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: getChartColors().textColor, padding: 12, font: { size: 11 }, boxWidth: 12 } },
        tooltip: { ...defaultTooltip(), callbacks: { label: ctx => ` ${ctx.label}: ₹${Number(ctx.raw).toLocaleString('en-IN')}` } }
      }
    }
  });
}

function renderGainLossBar() {
  const canvasId = 'gainLossChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const invs = getInvestments();
  if (!invs.length) return;

  const labels = invs.map(i => i.name.length > 12 ? i.name.substring(0,12)+'...' : i.name);
  const gains = invs.map(i => parseFloat(i.currentValue || 0) - parseFloat(i.investedAmount || 0));
  const colors = gains.map(g => g >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(239,68,68,0.75)');

  _charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Gain/Loss', data: gains, backgroundColor: colors, borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: defaultTooltip() },
      scales: defaultScales()
    }
  });
}

// ---- ANALYTICS CHARTS ----
function renderAnalyticsCharts() {
  const year = parseInt(document.getElementById('analyticsYear')?.value || new Date().getFullYear());
  renderAnalyticsBar(year);
  renderCashFlow(year);
  renderAnalyticsDonut(year);
  renderBudgetUtil();
  renderSavingsProgressChart();
}

function renderAnalyticsBar(year) {
  const canvasId = 'analyticsBarChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const months = Array.from({length:12}, (_,i) => {
    const m = String(i+1).padStart(2,'0');
    return { key: `${year}-${m}`, label: new Date(year, i, 1).toLocaleString('default',{month:'short'}) };
  });

  _charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        { label: 'Income', data: months.map(m => calcTotalIncome(m.key)), backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6, borderSkipped: false },
        { label: 'Expenses', data: months.map(m => calcTotalExpenses(m.key)), backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 6, borderSkipped: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: getChartColors().textColor } }, tooltip: defaultTooltip() },
      scales: defaultScales()
    }
  });
}

function renderCashFlow(year) {
  const canvasId = 'cashFlowChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const months = Array.from({length:12}, (_,i) => {
    const m = String(i+1).padStart(2,'0');
    return { key: `${year}-${m}`, label: new Date(year, i, 1).toLocaleString('default',{month:'short'}) };
  });

  const netFlow = months.map(m => calcTotalIncome(m.key) - calcTotalExpenses(m.key));

  _charts[canvasId] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Net Cash Flow',
        data: netFlow,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: getChartColors().textColor } }, tooltip: defaultTooltip() },
      scales: { ...defaultScales(), y: { ...defaultScales().y, ticks: { ...defaultScales().y.ticks, callback: v => (v >= 0 ? '+' : '') + '₹' + Number(Math.abs(v)).toLocaleString('en-IN') } } }
    }
  });
}

function renderAnalyticsDonut(year) {
  const canvasId = 'analyticsDonutChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const cats = {};
  getExpenses().filter(r => new Date(r.date).getFullYear() === year).forEach(r => { cats[r.category] = (cats[r.category] || 0) + parseFloat(r.amount); });
  const entries = Object.entries(cats).sort((a,b) => b[1]-a[1]);
  if (!entries.length) return;

  const COLORS = ['#10b981','#ef4444','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#64748b'];

  _charts[canvasId] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{ data: entries.map(e => e[1]), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: getChartColors().textColor, padding: 10, font: { size: 10 }, boxWidth: 10 } },
        tooltip: { ...defaultTooltip(), callbacks: { label: ctx => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}` } }
      }
    }
  });
}

function renderBudgetUtil() {
  const canvasId = 'budgetUtilChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const curMonth = getCurrentMonth();
  const budgets = getBudgets().filter(b => b.month === curMonth || !b.month);
  if (!budgets.length) return;

  const expByCat = {};
  const totalExp = calcTotalExpenses(curMonth);
  getExpenses().filter(r => getMonthStr(r.date) === curMonth).forEach(r => { expByCat[r.category] = (expByCat[r.category] || 0) + parseFloat(r.amount); });

  const labels = budgets.map(b => b.name.length > 14 ? b.name.substring(0,14)+'...' : b.name);
  const limits = budgets.map(b => parseFloat(b.limit));
  const spent = budgets.map(b => b.category === 'Overall' ? totalExp : (expByCat[b.category] || 0));

  _charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Budget Limit', data: limits, backgroundColor: 'rgba(59,130,246,0.4)', borderRadius: 6 },
        { label: 'Spent', data: spent, backgroundColor: spent.map((s,i) => s/limits[i] > 1 ? 'rgba(239,68,68,0.75)' : s/limits[i] > 0.75 ? 'rgba(245,158,11,0.75)' : 'rgba(16,185,129,0.75)'), borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend: { labels: { color: getChartColors().textColor } }, tooltip: defaultTooltip() },
      scales: {
        x: { ...defaultScales().x, ticks: { ...defaultScales().x.ticks, callback: v => '₹' + Number(v).toLocaleString('en-IN') } },
        y: { ticks: { color: getChartColors().textColor, font: { size: 11 } }, grid: { color: getChartColors().gridColor } }
      }
    }
  });
}

function renderSavingsProgressChart() {
  const canvasId = 'savingsProgressChart';
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const goals = getGoals();
  if (!goals.length) return;

  const labels = goals.map(g => g.name.length > 14 ? g.name.substring(0,14)+'...' : g.name);
  const targets = goals.map(g => parseFloat(g.targetAmount));
  const current = goals.map(g => parseFloat(g.currentAmount || 0));

  _charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Target', data: targets, backgroundColor: 'rgba(59,130,246,0.3)', borderRadius: 6 },
        { label: 'Saved', data: current, backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: getChartColors().textColor } }, tooltip: defaultTooltip() },
      scales: defaultScales()
    }
  });
}

// ---- HELPERS ----
function getLast6Months() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
      label: d.toLocaleString('default', { month: 'short' })
    });
  }
  return months;
}

// Allow chart redraw on theme change
window.redrawCharts = function() {
  const sec = typeof currentSection === 'function' ? currentSection() : 'overview';
  setTimeout(() => {
    if (sec === 'overview') renderOverviewCharts();
    else if (sec === 'analytics') renderAnalyticsCharts();
    else if (sec === 'investments') renderInvestmentCharts();
  }, 100);
};
