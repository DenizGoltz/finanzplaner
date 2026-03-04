"use strict";

/* ════════════════════════════════════════════════════
   BUDGETPRO — script.js
   Vollständige Implementierung — Vanilla JS
   Kein Framework, kein CDN, kein Backend
════════════════════════════════════════════════════ */

/* ── 1. KONSTANTEN ── */

const STORAGE_KEY = "budgetpro_v3";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const INCOME_CATEGORIES = [
  "Gehalt",
  "Freelance",
  "Mieteinnahmen",
  "Kapitalerträge",
  "Kindergeld",
  "Elterngeld",
  "Steuerrückerstattung",
  "Nebenjob",
  "Verkäufe",
  "Sonstiges",
];

const EXPENSE_CATEGORIES = {
  Wohnen: [
    "Miete/Hypothek",
    "Nebenkosten",
    "Strom",
    "Gas",
    "Wasser",
    "Internet",
    "Telefon",
    "Versicherung Haus",
    "Reparaturen",
    "GEZ",
  ],
  Lebensmittel: [
    "Supermarkt",
    "Bäcker",
    "Bio-Laden",
    "Markt",
    "Lieferdienst",
    "Getränke",
    "Drogerie",
  ],
  Transport: [
    "KFZ-Steuer",
    "KFZ-Versicherung",
    "Kraftstoff",
    "ÖPNV",
    "Bahnticket",
    "Parkgebühren",
    "Wartung",
    "Reparatur Auto",
    "Leasing",
  ],
  Gesundheit: [
    "Arzt",
    "Zahnarzt",
    "Medikamente",
    "Krankenversicherung",
    "Physiotherapie",
    "Brille/Kontaktlinsen",
    "Sportmedizin",
  ],
  Kind: [
    "Kindergarten",
    "Schule",
    "Hort",
    "Kleidung Kind",
    "Spielzeug",
    "Schulbedarf",
    "Sportverein",
    "Nachhilfe",
    "Kinderarzt",
  ],
  Hund: [
    "Futter",
    "Tierarzt",
    "Tierpension",
    "Zubehör",
    "Hundesteuer",
    "Hundeschule",
    "Tierkrankenversicherung",
  ],
  Freizeit: [
    "Restaurant",
    "Café",
    "Kino/Theater",
    "Sport",
    "Urlaub",
    "Hobbys",
    "Bücher",
    "Streaming",
    "Spiele",
    "Konzerte",
  ],
  Kleidung: ["Kleidung Erwachsene", "Schuhe", "Accessoires", "Reinigung"],
  Versicherungen: [
    "Lebensversicherung",
    "Haftpflicht",
    "Berufsunfähigkeit",
    "Unfallversicherung",
    "Rechtschutz",
  ],
  Sparen: ["Sparplan", "Tagesgeld", "Notgroschen", "Bausparvertrag"],
  Investitionen: [
    "ETF/Fonds",
    "Aktien",
    "Immobilien",
    "Altersvorsorge",
    "Depot",
  ],
  Schulden: ["Kreditrate", "Leasing", "Ratenzahlung"],
  Sonstiges: ["Geschenke", "Spenden", "Zeitungen/Abo", "Haushalt", "Sonstiges"],
};

const PAYMENT_METHODS = [
  "Bar",
  "EC-Karte",
  "Kreditkarte",
  "Lastschrift",
  "Überweisung",
  "PayPal",
  "Apple Pay",
];
const EXPENSE_TYPES = [
  "Fixkosten",
  "Variable Kosten",
  "Sparen",
  "Investition",
  "Schulden",
];
const PERSONS = ["Sarah", "Deniz", "Kiyan", "Gucci", "Alle"];
const INTERVALS = [
  "Monatlich",
  "Vierteljährlich",
  "Halbjährlich",
  "Jährlich",
  "Wöchentlich",
  "Einmalig",
];
const ACCOUNT_TYPES = [
  "Girokonto",
  "Sparkonto",
  "Tagesgeld",
  "Kreditkarte",
  "Bargeld",
  "Depot",
  "Sonstiges",
];

const ACCOUNT_ICONS = {
  Girokonto: "🏦",
  Sparkonto: "💰",
  Tagesgeld: "📈",
  Kreditkarte: "💳",
  Bargeld: "💵",
  Depot: "📊",
  Sonstiges: "🔷",
};

const CAT_EMOJIS = {
  Wohnen: "🏠",
  Lebensmittel: "🛒",
  Transport: "🚗",
  Gesundheit: "💊",
  Kind: "👶",
  Hund: "🐕",
  Freizeit: "🎭",
  Kleidung: "👗",
  Versicherungen: "🛡️",
  Sparen: "💰",
  Investitionen: "📈",
  Schulden: "📉",
  Sonstiges: "📦",
};

const CHART_COLORS = [
  "#00e599",
  "#4facfe",
  "#ffb547",
  "#ff4f6d",
  "#a78bfa",
  "#2dd4bf",
  "#fb923c",
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#e879f9",
  "#a3e635",
];

/* ── 2. STATE ── */

const state = {
  section: "dashboard",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  sortField: null,
  sortDir: "asc",
  searchQuery: "",
  filterCategory: "",
  filterPerson: "",
  filterType: "",
  editingId: null,
};

/* ── 3. DATENBANK ── */

let db = {
  incomes: [],
  expenses: [],
  budgets: {},
  savingsGoals: [],
  debts: [],
  accounts: [],
  settings: {
    currency: "EUR",
    darkMode: true,
    plannedIncome: 0,
    householdName: "Unser Haushalt",
  },
};

function saveDB() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    toast("Fehler beim Speichern!", "error");
  }
}

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      db = { ...db, ...parsed };
      db.incomes = db.incomes || [];
      db.expenses = db.expenses || [];
      db.savingsGoals = db.savingsGoals || [];
      db.debts = db.debts || [];
      db.accounts = db.accounts || [];
      db.budgets = db.budgets || {};
      db.settings = {
        currency: "EUR",
        darkMode: true,
        plannedIncome: 0,
        householdName: "Unser Haushalt",
        ...db.settings,
      };
    }
    /* Kein seedDemoData – App startet leer */
  } catch (e) {
    console.warn("Fehler beim Laden:", e);
  }
}

/* Demo-Daten nur auf expliziten Wunsch laden */
function seedDemoData() {
  const m = state.month,
    y = state.year;

  db.accounts = [
    {
      id: uid(),
      name: "Girokonto",
      type: "Girokonto",
      balance: 3240.5,
      note: "Volksbank",
    },
    {
      id: uid(),
      name: "Sparkonto",
      type: "Sparkonto",
      balance: 8500.0,
      note: "",
    },
    {
      id: uid(),
      name: "Tagesgeld",
      type: "Tagesgeld",
      balance: 15000.0,
      note: "3,5 % p.a.",
    },
    {
      id: uid(),
      name: "Depot",
      type: "Depot",
      balance: 22000.0,
      note: "ETF-Sparplan",
    },
    { id: uid(), name: "Bargeld", type: "Bargeld", balance: 180.0, note: "" },
  ];
  db.incomes = [
    {
      id: uid(),
      category: "Gehalt",
      subcategory: "Nettolohn",
      amount: 3800,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      recurring: true,
      interval: "Monatlich",
      person: "Sarah",
      note: "",
      taxable: true,
      gross: 5200,
      net: 3800,
    },
    {
      id: uid(),
      category: "Gehalt",
      subcategory: "Nettolohn",
      amount: 2600,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      recurring: true,
      interval: "Monatlich",
      person: "Deniz",
      note: "",
      taxable: true,
      gross: 3400,
      net: 2600,
    },
    {
      id: uid(),
      category: "Kindergeld",
      subcategory: "",
      amount: 250,
      date: `${y}-${pad(m)}-05`,
      month: m,
      year: y,
      recurring: true,
      interval: "Monatlich",
      person: "Kiyan",
      note: "",
      taxable: false,
      gross: 250,
      net: 250,
    },
  ];
  db.expenses = [
    {
      id: uid(),
      type: "Fixkosten",
      category: "Wohnen",
      subcategory: "Miete/Hypothek",
      amount: 1250,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      paymentMethod: "Lastschrift",
      account: "Girokonto",
      forWhom: "Alle",
      note: "Warmmiete",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Fixkosten",
      category: "Wohnen",
      subcategory: "Strom",
      amount: 85,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      paymentMethod: "Lastschrift",
      account: "Girokonto",
      forWhom: "Alle",
      note: "",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Fixkosten",
      category: "Wohnen",
      subcategory: "Internet",
      amount: 40,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      paymentMethod: "Lastschrift",
      account: "Girokonto",
      forWhom: "Alle",
      note: "",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Fixkosten",
      category: "Transport",
      subcategory: "KFZ-Versicherung",
      amount: 110,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      paymentMethod: "Lastschrift",
      account: "Girokonto",
      forWhom: "Alle",
      note: "",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Variable Kosten",
      category: "Lebensmittel",
      subcategory: "Supermarkt",
      amount: 480,
      date: `${y}-${pad(m)}-15`,
      month: m,
      year: y,
      paymentMethod: "EC-Karte",
      account: "Girokonto",
      forWhom: "Alle",
      note: "",
      recurring: false,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Variable Kosten",
      category: "Hund",
      subcategory: "Futter",
      amount: 65,
      date: `${y}-${pad(m)}-10`,
      month: m,
      year: y,
      paymentMethod: "EC-Karte",
      account: "Girokonto",
      forWhom: "Gucci",
      note: "",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Variable Kosten",
      category: "Kind",
      subcategory: "Kindergarten",
      amount: 180,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      paymentMethod: "Lastschrift",
      account: "Girokonto",
      forWhom: "Kiyan",
      note: "",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Variable Kosten",
      category: "Freizeit",
      subcategory: "Restaurant",
      amount: 120,
      date: `${y}-${pad(m)}-20`,
      month: m,
      year: y,
      paymentMethod: "Bar",
      account: "Bargeld",
      forWhom: "Alle",
      note: "Familienessen",
      recurring: false,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Sparen",
      category: "Sparen",
      subcategory: "Sparplan",
      amount: 500,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      paymentMethod: "Überweisung",
      account: "Girokonto",
      forWhom: "Alle",
      note: "Notgroschen",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
    {
      id: uid(),
      type: "Investition",
      category: "Investitionen",
      subcategory: "ETF/Fonds",
      amount: 300,
      date: `${y}-${pad(m)}-01`,
      month: m,
      year: y,
      paymentMethod: "Überweisung",
      account: "Girokonto",
      forWhom: "Alle",
      note: "ETF-Sparplan",
      recurring: true,
      warranty: false,
      taxDeductible: false,
    },
  ];
  db.budgets = {
    Wohnen: { planned: 1500 },
    Lebensmittel: { planned: 600 },
    Transport: { planned: 250 },
    Freizeit: { planned: 200 },
    Kind: { planned: 300 },
    Hund: { planned: 100 },
    Sparen: { planned: 500 },
    Investitionen: { planned: 300 },
    Gesundheit: { planned: 100 },
    Kleidung: { planned: 150 },
  };
  db.savingsGoals = [
    {
      id: uid(),
      name: "Notgroschen",
      target: 10000,
      current: 8500,
      startDate: `${y - 1}-01-01`,
      deadline: `${y + 1}-12-31`,
      monthlyRate: 200,
      note: "3 Monatsgehälter",
    },
    {
      id: uid(),
      name: "Urlaub",
      target: 3000,
      current: 1200,
      startDate: `${y}-01-01`,
      deadline: `${y}-07-01`,
      monthlyRate: 300,
      note: "Familienurlaub Spanien",
    },
    {
      id: uid(),
      name: "Auto-Neukauf",
      target: 20000,
      current: 5500,
      startDate: `${y - 1}-06-01`,
      deadline: `${y + 3}-06-01`,
      monthlyRate: 350,
      note: "Elektroauto",
    },
  ];
  db.debts = [
    {
      id: uid(),
      type: "Konsumentenkredit",
      creditor: "Hausbank",
      interestRate: 3.9,
      balance: 12500,
      monthlyRate: 380,
      extra: 0,
      startDate: `${y - 2}-03-01`,
      duration: 48,
      note: "Küchenkredit",
    },
  ];
  db.settings.plannedIncome = 6650;
  saveDB();
}

/* ── 4. HILFSFUNKTIONEN ── */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function fmt(amount) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: db.settings.currency || "EUR",
  }).format(amount || 0);
}

function fmtPct(v, t) {
  return t ? ((v / t) * 100).toFixed(1) + " %" : "0 %";
}

function fmtDate(s) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("de-DE");
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysInMonth(m, y) {
  return new Date(y, m, 0).getDate();
}

function monthsUntil(dl) {
  if (!dl) return 0;
  const now = new Date();
  const d = new Date(dl);
  return Math.max(
    0,
    (d.getFullYear() - now.getFullYear()) * 12 +
      (d.getMonth() - now.getMonth()),
  );
}

function catEmoji(cat) {
  return CAT_EMOJIS[cat] || "💸";
}

/* ── Berechnungen ── */

function totalIncome(m, y) {
  return db.incomes
    .filter((i) => i.month == m && i.year == y)
    .reduce((s, i) => s + i.amount, 0);
}
function totalExpense(m, y) {
  return db.expenses
    .filter((e) => e.month == m && e.year == y)
    .reduce((s, e) => s + e.amount, 0);
}
function totalAssets() {
  return db.accounts.reduce((s, a) => s + (a.balance || 0), 0);
}
function totalDebt() {
  return db.debts.reduce((s, d) => s + d.balance, 0);
}

function savingsRate(m, y) {
  const inc = totalIncome(m, y);
  if (!inc) return 0;
  return Math.max(0, ((inc - totalExpense(m, y)) / inc) * 100);
}

