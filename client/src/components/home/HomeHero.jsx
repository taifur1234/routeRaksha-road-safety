import { Link } from "react-router-dom";
import HomeIcon from "./HomeIcon";

const metrics = [
  ["3", "route choices"],
  ["78", "safety score"],
  ["2", "risk zones"],
];

function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#e5eedf]">
      <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-indigo-700 shadow-sm backdrop-blur">
            <HomeIcon name="shield" className="size-4" strokeWidth={2.4} />
            Blackspot-aware route planning
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Know the risky stretch before the road does.
          </h1>

          <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">
            RouteRaksha turns blackspot reports, road context, and route choices into a calm
            safety layer for everyday travel.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/plan-route"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173a0b] px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,47,0,0.18)] hover:bg-[#102f00]"
            >
              <HomeIcon name="route" className="size-4" />
              Plan safer route
            </Link>
            <Link
              to="/report-accident"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#173a0b] bg-transparent px-6 text-sm font-black text-[#173a0b] hover:bg-[#d8e8d1]"
            >
              <HomeIcon name="file" className="size-4" />
              Report black spot
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#fbfcfa]">
            {metrics.map(([value, label], index) => (
              <div key={label} className={`p-4 ${index === 1 ? "bg-indigo-100" : ""}`}>
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="grid gap-0 lg:grid-cols-[0.72fr_1fr]">
              <div className="bg-slate-950 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">
                  Live safety board
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight">
                  Route B is safer by 31%.
                </h2>
                <div className="mt-6 grid gap-3">
                  {[
                    ["Fastest", "24 min", "5 blackspots", "High"],
                    ["Recommended", "28 min", "2 blackspots", "Medium"],
                    ["Safer", "34 min", "1 blackspot", "Low"],
                  ].map(([name, time, spots, risk]) => (
                    <div
                      key={name}
                      className={`rounded-lg border px-4 py-3 ${
                        name === "Recommended"
                          ? "border-indigo-300 bg-indigo-500 text-white shadow-[0_16px_35px_rgba(99,102,241,0.28)]"
                          : "border-white/10 bg-white/5 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black">{name}</p>
                        <p className="text-xs font-black">{risk}</p>
                      </div>
                      <p className="mt-1 text-xs font-semibold opacity-80">
                        {time} / {spots}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[30rem] overflow-hidden">
                <img
                  src="/images/open-road-route.jpg"
                  alt="Open highway used for route safety planning"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-slate-50/75" />
                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(99,102,241,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.11)_1px,transparent_1px)] [background-size:46px_46px]" />

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 430" fill="none">
                  <path
                    d="M55 340 C145 260 180 165 270 180 C365 197 374 290 480 205 C515 177 530 138 538 94"
                    stroke="rgba(99,102,241,0.18)"
                    strokeWidth="28"
                    strokeLinecap="round"
                  />
                  <path
                    d="M55 340 C145 260 180 165 270 180 C365 197 374 290 480 205 C515 177 530 138 538 94"
                    stroke="#4f46e5"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="18 14"
                  />
                  <circle cx="270" cy="180" r="24" fill="#8a3d58" opacity="0.18" />
                  <circle cx="270" cy="180" r="10" fill="#fbfcfa" stroke="#8a3d58" strokeWidth="3" />
                  <circle cx="480" cy="205" r="22" fill="#e4b84d" opacity="0.25" />
                  <circle cx="480" cy="205" r="10" fill="#fbfcfa" stroke="#b88416" strokeWidth="3" />
                </svg>

                <div className="absolute left-5 top-5 rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Alert
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">Slow near signal</p>
                </div>

                <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.16)] backdrop-blur sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500">Risk zones</p>
                    <p className="mt-1 text-lg font-black text-slate-950">2 flagged</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">Suggested speed</p>
                    <p className="mt-1 text-lg font-black text-[#b88416]">35 km/h</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">Confidence</p>
                    <p className="mt-1 text-lg font-black text-slate-950">92%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
