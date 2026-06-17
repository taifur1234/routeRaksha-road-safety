import HomeIcon from "./HomeIcon";

const values = [
  {
    title: "Blackspot intelligence",
    text: "Accident-prone stretches are grouped, scored, and shown directly around the route.",
    icon: "map",
    stat: "160+ mapped zones",
  },
  {
    title: "Route risk scoring",
    text: "Every route can be compared by time, distance, severity mix, and safer alternatives.",
    icon: "route",
    stat: "100-point safety score",
  },
  {
    title: "Community verification",
    text: "Reports stay useful because submissions move through review before shaping public alerts.",
    icon: "file",
    stat: "review-first data",
  },
  {
    title: "Drive-ready warnings",
    text: "Short, readable alerts help drivers slow down before a risky signal, turn, or merge.",
    icon: "alert",
    stat: "early caution window",
  },
];

function ValueSection() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 sm:gap-9 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="rr-kicker text-xs font-black uppercase">Safety OS</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:mt-4 sm:text-5xl">
              A serious product layer for real road decisions.
            </h2>
            <p className="mt-4 max-w-lg text-sm font-semibold leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">
              RouteRaksha feels like a startup product because it behaves like one: focused
              information, clear tradeoffs, and workflows built around trust.
            </p>

            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(7,17,31,0.08)] sm:block lg:mt-7">
              <div className="grid grid-cols-3 divide-x divide-slate-200">
                {[
                  ["Live", "alerts"],
                  ["AI", "risk layer"],
                  ["Admin", "review"],
                ].map(([value, label]) => (
                  <div key={label} className="p-4 text-center">
                    <p className="text-xl font-black text-slate-950">{value}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((item, index) => (
              <article
                key={item.title}
                className={`rr-card rounded-2xl p-4 transition sm:p-5 ${
                  index > 1 ? "hidden sm:block" : ""
                } ${
                  index === 1 ? "bg-slate-950 text-white" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl ${
                      index === 1 ? "bg-cyan-300 text-slate-950" : "bg-slate-950 text-white"
                    }`}
                  >
                    <HomeIcon name={item.icon} className="size-5" strokeWidth={2.35} />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
                      index === 1 ? "bg-white/10 text-cyan-100" : "bg-cyan-50 text-cyan-700"
                    }`}
                  >
                    {item.stat}
                  </span>
                </div>
                <h3 className={`mt-5 text-lg font-black sm:mt-7 sm:text-xl ${index === 1 ? "text-white" : "text-slate-950"}`}>
                  {item.title}
                </h3>
                <p className={`mt-2 text-sm font-semibold leading-6 sm:mt-3 sm:leading-7 ${index === 1 ? "text-slate-300" : "text-slate-600"}`}>
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueSection;