function expensesByCategory(m, y) {
  const map = {};
  db.expenses
    .filter((e) => e.month == m && e.year == y)
    .forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function expensesByType(m, y) {
  const map = {};
  db.expenses
    .filter((e) => e.month == m && e.year == y)
    .forEach((e) => {
      map[e.type] = (map[e.type] || 0) + e.amount;
    });
  return map;
}

function forecastMonthEnd(m, y) {
  const exp = totalExpense(m, y);
  const inc = totalIncome(m, y);
  const now = new Date();
  const isCurrentMonth = m === now.getMonth() + 1 && y === now.getFullYear();
  const dayNow = isCurrentMonth ? now.getDate() : daysInMonth(m, y);
  const daysTotal = daysInMonth(m, y);
  const projExp = dayNow ? (exp / dayNow) * daysTotal : exp;
  return { projExp, projInc: inc, dayNow, daysTotal };
}

function calcAmortization(debt) {
  const schedule = [];
  let balance = +debt.balance;
  const monthlyRate = +debt.interestRate / 100 / 12;
  let mo = 0;
  while (balance > 0.01 && mo < 600) {
    const interest = balance * monthlyRate;
    const principal = Math.min(+debt.monthlyRate - interest, balance);
    if (principal <= 0) break;
    balance -= principal;
    if (+debt.extra > 0 && balance > 0)
      balance = Math.max(0, balance - +debt.extra);
    schedule.push({
      month: mo + 1,
      interest,
      principal: principal + (+debt.extra || 0),
      balance: Math.max(0, balance),
    });
    mo++;
  }
  return schedule;
}

function ampel(pct) {
  if (pct >= 100) return "ampel-red";
  if (pct >= 80) return "ampel-amber";
  return "ampel-green";
}

function ampelLabel(pct) {
  if (pct >= 100) return "Überschritten";
  if (pct >= 80) return "Warnung";
  return "OK";
}

function progressCls(pct) {
  if (pct >= 100) return "progress-red";
  if (pct >= 80) return "progress-amber";
  return "progress-green";
}

/* ── 5. CANVAS CHARTS ── */

const Charts = {
  /* Hilfsfunktion: Canvas vorbereiten */
  setup(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.offsetWidth || 400;
    const h = rect.height || canvas.offsetHeight || 240;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx, w, h };
  },

  /* Farbe aus CSS-Variable lesen */
  cssVar(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  },

  /* ── Balken-Chart ── */
  bar(id, labels, datasets, opts = {}) {
    const g = this.setup(id);
    if (!g) return;
    const { ctx, w, h } = g;
    ctx.clearRect(0, 0, w, h);

    const pL = opts.padLeft || 68;
    const pR = opts.padRight || 20;
    const pT = opts.padTop || 16;
    const pB = opts.padBot || (datasets.length > 1 ? 52 : 36);

    const cw = w - pL - pR;
    const ch = h - pT - pB;

    const allVals = datasets.flatMap((d) => d.data);
    const maxVal = Math.max(...allVals, 1) * 1.12;

    /* Grid */
    const gridN = 4;
    for (let i = 0; i <= gridN; i++) {
      const gy = pT + (ch / gridN) * i;
      ctx.strokeStyle = this.cssVar("--border");
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pL, gy);
      ctx.lineTo(pL + cw, gy);
      ctx.stroke();
      ctx.setLineDash([]);
      const val = maxVal - (maxVal / gridN) * i;
      ctx.fillStyle = this.cssVar("--text-muted");
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      const label =
        val >= 1000 ? (val / 1000).toFixed(1) + "k" : val.toFixed(0);
      ctx.fillText(label, pL - 6, gy + 4);
    }

    /* Bars */
    const groupW = cw / (labels.length || 1);
    const numDs = datasets.length;
    const barW = Math.min((groupW / (numDs + 0.8)) * 0.85, 32);

    labels.forEach((lbl, li) => {
      datasets.forEach((ds, di) => {
        const val = ds.data[li] || 0;
        const x = pL + li * groupW + (groupW - barW * numDs) / 2 + di * barW;
        const bh = (val / maxVal) * ch;
        const y = pT + ch - bh;
        const col = ds.color || CHART_COLORS[di];

        const grad = ctx.createLinearGradient(0, y, 0, pT + ch);
        grad.addColorStop(0, col);
        grad.addColorStop(1, col + "33");
        ctx.fillStyle = grad;

        const r = Math.min(3, barW / 2, bh / 2);
        ctx.beginPath();
        ctx.moveTo(x, pT + ch);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.lineTo(x + barW - r, y);
        ctx.arcTo(x + barW, y, x + barW, y + r, r);
        ctx.lineTo(x + barW, pT + ch);
        ctx.closePath();
        ctx.fill();
      });

      /* X-Label */
      ctx.fillStyle = this.cssVar("--text-muted");
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lbl, pL + li * groupW + groupW / 2, pT + ch + 15);
    });

    /* Legende */
    if (datasets.length > 1 && opts.legend !== false) {
      const legY = pT + ch + 30;
      const total = datasets.reduce((s, ds) => s + ds.label.length * 7 + 28, 0);
      let lx = pL + (cw - Math.min(total, cw)) / 2;
      datasets.forEach((ds) => {
        const col = ds.color || CHART_COLORS[0];
        ctx.fillStyle = col;
        ctx.fillRect(lx, legY - 7, 14, 8);
        ctx.fillStyle = this.cssVar("--text-secondary");
        ctx.font = "10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(ds.label, lx + 18, legY);
        lx += ds.label.length * 7 + 28;
      });
    }
  },

  /* ── Donut-Chart ── */
  donut(id, labels, values, colors) {
    const g = this.setup(id);
    if (!g) return;
    const { ctx, w, h } = g;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 6;
    const ir = r * 0.62;
    const total = values.reduce((a, b) => a + b, 0) || 1;

    let angle = -Math.PI / 2;
    values.forEach((val, i) => {
      const slice = (val / total) * 2 * Math.PI;
      const col =
        (colors && colors[i]) || CHART_COLORS[i % CHART_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();

      ctx.strokeStyle = this.cssVar("--bg-card");
      ctx.lineWidth = 2.5;
      ctx.stroke();

      angle += slice;
    });

    /* Loch */
    ctx.beginPath();
    ctx.arc(cx, cy, ir, 0, 2 * Math.PI);
    ctx.fillStyle = this.cssVar("--bg-card");
    ctx.fill();
  },

  /* ── Linien-Chart ── */
  line(id, labels, datasets, opts = {}) {
    const g = this.setup(id);
    if (!g) return;
    const { ctx, w, h } = g;
    ctx.clearRect(0, 0, w, h);

    const pL = 68,
      pR = 20,
      pT = 16,
      pB = datasets.length > 1 ? 52 : 30;
    const cw = w - pL - pR;
    const ch = h - pT - pB;

    const allVals = datasets.flatMap((d) => d.data);
    const maxVal = Math.max(...allVals, 1) * 1.1;
    const minVal = opts.minZero ? 0 : Math.min(...allVals, 0) * 1.1;
    const range = maxVal - minVal || 1;

    /* Grid */
    const gridN = 4;
    for (let i = 0; i <= gridN; i++) {
      const gy = pT + (ch / gridN) * i;
      const val = maxVal - (range / gridN) * i;
      ctx.strokeStyle = this.cssVar("--border");
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pL, gy);
      ctx.lineTo(pL + cw, gy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = this.cssVar("--text-muted");
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(
        val >= 1000 ? (val / 1000).toFixed(1) + "k€" : val.toFixed(0) + "€",
        pL - 6,
        gy + 4,
      );
    }

    const numPts = labels.length;

    datasets.forEach((ds, di) => {
      const col = ds.color || CHART_COLORS[di];
      const pts = ds.data.map((val, i) => ({
        x: pL + (numPts > 1 ? i / (numPts - 1) : 0.5) * cw,
        y: pT + ch - ((val - minVal) / range) * ch,
      }));
      if (pts.length < 1) return;

      /* Fläche */
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pT + ch);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, pT + ch);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pT, 0, pT + ch);
      grad.addColorStop(0, col + "55");
      grad.addColorStop(1, col + "00");
      ctx.fillStyle = grad;
      ctx.fill();

      /* Linie */
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cpx = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      /* Punkte */
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = this.cssVar("--bg-card");
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    /* X-Labels */
    labels.forEach((lbl, i) => {
      const x = pL + (numPts > 1 ? i / (numPts - 1) : 0.5) * cw;
      ctx.fillStyle = this.cssVar("--text-muted");
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lbl, x, pT + ch + 14);
    });

    /* Legende */
    if (datasets.length > 1) {
      const ly = pT + ch + 32;
      let lx = pL;
      datasets.forEach((ds, i) => {
        const col = ds.color || CHART_COLORS[i];
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lx, ly - 4);
        ctx.lineTo(lx + 18, ly - 4);
        ctx.stroke();
        ctx.fillStyle = this.cssVar("--text-secondary");
        ctx.font = "10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(ds.label, lx + 22, ly);
        lx += ds.label.length * 7 + 32;
      });
    }
  },

  /* ── Horizontaler Balken ── */
  hbar(id, labels, values, colors) {
    const g = this.setup(id);
    if (!g) return;
    const { ctx, w, h } = g;
    ctx.clearRect(0, 0, w, h);

    if (!values.length) return;

    const pL = 110,
      pR = 72,
      pT = 6,
      pB = 6;
    const cw = w - pL - pR;
    const rowH = Math.max(14, (h - pT - pB) / values.length);
    const barH = Math.min(rowH * 0.6, 22);
    const maxV = Math.max(...values, 1);

    labels.forEach((lbl, i) => {
      const val = values[i];
      const y = pT + i * rowH + (rowH - barH) / 2;
      const bw = (val / maxV) * cw;
      const col =
        (colors && colors[i]) || CHART_COLORS[i % CHART_COLORS.length];

      const grad = ctx.createLinearGradient(pL, 0, pL + bw, 0);
      grad.addColorStop(0, col);
      grad.addColorStop(1, col + "66");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(pL, y, Math.max(bw, 2), barH, 4);
      ctx.fill();

      ctx.fillStyle = this.cssVar("--text-secondary");
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(lbl, pL - 8, y + barH / 2 + 4);

      ctx.fillStyle = col;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        val >= 1000 ? (val / 1000).toFixed(1) + "k€" : val.toFixed(0) + "€",
        pL + bw + 8,
        y + barH / 2 + 4,
      );
    });
  },
};

/* ── 6. MODAL & TOAST ── */

const Modal = {
  open(title, body, footer) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = body;
    document.getElementById("modalFooter").innerHTML =
      footer ||
      `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>`;
    document.getElementById("modalOverlay").classList.add("open");
    setTimeout(() => {
      const first = document.querySelector(
        "#modalBody input, #modalBody select, #modalBody textarea",
      );
      if (first) first.focus();
    }, 120);
  },
  close() {
    document.getElementById("modalOverlay").classList.remove("open");
    document.getElementById("modalBody").innerHTML = "";
    document.getElementById("modalFooter").innerHTML = "";
    state.editingId = null;
  },
};

const Confirm = {
  _resolve: null,
  show(msg, title = "Bestätigung") {
    return new Promise((res) => {
      this._resolve = res;
      document.getElementById("confirmTitle").textContent = title;
      document.getElementById("confirmMessage").textContent = msg;
      document.getElementById("confirmOverlay").classList.add("open");
    });
  },
  ok() {
    document.getElementById("confirmOverlay").classList.remove("open");
    if (this._resolve) this._resolve(true);
  },
  cancel() {
    document.getElementById("confirmOverlay").classList.remove("open");
    if (this._resolve) this._resolve(false);
  },
};

function toast(msg, type = "success") {
  const c = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add("out");
    setTimeout(() => t.remove(), 320);
  }, 3200);
}

/* ── 7. NAVIGATION ── */

const PAGE_TITLES = {
  dashboard: "Dashboard",
  income: "Einnahmen",
  expenses: "Ausgaben",
  budget: "Budgetplanung",
  savings: "Sparziele",
  debts: "Schulden-Tracker",
  accounts: "Konten-Verwaltung",
  annual: "Jahresübersicht",
  analysis: "Analyse & Optimierung",
};

const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  income: renderIncome,
  expenses: renderExpenses,
  budget: renderBudget,
  savings: renderSavings,
  debts: renderDebts,
  accounts: renderAccounts,
  annual: renderAnnual,
  analysis: renderAnalysis,
};

function navigate(section) {
  state.section = section;
  state.sortField = null;
  state.sortDir = "asc";
  state.searchQuery = "";
  state.filterCategory = "";
  state.filterPerson = "";
  state.filterType = "";

  document
    .querySelectorAll(".nav-link")
    .forEach((el) =>
      el.classList.toggle("active", el.dataset.section === section),
    );
  document.getElementById("pageTitle").textContent =
    PAGE_TITLES[section] || section;
  document.getElementById("mainContent").innerHTML = "";
  if (PAGE_RENDERERS[section]) PAGE_RENDERERS[section]();

  /* Mobile Sidebar schließen */
  document.getElementById("sidebar").classList.remove("mobile-open");
  document.getElementById("sidebarBackdrop").classList.remove("open");
}

/* ── 8. DASHBOARD ── */

