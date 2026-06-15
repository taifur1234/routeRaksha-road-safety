import { Link } from "react-router-dom";
import HomeIcon from "./HomeIcon";

const impactStats = [
  ["78/100", "route safety score"],
  ["2", "blackspots avoided"],
  ["4 min", "extra for safer route"],
];

const cockpitRows = [
  ["Current route", "24 min", "5 risk zones", "High", "bg-[#f0645a]"],
  ["Recommended", "28 min", "2 risk zones", "Balanced", "bg-[#7ce7b2]"],
  ["Calm corridor", "34 min", "1 risk zone", "Low", "bg-[#f3b544]"],
];

function HomeHero() {
  return (
    <section className="rr-mobile-hero rr-road-band isolate min-h-[calc(92svh-4.7rem)] text-white">
      <img
        src="/images/open-road-route.jpg"
        alt="Open highway route for blackspot-aware planning"
        className="rr-hero-image absolute inset-0 h-full w-full object-cover opacity-24 mix-blend-screen"
        loading="eager"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,32,0.98)_0%,rgba(16,24,32,0.87)_52%,rgba(15,61,52,0.62)_100%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-16 lg:pt-16">
        <div className="self-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#baf7da] backdrop-blur">
            <HomeIcon name="shield" className="size-4" strokeWidth={2.4} />
            Blackspot aware route planner
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.96] text-white sm:text-6xl lg:text-7xl">
            Plan safer routes before the road surprises you.
          </h1>

          <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-[#dce8e5] sm:text-lg">
            RouteRaksha turns accident reports, risky turns, emergency context, and community
            verification into one clear safety cockpit for everyday travel.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/plan-route"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#7ce7b2] px-6 text-sm font-black text-[#101820] shadow-[0_18px_42px_rgba(124,231,178,0.24)] hover:bg-[#9cf0c7]"
            >
              <HomeIcon name="route" className="size-4" />
              Plan safer route
            </Link>
            <Link
              to="/report-accident"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-black text-white backdrop-blur hover:bg-white/18"
            >
              <HomeIcon name="file" className="size-4" />
              Report blackspot
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {impactStats.map(([value, label]) => (
              <div key={label} className="border-l border-white/18 bg-white/[0.06] px-4 py-3 backdrop-blur">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/62">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="self-center">
          <div className="rr-glass relative overflow-hidden p-3 text-[#101820]">
            <div className="grid overflow-hidden bg-[#f8fbfa] lg:grid-cols-[1.02fr_0.98fr]">
              <div className="relative min-h-[31rem] overflow-hidden">
                <img
                  src="/images/highway-safety-overlay.jpg"
                  alt="Route map with blackspot risk overlay"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-[#f8fbfa]/72" />
                <div className="absolute inset-0 rr-grid opacity-80" />

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 540 500" fill="none">
                  <path
                    d="M58 418 C140 334 162 208 270 225 C384 245 380 352 482 236 C516 197 522 140 528 88"
                    stroke="rgba(16,24,32,0.16)"
                    strokeLinecap="round"
                    strokeWidth="36"
                  />
                  <path
                    className="rr-route-line"
                    d="M58 418 C140 334 162 208 270 225 C384 245 380 352 482 236 C516 197 522 140 528 88"
                    stroke="#7ce7b2"
                    strokeDasharray="20 14"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                  <circle className="rr-risk-pulse" cx="270" cy="225" fill="#f0645a" opacity="0.32" r="36" />
                  <circle cx="270" cy="225" fill="#fff" r="11" stroke="#f0645a" strokeWidth="4" />
                  <circle className="rr-risk-pulse" cx="482" cy="236" fill="#f3b544" opacity="0.38" r="31" />
                  <circle cx="482" cy="236" fill="#fff" r="11" stroke="#b7791f" strokeWidth="4" />
                </svg>

                <div className="absolute left-5 top-5 border border-white/80 bg-white/90 px-4 py-3 shadow-[0_16px_38px_rgba(16,24,32,0.14)] backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#637083]">
                    Driver alert
                  </p>
                  <p className="mt-1 text-sm font-black text-[#101820]">Sharp turn in 600 m</p>
                </div>

                <div className="absolute bottom-5 left-5 right-5 grid gap-3 border border-white/80 bg-white/92 p-4 shadow-[0_22px_50px_rgba(16,24,32,0.16)] backdrop-blur sm:grid-cols-3">
                  {[
                    ["Risk", "Medium"],
                    ["Help", "1.8 km"],
                    ["Reports", "18"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xl font-black text-[#101820]">{value}</p>
                      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.1em] text-[#637083]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="bg-[#101820] p-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#baf7da]">
                    Live decision board
                  </p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-[#baf7da]">
                    AI + reports
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight text-white">
                  See what speed alone hides.
                </h2>

                <div className="mt-6 grid gap-3">
                  {cockpitRows.map(([name, time, zones, risk, dot]) => (
                    <div
                      key={name}
                      className={`border px-4 py-3 ${
                        name === "Recommended"
                          ? "border-[#7ce7b2] bg-[#7ce7b2] text-[#101820] shadow-[0_18px_38px_rgba(124,231,178,0.2)]"
                          : "border-white/10 bg-white/10 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black">{name}</p>
                        <span className={`size-2.5 rounded-full ${dot}`} />
                      </div>
                      <p className="mt-1 text-xs font-bold opacity-80">
                        {time} / {zones} / {risk}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#baf7da]">
                    Best next action
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#dce8e5]">
                    Take the recommended route and avoid the market crossing cluster.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
