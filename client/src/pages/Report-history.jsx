import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/home/Footer";
import HomeIcon from "../components/home/HomeIcon";
import { useAuth } from "../context/AuthContext";
import { readAccidentReports } from "../utils/reportStore";

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    mapPin: (
      <>
        <path d="M20 10c0 4.5-8 12-8 12S4 14.5 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9.5 12.5 11 14l4-4" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusClasses(status) {
  if (status === "approved") {
    return "border-[#9cec6d] bg-[#efffe8] text-[#173a0b]";
  }

  if (status === "declined") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getSeverityClasses(severity) {
  if (severity === "High") return "bg-red-500";
  if (severity === "Medium") return "bg-amber-400";
  return "bg-yellow-400";
}

function HistoryMap({ reports }) {
  const points = [
    { left: "16%", top: "62%" },
    { left: "34%", top: "38%" },
    { left: "58%", top: "55%" },
    { left: "76%", top: "30%" },
  ];

  return (
    <div className="relative min-h-72 overflow-hidden rounded-lg border border-[#d8e5d3] bg-slate-950 p-5 text-white">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.24)_1px,transparent_1px)] [background-size:34px_34px]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 260" fill="none">
        <path d="M20 190 C110 140 165 80 255 120 C345 160 390 130 500 60" stroke="rgba(255,255,255,0.2)" strokeWidth="18" strokeLinecap="round" />
        <path d="M20 190 C110 140 165 80 255 120 C345 160 390 130 500 60" stroke="#8ef35f" strokeWidth="4" strokeDasharray="14 12" strokeLinecap="round" />
      </svg>
      <div className="relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#baf89f]">Map history</p>
        <h2 className="mt-2 text-2xl font-black">Submitted blackspot footprint</h2>
      </div>
      {reports.slice(0, 4).map((report, index) => (
        <div
          key={report.id}
          className="absolute z-10 rounded-full bg-white p-1 shadow-[0_0_0_8px_rgba(255,255,255,0.12)]"
          style={points[index] || points[0]}
          title={report.location}
        >
          <span className={`block size-3 rounded-full ${getSeverityClasses(report.severity)}`} />
        </div>
      ))}
    </div>
  );
}