function renderDashboard() {
  const m = state.month,
    y = state.year;
  const inc = totalIncome(m, y);
  const exp = totalExpense(m, y);
  const isFirstRun =
    !db.accounts.length && !db.incomes.length && !db.expenses.length;

  /* ── Erster Start: Willkommens-Assistent ── */
  if (isFirstRun) {
    document.getElementById("mainContent").innerHTML = `
      <div style="max-width:680px;margin:40px auto">

        <div style="text-align:center;margin-bottom:40px">
          <div style="font-size:48px;margin-bottom:16px">👋</div>
          <h1 style="font-size:28px;font-weight:800;letter-spacing:-.5px;margin-bottom:10px">Willkommen bei BudgetPro</h1>
          <p style="color:var(--text-secondary);font-size:15px;line-height:1.6">
            Dein persönlicher Haushaltsplaner für 2 Erwachsene, 1 Kind & Hund.<br>
            Budgetplanung für Sarah, Kiyan, Gucci & Deniz.
          </p>
        </div>

        <!-- Schnellstart-Karten -->
        <div class="grid-2" style="gap:14px;margin-bottom:28px">

          <div class="card" style="cursor:pointer;transition:transform .2s,box-shadow .2s" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform='';this.style.boxShadow=''" onclick="navigate('accounts')">
            <div style="font-size:28px;margin-bottom:10px">🏦</div>
            <div style="font-size:15px;font-weight:700;margin-bottom:5px">1. Konten anlegen</div>
            <div style="font-size:13px;color:var(--text-secondary)">Trage deine Bankkonten, Tagesgeld, Depot und Bargeld ein.</div>
            <div style="margin-top:12px"><span class="badge badge-blue">Jetzt starten →</span></div>
          </div>

          <div class="card" style="cursor:pointer;transition:transform .2s,box-shadow .2s" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform='';this.style.boxShadow=''" onclick="navigate('income')">
            <div style="font-size:28px;margin-bottom:10px">💰</div>
            <div style="font-size:15px;font-weight:700;margin-bottom:5px">2. Einnahmen eintragen</div>
            <div style="font-size:13px;color:var(--text-secondary)">Gehalt, Kindergeld, Nebenjobs – trag alles ein was reinkommt.</div>
            <div style="margin-top:12px"><span class="badge badge-green">Einnahmen →</span></div>
          </div>

          <div class="card" style="cursor:pointer;transition:transform .2s,box-shadow .2s" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform='';this.style.boxShadow=''" onclick="navigate('expenses')">
            <div style="font-size:28px;margin-bottom:10px">🧾</div>
            <div style="font-size:15px;font-weight:700;margin-bottom:5px">3. Ausgaben erfassen</div>
            <div style="font-size:13px;color:var(--text-secondary)">Miete, Lebensmittel, Kind, Hund – alle Ausgaben im Blick.</div>
            <div style="margin-top:12px"><span class="badge badge-red">Ausgaben →</span></div>
          </div>

          <div class="card" style="cursor:pointer;transition:transform .2s,box-shadow .2s" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform='';this.style.boxShadow=''" onclick="navigate('budget')">
            <div style="font-size:28px;margin-bottom:10px">🎯</div>
            <div style="font-size:15px;font-weight:700;margin-bottom:5px">4. Budget planen</div>
            <div style="font-size:13px;color:var(--text-secondary)">Lege Budgetgrenzen pro Kategorie fest. Die Ampel zeigt dir, ob du im Rahmen bist.</div>
            <div style="margin-top:12px"><span class="badge badge-amber">Budget →</span></div>
          </div>

        </div>

        <!-- Oder Demo laden -->
        <div class="card" style="text-align:center;padding:24px;background:var(--bg-card-alt)">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px">
            Du möchtest die App erstmal ausprobieren, bevor du eigene Daten eingibst?
          </div>
          <button class="btn-secondary" onclick="loadDemoAndReload()" style="margin:0 auto">
            📊 Demo-Daten laden & App erkunden
          </button>
        </div>

      </div>`;
    return;
  }

  /* ── Normales Dashboard ── */
  const sav = inc - exp;
  const savRate = savingsRate(m, y);
  const { projExp } = forecastMonthEnd(m, y);
  const byType = expensesByType(m, y);
  const fixAmt = byType["Fixkosten"] || 0;
  const varAmt = byType["Variable Kosten"] || 0;

  const el = document.getElementById("mainContent");
  el.innerHTML = `

    ${
      projExp > inc && inc > 0
        ? `
    <div class="forecast-banner mb-16">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>⚠️ Prognose bis Monatsende: Ausgaben <strong>${fmt(projExp)}</strong> könnten Einnahmen übersteigen!</span>
    </div>`
        : ""
    }

    <div class="stat-grid mb-16">
      ${kpiCard("income", "Einnahmen", fmt(inc), `Plan: ${fmt(db.settings.plannedIncome)}`, svgArrowUp())}
      ${kpiCard("expense", "Ausgaben", fmt(exp), `Prognose: ${fmt(projExp)}`, svgArrowDown())}
      ${kpiCard("balance", "Gesamtvermögen", fmt(totalAssets()), `${db.accounts.length} Konten`, svgCard())}
      ${kpiCard("saving", "Monatsersparnis", fmt(sav), `Sparquote: ${savRate.toFixed(1)} %`, svgHeart(), sav >= 0 ? "green" : "red")}
    </div>

    <div class="kpi-row mb-16">
      <div class="kpi-box"><div class="kpi-box-val">${inc ? ((fixAmt / inc) * 100).toFixed(1) : 0} %</div><div class="kpi-box-lbl">Fixkostenquote</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${inc ? ((varAmt / inc) * 100).toFixed(1) : 0} %</div><div class="kpi-box-lbl">Variable Quote</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${savRate.toFixed(1)} %</div><div class="kpi-box-lbl">Sparquote</div></div>
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(totalDebt())}</div><div class="kpi-box-lbl">Schuldenstand</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${db.savingsGoals.length}</div><div class="kpi-box-lbl">Sparziele aktiv</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(totalAssets() - totalDebt())}</div><div class="kpi-box-lbl">Nettovermögen</div></div>
    </div>

    <div class="charts-row mb-16">
      <div class="card">
        <div class="card-header"><span class="card-title">12-Monats-Verlauf ${y}</span></div>
        <div class="chart-container" style="height:220px"><canvas id="ch_monthly" style="width:100%;height:220px"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Ausgaben nach Kategorie</span></div>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div class="donut-wrap" style="height:200px;width:200px;flex-shrink:0">
            <canvas id="ch_donut" style="width:200px;height:200px"></canvas>
            <div class="donut-center">
              <div class="donut-center-value">${fmt(exp)}</div>
              <div class="donut-center-label">Gesamt</div>
            </div>
          </div>
          <div class="chart-legend" id="donutLegend" style="flex:1;min-width:120px"></div>
        </div>
      </div>
    </div>

    <div class="charts-row-3 mb-16">
      <div class="card">
        <div class="card-header"><span class="card-title">Fix vs. Variabel</span></div>
        <div class="chart-container" style="height:180px"><canvas id="ch_fixvar" style="width:100%;height:180px"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Sparentwicklung</span></div>
        <div class="chart-container" style="height:180px"><canvas id="ch_savings" style="width:100%;height:180px"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Größte Ausgaben</span></div>
        <div class="chart-container" style="height:180px"><canvas id="ch_topcats" style="width:100%;height:180px"></canvas></div>
      </div>
    </div>

    <div class="dashboard-bottom">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Letzte Transaktionen</span>
          <button class="btn-secondary" style="font-size:12px;padding:6px 12px" onclick="navigate('expenses')">Alle →</button>
        </div>
        <div id="recentTxns"></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Budget-Ampel</span></div>
        <div id="budgetAmpel"></div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    drawMonthlyChart(m, y);
    drawDonutChart(m, y);
    drawFixVarChart(m, y);
    drawSavingsLineChart(y);
    drawTopCatsChart(m, y);
    drawRecentTxns();
    drawBudgetAmpel(m, y);
  });
}

function loadDemoAndReload() {
  seedDemoData();
  toast("Demo-Daten geladen!");
  navigate("dashboard");
}

function kpiCard(cls, label, value, sub, icon, valCls = "") {
  return `
  <div class="stat-card ${cls}">
    <div class="stat-card-icon">${icon}</div>
    <div class="stat-value ${valCls}">${value}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-change">${sub}</div>
  </div>`;
}

function svgArrowUp() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
}
function svgArrowDown() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`;
}
function svgCard() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;
}
function svgHeart() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
}
function svgEdit() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
}
function svgTrash() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
}

function drawMonthlyChart(m, y) {
  const labels = MONTHS.map((mn) => mn.slice(0, 3));
  const incData = MONTHS.map((_, i) => totalIncome(i + 1, y));
  const expData = MONTHS.map((_, i) => totalExpense(i + 1, y));
  Charts.bar("ch_monthly", labels, [
    { label: "Einnahmen", data: incData, color: "#00e599" },
    { label: "Ausgaben", data: expData, color: "#ff4f6d" },
  ]);
}

