function SafetyPreview() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-300">
            Safety preview
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight">
            The map becomes a road-risk briefing.
          </h2>
          <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-white/75">
            RouteRaksha shows the important bits first: where the dangerous stretch is, how
            serious it looks, and whether a calmer route is available.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["2 zones", "Blackspots"],
              ["Medium", "Route risk"],
              ["78/100", "Safety score"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[26rem] overflow-hidden bg-[#e5eedf]">
          <img
            src="/images/highway-safety-overlay.jpg"
            alt="Highway route with safety overlays"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-slate-50/70" />
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(99,102,241,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.11)_1px,transparent_1px)] [background-size:48px_48px]" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 430" fill="none">
            <path
              d="M70 330 C180 235 250 150 350 170 C480 197 510 282 640 188 C698 146 720 105 730 76"
              stroke="rgba(99,102,241,0.2)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M70 330 C180 235 250 150 350 170 C480 197 510 282 640 188 C698 146 720 105 730 76"
              stroke="#4f46e5"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="18 14"
            />
            <circle className="safety-preview-blackspot-halo" cx="350" cy="170" r="25" fill="#8a3d58" opacity="0.2" />
            <circle cx="350" cy="170" r="10" fill="#fbfcfa" stroke="#8a3d58" strokeWidth="3" />
            <circle className="safety-preview-blackspot-halo safety-preview-blackspot-halo-alt" cx="640" cy="188" r="22" fill="#e4b84d" opacity="0.3" />
            <circle cx="640" cy="188" r="10" fill="#fbfcfa" stroke="#b88416" strokeWidth="3" />
          </svg>

          <div className="absolute left-5 top-5 rounded-lg bg-[#fbfcfa] px-4 py-3 shadow-[0_12px_30px_rgba(16,47,0,0.12)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#46623d]">
              Report cluster
            </p>
            <p className="mt-1 text-sm font-black text-[#173a0b]">18 reports near signal</p>
          </div>

          <div className="absolute bottom-5 right-5 w-64 rounded-lg bg-[#fbfcfa] p-4 shadow-[0_16px_35px_rgba(16,47,0,0.14)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#46623d]">
              Safer suggestion
            </p>
            <p className="mt-2 text-xl font-black text-[#173a0b]">Take Route B</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
              Adds 4 minutes, avoids 3 blackspot reports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SafetyPreview;
