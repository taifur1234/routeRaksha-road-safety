import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deleteAccidentReport,
  ensureAccidentReports,
  updateAccidentReport,
  updateAccidentReportStatus,
} from "../utils/reportStore";
import {
  deleteContactMessage as deleteContactMessageApi,
  listContactMessages,
  markContactMessageSeen,
} from "../utils/contactMessageApi";
import { broadcastNotification } from "../utils/notificationApi";
import { getLeaderboard, grantReputationBonus } from "../utils/reputationApi";
import { getVerificationMeta } from "../utils/safetyData";

const navItems = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "review", label: "Review queue", icon: "clipboard" },
  { id: "blackspots", label: "Blackspots", icon: "map" },
  { id: "messages", label: "Contact messages", icon: "mail" },
  { id: "community", label: "Community", icon: "user" },
];

const metricCopy = {
  total: {
    title: "Total signals",
    icon: "signal",
    helper: "Community reports received",
  },
  pending: {
    title: "Needs review",
    icon: "clock",
    helper: "Waiting for admin action",
  },
  approved: {
    title: "Verified zones",
    icon: "shield",
    helper: "Live in user safety data",
  },
  high: {
    title: "High risk",
    icon: "alert",
    helper: "Requires fast attention",
  },
};

const playbook = [
  "Validate report details and location quality.",
  "Prioritize high severity zones near junctions or schools.",
  "Approve verified reports so users can avoid unsafe routes.",
  "Decline duplicate or unclear reports with a clean audit trail.",
];