function drawDonutChart(m, y) {
  const cats = expensesByCategory(m, y).slice(0, 8);
  const labels = cats.map((c) => c[0]);
  const values = cats.map((c) => c[1]);
  const colors = CHART_COLORS.slice(0, cats.length);
  Charts.donut("ch_donut", labels, values, colors);

  const lg = document.getElementById("donutLegend");
  if (!lg) return;
  const total = values.reduce((a, b) => a + b, 0) || 1;
  lg.innerHTML = cats
    .map(
      (c, i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${colors[i]}"></span>
      <span class="legend-name">${c[0]}</span>
      <span class="legend-value">${((c[1] / total) * 100).toFixed(0)}%</span>
    </div>`,
    )
    .join("");
}

function drawFixVarChart(m, y) {
  const t = expensesByType(m, y);
  Charts.bar(
    "ch_fixvar",
    ["Fix", "Var", "Spar", "Inv", "Schuld"],
    [
      {
        label: "Ausgaben",
        data: [
          t["Fixkosten"] || 0,
          t["Variable Kosten"] || 0,
          t["Sparen"] || 0,
          t["Investition"] || 0,
          t["Schulden"] || 0,
        ],
        color: "#4facfe",
      },
    ],
    { legend: false },
  );
}

function drawSavingsLineChart(y) {
  const labels = MONTHS.map((mn) => mn.slice(0, 3));
  const data = MONTHS.map((_, i) =>
    Math.max(0, totalIncome(i + 1, y) - totalExpense(i + 1, y)),
  );
  Charts.line(
    "ch_savings",
    labels,
    [{ label: "Ersparnis", data, color: "#00e599" }],
    { minZero: true },
  );
}

function drawTopCatsChart(m, y) {
  const cats = expensesByCategory(m, y).slice(0, 7);
  if (!cats.length) return;
  Charts.hbar(
    "ch_topcats",
    cats.map((c) => (c[0].length > 13 ? c[0].slice(0, 13) + "…" : c[0])),
    cats.map((c) => c[1]),
    CHART_COLORS,
  );
}

function drawRecentTxns() {
  const el = document.getElementById("recentTxns");
  if (!el) return;
  const all = [
    ...db.incomes.map((i) => ({ ...i, _k: "income" })),
    ...db.expenses.map((e) => ({ ...e, _k: "expense" })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (!all.length) {
    el.innerHTML = `<div class="empty-state"><p>Keine Transaktionen vorhanden.</p></div>`;
    return;
  }
  el.innerHTML = all
    .map((t) => {
      const isInc = t._k === "income";
      const emoji = isInc ? "💰" : catEmoji(t.category);
      const bg = isInc ? "rgba(0,229,153,.12)" : "rgba(255,79,109,.12)";
      return `
    <div class="txn-item">
      <div class="txn-icon" style="background:${bg}">${emoji}</div>
      <div class="txn-info">
        <div class="txn-name">${t.category}${t.subcategory ? " · " + t.subcategory : ""}</div>
        <div class="txn-meta">${fmtDate(t.date)}${t.person ? " · " + t.person : ""}${t.forWhom && !isInc ? " · " + t.forWhom : ""}</div>
      </div>
      <div class="txn-amount ${isInc ? "pos" : "neg"}">${isInc ? "+" : "−"}${fmt(t.amount)}</div>
    </div>`;
    })
    .join("");
}

function drawBudgetAmpel(m, y) {
  const el = document.getElementById("budgetAmpel");
  if (!el) return;
  const cats = Object.entries(db.budgets);
  if (!cats.length) {
    el.innerHTML = `<p class="text-muted" style="font-size:13px">Kein Budget definiert. Gehe zu Budgetplanung.</p>`;
    return;
  }
  el.innerHTML = cats
    .map(([cat, bud]) => {
      const actual = db.expenses
        .filter((e) => e.month == m && e.year == y && e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
      const pct = bud.planned ? (actual / bud.planned) * 100 : 0;
      const aCls = ampel(pct);
      const pCls = progressCls(pct);
      return `
    <div style="margin-bottom:13px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:13px;font-weight:600">${catEmoji(cat)} ${cat}</span>
        <span class="ampel ${aCls}"><span class="ampel-dot"></span>${pct.toFixed(0)} %</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${pCls}" style="width:${Math.min(pct, 100)}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:3px">
        <span>${fmt(actual)}</span><span>von ${fmt(bud.planned)}</span>
      </div>
    </div>`;
    })
    .join("");
}

/* ── 9. EINNAHMEN ── */

function renderIncome() {
  const m = state.month,
    y = state.year;
  let items = db.incomes.filter((i) => i.month == m && i.year == y);
  if (state.searchQuery)
    items = items.filter((i) =>
      JSON.stringify(i).toLowerCase().includes(state.searchQuery.toLowerCase()),
    );
  if (state.filterCategory)
    items = items.filter((i) => i.category === state.filterCategory);
  if (state.filterPerson)
    items = items.filter((i) => i.person === state.filterPerson);

  if (state.sortField) {
    items.sort((a, b) => {
      let av = a[state.sortField],
        bv = b[state.sortField];
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      return state.sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
  }

  const total = items.reduce((s, i) => s + i.amount, 0);
  const yearTotal = db.incomes
    .filter((i) => i.year == y)
    .reduce((s, i) => s + i.amount, 0);
  const avg = items.length ? total / items.length : 0;
  const planned = db.settings.plannedIncome || 0;
  const diff = total - planned;
  const forecast = (yearTotal / Math.max(m, 1)) * 12;

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Einnahmen — ${MONTHS[m - 1]} ${y}</h2>
      <button class="btn-primary" onclick="openIncomeForm()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Einnahme hinzufügen
      </button>
    </div>

    <div class="kpi-row mb-16">
      <div class="kpi-box"><div class="kpi-box-val text-green">${fmt(total)}</div><div class="kpi-box-lbl">Monatssumme</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(yearTotal)}</div><div class="kpi-box-lbl">Jahressumme</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(avg)}</div><div class="kpi-box-lbl">Ø pro Buchung</div></div>
      <div class="kpi-box"><div class="kpi-box-val ${diff >= 0 ? "text-green" : "text-red"}">${diff >= 0 ? "+" : ""}${fmt(diff)}</div><div class="kpi-box-lbl">vs. Plan (${fmt(planned)})</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(forecast)}</div><div class="kpi-box-lbl">Prognose Jahresende</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(yearTotal / 12)}</div><div class="kpi-box-lbl">Jahres-Ø/Monat</div></div>
    </div>

    <div class="filter-bar mb-0">
      <div class="search-input-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Suchen…" value="${state.searchQuery}" oninput="state.searchQuery=this.value;renderIncome()">
      </div>
      <select class="select-styled" onchange="state.filterCategory=this.value;renderIncome()">
        <option value="">Alle Kategorien</option>
        ${INCOME_CATEGORIES.map((c) => `<option value="${c}" ${state.filterCategory === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>
      <select class="select-styled" onchange="state.filterPerson=this.value;renderIncome()">
        <option value="">Alle Personen</option>
        ${PERSONS.map((p) => `<option value="${p}" ${state.filterPerson === p ? "selected" : ""}>${p}</option>`).join("")}
      </select>
    </div>

    <div class="table-wrapper mt-16">
      <table>
        <thead>
          <tr>
            ${th("Datum", "date", "income")}${th("Kategorie", "category", "income")}
            <th>Unterkategorie</th>${th("Person", "person", "income")}
            <th>Intervall</th><th>Brutto</th><th>Steuerpfl.</th>
            ${th("Betrag", "amount", "income", "text-align:right")}
            <th>Notiz</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length
              ? items
                  .map(
                    (i) => `
          <tr>
            <td>${fmtDate(i.date)}</td>
            <td><span class="badge badge-green">${i.category}</span></td>
            <td class="text-muted" style="font-size:12.5px">${i.subcategory || "—"}</td>
            <td>${i.person || "—"}</td>
            <td>${
              i.recurring
                ? `<span class="badge badge-blue">${i.interval || "Monatlich"}</span>`
                : `<span class="badge badge-muted">Einmalig</span>`
            }</td>
            <td class="td-mono" style="font-size:12.5px">${i.gross ? fmt(i.gross) : "—"}</td>
            <td>${i.taxable ? '<span class="badge badge-amber">Ja</span>' : '<span class="badge badge-muted">Nein</span>'}</td>
            <td class="td-mono text-right text-green font-bold">+${fmt(i.amount)}</td>
            <td class="text-muted" style="font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.note || "—"}</td>
            <td><div class="td-actions">
              <button class="btn-icon edit" onclick="openIncomeForm('${i.id}')" title="Bearbeiten">${svgEdit()}</button>
              <button class="btn-icon danger" onclick="deleteIncome('${i.id}')" title="Löschen">${svgTrash()}</button>
            </div></td>
          </tr>`,
                  )
                  .join("")
              : emptyRow(10, "Keine Einnahmen für diesen Monat.")
          }
        </tbody>
      </table>
    </div>`;
}

function th(label, field, section, style = "") {
  const active = state.sortField === field;
  const dir = active ? "sort-" + state.sortDir : "";
  return `<th class="sortable ${dir}" style="${style}" onclick="sortBy('${section}','${field}')">${label}</th>`;
}

function emptyRow(colspan, msg) {
  return `<tr><td colspan="${colspan}"><div class="empty-state"><h3>${msg}</h3></div></td></tr>`;
}

function sortBy(section, field) {
  state.sortDir =
    state.sortField === field
      ? state.sortDir === "asc"
        ? "desc"
        : "asc"
      : "asc";
  state.sortField = field;
  if (section === "income") renderIncome();
  if (section === "expenses") renderExpenses();
}

function openIncomeForm(editId = null) {
  const ex = editId ? db.incomes.find((i) => i.id === editId) : null;
  const d = ex || {
    category: "Gehalt",
    subcategory: "",
    amount: "",
    date: todayStr(),
    month: state.month,
    year: state.year,
    recurring: false,
    interval: "Monatlich",
    person: "Person 1",
    note: "",
    taxable: false,
    gross: "",
    net: "",
  };
  state.editingId = editId;

  Modal.open(
    editId ? "Einnahme bearbeiten" : "Einnahme hinzufügen",
    `<div class="form-grid">
      <div class="form-group">
        <label class="form-label">Kategorie *</label>
        <select class="form-control" id="f_cat">${INCOME_CATEGORIES.map((c) => `<option value="${c}" ${d.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Unterkategorie</label>
        <input class="form-control" id="f_sub" type="text" value="${d.subcategory}" placeholder="z.B. Bonus">
      </div>
      <div class="form-group">
        <label class="form-label">Betrag Netto (€) *</label>
        <input class="form-control" id="f_amount" type="number" step="0.01" min="0" value="${d.amount}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Brutto (€)</label>
        <input class="form-control" id="f_gross" type="number" step="0.01" min="0" value="${d.gross || ""}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Datum *</label>
        <input class="form-control" id="f_date" type="date" value="${d.date}">
      </div>
      <div class="form-group">
        <label class="form-label">Person</label>
        <select class="form-control" id="f_person">${PERSONS.map((p) => `<option value="${p}" ${d.person === p ? "selected" : ""}>${p}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Monat</label>
        <select class="form-control" id="f_month">${MONTHS.map((mn, i) => `<option value="${i + 1}" ${d.month == i + 1 ? "selected" : ""}>${mn}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Jahr</label>
        <input class="form-control" id="f_year" type="number" min="2000" max="2100" value="${d.year}">
      </div>
      <div class="form-group">
        <label class="form-label">Intervall</label>
        <select class="form-control" id="f_interval">${INTERVALS.map((iv) => `<option value="${iv}" ${d.interval === iv ? "selected" : ""}>${iv}</option>`).join("")}</select>
      </div>
      <div class="form-group" style="display:flex;flex-direction:column;gap:6px;justify-content:flex-end">
        <div class="checkbox-group"><input type="checkbox" id="f_recurring" ${d.recurring ? "checked" : ""}><label for="f_recurring">Wiederkehrend</label></div>
        <div class="checkbox-group"><input type="checkbox" id="f_taxable"   ${d.taxable ? "checked" : ""}  ><label for="f_taxable">Steuerpflichtig</label></div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notiz</label>
        <textarea class="form-control" id="f_note" rows="2">${d.note || ""}</textarea>
      </div>
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveIncome()">${editId ? "Aktualisieren" : "Hinzufügen"}</button>`,
  );
}

function saveIncome() {
  const amount = parseFloat(document.getElementById("f_amount").value);
  const date = document.getElementById("f_date").value;
  if (!amount || amount <= 0) {
    toast("Bitte gültigen Betrag eingeben!", "error");
    return;
  }
  if (!date) {
    toast("Bitte Datum wählen!", "error");
    return;
  }

  const obj = {
    id: state.editingId || uid(),
    category: document.getElementById("f_cat").value,
    subcategory: document.getElementById("f_sub").value.trim(),
    amount,
    gross: parseFloat(document.getElementById("f_gross").value) || amount,
    net: amount,
    date,
    month: parseInt(document.getElementById("f_month").value),
    year: parseInt(document.getElementById("f_year").value),
    recurring: document.getElementById("f_recurring").checked,
    interval: document.getElementById("f_interval").value,
    person: document.getElementById("f_person").value,
    taxable: document.getElementById("f_taxable").checked,
    note: document.getElementById("f_note").value.trim(),
  };

  if (state.editingId) {
    const idx = db.incomes.findIndex((i) => i.id === state.editingId);
    if (idx > -1) db.incomes[idx] = obj;
    toast("Einnahme aktualisiert!");
  } else {
    db.incomes.push(obj);
    toast("Einnahme hinzugefügt!");
  }
  saveDB();
  Modal.close();
  renderIncome();
}

async function deleteIncome(id) {
  if (!(await Confirm.show("Einnahme wirklich löschen?"))) return;
  db.incomes = db.incomes.filter((i) => i.id !== id);
  saveDB();
  toast("Einnahme gelöscht.", "info");
  renderIncome();
}

/* ── 10. AUSGABEN ── */

function renderExpenses() {
  const m = state.month,
    y = state.year;
  let items = db.expenses.filter((e) => e.month == m && e.year == y);

  if (state.searchQuery)
    items = items.filter((e) =>
      JSON.stringify(e).toLowerCase().includes(state.searchQuery.toLowerCase()),
    );
  if (state.filterCategory)
    items = items.filter((e) => e.category === state.filterCategory);
  if (state.filterPerson)
    items = items.filter((e) => e.forWhom === state.filterPerson);
  if (state.filterType)
    items = items.filter((e) => e.type === state.filterType);

  if (state.sortField) {
    items.sort((a, b) => {
      let av = a[state.sortField],
        bv = b[state.sortField];
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      return state.sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
  }

  const total = items.reduce((s, e) => s + e.amount, 0);
  const yearTot = db.expenses
    .filter((e) => e.year == y)
    .reduce((s, e) => s + e.amount, 0);
  const inc = totalIncome(m, y);
  const { projExp, dayNow } = forecastMonthEnd(m, y);
  const daily = dayNow ? total / dayNow : 0;

  const typeBadge = {
    Fixkosten: "badge-blue",
    "Variable Kosten": "badge-amber",
    Sparen: "badge-green",
    Investition: "badge-purple",
    Schulden: "badge-red",
  };

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Ausgaben — ${MONTHS[m - 1]} ${y}</h2>
      <button class="btn-primary" onclick="openExpenseForm()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ausgabe hinzufügen
      </button>
    </div>

    <div class="kpi-row mb-16">
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(total)}</div><div class="kpi-box-lbl">Monatssumme</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(yearTot)}</div><div class="kpi-box-lbl">Jahressumme</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${items.length ? fmt(total / items.length) : "—"}</div><div class="kpi-box-lbl">Ø pro Buchung</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(daily)}</div><div class="kpi-box-lbl">Tagesdurchschnitt</div></div>
      <div class="kpi-box"><div class="kpi-box-val ${projExp > inc ? "text-red" : "text-amber"}">${fmt(projExp)}</div><div class="kpi-box-lbl">Prognose Monatsende</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${inc ? ((total / inc) * 100).toFixed(1) + " %" : "—"}</div><div class="kpi-box-lbl">Quote vom Einkommen</div></div>
    </div>

    <div class="filter-bar mb-0">
      <div class="search-input-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Suchen…" value="${state.searchQuery}" oninput="state.searchQuery=this.value;renderExpenses()">
      </div>
      <select class="select-styled" onchange="state.filterType=this.value;renderExpenses()">
        <option value="">Alle Typen</option>
        ${EXPENSE_TYPES.map((t) => `<option value="${t}" ${state.filterType === t ? "selected" : ""}>${t}</option>`).join("")}
      </select>
      <select class="select-styled" onchange="state.filterCategory=this.value;renderExpenses()">
        <option value="">Alle Kategorien</option>
        ${Object.keys(EXPENSE_CATEGORIES)
          .map(
            (c) =>
              `<option value="${c}" ${state.filterCategory === c ? "selected" : ""}>${c}</option>`,
          )
          .join("")}
      </select>
      <select class="select-styled" onchange="state.filterPerson=this.value;renderExpenses()">
        <option value="">Alle Personen</option>
        ${PERSONS.map((p) => `<option value="${p}" ${state.filterPerson === p ? "selected" : ""}>${p}</option>`).join("")}
      </select>
    </div>

    <div class="table-wrapper mt-16">
      <table>
        <thead>
          <tr>
            ${th("Datum", "date", "expenses")}
            <th>Typ</th>
            ${th("Kategorie", "category", "expenses")}
            <th>Unterkategorie</th>
            <th>Für wen</th>
            <th>Zahlung</th>
            <th>Konto</th>
            <th>Wiederh.</th>
            <th>Absetzbar</th>
            ${th("Betrag", "amount", "expenses", "text-align:right")}
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length
              ? items
                  .map(
                    (e) => `
          <tr>
            <td>${fmtDate(e.date)}</td>
            <td><span class="badge ${typeBadge[e.type] || "badge-muted"}">${e.type}</span></td>
            <td>${catEmoji(e.category)} ${e.category}</td>
            <td class="text-muted" style="font-size:12.5px">${e.subcategory || "—"}</td>
            <td>${e.forWhom || "—"}</td>
            <td style="font-size:12.5px">${e.paymentMethod || "—"}</td>
            <td style="font-size:12.5px">${e.account || "—"}</td>
            <td>${e.recurring ? '<span class="badge badge-teal">Ja</span>' : '<span class="badge badge-muted">Nein</span>'}</td>
            <td>${e.taxDeductible ? '<span class="badge badge-green">Ja</span>' : '<span class="badge badge-muted">Nein</span>'}</td>
            <td class="td-mono text-right text-red font-bold">−${fmt(e.amount)}</td>
            <td><div class="td-actions">
              <button class="btn-icon edit"   onclick="openExpenseForm('${e.id}')">${svgEdit()}</button>
              <button class="btn-icon danger" onclick="deleteExpense('${e.id}')">${svgTrash()}</button>
            </div></td>
          </tr>`,
                  )
                  .join("")
              : emptyRow(11, "Keine Ausgaben für diesen Monat.")
          }
        </tbody>
      </table>
    </div>`;
}

function openExpenseForm(editId = null) {
  const ex = editId ? db.expenses.find((e) => e.id === editId) : null;
  const d = ex || {
    type: "Variable Kosten",
    category: "Lebensmittel",
    subcategory: "",
    amount: "",
    date: todayStr(),
    month: state.month,
    year: state.year,
    paymentMethod: "EC-Karte",
    account: "Girokonto",
    forWhom: "Alle",
    note: "",
    recurring: false,
    warranty: false,
    taxDeductible: false,
  };
  state.editingId = editId;

  const accountOpts = ["Kein Konto", ...db.accounts.map((a) => a.name)]
    .map(
      (a) =>
        `<option value="${a}" ${d.account === a ? "selected" : ""}>${a}</option>`,
    )
    .join("");

  Modal.open(
    editId ? "Ausgabe bearbeiten" : "Ausgabe hinzufügen",
    `<div class="form-grid">
      <div class="form-group">
        <label class="form-label">Typ *</label>
        <select class="form-control" id="f_type">${EXPENSE_TYPES.map((t) => `<option value="${t}" ${d.type === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Hauptkategorie *</label>
        <select class="form-control" id="f_cat" onchange="refreshSubcategory()">${Object.keys(
          EXPENSE_CATEGORIES,
        )
          .map(
            (c) =>
              `<option value="${c}" ${d.category === c ? "selected" : ""}>${c}</option>`,
          )
          .join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Unterkategorie</label>
        <select class="form-control" id="f_sub">${(EXPENSE_CATEGORIES[d.category] || []).map((s) => `<option value="${s}" ${d.subcategory === s ? "selected" : ""}>${s}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Betrag (€) *</label>
        <input class="form-control" id="f_amount" type="number" step="0.01" min="0" value="${d.amount}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Datum *</label>
        <input class="form-control" id="f_date" type="date" value="${d.date}">
      </div>
      <div class="form-group">
        <label class="form-label">Zahlungsart</label>
        <select class="form-control" id="f_pay">${PAYMENT_METHODS.map((p) => `<option value="${p}" ${d.paymentMethod === p ? "selected" : ""}>${p}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Konto</label>
        <select class="form-control" id="f_account">${accountOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Für wen?</label>
        <select class="form-control" id="f_whom">${PERSONS.map((p) => `<option value="${p}" ${d.forWhom === p ? "selected" : ""}>${p}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Monat</label>
        <select class="form-control" id="f_month">${MONTHS.map((mn, i) => `<option value="${i + 1}" ${d.month == i + 1 ? "selected" : ""}>${mn}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Jahr</label>
        <input class="form-control" id="f_year" type="number" min="2000" max="2100" value="${d.year}">
      </div>
      <div class="form-group" style="display:flex;flex-direction:column;gap:4px;justify-content:flex-end">
        <div class="checkbox-group"><input type="checkbox" id="f_recurring" ${d.recurring ? "checked" : ""}><label for="f_recurring">Wiederkehrend</label></div>
        <div class="checkbox-group"><input type="checkbox" id="f_warranty"  ${d.warranty ? "checked" : ""}><label for="f_warranty">Garantie vorhanden</label></div>
        <div class="checkbox-group"><input type="checkbox" id="f_taxded"    ${d.taxDeductible ? "checked" : ""}><label for="f_taxded">Steuerlich absetzbar</label></div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notiz</label>
        <textarea class="form-control" id="f_note" rows="2">${d.note || ""}</textarea>
      </div>
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveExpense()">${editId ? "Aktualisieren" : "Hinzufügen"}</button>`,
  );
}

function refreshSubcategory() {
  const cat = document.getElementById("f_cat").value;
  const sub = document.getElementById("f_sub");
  if (!sub) return;
  sub.innerHTML = (EXPENSE_CATEGORIES[cat] || ["Sonstiges"])
    .map((s) => `<option value="${s}">${s}</option>`)
    .join("");
}

function saveExpense() {
  const amount = parseFloat(document.getElementById("f_amount").value);
  const date = document.getElementById("f_date").value;
  if (!amount || amount <= 0) {
    toast("Bitte gültigen Betrag eingeben!", "error");
    return;
  }
  if (!date) {
    toast("Bitte Datum wählen!", "error");
    return;
  }

  const obj = {
    id: state.editingId || uid(),
    type: document.getElementById("f_type").value,
    category: document.getElementById("f_cat").value,
    subcategory: document.getElementById("f_sub").value,
    amount,
    date,
    month: parseInt(document.getElementById("f_month").value),
    year: parseInt(document.getElementById("f_year").value),
    paymentMethod: document.getElementById("f_pay").value,
    account: document.getElementById("f_account").value,
    forWhom: document.getElementById("f_whom").value,
    recurring: document.getElementById("f_recurring").checked,
    warranty: document.getElementById("f_warranty").checked,
    taxDeductible: document.getElementById("f_taxded").checked,
    note: document.getElementById("f_note").value.trim(),
  };

  if (state.editingId) {
    const idx = db.expenses.findIndex((e) => e.id === state.editingId);
    if (idx > -1) db.expenses[idx] = obj;
    toast("Ausgabe aktualisiert!");
  } else {
    db.expenses.push(obj);
    toast("Ausgabe hinzugefügt!");
  }
  saveDB();
  Modal.close();
  renderExpenses();
}

async function deleteExpense(id) {
  if (!(await Confirm.show("Ausgabe wirklich löschen?"))) return;
  db.expenses = db.expenses.filter((e) => e.id !== id);
  saveDB();
  toast("Ausgabe gelöscht.", "info");
  renderExpenses();
}

/* ── 11. BUDGETPLANUNG ── */

function renderBudget() {
  const m = state.month,
    y = state.year;
  const totalPlanned = Object.values(db.budgets).reduce(
    (s, b) => s + (b.planned || 0),
    0,
  );
  const totalActual = totalExpense(m, y);
  const inc = totalIncome(m, y);
  const usePct = totalPlanned ? (totalActual / totalPlanned) * 100 : 0;

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Budgetplanung — ${MONTHS[m - 1]} ${y}</h2>
      <div style="display:flex;gap:10px">
        <button class="btn-secondary" onclick="openBudgetSettings()">⚙ Einstellungen</button>
        <button class="btn-primary" onclick="openAddBudget()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Kategorie
        </button>
      </div>
    </div>

    <div class="kpi-row mb-20">
      <div class="kpi-box"><div class="kpi-box-val">${fmt(inc)}</div><div class="kpi-box-lbl">Einnahmen</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(totalPlanned)}</div><div class="kpi-box-lbl">Geplante Ausgaben</div></div>
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(totalActual)}</div><div class="kpi-box-lbl">Tatsächliche Ausgaben</div></div>
      <div class="kpi-box"><div class="kpi-box-val ${inc - totalPlanned >= 0 ? "text-green" : "text-red"}">${fmt(inc - totalPlanned)}</div><div class="kpi-box-lbl">Verfügbares Budget</div></div>
      <div class="kpi-box"><div class="kpi-box-val ${usePct >= 100 ? "text-red" : usePct >= 80 ? "text-amber" : "text-green"}">${usePct.toFixed(0)} %</div><div class="kpi-box-lbl">Budgetverbrauch</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${Object.keys(db.budgets).length}</div><div class="kpi-box-lbl">Kategorien</div></div>
    </div>

    <div class="grid-2">
      <div>
        <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-secondary);margin-bottom:14px">KATEGORIEN-BUDGET</h3>
        <div id="budgetList"></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Geplant vs. Tatsächlich</span></div>
        <div class="chart-container" style="height:320px"><canvas id="ch_budget" style="width:100%;height:320px"></canvas></div>
      </div>
    </div>`;

  renderBudgetList(m, y);
  requestAnimationFrame(() => {
    const cats = Object.entries(db.budgets);
    const labels = cats.map(([c]) =>
      c.length > 10 ? c.slice(0, 10) + "…" : c,
    );
    const plan = cats.map(([, b]) => b.planned || 0);
    const act = cats.map(([c]) =>
      db.expenses
        .filter((e) => e.month == m && e.year == y && e.category === c)
        .reduce((s, e) => s + e.amount, 0),
    );
    Charts.bar("ch_budget", labels, [
      { label: "Geplant", data: plan, color: "#4facfe" },
      { label: "Ist", data: act, color: "#ff4f6d" },
    ]);
  });
}

function renderBudgetList(m, y) {
  const el = document.getElementById("budgetList");
  if (!el) return;
  const cats = Object.entries(db.budgets);
  if (!cats.length) {
    el.innerHTML = `<div class="empty-state"><p>Noch keine Budgetkategorien definiert.</p></div>`;
    return;
  }
  el.innerHTML = cats
    .map(([cat, bud]) => {
      const actual = db.expenses
        .filter((e) => e.month == m && e.year == y && e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
      const pct = bud.planned ? Math.min((actual / bud.planned) * 100, 150) : 0;
      const pCls = progressCls(pct);
      const aCls = ampel(pct);
      return `
    <div class="budget-category-item">
      <div class="budget-cat-header">
        <span class="budget-cat-name">${catEmoji(cat)} ${cat}</span>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="ampel ${aCls}"><span class="ampel-dot"></span>${ampelLabel(pct)}</span>
          <div class="td-actions">
            <button class="btn-icon edit"   onclick="editBudget('${cat}')">${svgEdit()}</button>
            <button class="btn-icon danger" onclick="deleteBudget('${cat}')">${svgTrash()}</button>
          </div>
        </div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${pCls}" style="width:${Math.min(pct, 100)}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px">
        <span class="text-red font-bold">${fmt(actual)}</span>
        <span class="text-muted">/ ${fmt(bud.planned)}</span>
        <span class="${pct >= 100 ? "text-red" : pct >= 80 ? "text-amber" : "text-green"}" style="font-weight:700">${pct.toFixed(0)} %</span>
      </div>
      ${pct >= 100 ? `<div class="alert alert-red mt-8" style="padding:8px 12px;font-size:12px">⚠️ Überschritten um ${fmt(actual - bud.planned)}</div>` : ""}
      ${pct >= 80 && pct < 100 ? `<div class="alert alert-amber mt-8" style="padding:8px 12px;font-size:12px">⚡ 80% verbraucht – noch ${fmt(bud.planned - actual)} verfügbar.</div>` : ""}
    </div>`;
    })
    .join("");
}

function openAddBudget() {
  Modal.open(
    "Budget-Kategorie hinzufügen",
    `<div class="form-grid">
      <div class="form-group">
        <label class="form-label">Kategorie</label>
        <select class="form-control" id="f_cat">
          ${Object.keys(EXPENSE_CATEGORIES)
            .map((c) => `<option value="${c}">${c}</option>`)
            .join("")}
          <option value="__custom__">Eigene…</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Eigener Name (optional)</label>
        <input class="form-control" id="f_custom" type="text" placeholder="Kategoriename">
      </div>
      <div class="form-group form-full">
        <label class="form-label">Monatliches Budget (€) *</label>
        <input class="form-control" id="f_amount" type="number" step="0.01" min="0" placeholder="0,00">
      </div>
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveNewBudget()">Hinzufügen</button>`,
  );
}

function saveNewBudget() {
  let cat = document.getElementById("f_cat").value;
  if (cat === "__custom__")
    cat = document.getElementById("f_custom").value.trim();
  const amt = parseFloat(document.getElementById("f_amount").value);
  if (!cat) {
    toast("Bitte Kategorie wählen!", "error");
    return;
  }
  if (isNaN(amt)) {
    toast("Bitte Betrag eingeben!", "error");
    return;
  }
  db.budgets[cat] = { planned: amt };
  saveDB();
  Modal.close();
  toast("Budget-Kategorie gespeichert!");
  renderBudget();
}

function editBudget(cat) {
  Modal.open(
    `Budget bearbeiten: ${cat}`,
    `<div class="form-group">
      <label class="form-label">Monatliches Budget (€)</label>
      <input class="form-control" id="f_amount" type="number" step="0.01" value="${(db.budgets[cat] || {}).planned || 0}">
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="updateBudget('${cat}')">Speichern</button>`,
  );
}

function updateBudget(cat) {
  const amt = parseFloat(document.getElementById("f_amount").value);
  if (isNaN(amt)) {
    toast("Bitte Betrag eingeben!", "error");
    return;
  }
  db.budgets[cat] = { planned: amt };
  saveDB();
  Modal.close();
  toast("Budget aktualisiert!");
  renderBudget();
}

async function deleteBudget(cat) {
  if (!(await Confirm.show(`Budget "${cat}" löschen?`))) return;
  delete db.budgets[cat];
  saveDB();
  toast("Budget gelöscht.", "info");
  renderBudget();
}

function openBudgetSettings() {
  Modal.open(
    "Budget-Einstellungen",
    `<div class="form-group">
      <label class="form-label">Geplantes Monatseinkommen (€)</label>
      <input class="form-control" id="f_pi" type="number" step="0.01" value="${db.settings.plannedIncome}">
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveBudgetSettings()">Speichern</button>`,
  );
}

function saveBudgetSettings() {
  db.settings.plannedIncome =
    parseFloat(document.getElementById("f_pi").value) || 0;
  saveDB();
  Modal.close();
  toast("Einstellungen gespeichert!");
  renderBudget();
}

/* ── 12. SPARZIELE ── */

function renderSavings() {
  const totalSaved = db.savingsGoals.reduce((s, g) => s + g.current, 0);
  const totalTarget = db.savingsGoals.reduce((s, g) => s + g.target, 0);
  const overallPct = totalTarget ? (totalSaved / totalTarget) * 100 : 0;

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Sparziele</h2>
      <button class="btn-primary" onclick="openSavingsForm()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ziel hinzufügen
      </button>
    </div>

    <div class="kpi-row mb-20">
      <div class="kpi-box"><div class="kpi-box-val text-green">${fmt(totalSaved)}</div><div class="kpi-box-lbl">Gesamt gespart</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(totalTarget)}</div><div class="kpi-box-lbl">Gesamtziel</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${overallPct.toFixed(1)} %</div><div class="kpi-box-lbl">Gesamtfortschritt</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${db.savingsGoals.length}</div><div class="kpi-box-lbl">Aktive Ziele</div></div>
    </div>

    <div class="goals-grid" id="goalsGrid"></div>`;

  renderGoalCards();
}

function renderGoalCards() {
  const el = document.getElementById("goalsGrid");
  if (!el) return;
  if (!db.savingsGoals.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      <h3>Noch keine Sparziele</h3><p>Definiere dein erstes Sparziel.</p>
    </div>`;
    return;
  }
  el.innerHTML = db.savingsGoals
    .map((g) => {
      const pct = g.target ? Math.min((g.current / g.target) * 100, 100) : 0;
      const remaining = Math.max(0, g.target - g.current);
      const months = g.monthlyRate ? Math.ceil(remaining / g.monthlyRate) : "∞";
      const dlMonths = g.deadline ? monthsUntil(g.deadline) : null;
      const reachable =
        dlMonths !== null &&
        g.monthlyRate > 0 &&
        Math.ceil(remaining / g.monthlyRate) <= dlMonths;
      const pCls =
        pct >= 80
          ? "progress-green"
          : pct >= 40
            ? "progress-amber"
            : "progress-red";
      return `
    <div class="goal-card">
      <div class="goal-header">
        <div>
          <div class="goal-name">${g.name}</div>
          ${g.note ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${g.note}</div>` : ""}
        </div>
        <div class="goal-actions">
          <button class="btn-icon" onclick="addToGoal('${g.id}')" style="border-color:var(--accent-green);color:var(--accent-green)" title="Betrag hinzufügen">+</button>
          <button class="btn-icon edit"   onclick="openSavingsForm('${g.id}')">${svgEdit()}</button>
          <button class="btn-icon danger" onclick="deleteSavings('${g.id}')">${svgTrash()}</button>
        </div>
      </div>
      <div class="goal-amounts">
        <div class="goal-current">${fmt(g.current)}</div>
        <div class="goal-target">/ ${fmt(g.target)}</div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${pCls}" style="width:${pct}%"></div>
      </div>
      <div class="goal-progress-text">
        <span>${pct.toFixed(1)} % erreicht</span>
        <span>Noch ${fmt(remaining)}</span>
      </div>
      <div class="goal-stats">
        <div class="goal-stat-item">
          <div class="goal-stat-value">${fmt(g.monthlyRate)}/Mo</div>
          <div class="goal-stat-label">Sparrate</div>
        </div>
        <div class="goal-stat-item">
          <div class="goal-stat-value">${months} Mo</div>
          <div class="goal-stat-label">Bis Ziel</div>
        </div>
        <div class="goal-stat-item">
          <div class="goal-stat-value">${g.deadline ? fmtDate(g.deadline) : "—"}</div>
          <div class="goal-stat-label">Deadline</div>
        </div>
        <div class="goal-stat-item">
          <div class="goal-stat-value ${reachable ? "text-green" : "text-red"}">${reachable ? "✓ Ja" : "✗ Nein"}</div>
          <div class="goal-stat-label">Erreichbar?</div>
        </div>
      </div>
    </div>`;
    })
    .join("");
}

function openSavingsForm(editId = null) {
  const ex = editId ? db.savingsGoals.find((g) => g.id === editId) : null;
  const d = ex || {
    name: "",
    target: "",
    current: "0",
    startDate: todayStr(),
    deadline: "",
    monthlyRate: "",
    note: "",
  };
  state.editingId = editId;

  Modal.open(
    editId ? "Sparziel bearbeiten" : "Sparziel hinzufügen",
    `<div class="form-grid">
      <div class="form-group form-full">
        <label class="form-label">Zielname *</label>
        <input class="form-control" id="f_name" type="text" value="${d.name}" placeholder="z.B. Urlaub 2026">
      </div>
      <div class="form-group">
        <label class="form-label">Zielbetrag (€) *</label>
        <input class="form-control" id="f_target" type="number" step="0.01" min="0" value="${d.target}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Aktueller Stand (€)</label>
        <input class="form-control" id="f_current" type="number" step="0.01" min="0" value="${d.current}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Monatliche Sparrate (€)</label>
        <input class="form-control" id="f_rate" type="number" step="0.01" min="0" value="${d.monthlyRate}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Startdatum</label>
        <input class="form-control" id="f_start" type="date" value="${d.startDate}">
      </div>
      <div class="form-group">
        <label class="form-label">Deadline</label>
        <input class="form-control" id="f_deadline" type="date" value="${d.deadline}">
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notiz</label>
        <textarea class="form-control" id="f_note" rows="2">${d.note || ""}</textarea>
      </div>
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveSavings()">${editId ? "Aktualisieren" : "Hinzufügen"}</button>`,
  );
}

function saveSavings() {
  const name = document.getElementById("f_name").value.trim();
  const target = parseFloat(document.getElementById("f_target").value);
  if (!name) {
    toast("Bitte Namen eingeben!", "error");
    return;
  }
  if (!target) {
    toast("Bitte Zielbetrag eingeben!", "error");
    return;
  }

  const obj = {
    id: state.editingId || uid(),
    name,
    target,
    current: parseFloat(document.getElementById("f_current").value) || 0,
    monthlyRate: parseFloat(document.getElementById("f_rate").value) || 0,
    startDate: document.getElementById("f_start").value,
    deadline: document.getElementById("f_deadline").value,
    note: document.getElementById("f_note").value.trim(),
  };

  if (state.editingId) {
    const idx = db.savingsGoals.findIndex((g) => g.id === state.editingId);
    if (idx > -1) db.savingsGoals[idx] = obj;
    toast("Sparziel aktualisiert!");
  } else {
    db.savingsGoals.push(obj);
    toast("Sparziel hinzugefügt!");
  }
  saveDB();
  Modal.close();
  renderSavings();
}

async function deleteSavings(id) {
  if (!(await Confirm.show("Sparziel wirklich löschen?"))) return;
  db.savingsGoals = db.savingsGoals.filter((g) => g.id !== id);
  saveDB();
  toast("Sparziel gelöscht.", "info");
  renderSavings();
}

function addToGoal(id) {
  const g = db.savingsGoals.find((g) => g.id === id);
  if (!g) return;
  Modal.open(
    `Betrag zu "${g.name}" hinzufügen`,
    `<div class="form-group">
      <label class="form-label">Betrag (€)</label>
      <input class="form-control" id="f_addamt" type="number" step="0.01" min="0.01" placeholder="0,00">
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="confirmAddGoal('${id}')">Hinzufügen</button>`,
  );
}

function confirmAddGoal(id) {
  const amt = parseFloat(document.getElementById("f_addamt").value);
  if (!amt || amt <= 0) {
    toast("Bitte gültigen Betrag eingeben!", "error");
    return;
  }
  const g = db.savingsGoals.find((g) => g.id === id);
  if (!g) return;
  g.current = Math.min(g.current + amt, g.target);
  saveDB();
  Modal.close();
  toast(`${fmt(amt)} zu "${g.name}" hinzugefügt!`);
  renderSavings();
}

/* ── 13. SCHULDEN-TRACKER ── */

function renderDebts() {
  const totDebt = totalDebt();
  const totMonthly = db.debts.reduce((s, d) => s + +d.monthlyRate, 0);
  const totInterest = db.debts.reduce(
    (s, d) => s + calcAmortization(d).reduce((si, r) => si + r.interest, 0),
    0,
  );

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Schulden-Tracker</h2>
      <button class="btn-primary" onclick="openDebtForm()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Schuld hinzufügen
      </button>
    </div>

    <div class="kpi-row mb-20">
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(totDebt)}</div><div class="kpi-box-lbl">Gesamtschulden</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(totMonthly)}</div><div class="kpi-box-lbl">Monatl. Raten</div></div>
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(totInterest)}</div><div class="kpi-box-lbl">Gesamtzinsen</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${db.debts.length}</div><div class="kpi-box-lbl">Aktive Schulden</div></div>
    </div>

    <div class="grid-2" id="debtsGrid"></div>`;

  const el = document.getElementById("debtsGrid");
  if (!el) return;
  if (!db.debts.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Keine Schulden erfasst.</h3></div>`;
    return;
  }
  el.innerHTML = db.debts
    .map((d) => {
      const sched = calcAmortization(d);
      const totInt = sched.reduce((s, r) => s + r.interest, 0);
      const totRepay = sched.reduce((s, r) => s + r.interest + r.principal, 0);
      const monthsLeft = sched.length;
      const moInt = sched.length ? sched[0].interest : 0;
      return `
    <div class="debt-card">
      <div class="debt-header">
        <div>
          <div class="debt-name">${d.type}</div>
          <div class="debt-creditor">📍 ${d.creditor}${d.note ? " — " + d.note : ""}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn-icon" onclick="showTilgungsplan('${d.id}')" title="Tilgungsplan" style="font-size:13px">📋</button>
          <button class="btn-icon edit"   onclick="openDebtForm('${d.id}')">${svgEdit()}</button>
          <button class="btn-icon danger" onclick="deleteDebt('${d.id}')">${svgTrash()}</button>
        </div>
      </div>
      <div class="debt-amount">${fmt(d.balance)}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Restschuld</div>
      <div class="debt-stats">
        <div class="debt-stat"><div class="debt-stat-val">${d.interestRate} %</div><div class="debt-stat-lbl">Zins p.a.</div></div>
        <div class="debt-stat"><div class="debt-stat-val">${fmt(d.monthlyRate)}</div><div class="debt-stat-lbl">Rate/Mo.</div></div>
        <div class="debt-stat"><div class="debt-stat-val">${monthsLeft} Mo</div><div class="debt-stat-lbl">Restlaufzeit</div></div>
        <div class="debt-stat"><div class="debt-stat-val text-red">${fmt(moInt)}</div><div class="debt-stat-lbl">Zinsen/Mo.</div></div>
        <div class="debt-stat"><div class="debt-stat-val text-red">${fmt(totInt)}</div><div class="debt-stat-lbl">Gesamtzinsen</div></div>
        <div class="debt-stat"><div class="debt-stat-val">${fmt(totRepay)}</div><div class="debt-stat-lbl">Gesamtrückzahlung</div></div>
      </div>
      ${+d.extra > 0 ? `<div class="alert alert-green mt-8" style="font-size:12px;padding:8px 12px">✅ Sondertilgung: ${fmt(d.extra)} / Monat</div>` : ""}
    </div>`;
    })
    .join("");
}

