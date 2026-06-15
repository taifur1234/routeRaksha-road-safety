import { Link, useLocation } from "react-router-dom";
import HomeIcon from "../components/home/HomeIcon";

function NotFoundPage() {
  const location = useLocation();

  return (
    <main className="motion-page rr-not-found min-h-[calc(100vh-4.75rem)] overflow-hidden bg-[#fbfcfa] px-4 py-10 text-[#173a0b] sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8e5d3] bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#18a999] shadow-sm backdrop-blur">
            <HomeIcon name="alert" className="size-4" strokeWidth={2.4} />
            Route not found
          </p>

          <h1 className="mt-6 max-w-3xl text-6xl font-black leading-[0.9] tracking-tight text-[#101820] sm:text-7xl lg:text-8xl">
            404
          </h1>
          <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#173a0b] sm:text-5xl">
            This road is not on our safety map.
          </h2>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[#46623d]">
            The page you tried to open does not exist, moved away, or was typed like a risky shortcut. RouteRaksha can get you back to a safer path.
          </p>

          <div className="mt-5 max-w-xl rounded-lg border border-[#d8e5d3] bg-white/90 p-4 shadow-[0_18px_55px_rgba(16,24,32,0.08)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#78936d]">
              Requested path
            </p>
            <p className="mt-2 break-all font-mono text-sm font-black text-[#173a0b]">
              {location.pathname}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173a0b] px-6 text-sm font-black text-white"
            >
              <HomeIcon name="shield" className="size-4" />
              Back to home
            </Link>
            <Link
              to="/plan-route"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d8e5d3] bg-white px-6 text-sm font-black text-[#173a0b]"
            >
              <HomeIcon name="route" className="size-4" />
              Plan route
            </Link>
            <Link
              to="/report-accident"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d8e5d3] bg-white px-6 text-sm font-black text-[#173a0b]"
            >
              <HomeIcon name="file" className="size-4" />
              Report blackspot
            </Link>
          </div>
        </div>

        <div className="relative min-h-[32rem]">
          <div className="rr-404-map absolute inset-0 overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#101820] shadow-[0_32px_90px_rgba(16,24,32,0.22)]">
            <div className="absolute inset-0 rr-grid opacity-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(124,231,178,0.2),transparent_26rem),linear-gradient(135deg,rgba(16,24,32,0.98),rgba(15,61,52,0.9))]" />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 560" fill="none">
              <path
                d="M72 464 C150 360 230 360 300 282 C375 198 454 198 526 108"
                stroke="rgba(255,255,255,0.15)"
                strokeLinecap="round"
                strokeWidth="42"
              />
              <path
                className="rr-404-route"
                d="M72 464 C150 360 230 360 300 282 C375 198 454 198 526 108"
                stroke="#7ce7b2"
                strokeDasharray="22 18"
                strokeLinecap="round"
                strokeWidth="10"
              />
              <path
                className="rr-404-broken"
                d="M506 122 544 84 M548 122 510 84"
                stroke="#f0645a"
                strokeLinecap="round"
                strokeWidth="14"
              />
              <circle className="rr-404-pulse" cx="300" cy="282" r="40" fill="#f3b544" opacity="0.32" />
              <circle cx="300" cy="282" r="12" fill="#ffffff" stroke="#f3b544" strokeWidth="4" />
              <circle className="rr-404-pulse rr-404-pulse-alt" cx="526" cy="108" r="42" fill="#f0645a" opacity="0.3" />
              <circle cx="526" cy="108" r="12" fill="#ffffff" stroke="#f0645a" strokeWidth="4" />
            </svg>

            <div className="rr-404-car absolute left-[9%] top-[78%] grid size-12 place-items-center rounded-full border-4 border-white bg-[#7ce7b2] text-[#101820] shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
              <HomeIcon name="route" className="size-5" strokeWidth={2.5} />
            </div>

            <div className="absolute left-5 top-5 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#baf7da]">
                Safety system
              </p>
              <p className="mt-1 text-sm font-black">Recalculating path...</p>
            </div>

            <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded-lg border border-white/10 bg-white/10 p-4 text-white backdrop-blur sm:grid-cols-3">
              {[
                ["404", "missing page"],
                ["0", "safe matches"],
                ["3", "recovery routes"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