function Icon({ name, size = 18 }) {
  const icons = {
    dashboard: [
      "M4 4h7v7H4z",
      "M13 4h7v7h-7z",
      "M4 13h7v7H4z",
      "M13 13h7v7h-7z",
    ],
    clipboard: [
      "M9 4h6",
      "M9 2h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2z",
      "M8 11h8",
      "M8 15h5",
    ],
    map: [
      "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z",
      "M9 3v15",
      "M15 6v15",
    ],
    signal: ["M5 20v-5", "M12 20V8", "M19 20V4"],
    home: ["M3 10.5 12 3l9 7.5", "M5 10v10h14V10", "M9 20v-6h6v6"],
    mail: ["M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "m22 7-10 6L2 7"],
    eye: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
    trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6", "M10 11v5", "M14 11v5"],
    clock: ["M12 7v5l3 2", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"],
    shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-5"],
    alert: [
      "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
      "M12 9v4",
      "M12 17h.01",
    ],
    search: ["M21 21l-4.3-4.3", "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"],
    logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
    refresh: ["M21 12a9 9 0 0 1-15.2 6.5L3 16", "M3 21v-5h5", "M3 12A9 9 0 0 1 18.2 5.5L21 8", "M21 3v5h-5"],
    check: ["M20 6L9 17l-5-5"],
    x: ["M18 6L6 18", "M6 6l12 12"],
    lock: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
    user: ["M20 21a8 8 0 0 0-16 0", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
    pin: ["M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z", "M12 10.5h.01"],
    leaf: ["M4 20c10 0 16-6 16-16C10 4 4 10 4 20z", "M4 20c4-6 8-9 16-16"],
    filter: ["M4 6h16", "M7 12h10", "M10 18h4"],
    arrowRight: ["M5 12h14", "M12 5l7 7-7 7"],
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(icons[name] || icons.dashboard).map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not reviewed";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function isThisWeek(value) {
  if (!value) {
    return false;
  }

  return Date.now() - new Date(value).getTime() <= 7 * 24 * 60 * 60 * 1000;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function statusBadge(status) {
  const normalized = normalize(status);

  if (normalized === "approved") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  if (normalized === "declined") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  return "bg-amber-100 text-amber-700 border border-amber-200";
}

function severityBadge(severity) {
  const normalized = normalize(severity);

  if (normalized === "high") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  if (normalized === "medium") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
}

// ── STAT CARD ──────────────────────────────────────────────────────────────
const statAccent = {
  total: { card: "from-indigo-50 to-slate-50 border-indigo-100", icon: "bg-indigo-100 text-indigo-600", val: "text-indigo-700" },
  pending: { card: "from-amber-50 to-orange-50 border-amber-100", icon: "bg-amber-100 text-amber-600", val: "text-amber-700" },
  approved: { card: "from-emerald-50 to-teal-50 border-emerald-100", icon: "bg-emerald-100 text-emerald-600", val: "text-emerald-700" },
  high: { card: "from-red-50 to-rose-50 border-red-100", icon: "bg-red-100 text-red-600", val: "text-red-700" },
};

function StatCard({ type, value }) {
  const item = metricCopy[type];
  const accent = statAccent[type];

  return (
    <article className={`rounded-2xl border bg-gradient-to-br ${accent.card} p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600">{item.title}</p>
          <h3 className={`mt-2 text-4xl font-extrabold tabular-nums tracking-tight ${accent.val}`}>{value}</h3>
          <p className="mt-1.5 text-xs font-semibold text-slate-700">{item.helper}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent.icon}`}>
          <Icon name={item.icon} size={18} />
        </span>
      </div>
    </article>
  );
}

// ── BAR CHART ──────────────────────────────────────────────────────────────
const BAR_FILLS = {
  High:   { fill: "url(#barHigh)",   stop1: "#f87171", stop2: "#ef4444" },
  Medium: { fill: "url(#barMedium)", stop1: "#fbbf24", stop2: "#f59e0b" },
  Low:    { fill: "url(#barLow)",    stop1: "#4ade80", stop2: "#22c55e" },
};
const DEFAULT_BAR = { fill: "url(#barDefault)", stop1: "#8ef35f", stop2: "#167a43" };

function BarChart({ title, helper, data }) {
  const [hovered, setHovered] = useState(null);
  const W = 320, H = 180, padL = 36, padR = 12, padT = 12, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const rawMax = Math.max(...data.map((d) => d.value), 1);
  const yMax = Math.ceil(rawMax / 5) * 5 || 5;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(yMax * t));
  const barW = Math.floor((chartW / data.length) * 0.52);
  const gap  = chartW / data.length;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{helper}</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-800">{title}</h2>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-400">
          <Icon name="filter" size={16} />
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: 200 }}>
        <defs>
          {data.map((d) => {
            const f = BAR_FILLS[d.label] || DEFAULT_BAR;
            return (
              <linearGradient key={d.label} id={`bar${d.label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={f.stop1} />
                <stop offset="100%" stopColor={f.stop2} />
              </linearGradient>
            );
          })}
          <linearGradient id="barDefault" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8ef35f" /><stop offset="100%" stopColor="#167a43" />
          </linearGradient>
        </defs>

        {/* Y-axis gridlines + labels */}
        {ticks.map((tick) => {
          const y = padT + chartH - (tick / yMax) * chartH;
          return (
            <g key={tick}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="600">{tick}</text>
            </g>
          );
        })}

        {/* X axis line */}
        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="1.5" />

        {/* Bars */}
        {data.map((d, i) => {
          const f = BAR_FILLS[d.label] || DEFAULT_BAR;
          const barH = Math.max((d.value / yMax) * chartH, d.value ? 6 : 2);
          const bx = padL + gap * i + (gap - barW) / 2;
          const by = padT + chartH - barH;
          const isHov = hovered === d.label;
          return (
            <g key={d.label}
              onMouseEnter={() => setHovered(d.label)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* background track */}
              <rect x={bx} y={padT} width={barW} height={chartH} rx="6" fill="#f8fafc" />
              {/* bar */}
              <rect
                x={bx} y={by} width={barW} height={barH} rx="6"
                fill={f.fill}
                opacity={isHov ? 1 : 0.88}
                style={{ transition: "opacity 0.15s, y 0.4s, height 0.4s" }}
              />
              {/* value label on hover */}
              {isHov && (
                <g>
                  <rect x={bx - 8} y={by - 26} width={barW + 16} height={20} rx="5" fill="#1e293b" />
                  <text x={bx + barW / 2} y={by - 12} textAnchor="middle" fontSize="10" fill="white" fontWeight="700">{d.value}</text>
                </g>
              )}
              {/* X label */}
              <text x={bx + barW / 2} y={padT + chartH + 16} textAnchor="middle" fontSize="10" fill={isHov ? "#1e293b" : "#94a3b8"} fontWeight="700">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}

// ── DONUT CHART ─────────────────────────────────────────────────────────────
function DonutChart({ title, helper, data }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const R = 54, stroke = 22, cx = 75, cy = 75;
  const circ = 2 * Math.PI * R;

  // build segments
  let offset = 0;
  const segments = data.map((d) => {
    const pct = total ? d.value / total : 0;
    const dash = pct * circ;
    const seg = { ...d, dash, gap: circ - dash, offset, pct };
    offset += dash;
    return seg;
  });

  const hovSeg = segments.find((s) => s.label === hovered);

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{helper}</p>
      <h2 className="mt-1 text-lg font-extrabold text-slate-800 mb-5">{title}</h2>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* SVG donut */}
        <div className="relative mx-auto shrink-0" style={{ width: 150, height: 150 }}>
          <svg viewBox="0 0 150 150" width="150" height="150">
            {/* track */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            {/* segments */}
            {segments.map((seg) => {
              const isHov = hovered === seg.label;
              return (
                <circle
                  key={seg.label}
                  cx={cx} cy={cy} r={R}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHov ? stroke + 4 : stroke}
                  strokeDasharray={`${seg.dash} ${seg.gap}`}
                  strokeDashoffset={-seg.offset + circ * 0.25}
                  strokeLinecap="butt"
                  style={{ transition: "stroke-width 0.2s, opacity 0.2s", opacity: hovered && !isHov ? 0.35 : 1, cursor: "pointer" }}
                  onMouseEnter={() => setHovered(seg.label)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
            {/* center text */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">
              {hovSeg ? hovSeg.value : total}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8" letterSpacing="0.08em">
              {hovSeg ? hovSeg.label.toUpperCase() : "TOTAL"}
            </text>
            <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fontWeight="600" fill="#cbd5e1">
              {hovSeg ? `${Math.round(hovSeg.pct * 100)}%` : "reports"}
            </text>
          </svg>
        </div>

        {/* legend */}
        <div className="flex flex-1 flex-col gap-2.5">
          {segments.map((seg) => {
            const isHov = hovered === seg.label;
            return (
              <div
                key={seg.label}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-150 cursor-pointer ${isHov ? "bg-slate-100 shadow-sm" : "bg-slate-50 hover:bg-slate-100"}`}
                onMouseEnter={() => setHovered(seg.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="size-3 shrink-0 rounded-sm" style={{ background: seg.color }} />
                <span className="flex-1 text-sm font-bold text-slate-700">{seg.label}</span>
                <span className="text-sm font-extrabold text-slate-800 tabular-nums">{seg.value}</span>
                <span
                  className="w-10 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold"
                  style={{ background: seg.color + "22", color: seg.color }}
                >
                  {total ? Math.round(seg.pct * 100) : 0}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

// ── LINE CHART ──────────────────────────────────────────────────────────────
function VerificationSignalChart({ title, helper, data }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const totalFrequency = data.reduce((sum, item) => sum + item.frequency, 0);
  const totalReports = data.reduce((sum, item) => sum + item.count, 0);
  const weightedConfidence = Math.round(
    data.reduce((sum, item) => sum + item.avgConfidence * item.count, 0) / Math.max(totalReports, 1),
  );

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{helper}</p>
      <h2 className="mt-1 text-lg font-extrabold text-slate-800">{title}</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Avg confidence</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-indigo-700">{weightedConfidence}%</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Accident frequency</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-800">{totalFrequency}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {data.map((item) => {
          const width = item.count ? `${Math.max(8, Math.round((item.count / maxCount) * 100))}%` : "0%";

          return (
            <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-700">{item.label}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-400">
                    {item.avgConfidence}% confidence / frequency {item.frequency}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold tabular-nums text-slate-700 shadow-sm">
                  {item.count}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width, background: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

// ── ACCESS PANEL ────────────────────────────────────────────────────────────
function AccessPanel({ type, onLogout }) {
  const isLoggedOut = type === "login";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 font-sans">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-4xl place-items-center">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid md:grid-cols-[0.9fr_1.1fr]">
          {/* left panel */}
          <div className="relative min-h-64 overflow-hidden bg-slate-900 p-10 text-white">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-500/20" />
            <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full border border-indigo-400/30" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500 text-white">
                <Icon name="lock" size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Admin area</p>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight">Road Safety<br />Command Center</h1>
              </div>
            </div>
          </div>
          {/* right panel */}
          <div className="p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {isLoggedOut ? "Login required" : "Admin access only"}
            </p>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-800">
              {isLoggedOut ? "Sign in as admin to continue." : "This account cannot open the admin panel."}
            </h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-500 max-w-sm">
              {isLoggedOut
                ? "Use the RouteRaksha admin account to review reports, approve verified blackspots and keep unsafe routes visible to users."
                : "For safety, only an admin role can approve or decline road risk reports. Switch to the admin account to continue."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Go to login
              </Link>
              {isLoggedOut ? (
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back home
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Icon name="logout" size={15} />
                  Switch account
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── MAP ──────────────────────────────────────────────────────────────────────
function OrganicMap({ reports }) {
  const approved = reports.filter((report) => normalize(report.status) === "approved").slice(0, 4);
  const points = [
    { top: "18%", left: "10%" },
    { top: "50%", left: "30%" },
    { top: "20%", left: "60%" },
    { top: "62%", left: "68%" },
  ];
  const sevColor = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

  return (
    <div className="relative min-h-72 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-50 p-6 shadow-sm">
      {/* grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "linear-gradient(#cbd5e1 1px,transparent 1px),linear-gradient(90deg,#cbd5e1 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* SVG road decoration */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 130 Q100 90 200 130 T400 110" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
        <path d="M0 130 Q100 90 200 130 T400 110" stroke="white" strokeWidth="2" strokeDasharray="12 10" strokeLinecap="round" />
        <path d="M90 0 Q130 90 110 260" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        <path d="M90 0 Q130 90 110 260" stroke="white" strokeWidth="2" strokeDasharray="12 10" strokeLinecap="round" />
        <path d="M310 0 Q290 130 330 260" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        <path d="M310 0 Q290 130 330 260" stroke="white" strokeWidth="2" strokeDasharray="12 10" strokeLinecap="round" />
      </svg>

      <div className="relative z-10 mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Live Safety Field</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-800">Verified Risk Pockets</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-sm">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <div className="relative z-10 h-40">
        {(approved.length ? approved : reports.slice(0, 4)).map((report, index) => {
          const color = sevColor[normalize(report.severity)] || "#167a43";
          return (
            <div
              key={report.id}
              className="absolute flex max-w-[148px] items-start gap-2 rounded-xl border border-slate-200 bg-white/90 p-2.5 shadow-md backdrop-blur-sm"
              style={points[index] || points[0]}
            >
              <span
                className="mt-0.5 size-2.5 shrink-0 rounded-full ring-2 ring-white"
                style={{ background: color }}
              />
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color }}>{report.severity || "Risk"}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-slate-600">{report.location}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── REPORT CARD ──────────────────────────────────────────────────────────────
function ReportCard({ report, onReview }) {
  const isPending = normalize(report.status) === "pending";

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider ${severityBadge(report.severity)}`}>
              {report.severity || "Medium"}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider ${statusBadge(report.status)}`}>
              {report.status || "Pending"}
            </span>
            <span className="text-xs font-semibold text-slate-400">{formatDate(report.createdAt)}</span>
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-800">{report.location}</h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-500">{report.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{report.type || "Road risk"}</span>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getVerificationMeta(report.verificationStatus).className}`}>
              {getVerificationMeta(report.verificationStatus).label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Reporter: {report.reporterName || "RouteRaksha user"}
            </span>
            {report.lightCondition && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{report.lightCondition}</span>
            )}
            {report.accidentTime && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{report.accidentTime}</span>
            )}
            {report.reviewedBy && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Reviewed by {report.reviewedBy}</span>
            )}
          </div>
          {report.imageData && (
            <img src={report.imageData} alt="" className="mt-4 h-32 w-full max-w-md rounded-xl object-cover" />
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-end">
          {isPending ? (
            <>
              <button
                type="button"
                onClick={() => onReview(report.id, "approved")}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-200 hover:bg-emerald-600 transition-colors"
              >
                <Icon name="check" size={13} />
                Approve
              </button>
              <button
                type="button"
                onClick={() => onReview(report.id, "declined")}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
              >
                <Icon name="x" size={13} />
                Decline
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
              <Icon name={normalize(report.status) === "approved" ? "check" : "x"} size={13} />
              {normalize(report.status) === "approved" ? "Verified" : "Closed"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ title, copy }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-500">
        <Icon name="shield" size={24} />
      </div>
      <h3 className="mt-4 text-xl font-extrabold text-slate-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">{copy}</p>
    </div>
  );
}

function SourceBlackspotCard({ report }) {
  const verification = getVerificationMeta(report.verificationStatus);

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
          <Icon name="pin" size={17} />
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${severityBadge(report.severity)}`}>
          {report.severity || "Medium"}
        </span>
      </div>
      <h3 className="text-base font-extrabold tracking-tight text-slate-800">{report.location}</h3>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-500">{report.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {report.type || "Road risk"}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${verification.className}`}>
          {verification.label}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {report.sourceType || "Source data"}
        </span>
        {report.sourceUrl ? (
          <a
            href={report.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
          >
            Open source
          </a>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-lg font-extrabold text-slate-800">{report.confidenceScore || 0}%</p>
          <p>Confidence</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-lg font-extrabold text-slate-800">{report.accidentFrequency || 0}</p>
          <p>Frequency</p>
        </div>
      </div>
    </article>
  );
}

function BlackspotEditor({ report, onSave, onDelete }) {
  const [draft, setDraft] = useState({
    severity: report.severity || "Medium",
    confidenceScore: report.confidenceScore ?? 78,
    accidentFrequency: report.accidentFrequency ?? 1,
    verificationStatus: report.verificationStatus || "community_verified",
  });

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function saveDraft() {
    onSave(report.id, {
      ...draft,
      confidenceScore: draft.confidenceScore === "" ? 0 : Number(draft.confidenceScore),
      accidentFrequency: draft.accidentFrequency === "" ? 0 : Number(draft.accidentFrequency),
    });
  }

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
          <Icon name="pin" size={17} />
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${severityBadge(draft.severity)}`}>
          {draft.severity || "Medium"}
        </span>
      </div>
      <h3 className="text-base font-extrabold tracking-tight text-slate-800">{report.location}</h3>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-500">{report.description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-bold text-slate-500">
          Severity
          <select
            value={draft.severity}
            onChange={(event) => updateDraft("severity", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
          >
            {["High", "Medium", "Low"].map((severity) => <option key={severity}>{severity}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-slate-500">
          Verification
          <select
            value={draft.verificationStatus}
            onChange={(event) => updateDraft("verificationStatus", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
          >
            <option value="government_verified">Government Verified</option>
            <option value="community_verified">Community Verified</option>
            <option value="under_review">Under Review</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-slate-500">
          Confidence
          <input
            type="number"
            min="0"
            max="100"
            value={draft.confidenceScore}
            onChange={(event) => updateDraft("confidenceScore", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-slate-500">
          Accident frequency
          <input
            type="number"
            min="0"
            value={draft.accidentFrequency}
            onChange={(event) => updateDraft("accidentFrequency", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveDraft}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
        >
          Save details
        </button>
        <button
          type="button"
          onClick={() => onDelete(report.id)}
          className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
        >
          Delete fake report
        </button>
        <span className={`rounded-full border px-3 py-2 text-xs font-bold ${getVerificationMeta(draft.verificationStatus).className}`}>
          {getVerificationMeta(draft.verificationStatus).label}
        </span>
      </div>
    </article>
  );
}

// ── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel() {
  const { user, isLoggedIn, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [activeView, setActiveView] = useState("overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactPagination, setContactPagination] = useState(null);
  const [contactUnseenCount, setContactUnseenCount] = useState(0);
  const [contactSearch, setContactSearch] = useState("");
  const [contactSeenFilter, setContactSeenFilter] = useState("all");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [broadcastDraft, setBroadcastDraft] = useState({ title: "", message: "", mode: "all", userIds: "" });
  const [bonusDraft, setBonusDraft] = useState({ userId: "", reason: "" });
  const isAdmin = user?.role === "admin";

  const summary = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((report) => normalize(report.status) === "pending").length;
    const approved = reports.filter((report) => normalize(report.status) === "approved").length;
    const declined = reports.filter((report) => normalize(report.status) === "declined").length;
    const high = reports.filter((report) => normalize(report.severity) === "high").length;
    const thisWeek = reports.filter((report) => isThisWeek(report.createdAt)).length;
    const activeZones = new Set(
      reports
        .filter((report) => normalize(report.status) === "approved")
        .map((report) => normalize(report.location))
        .filter(Boolean)
    ).size;
    const approvalRate = total ? Math.round((approved / total) * 100) : 0;

    return { total, pending, approved, declined, high, thisWeek, activeZones, approvalRate };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const needle = normalize(query);
    const score = { high: 0, medium: 1, low: 2 };

    return reports
      .filter((report) => {
        if (statusFilter !== "all" && normalize(report.status) !== statusFilter) {
          return false;
        }

        if (severityFilter !== "all" && normalize(report.severity) !== severityFilter) {
          return false;
        }

        if (!needle) {
          return true;
        }

        return [report.location, report.type, report.severity, report.status, report.description, report.reporterName]
          .map(normalize)
          .some((value) => value.includes(needle));
      })
      .sort((a, b) => {
        const statusA = normalize(a.status) === "pending" ? -1 : 1;
        const statusB = normalize(b.status) === "pending" ? -1 : 1;

        if (statusA !== statusB) {
          return statusA - statusB;
        }

        const severityA = score[normalize(a.severity)] ?? 3;
        const severityB = score[normalize(b.severity)] ?? 3;

        if (severityA !== severityB) {
          return severityA - severityB;
        }

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [query, reports, severityFilter, statusFilter]);

  const pendingReports = filteredReports.filter((report) => normalize(report.status) === "pending");
  const approvedReports = reports.filter((report) => normalize(report.status) === "approved");
  const sourceBlackspots = approvedReports.filter((report) =>
    ["seed_blackspot", "imported_blackspot"].includes(normalize(report.dataOrigin)),
  );
  const editableApprovedReports = approvedReports.filter((report) => {
    const origin = normalize(report.dataOrigin);
    return !origin || origin === "user_report";
  });
  const blackspotLayerReports = [...sourceBlackspots, ...editableApprovedReports];
  const blackspotLayerSummary = {
    total: blackspotLayerReports.length,
    governmentVerified: blackspotLayerReports.filter((report) => normalize(report.verificationStatus) === "government_verified").length,
    highSeverity: blackspotLayerReports.filter((report) => normalize(report.severity) === "high").length,
    underReview: blackspotLayerReports.filter((report) => normalize(report.verificationStatus) === "under_review").length,
  };
  const recentReports = filteredReports.slice(0, 5);

  const severityData = useMemo(() => {
    return ["High", "Medium", "Low"].map((level) => ({
      label: level,
      value: reports.filter((report) => normalize(report.severity) === normalize(level)).length,
      color: level === "High" ? "#ef4444" : level === "Medium" ? "#f59e0b" : "#22c55e",
    }));
  }, [reports]);

  const statusData = useMemo(() => {
    return [
      { label: "Pending", value: summary.pending, color: "#f59e0b" },
      { label: "Approved", value: summary.approved, color: "#22c55e" },
      { label: "Declined", value: summary.declined, color: "#ef4444" },
    ];
  }, [summary]);

  const verificationSignalData = useMemo(() => {
    const groups = [
      { key: "government_verified", label: "Government Verified", color: "#10b981" },
      { key: "community_verified", label: "Community Verified", color: "#167a43" },
      { key: "under_review", label: "Under Review", color: "#f59e0b" },
    ];

    return groups.map((group) => {
      const groupReports = reports.filter((report) => {
        const fallbackStatus = normalize(report.status) === "approved" ? "community_verified" : "under_review";
        return normalize(report.verificationStatus || fallbackStatus) === group.key;
      });
      const count = groupReports.length;
      const avgConfidence = Math.round(
        groupReports.reduce((sum, report) => sum + Number(report.confidenceScore || 60), 0) /
          Math.max(count, 1),
      );
      const frequency = groupReports.reduce(
        (sum, report) => sum + Number(report.accidentFrequency || 1),
        0,
      );

      return {
        ...group,
        count,
        avgConfidence,
        frequency,
      };
    });
  }, [reports]);

  const flash = useCallback(function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }, []);

  const loadReports = useCallback(async function loadReports({ silent = false } = {}) {
    setIsLoadingReports(true);

    try {
      const nextReports = await ensureAccidentReports();
      setReports(nextReports);

      if (!silent) {
        flash("Latest reports loaded.");
      }
    } catch (error) {
      flash(error.message || "Could not load reports.");
    } finally {
      setIsLoadingReports(false);
    }
  }, [flash]);

  const loadContactMessages = useCallback(async function loadContactMessages({ silent = false } = {}) {
    setIsLoadingContacts(true);

    try {
      const data = await listContactMessages({
        search: contactSearch,
        seen: contactSeenFilter === "all" ? "" : contactSeenFilter,
      });
      setContactMessages(data.messages || []);
      setContactPagination(data.pagination || null);
      setContactUnseenCount(data.unseenCount || 0);

      if (!silent) {
        flash("Contact messages loaded.");
      }
    } catch (error) {
      flash(error.message || "Could not load contact messages.");
    } finally {
      setIsLoadingContacts(false);
    }
  }, [contactSearch, contactSeenFilter, flash]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      loadReports({ silent: true });
    }
  }, [isLoggedIn, isAdmin, loadReports]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin || activeView !== "community") {
      return;
    }

    getLeaderboard({ limit: 20 })
      .then((data) => setContributors(data.users || []))
      .catch((error) => flash(error.message || "Could not load contributors."));
  }, [activeView, flash, isAdmin, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin || activeView !== "messages") {
      return;
    }

    loadContactMessages({ silent: true });
  }, [activeView, isAdmin, isLoggedIn, loadContactMessages]);

  async function handleReview(id, status) {
    try {
      const updatedReport = await updateAccidentReportStatus(id, status);
      setReports((currentReports) =>
        currentReports.map((report) => (report.id === id ? updatedReport : report)),
      );
      flash(status === "approved" ? "Report approved and added to verified zones." : "Report declined and closed.");
    } catch (error) {
      flash(error.message || "Could not update report.");
    }
  }

  async function handleSaveBlackspot(id, updates) {
    try {
      const updatedReport = await updateAccidentReport(id, updates);
      setReports((currentReports) =>
        currentReports.map((report) => (report.id === id ? updatedReport : report)),
      );
      flash("Blackspot details updated.");
    } catch (error) {
      flash(error.message || "Could not update blackspot.");
    }
  }

  async function handleDeleteReport(id) {
    try {
      await deleteAccidentReport(id);
      setReports((currentReports) => currentReports.filter((report) => report.id !== id));
      flash("Report deleted from review data.");
    } catch (error) {
      flash(error.message || "Could not delete report.");
    }
  }

  async function handleMarkContactSeen(id) {
    try {
      const updatedMessage = await markContactMessageSeen(id);
      setContactMessages((currentMessages) =>
        currentMessages.map((message) => (message.id === id ? updatedMessage : message)),
      );
      setContactUnseenCount((count) => Math.max(0, count - 1));
      flash("Message marked as seen.");
    } catch (error) {
      flash(error.message || "Could not mark message as seen.");
    }
  }

  async function handleDeleteContactMessage(id) {
    try {
      const deletedMessage = await deleteContactMessageApi(id);
      setContactMessages((currentMessages) => currentMessages.filter((message) => message.id !== id));
      if (!deletedMessage.isSeen) {
        setContactUnseenCount((count) => Math.max(0, count - 1));
      }
      flash("Contact message deleted.");
    } catch (error) {
      flash(error.message || "Could not delete contact message.");
    }
  }

  async function handleBroadcast(event) {
    event.preventDefault();

    try {
      const userIds = broadcastDraft.userIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const result = await broadcastNotification({
        mode: broadcastDraft.mode,
        userIds,
        title: broadcastDraft.title,
        message: broadcastDraft.message,
      });

      setBroadcastDraft({ title: "", message: "", mode: "all", userIds: "" });
      flash(`Notification sent to ${result.createdCount || 0} user(s).`);
    } catch (error) {
      flash(error.message || "Could not send broadcast.");
    }
  }

  async function handleBonus(event) {
    event.preventDefault();

    try {
      await grantReputationBonus(bonusDraft.userId, bonusDraft.reason);
      setBonusDraft({ userId: "", reason: "" });
      const data = await getLeaderboard({ limit: 20 });
      setContributors(data.users || []);
      flash("Reputation bonus awarded.");
    } catch (error) {
      flash(error.message || "Could not award bonus.");
    }
  }

  function refreshReports() {
    loadReports();
  }

  function handleAdminLogout() {
    logout();
    window.location.assign("/");
  }

  if (!isLoggedIn) {
    return <AccessPanel type="login" onLogout={handleAdminLogout} />;
  }

  if (!isAdmin) {
    return <AccessPanel type="forbidden" onLogout={handleAdminLogout} />;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="min-h-screen lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">

        {/* ── SIDEBAR ── */}
        <aside className="relative overflow-hidden bg-slate-900 px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:px-5 lg:py-6">
          <div className="absolute -left-16 top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex h-full flex-col gap-5">

            {/* logo */}
            <div className="flex items-center gap-3 px-1 pb-3 border-b border-white/10">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-white shrink-0">
                <Icon name="shield" size={18} />
              </span>
              <div>
                <p className="text-sm font-extrabold tracking-tight">RouteRaksha</p>
                <p className="text-[10px] font-semibold text-slate-400">Admin Panel</p>
              </div>
            </div>

            {/* nav */}
            <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {navItems.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${
                      active
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon name={item.icon} size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* approval rate */}
            <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Approval Rate</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-extrabold">{summary.approvalRate}%</span>
                <span className="pb-1 text-xs font-semibold text-slate-400">approved</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700"
                  style={{ width: `${summary.approvalRate}%` }}
                />
              </div>
            </div>

            {/* user */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-300 shrink-0">
                  <Icon name="user" size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{user?.name || "RouteRaksha Admin"}</p>
                  <p className="truncate text-[11px] font-medium text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300 transition-all"
              >
                <Icon name="logout" size={14} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <section className="px-5 py-6 sm:px-7 lg:px-8 lg:py-7">

          {/* page header */}
          <header className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Safety operations</p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
                Admin Center
              </h1>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
              >
                <Icon name="home" size={14} />
                Home
              </Link>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="all">All severity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="relative">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search reports…"
                  className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-64 transition-all"
                />
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" size={15} />
                </span>
              </div>
              <button
                type="button"
                onClick={refreshReports}
                disabled={isLoadingReports}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                <Icon name="refresh" size={14} />
                {isLoadingReports ? "Loading..." : "Refresh"}
              </button>
            </div>
          </header>

          {/* toast */}
          {notice && (
            <div className="fixed right-5 top-5 z-50 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-xl animate-bounce">
              {notice}
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeView === "overview" && (
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard type="total" value={summary.total} />
                <StatCard type="pending" value={summary.pending} />
                <StatCard type="approved" value={summary.approved} />
                <StatCard type="high" value={summary.high} />
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <OrganicMap reports={reports} />
                <BarChart title="Severity distribution" helper="Risk mix" data={severityData} />
              </section>

              <section className="grid gap-5 xl:grid-cols-2">
                <DonutChart title="Review status" helper="Decision split" data={statusData} />
                <VerificationSignalChart
                  title="Verification quality"
                  helper="Real report values"
                  data={verificationSignalData}
                />
              </section>

              <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                {/* playbook */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin playbook</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-800 mb-5">What to do next</h2>
                  <div className="space-y-3">
                    {playbook.map((item, index) => (
                      <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-500 text-xs font-extrabold text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium leading-relaxed text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* recent reports */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest signals</p>
                      <h2 className="mt-1 text-lg font-extrabold text-slate-800">Recent reports</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView("review")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Open queue <Icon name="arrowRight" size={12} />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex flex-col gap-2.5 rounded-xl border border-slate-100 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{report.location}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">{report.type || "Road risk"} · {formatDate(report.createdAt)}</p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${severityBadge(report.severity)}`}>
                            {report.severity || "Medium"}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${statusBadge(report.status)}`}>
                            {report.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ── REVIEW QUEUE ── */}
          {activeView === "review" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verification desk</p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-800">Pending report queue</h2>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
                      Review user-submitted accident reports and decide what becomes visible as a verified safety signal.
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-bold text-amber-700">
                    <Icon name="clock" size={14} />
                    {pendingReports.length} pending
                  </span>
                </div>
              </div>

              {pendingReports.length ? (
                pendingReports.map((report) => (
                  <ReportCard key={report.id} report={report} onReview={handleReview} />
                ))
              ) : (
                <EmptyState
                  title="No pending reports right now."
                  copy="The queue is clear. New accident reports will appear here as users submit them from the report accident page."
                />
              )}

              {filteredReports.some((report) => normalize(report.status) !== "pending") && (
                <div className="pt-4">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Recently closed</p>
                  <div className="space-y-3">
                    {filteredReports
                      .filter((report) => normalize(report.status) !== "pending")
                      .slice(0, 4)
                      .map((report) => (
                        <ReportCard key={report.id} report={report} onReview={handleReview} />
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── BLACKSPOTS ── */}
          {activeView === "blackspots" && (
            <section className="space-y-6">
              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verified safety layer</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-800">Khargone-Indore blackspot zones</h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                    Source-backed corridor signals and admin-approved reports are used by RouteRaksha to warn users, plan safer routes and keep risky road conditions visible.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { label: "Route signals", value: blackspotLayerSummary.total, cls: "border border-indigo-200 bg-indigo-100 text-indigo-950" },
                      { label: "High severity", value: blackspotLayerSummary.highSeverity, cls: "border border-red-200 bg-red-100 text-red-950" },
                      { label: "Govt verified", value: blackspotLayerSummary.governmentVerified, cls: "border border-emerald-200 bg-emerald-100 text-emerald-950" },
                      { label: "Needs validation", value: blackspotLayerSummary.underReview, cls: "border border-amber-200 bg-amber-100 text-amber-950" },
                    ].map((m) => (
                      <div key={m.label} className={`rounded-xl p-4 ${m.cls}`}>
                        <p className="text-2xl font-extrabold">{m.value}</p>
                        <p className="mt-0.5 text-xs font-bold opacity-90">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <OrganicMap reports={blackspotLayerReports} />
              </div>

              {sourceBlackspots.length ? (
                <div>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Database source data</p>
                      <h2 className="mt-1 text-lg font-extrabold text-slate-800">Seeded and imported blackspots</h2>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      Read-only DB source layer
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {sourceBlackspots.map((report) => (
                      <SourceBlackspotCard key={report.id} report={report} />
                    ))}
                  </div>
                </div>
              ) : null}

              {editableApprovedReports.length ? (
                <div>
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Editable reports</p>
                    <h2 className="mt-1 text-lg font-extrabold text-slate-800">Admin-approved user blackspots</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {editableApprovedReports.map((report) => (
                      <BlackspotEditor
                        key={report.id}
                        report={report}
                        onSave={handleSaveBlackspot}
                        onDelete={handleDeleteReport}
                      />
                    ))}
                  </div>
                </div>
              ) : !sourceBlackspots.length ? (
                  <EmptyState
                    title="No verified blackspots yet."
                    copy="Approve reports from the review queue and they will become verified blackspot zones here."
                  />
                ) : (
                  <EmptyState
                    title="No approved user reports yet."
                    copy="Khargone-Indore source signals are live. Approved user reports will appear here for editing."
                  />
              )}
            </section>
          )}

          {activeView === "messages" && (
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Inbox</p>
                  <p className="mt-2 text-3xl font-extrabold text-indigo-700">{contactPagination?.total || contactMessages.length}</p>
                  <p className="mt-1 text-xs font-semibold text-indigo-700/70">Messages in current filter</p>
                </article>
                <article className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Unseen</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-700">{contactUnseenCount}</p>
                  <p className="mt-1 text-xs font-semibold text-amber-700/70">Needs admin review</p>
                </article>
                <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Status</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                    {contactUnseenCount ? "Open" : "Clear"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700/70">Contact desk health</p>
                </article>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact inbox</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-slate-800">User messages</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Messages sent from Contact Us are stored in database and shown here for admin review.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={contactSeenFilter}
                      onChange={(event) => setContactSeenFilter(event.target.value)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="all">All messages</option>
                      <option value="false">Unseen only</option>
                      <option value="true">Seen only</option>
                    </select>
                    <div className="relative">
                      <input
                        value={contactSearch}
                        onChange={(event) => setContactSearch(event.target.value)}
                        placeholder="Search messages..."
                        className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-72"
                      />
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon name="search" size={15} />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadContactMessages()}
                      disabled={isLoadingContacts}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Icon name="refresh" size={14} />
                      {isLoadingContacts ? "Loading..." : "Refresh"}
                    </button>
                  </div>
                </div>
              </div>

              {contactMessages.length ? (
                <div className="grid gap-4">
                  {contactMessages.map((message) => (
                    <article
                      key={message.id}
                      className={`rounded-2xl border bg-white p-5 shadow-sm ${
                        message.isSeen ? "border-slate-100" : "border-amber-200 ring-4 ring-amber-50"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                              message.isSeen
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {message.isSeen ? "Seen" : "Unseen"}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                              {message.topic}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{formatDate(message.createdAt)}</span>
                          </div>
                          <h3 className="mt-3 text-xl font-extrabold text-slate-800">{message.name}</h3>
                          <p className="mt-1 text-sm font-bold text-slate-500">{message.email}</p>
                          {message.userEmail && message.userEmail !== message.email && (
                            <p className="mt-1 text-xs font-semibold text-slate-400">Signed in as {message.userEmail}</p>
                          )}
                          <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-7 text-slate-600">
                            {message.message}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                          <button
                            type="button"
                            onClick={() => handleMarkContactSeen(message.id)}
                            disabled={message.isSeen}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Icon name="eye" size={14} />
                            Mark seen
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteContactMessage(message.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                          >
                            <Icon name="trash" size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={isLoadingContacts ? "Loading contact messages..." : "No contact messages found."}
                  copy="New messages from the Contact Us page will appear here for admin review."
                />
              )}
            </section>
          )}

          {activeView === "community" && (
            <section className="space-y-6">
              <div className="grid gap-5 xl:grid-cols-2">
                <form onSubmit={handleBroadcast} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin broadcast</p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-800">Send notification</h2>
                  <div className="mt-5 grid gap-3">
                    <select
                      value={broadcastDraft.mode}
                      onChange={(event) => setBroadcastDraft((draft) => ({ ...draft, mode: event.target.value }))}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
                    >
                      <option value="all">All users</option>
                      <option value="selected">Selected user IDs</option>
                    </select>
                    {broadcastDraft.mode === "selected" && (
                      <input
                        value={broadcastDraft.userIds}
                        onChange={(event) => setBroadcastDraft((draft) => ({ ...draft, userIds: event.target.value }))}
                        placeholder="Comma-separated user IDs"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
                      />
                    )}
                    <input
                      value={broadcastDraft.title}
                      onChange={(event) => setBroadcastDraft((draft) => ({ ...draft, title: event.target.value }))}
                      placeholder="Title"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
                    />
                    <textarea
                      value={broadcastDraft.message}
                      onChange={(event) => setBroadcastDraft((draft) => ({ ...draft, message: event.target.value }))}
                      placeholder="Message"
                      rows={4}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
                    />
                    <button className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white">
                      Send broadcast
                    </button>
                  </div>
                </form>

                <form onSubmit={handleBonus} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Reputation control</p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-800">Award admin bonus</h2>
                  <div className="mt-5 grid gap-3">
                    <select
                      value={bonusDraft.userId}
                      onChange={(event) => setBonusDraft((draft) => ({ ...draft, userId: event.target.value }))}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
                    >
                      <option value="">Choose contributor</option>
                      {contributors.map((contributor) => (
                        <option key={contributor.userId} value={contributor.userId}>
                          {contributor.name} - {contributor.reputationPoints} pts
                        </option>
                      ))}
                    </select>
                    <input
                      value={bonusDraft.reason}
                      onChange={(event) => setBonusDraft((draft) => ({ ...draft, reason: event.target.value }))}
                      placeholder="Reason"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
                    />
                    <button className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white">
                      Award +20 points
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Top contributors</p>
                <div className="mt-4 grid gap-3">
                  {contributors.map((contributor) => (
                    <div key={contributor.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                      <div>
                        <p className="font-extrabold text-slate-800">{contributor.name}</p>
                        <p className="text-xs font-bold text-slate-500">{contributor.trustLevel}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-slate-700">
                        {contributor.reputationPoints} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminPanel;