function openDebtForm(editId = null) {
  const ex = editId ? db.debts.find((d) => d.id === editId) : null;
  const d = ex || {
    type: "Konsumentenkredit",
    creditor: "",
    interestRate: "",
    balance: "",
    monthlyRate: "",
    extra: "0",
    startDate: todayStr(),
    duration: "",
    note: "",
  };
  state.editingId = editId;

  Modal.open(
    editId ? "Schuld bearbeiten" : "Schuld hinzufügen",
    `<div class="form-grid">
      <div class="form-group">
        <label class="form-label">Art der Schuld *</label>
        <select class="form-control" id="f_type">${["Konsumentenkredit", "Immobiliendarlehen", "Autokredit", "Studentenkredit", "Kreditkartenschuld", "Ratenkredit", "Sonstige"].map((t) => `<option value="${t}" ${d.type === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Gläubiger *</label>
        <input class="form-control" id="f_creditor" type="text" value="${d.creditor}" placeholder="z.B. Volksbank">
      </div>
      <div class="form-group">
        <label class="form-label">Restschuld (€) *</label>
        <input class="form-control" id="f_balance" type="number" step="0.01" min="0" value="${d.balance}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Zinssatz (% p.a.) *</label>
        <input class="form-control" id="f_rate" type="number" step="0.01" min="0" value="${d.interestRate}" placeholder="3,5">
      </div>
      <div class="form-group">
        <label class="form-label">Monatliche Rate (€) *</label>
        <input class="form-control" id="f_monthly" type="number" step="0.01" min="0" value="${d.monthlyRate}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Sondertilgung / Monat (€)</label>
        <input class="form-control" id="f_extra" type="number" step="0.01" min="0" value="${d.extra || 0}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Startdatum</label>
        <input class="form-control" id="f_start" type="date" value="${d.startDate}">
      </div>
      <div class="form-group">
        <label class="form-label">Geplante Laufzeit (Monate)</label>
        <input class="form-control" id="f_duration" type="number" min="0" value="${d.duration}" placeholder="z.B. 60">
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notiz</label>
        <textarea class="form-control" id="f_note" rows="2">${d.note || ""}</textarea>
      </div>
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveDebt()">${editId ? "Aktualisieren" : "Hinzufügen"}</button>`,
  );
}

function saveDebt() {
  const balance = parseFloat(document.getElementById("f_balance").value);
  const monthly = parseFloat(document.getElementById("f_monthly").value);
  const rate = parseFloat(document.getElementById("f_rate").value);
  const creditor = document.getElementById("f_creditor").value.trim();
  if (!balance || !monthly || isNaN(rate) || !creditor) {
    toast("Bitte alle Pflichtfelder ausfüllen!", "error");
    return;
  }
  const obj = {
    id: state.editingId || uid(),
    type: document.getElementById("f_type").value,
    creditor,
    balance,
    interestRate: rate,
    monthlyRate: monthly,
    extra: parseFloat(document.getElementById("f_extra").value) || 0,
    startDate: document.getElementById("f_start").value,
    duration: parseInt(document.getElementById("f_duration").value) || 0,
    note: document.getElementById("f_note").value.trim(),
  };
  if (state.editingId) {
    const idx = db.debts.findIndex((d) => d.id === state.editingId);
    if (idx > -1) db.debts[idx] = obj;
    toast("Schuld aktualisiert!");
  } else {
    db.debts.push(obj);
    toast("Schuld hinzugefügt!");
  }
  saveDB();
  Modal.close();
  renderDebts();
}

async function deleteDebt(id) {
  if (!(await Confirm.show("Schuld wirklich löschen?"))) return;
  db.debts = db.debts.filter((d) => d.id !== id);
  saveDB();
  toast("Schuld gelöscht.", "info");
  renderDebts();
}

function showTilgungsplan(id) {
  const d = db.debts.find((d) => d.id === id);
  if (!d) return;
  const sched = calcAmortization(d).slice(0, 60);
  Modal.open(
    `Tilgungsplan: ${d.type} — ${d.creditor}`,
    `<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Erste ${sched.length} Monate dargestellt.</p>
    <div class="table-wrapper" style="max-height:360px;overflow-y:auto">
      <table>
        <thead><tr><th>Monat</th><th style="text-align:right">Zinsen</th><th style="text-align:right">Tilgung</th><th style="text-align:right">Restschuld</th></tr></thead>
        <tbody>${sched
          .map(
            (r) => `
          <tr>
            <td>${r.month}</td>
            <td class="td-mono text-right text-red">${fmt(r.interest)}</td>
            <td class="td-mono text-right text-green">${fmt(r.principal)}</td>
            <td class="td-mono text-right">${fmt(r.balance)}</td>
          </tr>`,
          )
          .join("")}
        </tbody>
      </table>
    </div>`,
    `<button class="btn-primary" onclick="Modal.close()">Schließen</button>`,
  );
}

/* ── 14. KONTEN ── */

function renderAccounts() {
  const assets = totalAssets();
  const liquid = db.accounts
    .filter((a) => ["Girokonto", "Sparkonto", "Bargeld"].includes(a.type))
    .reduce((s, a) => s + a.balance, 0);
  const net = assets - totalDebt();

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Konten-Verwaltung</h2>
      <button class="btn-primary" onclick="openAccountForm()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Konto hinzufügen
      </button>
    </div>

    <div class="kpi-row mb-20">
      <div class="kpi-box"><div class="kpi-box-val text-green">${fmt(assets)}</div><div class="kpi-box-lbl">Gesamtvermögen</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(liquid)}</div><div class="kpi-box-lbl">Liquidität</div></div>
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(totalDebt())}</div><div class="kpi-box-lbl">Schulden</div></div>
      <div class="kpi-box"><div class="kpi-box-val ${net >= 0 ? "text-green" : "text-red"}">${fmt(net)}</div><div class="kpi-box-lbl">Nettovermögen</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${db.accounts.length}</div><div class="kpi-box-lbl">Konten gesamt</div></div>
    </div>

    <div class="accounts-grid" id="accountsGrid"></div>`;

  const el = document.getElementById("accountsGrid");
  if (!el) return;
  if (!db.accounts.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Noch keine Konten angelegt.</h3></div>`;
    return;
  }
  const bgMap = {
    Girokonto: "rgba(79,172,254,.1)",
    Sparkonto: "rgba(0,229,153,.1)",
    Tagesgeld: "rgba(45,212,191,.1)",
    Kreditkarte: "rgba(255,79,109,.1)",
    Bargeld: "rgba(255,181,71,.1)",
    Depot: "rgba(167,139,250,.1)",
    Sonstiges: "rgba(128,153,179,.1)",
  };
  el.innerHTML = db.accounts
    .map(
      (a) => `
    <div class="account-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="account-icon" style="background:${bgMap[a.type] || "rgba(128,153,179,.1)"}">${ACCOUNT_ICONS[a.type] || "🔷"}</div>
        <div style="display:flex;gap:6px">
          <button class="btn-icon edit"   onclick="openAccountForm('${a.id}')">${svgEdit()}</button>
          <button class="btn-icon danger" onclick="deleteAccount('${a.id}')">${svgTrash()}</button>
        </div>
      </div>
      <div class="account-name">${a.name}</div>
      <div class="account-type">${a.type}${a.note ? " · " + a.note : ""}</div>
      <div class="account-balance ${a.balance < 0 ? "negative" : ""}">${fmt(a.balance)}</div>
      <button class="btn-secondary" style="font-size:12px;padding:7px 12px;margin-top:12px;width:100%" onclick="updateBalance('${a.id}')">
        Kontostand aktualisieren
      </button>
    </div>`,
    )
    .join("");
}

