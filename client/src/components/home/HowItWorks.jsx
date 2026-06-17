import HomeIcon from "./HomeIcon";

const steps = [
  {
    title: "Capture the trip",
    text: "Origin, destination, and route options become the base layer for safety comparison.",
    icon: "route",
  },
  {
    title: "Score the corridor",
    text: "Blackspots, report severity, and route proximity turn into a readable safety score.",
    icon: "map",
  },
  {
    title: "Choose with context",
    text: "Drivers see what the faster route costs, where to slow down, and when rerouting helps.",
    icon: "alert",
  },
  {
    title: "Improve the network",
    text: "Verified community reports keep future route intelligence sharper over time.",
    icon: "file",
  },
];

function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#08111f] px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="absolute inset-0 rr-grid opacity-15" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 sm:mb-10 sm:gap-6 lg:grid-cols-[0.78fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
              Operating workflow
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:mt-4 sm:text-5xl">
              The route becomes a safety briefing.
            </h2>
          </div>
          <p className="hidden max-w-2xl text-base font-semibold leading-8 text-slate-300 sm:block lg:justify-self-end">
            A normal map answers "how fast?" RouteRaksha answers the startup-grade product
            question: "what is the safest decision right now?"
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/20 sm:p-5 ${
                index === 3 ? "hidden lg:block" : ""
              }`}
            >
              <div className="absolute right-4 top-4 text-4xl font-black leading-none text-white/[0.04] sm:text-5xl">
                0{index + 1}
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-cyan-300 text-slate-950 shadow-[0_14px_30px_rgba(20,184,216,0.18)] sm:size-12">
                <HomeIcon name={step.icon} className="size-5" strokeWidth={2.35} />
              </span>
              <h3 className="mt-5 text-lg font-black text-white sm:mt-7 sm:text-xl">{step.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300 sm:mt-3 sm:leading-7">{step.text}</p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10 sm:mt-7">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                  style={{ width: `${(index + 1) * 25}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