function ReportHistoryPage() {
  const { isLoggedIn, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("newest");

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    readAccidentReports()
      .then((nextReports) => {
        if (isMounted) {
          setReports(nextReports);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadError(error.message || "Could not load report history.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const userReports = useMemo(() => {
    if (!user?.email) return [];

    return reports
      .filter((report) => report.reporterEmail === user.email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports, user?.email]);

  const stats = useMemo(
    () => ({
      total: userReports.length,
      pending: userReports.filter((report) => report.status === "pending").length,
      approved: userReports.filter((report) => report.status === "approved").length,
      declined: userReports.filter((report) => report.status === "declined").length,
    }),
    [userReports],
  );

  const visibleReports = useMemo(() => {
    return userReports
      .filter((report) => statusFilter === "all" || report.status === statusFilter)
      .sort((a, b) => {
        if (sortMode === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }

        if (sortMode === "severity") {
          const score = { High: 0, Medium: 1, Low: 2 };
          return (score[a.severity] ?? 3) - (score[b.severity] ?? 3);
        }

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [sortMode, statusFilter, userReports]);

  if (!isLoggedIn) {
    return (
      <main className="motion-page min-h-[calc(100vh-4.75rem)] bg-[#fbfcfa] px-4 py-12 text-[#173a0b] sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#e5eedf] shadow-[0_24px_60px_rgba(16,47,0,0.1)] lg:grid-cols-[1fr_0.78fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="mb-6 grid size-12 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
              <Icon name="lock" className="size-6" strokeWidth={2.4} />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
              Report history access
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#173a0b] sm:text-5xl">
              Login required to view your report history.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#46623d]">
              Your accident reports are linked to your account, so sign in to track status and
              review submitted locations.
            </p>
          </div>

          <div className="grid content-center bg-[#fbfcfa] p-6 sm:p-8 lg:p-10">
            <Link
              to="/login"
              className="flex min-h-12 items-center justify-center rounded-full bg-[#173a0b] px-5 text-sm font-black text-white transition hover:bg-[#102f00]"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="mt-3 flex min-h-12 items-center justify-center rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
            >
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="motion-page bg-[#fbfcfa] text-[#173a0b]">
      <section className="bg-[#e5eedf] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
                User dashboard
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#173a0b] sm:text-5xl lg:text-6xl">
                Your report history
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#46623d]">
                Track every accident report you submitted, from admin review to approved
                blackspot data.
              </p>
            </div>

            <div className="rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-5 shadow-[0_18px_42px_rgba(16,47,0,0.08)]">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                  <Icon name="shield" className="size-5" strokeWidth={2.4} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#173a0b]">{user?.name}</p>
                  <p className="truncate text-xs font-semibold text-[#46623d]">{user?.email}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 overflow-hidden rounded-lg border border-[#d8e5d3]">
                {[
                  ["Total", stats.total],
                  ["Pending", stats.pending],
                  ["Approved", stats.approved],
                  ["Declined", stats.declined],
                ].map(([label, value], index) => (
                  <div key={label} className={`p-3 text-center ${index === 2 ? "bg-[#9cec6d]" : ""}`}>
                    <p className="text-xl font-black text-[#173a0b]">{value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#46623d]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loadError && (
            <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {loadError}
            </p>
          )}

          {userReports.length ? (
            <div className="grid gap-5">
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <HistoryMap reports={visibleReports} />
                <div className="rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_14px_35px_rgba(16,47,0,0.07)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#46623d]">
                        Filters
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-[#173a0b]">Timeline controls</h2>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="min-h-11 rounded-full border border-[#d8e5d3] bg-white px-4 text-sm font-black text-[#46623d] outline-none"
                      >
                        <option value="all">All status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                      </select>
                      <select
                        value={sortMode}
                        onChange={(event) => setSortMode(event.target.value)}
                        className="min-h-11 rounded-full border border-[#d8e5d3] bg-white px-4 text-sm font-black text-[#46623d] outline-none"
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="severity">Severity first</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {["pending", "approved", "declined"].map((status) => (
                      <div key={status} className={`rounded-lg border px-4 py-3 ${getStatusClasses(status)}`}>
                        <p className="text-xl font-black">{stats[status]}</p>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.12em]">{status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {visibleReports.map((report, index) => (
                <article
                  key={report.id}
                  className="relative rounded-lg border border-[#d8e5d3] bg-white p-5 shadow-[0_14px_35px_rgba(16,47,0,0.07)]"
                >
                  {index < visibleReports.length - 1 && (
                    <span className="absolute bottom-[-1.35rem] left-8 top-14 hidden w-px bg-[#d8e5d3] sm:block" />
                  )}
                  <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`size-2.5 rounded-full ${getSeverityClasses(report.severity)}`} />
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#46623d]">
                          {report.severity} severity
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${getStatusClasses(
                            report.status,
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-black leading-tight text-[#173a0b]">
                        {report.location}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-[#46623d]">{report.type}</p>
                      <p className="mt-4 max-w-4xl text-sm font-semibold leading-7 text-[#46623d]">
                        {report.description}
                      </p>
                      {report.notes && (
                        <p className="mt-3 max-w-4xl rounded-lg bg-[#f1f6f0] px-4 py-3 text-sm font-semibold leading-7 text-[#46623d]">
                          {report.notes}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {report.accidentTime && (
                          <span className="rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-black text-[#46623d]">
                            {report.accidentTime}
                          </span>
                        )}
                        {report.lightCondition && (
                          <span className="rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-black text-[#46623d]">
                            {report.lightCondition}
                          </span>
                        )}
                        {report.confidenceScore && (
                          <span className="rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-black text-[#46623d]">
                            {report.confidenceScore}% confidence
                          </span>
                        )}
                      </div>
                      {report.imageData && (
                        <img
                          src={report.imageData}
                          alt=""
                          className="mt-4 h-44 w-full max-w-xl rounded-lg border border-[#d8e5d3] object-cover"
                        />
                      )}
                    </div>

                    <div className="grid gap-3 rounded-lg bg-[#f1f6f0] p-4 lg:min-w-64">
                      <div className="flex items-center gap-3">
                        <Icon name="calendar" className="size-4 text-[#173a0b]" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#46623d]">
                            Submitted
                          </p>
                          <p className="text-sm font-black text-[#173a0b]">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="clock" className="size-4 text-[#173a0b]" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#46623d]">
                            Last updated
                          </p>
                          <p className="text-sm font-black text-[#173a0b]">
                            {formatDate(report.updatedAt)}
                          </p>
                        </div>
                      </div>
                      {report.reviewedBy && (
                        <div className="flex items-center gap-3">
                          <Icon name="shield" className="size-4 text-[#173a0b]" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#46623d]">
                              Reviewed by
                            </p>
                            <p className="text-sm font-black text-[#173a0b]">{report.reviewedBy}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
              {!visibleReports.length && (
                <div className="rounded-lg border border-dashed border-[#d8e5d3] bg-white p-8 text-center">
                  <p className="text-lg font-black text-[#173a0b]">No reports match this filter.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#e5eedf] shadow-[0_24px_60px_rgba(16,47,0,0.1)]">
              <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
                <div className="bg-[#173a0b] p-8 text-white">
                  <span className="grid size-14 place-items-center rounded-2xl bg-[#9cec6d] text-[#102f00]">
                    <Icon name="file" className="size-7" strokeWidth={2.4} />
                  </span>
                  <h2 className="mt-6 text-4xl font-black leading-tight">No reports yet.</h2>
                  <p className="mt-4 text-sm font-semibold leading-7 text-white/75">
                    When you submit an accident report, it will appear here with its review status
                    and update timeline.
                  </p>
                </div>

                <div className="grid content-center p-8">
                  <div className="rounded-lg bg-[#fbfcfa] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#46623d]">
                      Start contributing
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-[#173a0b]">
                      Help others avoid risky stretches.
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-7 text-[#46623d]">
                      Add the location, severity, and details of a dangerous road section. The
                      report enters review before becoming route awareness.
                    </p>
                    <Link
                      to="/report-accident"
                      className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173a0b] px-6 text-sm font-black text-white hover:bg-[#102f00]"
                    >
                      <HomeIcon name="file" className="size-4" />
                      Report an accident
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default ReportHistoryPage;