function openAccountForm(editId = null) {
  const ex = editId ? db.accounts.find((a) => a.id === editId) : null;
  const d = ex || { name: "", type: "Girokonto", balance: "", note: "" };
  state.editingId = editId;
  Modal.open(
    editId ? "Konto bearbeiten" : "Konto hinzufügen",
    `<div class="form-grid">
      <div class="form-group">
        <label class="form-label">Kontoname *</label>
        <input class="form-control" id="f_name" type="text" value="${d.name}" placeholder="z.B. Mein Girokonto">
      </div>
      <div class="form-group">
        <label class="form-label">Kontotyp</label>
        <select class="form-control" id="f_type">${ACCOUNT_TYPES.map((t) => `<option value="${t}" ${d.type === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Kontostand (€) *</label>
        <input class="form-control" id="f_balance" type="number" step="0.01" value="${d.balance}" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Notiz / Bank</label>
        <input class="form-control" id="f_note" type="text" value="${d.note || ""}" placeholder="z.B. Volksbank">
      </div>
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveAccount()">${editId ? "Aktualisieren" : "Hinzufügen"}</button>`,
  );
}

function saveAccount() {
  const name = document.getElementById("f_name").value.trim();
  const balance = parseFloat(document.getElementById("f_balance").value);
  if (!name) {
    toast("Bitte Kontoname eingeben!", "error");
    return;
  }
  if (isNaN(balance)) {
    toast("Bitte Kontostand eingeben!", "error");
    return;
  }
  const obj = {
    id: state.editingId || uid(),
    name,
    type: document.getElementById("f_type").value,
    balance,
    note: document.getElementById("f_note").value.trim(),
  };
  if (state.editingId) {
    const idx = db.accounts.findIndex((a) => a.id === state.editingId);
    if (idx > -1) db.accounts[idx] = obj;
    toast("Konto aktualisiert!");
  } else {
    db.accounts.push(obj);
    toast("Konto hinzugefügt!");
  }
  saveDB();
  Modal.close();
  renderAccounts();
}

async function deleteAccount(id) {
  if (!(await Confirm.show("Konto wirklich löschen?"))) return;
  db.accounts = db.accounts.filter((a) => a.id !== id);
  saveDB();
  toast("Konto gelöscht.", "info");
  renderAccounts();
}

function updateBalance(id) {
  const a = db.accounts.find((a) => a.id === id);
  if (!a) return;
  Modal.open(
    `Kontostand aktualisieren: ${a.name}`,
    `<div class="form-group">
      <label class="form-label">Neuer Kontostand (€)</label>
      <input class="form-control" id="f_bal" type="number" step="0.01" value="${a.balance}">
    </div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" onclick="saveBalance('${id}')">Speichern</button>`,
  );
}

function saveBalance(id) {
  const bal = parseFloat(document.getElementById("f_bal").value);
  if (isNaN(bal)) {
    toast("Bitte Betrag eingeben!", "error");
    return;
  }
  const a = db.accounts.find((a) => a.id === id);
  if (a) a.balance = bal;
  saveDB();
  Modal.close();
  toast("Kontostand aktualisiert!");
  renderAccounts();
}

/* ── 15. JAHRESÜBERSICHT ── */

function renderAnnual() {
  const y = state.year;
  const rows = MONTHS.map((name, i) => {
    const m = i + 1;
    const inc = totalIncome(m, y);
    const exp = totalExpense(m, y);
    const sav = inc - exp;
    const rt = inc ? (sav / inc) * 100 : 0;
    const byT = expensesByType(m, y);
    return { name: name.slice(0, 3), m, inc, exp, sav, rt, byT };
  });

  const yearInc = rows.reduce((s, r) => s + r.inc, 0);
  const yearExp = rows.reduce((s, r) => s + r.exp, 0);
  const yearSav = yearInc - yearExp;
  const avgInc = yearInc / 12;
  const avgExp = yearExp / 12;

  const withData = rows.filter((r) => r.inc > 0 || r.exp > 0);
  const bestMonth = withData.length
    ? [...withData].sort((a, b) => b.sav - a.sav)[0]
    : null;
  const worstMonth = withData.length
    ? [...withData].sort((a, b) => a.sav - b.sav)[0]
    : null;

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Jahresübersicht ${y}</h2>
      <div style="display:flex;gap:8px">
        <button class="btn-secondary" onclick="state.year--;renderAnnual()">◀ ${y - 1}</button>
        <button class="btn-secondary" onclick="state.year++;renderAnnual()">${y + 1} ▶</button>
      </div>
    </div>

    <div class="kpi-row mb-20">
      <div class="kpi-box"><div class="kpi-box-val text-green">${fmt(yearInc)}</div><div class="kpi-box-lbl">Jahreseinnahmen</div></div>
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(yearExp)}</div><div class="kpi-box-lbl">Jahresausgaben</div></div>
      <div class="kpi-box"><div class="kpi-box-val ${yearSav >= 0 ? "text-green" : "text-red"}">${fmt(yearSav)}</div><div class="kpi-box-lbl">Jahresersparnis</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(avgInc)}</div><div class="kpi-box-lbl">Ø Einnahmen/Mo.</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${fmt(avgExp)}</div><div class="kpi-box-lbl">Ø Ausgaben/Mo.</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${yearInc ? Math.max(0, (yearSav / yearInc) * 100).toFixed(1) : 0} %</div><div class="kpi-box-lbl">Jahres-Sparquote</div></div>
    </div>

    <div class="card mb-16">
      <div class="card-header"><span class="card-title">12-Monats-Verlauf ${y}</span></div>
      <div class="chart-container" style="height:240px"><canvas id="ch_annual" style="width:100%;height:240px"></canvas></div>
    </div>

    ${
      bestMonth || worstMonth
        ? `
    <div class="grid-2 mb-16">
      ${
        bestMonth
          ? `
      <div class="card">
        <div class="card-header"><span class="card-title">🏆 Bester Monat</span></div>
        <div style="text-align:center;padding:16px 0">
          <div style="font-size:22px;font-weight:700;color:var(--accent-green)">${bestMonth.name}</div>
          <div class="stat-value green" style="margin-top:8px">${fmt(bestMonth.sav)}</div>
          <div class="stat-label">Ersparnis</div>
        </div>
      </div>`
          : ""
      }
      ${
        worstMonth
          ? `
      <div class="card">
        <div class="card-header"><span class="card-title">⚠️ Schlechtester Monat</span></div>
        <div style="text-align:center;padding:16px 0">
          <div style="font-size:22px;font-weight:700;color:var(--accent-red)">${worstMonth.name}</div>
          <div class="stat-value red" style="margin-top:8px">${fmt(worstMonth.sav)}</div>
          <div class="stat-label">Ersparnis</div>
        </div>
      </div>`
          : ""
      }
    </div>`
        : ""
    }

    <div class="card">
      <div class="card-header"><span class="card-title">Monatstabelle ${y}</span></div>
      <div class="annual-table-wrap">
        <table class="annual-table">
          <thead><tr>
            <th>Monat</th>
            <th style="text-align:right">Einnahmen</th>
            <th style="text-align:right">Ausgaben</th>
            <th style="text-align:right">Ersparnis</th>
            <th style="text-align:right">Sparquote</th>
            <th style="text-align:right">Fixkosten</th>
            <th style="text-align:right">Variabel</th>
            <th style="text-align:right">Sparen/Invest</th>
          </tr></thead>
          <tbody>
            ${rows
              .map((r) => {
                const empty = r.inc === 0 && r.exp === 0;
                const spInv =
                  (r.byT["Sparen"] || 0) + (r.byT["Investition"] || 0);
                return `<tr>
                <td style="font-weight:600">${r.name}</td>
                <td class="td-mono text-right text-green">${empty ? "—" : fmt(r.inc)}</td>
                <td class="td-mono text-right text-red">${empty ? "—" : fmt(r.exp)}</td>
                <td class="td-mono text-right ${r.sav >= 0 ? "text-green" : "text-red"}">${empty ? "—" : fmt(r.sav)}</td>
                <td class="td-mono text-right">${empty ? "—" : r.rt.toFixed(1) + "%"}</td>
                <td class="td-mono text-right">${r.byT["Fixkosten"] ? fmt(r.byT["Fixkosten"]) : "—"}</td>
                <td class="td-mono text-right">${r.byT["Variable Kosten"] ? fmt(r.byT["Variable Kosten"]) : "—"}</td>
                <td class="td-mono text-right">${spInv ? fmt(spInv) : "—"}</td>
              </tr>`;
              })
              .join("")}
            <tr style="border-top:2px solid var(--border-light)">
              <td style="font-weight:700">Gesamt</td>
              <td class="td-mono text-right text-green font-bold">${fmt(yearInc)}</td>
              <td class="td-mono text-right text-red font-bold">${fmt(yearExp)}</td>
              <td class="td-mono text-right font-bold ${yearSav >= 0 ? "text-green" : "text-red"}">${fmt(yearSav)}</td>
              <td class="td-mono text-right">${yearInc ? Math.max(0, (yearSav / yearInc) * 100).toFixed(1) + "%" : "—"}</td>
              <td class="td-mono text-right">—</td><td class="td-mono text-right">—</td><td class="td-mono text-right">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    Charts.bar(
      "ch_annual",
      rows.map((r) => r.name),
      [
        { label: "Einnahmen", data: rows.map((r) => r.inc), color: "#00e599" },
        { label: "Ausgaben", data: rows.map((r) => r.exp), color: "#ff4f6d" },
      ],
    );
  });
}

