# 💰 Finora — Personal Finance Management System

> A complete, modern, mobile-friendly personal finance web app built with pure HTML, CSS & JavaScript. No build tools, no npm install — just open and use.

🌐 **Live Demo:** [https://theshlok18.github.io/web1](https://theshlok18.github.io/web1)

---

## 📱 Mobile Friendly

Fully responsive across all screen sizes:
- ✅ Desktop (1440px+)
- ✅ Laptop (1024px)
- ✅ Tablet (768px)
- ✅ Mobile (480px, 360px)
- ✅ iOS safe-area support
- ✅ Touch-friendly buttons (44px min targets)
- ✅ Horizontal scroll on data tables
- ✅ No horizontal overflow
- ✅ Prevents iOS zoom on input focus

---

## ✨ Features

| Module | What it does |
|---|---|
| 🏠 Landing Page | Hero, Features, How it Works, Security, CTA, Contact, Footer |
| 🔐 Auth | Register, Login, Forgot/Reset Password |
| 📊 Dashboard | Live summary cards + charts + recent transactions |
| 💵 Income | Add / Edit / Delete / Search / Filter / Paginate |
| 💸 Expenses | Full CRUD with category icons and filters |
| 🎯 Budgets | Monthly limits with progress bars + 75%/100% warnings |
| 🐷 Savings Goals | Animated SVG rings, contributions, completion state |
| 📈 Investments | Portfolio chart, gain/loss chart, performance table |
| 📉 Analytics | 5 interactive charts + CSV export |
| 🔔 Notifications | Budget alerts, goal milestones, read/unread/dismiss |
| ⚙️ Settings | Profile, password change, preferences, danger zone |
| 🌗 Theme | Dark / Light glassmorphism theme toggle |

---

## 🚀 How to Run Locally

### Option 1 — Open in Browser
Double-click `index.html` — works in Chrome, Firefox, Edge, Safari.

### Option 2 — Python Server (recommended)
```bash
cd personal-finance-management
python -m http.server 8080
```
Open: [http://localhost:8080](http://localhost:8080)

### Option 3 — Node.js
```bash
npx serve personal-finance-management
```

### Option 4 — VS Code
Right-click `index.html` → **Open with Live Server**

---

## 🎮 Demo Account

Click **"Login with Demo Account"** on the login page for instant access with pre-loaded data.

Or enter manually:
```
Email:    demo@finora.app
Password: Demo@1234
```

Pre-loaded demo data includes:
- 7 income records (salary, freelance, investments)
- 14 expense records across 8 categories
- 5 budget plans for current month
- 4 savings goals (laptop, emergency fund, vacation, car)
- 4 investments (stocks, mutual funds, FD, gold)
- 3 notifications

---

## 📁 Project Structure

```
personal-finance-management/
├── index.html              ← Landing page
├── login.html              ← Login
├── register.html           ← Register
├── forgot-password.html    ← Forgot password
├── reset-password.html     ← Reset password
├── dashboard.html          ← Main app (all modules)
├── profile.html            ← User profile
├── css/
│   ├── style.css           ← Global design system + dark/light vars
│   ├── landing.css         ← Landing page styles
│   ├── auth.css            ← Auth pages styles
│   ├── dashboard.css       ← Dashboard & module styles
│   └── mobile.css          ← Mobile-first responsive overrides
└── js/
    ├── theme.js            ← Dark/light theme toggle
    ├── auth.js             ← Auth guard (redirect logic)
    ├── data.js             ← localStorage data layer + seed data
    ├── dashboard.js        ← All section rendering & CRUD logic
    ├── charts.js           ← Chart.js chart renderers
    └── landing.js          ← Landing page animations
```

---

## 🛠️ Tech Stack

| Tech | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 Custom Properties | Glassmorphism design system, dark/light themes |
| Vanilla JS (ES6+) | All logic, routing, CRUD, data |
| [Chart.js v4](https://www.chartjs.org/) | 6 interactive charts |
| [Font Awesome 6](https://fontawesome.com/) | Icons |
| [Google Fonts — Inter](https://fonts.google.com/) | Typography |
| localStorage | Client-side data persistence |

---

## 📊 Dashboard Charts

1. **Income vs Expenses** — Monthly bar chart (overview)
2. **Expense Categories** — Doughnut chart (overview)
3. **Monthly Trend** — Full-year bar chart (analytics)
4. **Cash Flow** — Line chart (analytics)
5. **Expense Breakdown** — Doughnut (analytics)
6. **Budget Utilization** — Horizontal bar (analytics)
7. **Savings Progress** — Bar chart (analytics)
8. **Portfolio Allocation** — Doughnut (investments)
9. **Gain/Loss by Asset** — Bar chart (investments)

---

## 🎨 Design System

- **Theme:** Premium Glassmorphism (`backdrop-filter: blur`)
- **Dark:** Deep teal + dark navy background, emerald green accent
- **Light:** Soft gray background, same accent palette
- **Typography:** Inter (Google Fonts)
- **Animations:** CSS keyframes, SVG transitions, scroll-reveal

---

## 🔒 Data Storage

All data lives in the browser's `localStorage`:
- Persists between sessions
- Scoped per user account
- Cleared with browser site data
- No server or internet required (after initial CDN load)

---

## 🌐 Deploy to GitHub Pages

This repo is automatically served at:
**[https://theshlok18.github.io/web1](https://theshlok18.github.io/web1)**

To deploy your own fork:
1. Fork or push to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch → main → / (root)**
4. Click Save — live in ~60 seconds

---

## 📱 Screenshots

| Landing Page | Dashboard | Mobile |
|---|---|---|
| Premium glassmorphism hero | Live charts + summary cards | Responsive drawer nav |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ for financial clarity.
