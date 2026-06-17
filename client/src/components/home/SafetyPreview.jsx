const insights = [
  ["Risk zones", "2 flagged", "text-red-500"],
  ["Route risk", "Medium", "text-amber-500"],
  ["Safety score", "78/100", "text-emerald-500"],
  ["Nearest help", "1.8 km", "text-cyan-600"],
];

function SafetyPreview() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(7,17,31,0.11)] lg:grid-cols-[0.86fr_1.14fr]">
        <div className="p-5 sm:p-8 lg:p-10">
          <p className="rr-kicker text-xs font-black uppercase">Product preview</p>
          <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:mt-4 sm:text-5xl">
            Less noise. More signal before the road gets risky.
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">
            The interface keeps the important bits visible: danger zones, severity, route
            tradeoffs, and the action a driver should take next.
          </p>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
            {insights.map(([label, value, color], index) => (
              <div
                key={label}
                className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${
                  index > 1 ? "hidden sm:block" : ""
                }`}
              >
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white sm:mt-8 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
              Decision summary
            </p>
            <p className="mt-3 text-base font-black leading-7 sm:text-lg">
              Add 4 minutes, avoid 3 high-confidence blackspot reports.
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-[32rem] overflow-hidden bg-slate-100 md:block">
          <img
            src="/images/risk-score-preview.jpg"
            alt="Route risk dashboard preview"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-white/70" />
          <div className="absolute inset-0 rr-grid opacity-70" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 520" fill="none">
            <path
              d="M70 410 C175 302 255 180 374 206 C500 234 516 334 650 214 C707 163 730 112 742 72"
              stroke="rgba(7,17,31,0.13)"
              strokeWidth="36"
              strokeLinecap="round"
            />
            <path
              className="rr-route-line"
              d="M70 410 C175 302 255 180 374 206 C500 234 516 334 650 214 C707 163 730 112 742 72"
              stroke="#18c28f"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="20 14"
            />
            <circle className="rr-risk-pulse" cx="374" cy="206" r="34" fill="#ef4d5c" opacity="0.26" />
            <circle cx="374" cy="206" r="11" fill="#fff" stroke="#ef4d5c" strokeWidth="4" />
            <circle className="rr-risk-pulse" cx="650" cy="214" r="30" fill="#f3b23b" opacity="0.32" />
            <circle cx="650" cy="214" r="11" fill="#fff" stroke="#b7791f" strokeWidth="4" />
          </svg>

          <div className="absolute left-5 top-5 rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_16px_38px_rgba(7,17,31,0.14)] backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Report cluster
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">18 reports near signal</p>
          </div>

          <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_22px_50px_rgba(7,17,31,0.18)] backdrop-blur sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Safer suggestion
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">Take Route B</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Lower severity mix with hospital coverage nearby.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-5 py-4 text-center">
              <p className="text-3xl font-black text-emerald-600">+31%</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                safer
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SafetyPreview;