/* ── 16. ANALYSE ── */

function renderAnalysis() {
  const m = state.month,
    y = state.year;
  const catData = expensesByCategory(m, y);
  const top3 = catData.slice(0, 3);
  const totalExp = totalExpense(m, y);
  const totalInc = totalIncome(m, y);

  /* Anstiege vs. Vormonat */
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  const prevMap = Object.fromEntries(expensesByCategory(prevM, prevY));
  const rising = catData
    .filter(([c, a]) => prevMap[c] && a > prevMap[c])
    .sort((a, b) => b[1] - prevMap[b[0]] - (a[1] - prevMap[a[0]]))
    .slice(0, 3);

  /* Wiederkehrende Ausgaben */
  const recurring = db.expenses
    .filter((e) => e.recurring && e.month == m && e.year == y)
    .sort((a, b) => b.amount - a.amount);

  /* Sparvorschläge */
  const tips = generateTips(catData, totalInc, totalExp);

  document.getElementById("mainContent").innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Analyse & Optimierung</h2>
      <span class="badge badge-blue">${MONTHS[m - 1]} ${y}</span>
    </div>

    <div class="kpi-row mb-20">
      <div class="kpi-box"><div class="kpi-box-val text-red">${fmt(totalExp)}</div><div class="kpi-box-lbl">Ausgaben gesamt</div></div>
      <div class="kpi-box"><div class="kpi-box-val text-green">${fmt(totalInc)}</div><div class="kpi-box-lbl">Einnahmen gesamt</div></div>
      <div class="kpi-box"><div class="kpi-box-val ${totalInc - totalExp >= 0 ? "text-green" : "text-red"}">${fmt(totalInc - totalExp)}</div><div class="kpi-box-lbl">Restbudget</div></div>
      <div class="kpi-box"><div class="kpi-box-val">${totalInc ? Math.max(0, ((totalInc - totalExp) / totalInc) * 100).toFixed(1) : 0} %</div><div class="kpi-box-lbl">Sparquote</div></div>
    </div>

    <div class="grid-2 mb-16">
      <div class="card">
        <div class="card-header"><span class="card-title">🔴 Größte Ausgabenkategorien</span></div>
        ${
          top3.length
            ? top3
                .map(
                  ([cat, amt], i) => `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-weight:600">${["🥇", "🥈", "🥉"][i]} ${cat}</span>
            <span class="td-mono text-red">${fmt(amt)} (${totalExp ? ((amt / totalExp) * 100).toFixed(0) : 0} %)</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill progress-red" style="width:${totalExp ? (amt / totalExp) * 100 : 0}%"></div>
          </div>
        </div>`,
                )
                .join("")
            : '<p class="text-muted" style="font-size:13px">Keine Ausgaben vorhanden.</p>'
        }
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">📈 Stärkste Anstiege vs. Vormonat</span></div>
        ${
          rising.length
            ? rising
                .map(([cat, amt]) => {
                  const prev = prevMap[cat] || 0;
                  const delta = amt - prev;
                  return `
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-weight:600">${catEmoji(cat)} ${cat}</span>
              <span class="td-mono text-amber">+${fmt(delta)}</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted)">${fmt(prev)} → ${fmt(amt)} (+${prev ? ((delta / prev) * 100).toFixed(0) : 100} %)</div>
          </div>`;
                })
                .join("")
            : '<p class="text-muted" style="font-size:13px">Keine signifikanten Anstiege.</p>'
        }
      </div>
    </div>

    <div class="card mb-16">
      <div class="card-header"><span class="card-title">💡 Sparoptimierungen</span></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${tips
          .map(
            (t) => `
        <div class="analysis-tip-card">
          <div class="tip-icon" style="background:${t.bg}">${t.icon}</div>
          <div class="tip-info">
            <h4>${t.title}</h4>
            <p>${t.desc}</p>
            ${t.saving ? `<div class="tip-savings">💰 Einsparpotenzial: ${t.saving}</div>` : ""}
          </div>
        </div>`,
          )
          .join("")}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">🔁 Wiederkehrende Ausgaben (${MONTHS[m - 1]} ${y})</span></div>
      ${
        recurring.length
          ? `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Kategorie</th><th>Unterkategorie</th><th>Für wen</th><th>Zahlungsart</th><th style="text-align:right">Betrag</th></tr></thead>
          <tbody>
            ${recurring
              .map(
                (e) => `
            <tr>
              <td>${catEmoji(e.category)} ${e.category}</td>
              <td class="text-muted" style="font-size:12.5px">${e.subcategory || "—"}</td>
              <td>${e.forWhom || "—"}</td>
              <td style="font-size:12.5px">${e.paymentMethod || "—"}</td>
              <td class="td-mono text-right text-red font-bold">−${fmt(e.amount)}</td>
            </tr>`,
              )
              .join("")}
            <tr style="border-top:2px solid var(--border-light)">
              <td colspan="4" style="font-weight:700">Summe wiederkehrend</td>
              <td class="td-mono text-right text-red font-bold">−${fmt(recurring.reduce((s, e) => s + e.amount, 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>`
          : '<p class="text-muted" style="font-size:13px;padding:16px 0">Keine wiederkehrenden Ausgaben in diesem Monat.</p>'
      }
    </div>`;
}

function generateTips(catData, inc, exp) {
  const tips = [];
  const catMap = Object.fromEntries(catData);

  /* Tipp 1: Sparquote */
  const sr = inc ? ((inc - exp) / inc) * 100 : 0;
  if (sr < 10) {
    tips.push({
      icon: "💰",
      bg: "rgba(0,229,153,.1)",
      title: "Sparquote erhöhen",
      desc: `Deine Sparquote beträgt ${sr.toFixed(1)} %. Finanzexperten empfehlen mindestens 20 %. Versuche monatlich mehr zu sparen.`,
      saving: fmt(inc * 0.2 - Math.max(0, inc - exp)),
    });
  }

  /* Tipp 2: Lebensmittel */
  if (catMap["Lebensmittel"] && catMap["Lebensmittel"] > 500) {
    tips.push({
      icon: "🛒",
      bg: "rgba(255,181,71,.1)",
      title: "Lebensmittelkosten optimieren",
      desc: `Du gibst ${fmt(catMap["Lebensmittel"])} für Lebensmittel aus. Wochenplanung, Einkaufslisten und Discounter können bis zu 20 % sparen.`,
      saving: fmt(catMap["Lebensmittel"] * 0.2),
    });
  }

  /* Tipp 3: Freizeit */
  if (catMap["Freizeit"] && catMap["Freizeit"] > 300) {
    tips.push({
      icon: "🎭",
      bg: "rgba(167,139,250,.1)",
      title: "Freizeitausgaben prüfen",
      desc: `Freizeitkosten von ${fmt(catMap["Freizeit"])} sind hoch. Prüfe Streaming-Abos, reduziere Restaurantbesuche oder nutze günstigere Alternativen.`,
      saving: fmt(catMap["Freizeit"] * 0.15),
    });
  }

  /* Tipp 4: Fixkosten */
  const fixAmt = expensesByType(state.month, state.year)["Fixkosten"] || 0;
  if (inc && fixAmt / inc > 0.5) {
    tips.push({
      icon: "🏠",
      bg: "rgba(255,79,109,.1)",
      title: "Hohe Fixkostenquote",
      desc: `Deine Fixkosten betragen ${((fixAmt / inc) * 100).toFixed(0)} % deines Einkommens — empfohlen sind max. 50 %. Prüfe Verträge und Versicherungen.`,
      saving: null,
    });
  }

  /* Tipp 5: Transport */
  if (catMap["Transport"] && catMap["Transport"] > 400) {
    tips.push({
      icon: "🚗",
      bg: "rgba(79,172,254,.1)",
      title: "Transportkosten senken",
      desc: `${fmt(catMap["Transport"])} für Transport ist viel. ÖPNV, Fahrgemeinschaften oder ein Jobticket können helfen.`,
      saving: fmt(catMap["Transport"] * 0.25),
    });
  }

  /* Tipp 6: Keine Sparziele */
  if (!db.savingsGoals.length) {
    tips.push({
      icon: "🎯",
      bg: "rgba(45,212,191,.1)",
      title: "Sparziele definieren",
      desc: "Du hast noch keine Sparziele festgelegt. Konkrete Ziele helfen, motiviert zu sparen.",
      saving: null,
    });
  }

  if (!tips.length) {
    tips.push({
      icon: "✅",
      bg: "rgba(0,229,153,.1)",
      title: "Gut aufgestellt!",
      desc: "Dein Budget sieht ordentlich aus. Weiter so – und denke daran, regelmäßig deine Ausgaben zu überprüfen.",
      saving: null,
    });
  }

  return tips;
}

/* ── 17. QUICK-ADD ── */

function openQuickAdd() {
  Modal.open(
    "Schnell hinzufügen",
    `<div class="tab-header">
      <button class="tab-btn active" id="tab_inc" onclick="switchQuickTab('income')">💰 Einnahme</button>
      <button class="tab-btn"        id="tab_exp" onclick="switchQuickTab('expense')">💸 Ausgabe</button>
    </div>
    <div id="quickTabContent"></div>`,
    `<button class="btn-secondary" onclick="Modal.close()">Abbrechen</button>
     <button class="btn-primary" id="quickSaveBtn" onclick="quickSave()">Hinzufügen</button>`,
  );
  switchQuickTab("income");
}

let _quickTab = "income";

function switchQuickTab(tab) {
  _quickTab = tab;
  document
    .getElementById("tab_inc")
    .classList.toggle("active", tab === "income");
  document
    .getElementById("tab_exp")
    .classList.toggle("active", tab === "expense");

  const el = document.getElementById("quickTabContent");
  if (tab === "income") {
    el.innerHTML = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Kategorie</label>
          <select class="form-control" id="q_cat">${INCOME_CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("")}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Betrag (€) *</label>
          <input class="form-control" id="q_amount" type="number" step="0.01" min="0" placeholder="0,00">
        </div>
        <div class="form-group">
          <label class="form-label">Datum</label>
          <input class="form-control" id="q_date" type="date" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Person</label>
          <select class="form-control" id="q_person">${PERSONS.map((p) => `<option value="${p}">${p}</option>`).join("")}</select>
        </div>
        <div class="form-group form-full">
          <label class="form-label">Notiz</label>
          <input class="form-control" id="q_note" type="text" placeholder="Optional">
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Typ</label>
          <select class="form-control" id="q_type">${EXPENSE_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Kategorie</label>
          <select class="form-control" id="q_cat" onchange="refreshQuickSub()">${Object.keys(
            EXPENSE_CATEGORIES,
          )
            .map((c) => `<option value="${c}">${c}</option>`)
            .join("")}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Unterkategorie</label>
          <select class="form-control" id="q_sub">${(EXPENSE_CATEGORIES["Wohnen"] || []).map((s) => `<option value="${s}">${s}</option>`).join("")}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Betrag (€) *</label>
          <input class="form-control" id="q_amount" type="number" step="0.01" min="0" placeholder="0,00">
        </div>
        <div class="form-group">
          <label class="form-label">Datum</label>
          <input class="form-control" id="q_date" type="date" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Für wen</label>
          <select class="form-control" id="q_whom">${PERSONS.map((p) => `<option value="${p}">${p}</option>`).join("")}</select>
        </div>
        <div class="form-group form-full">
          <label class="form-label">Notiz</label>
          <input class="form-control" id="q_note" type="text" placeholder="Optional">
        </div>
      </div>`;
  }
}

function refreshQuickSub() {
  const cat = document.getElementById("q_cat").value;
  const sub = document.getElementById("q_sub");
  if (!sub) return;
  sub.innerHTML = (EXPENSE_CATEGORIES[cat] || ["Sonstiges"])
    .map((s) => `<option value="${s}">${s}</option>`)
    .join("");
}

function quickSave() {
  const amount = parseFloat(document.getElementById("q_amount").value);
  const date = document.getElementById("q_date").value;
  if (!amount || amount <= 0) {
    toast("Bitte Betrag eingeben!", "error");
    return;
  }
  if (!date) {
    toast("Bitte Datum wählen!", "error");
    return;
  }

  const d = new Date(date + "T00:00:00");
  const m = d.getMonth() + 1;
  const year = d.getFullYear();

  if (_quickTab === "income") {
    db.incomes.push({
      id: uid(),
      category: document.getElementById("q_cat").value,
      subcategory: "",
      amount,
      gross: amount,
      net: amount,
      date,
      month: m,
      year,
      recurring: false,
      interval: "Einmalig",
      person: document.getElementById("q_person").value,
      taxable: false,
      note: document.getElementById("q_note").value,
    });
    toast("Einnahme hinzugefügt!");
  } else {
    db.expenses.push({
      id: uid(),
      type: document.getElementById("q_type").value,
      category: document.getElementById("q_cat").value,
      subcategory: document.getElementById("q_sub").value,
      amount,
      date,
      month: m,
      year,
      paymentMethod: "EC-Karte",
      account: "Girokonto",
      forWhom: document.getElementById("q_whom").value,
      recurring: false,
      warranty: false,
      taxDeductible: false,
      note: document.getElementById("q_note").value,
    });
    toast("Ausgabe hinzugefügt!");
  }
  saveDB();
  Modal.close();
  if (PAGE_RENDERERS[state.section]) PAGE_RENDERERS[state.section]();
}

/* ── 18. CSV EXPORT ── */

function exportCSV() {
  const rows = [
    [
      "Typ",
      "Datum",
      "Kategorie",
      "Unterkategorie",
      "Betrag",
      "Person/FürWen",
      "Konto",
      "Notiz",
      "Monat",
      "Jahr",
    ],
  ];
  db.incomes.forEach((i) => {
    rows.push([
      "Einnahme",
      i.date,
      i.category,
      i.subcategory || "",
      i.amount.toFixed(2),
      i.person || "",
      "",
      i.note || "",
      i.month,
      i.year,
    ]);
  });
  db.expenses.forEach((e) => {
    rows.push([
      e.type,
      e.date,
      e.category,
      e.subcategory || "",
      e.amount.toFixed(2),
      e.forWhom || "",
      e.account || "",
      e.note || "",
      e.month,
      e.year,
    ]);
  });

  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `budgetpro_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast("CSV-Export erfolgreich!");
}

/* ── 19. RESET ── */

async function resetData() {
  const ok = await Confirm.show(
    "ALLE Daten wirklich löschen? Die App startet danach leer neu.",
    "⚠️ Daten zurücksetzen",
  );
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  db = {
    incomes: [],
    expenses: [],
    budgets: {},
    savingsGoals: [],
    debts: [],
    accounts: [],
    settings: {
      currency: "EUR",
      darkMode: db.settings.darkMode,
      plannedIncome: 0,
      householdName: "Unser Haushalt",
    },
  };
  saveDB();
  toast("Alle Daten gelöscht. Frischer Start!", "info");
  navigate("dashboard");
}

/* ── 20. DARK MODE ── */

function applyTheme() {
  const dark = db.settings.darkMode;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.getElementById("themeToggle").querySelector("span").textContent =
    dark ? "Dark Mode" : "Light Mode";
}

function toggleTheme() {
  db.settings.darkMode = !db.settings.darkMode;
  saveDB();
  applyTheme();
}

/* ── 21. PERIODEN-SELECTOR ── */

function buildPeriodSelectors() {
  const mSel = document.getElementById("globalMonth");
  const ySel = document.getElementById("globalYear");
  if (!mSel || !ySel) return;

  mSel.innerHTML = MONTHS.map(
    (mn, i) =>
      `<option value="${i + 1}" ${i + 1 === state.month ? "selected" : ""}>${mn}</option>`,
  ).join("");
  const now = new Date().getFullYear();
  ySel.innerHTML = Array.from({ length: 7 }, (_, i) => now - 3 + i)
    .map(
      (y) =>
        `<option value="${y}" ${y === state.year ? "selected" : ""}>${y}</option>`,
    )
    .join("");

  mSel.onchange = () => {
    state.month = parseInt(mSel.value);
    if (PAGE_RENDERERS[state.section]) PAGE_RENDERERS[state.section]();
  };
  ySel.onchange = () => {
    state.year = parseInt(ySel.value);
    if (PAGE_RENDERERS[state.section]) PAGE_RENDERERS[state.section]();
  };
}

/* ── 22. EVENT LISTENERS ── */

function bindEvents() {
  /* Nav Links */
  document.querySelectorAll(".nav-link").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(el.dataset.section);
    });
  });

  /* Mobile Menu */
  document.getElementById("mobileMenuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("mobile-open");
    document.getElementById("sidebarBackdrop").classList.toggle("open");
  });

  document.getElementById("sidebarBackdrop").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("mobile-open");
    document.getElementById("sidebarBackdrop").classList.remove("open");
  });

  /* Modal schließen */
  document
    .getElementById("modalClose")
    .addEventListener("click", () => Modal.close());
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) Modal.close();
  });

  /* Confirm Dialog */
  document
    .getElementById("confirmOk")
    .addEventListener("click", () => Confirm.ok());
  document
    .getElementById("confirmCancel")
    .addEventListener("click", () => Confirm.cancel());

  /* Quick Add */
  document
    .getElementById("quickAddBtn")
    .addEventListener("click", openQuickAdd);

  /* Theme Toggle */
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  /* CSV Export */
  document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);

  /* Reset */
  document.getElementById("resetDataBtn").addEventListener("click", resetData);

  /* Keyboard: ESC schließt Modal */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (document.getElementById("modalOverlay").classList.contains("open"))
        Modal.close();
      if (document.getElementById("confirmOverlay").classList.contains("open"))
        Confirm.cancel();
    }
  });

  /* Charts neu zeichnen bei Resize */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (PAGE_RENDERERS[state.section]) PAGE_RENDERERS[state.section]();
    }, 300);
  });
}

/* ── 23. INIT ── */

function init() {
  /* Sidebar-Backdrop ins DOM */
  if (!document.getElementById("sidebarBackdrop")) {
    const bd = document.createElement("div");
    bd.id = "sidebarBackdrop";
    bd.className = "sidebar-backdrop";
    document.body.appendChild(bd);
  }

  loadDB();
  applyTheme();
  buildPeriodSelectors();
  bindEvents();
  navigate("dashboard");
}

document.addEventListener("DOMContentLoaded", init);
