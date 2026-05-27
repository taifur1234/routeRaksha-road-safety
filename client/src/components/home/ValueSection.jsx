import HomeIcon from "./HomeIcon";

const values = [
  {
    title: "Blackspot heatmap",
    text: "Risky road sections appear as clear heat zones around the selected route.",
    icon: "map",
  },
  {
    title: "Safety score",
    text: "Compare routes by risk, not only by time and distance.",
    icon: "route",
  },
  {
    title: "Verified reports",
    text: "Community accident reports enter review before becoming route awareness.",
    icon: "file",
  },
  {
    title: "Drive-ready alerts",
    text: "Know where to slow down before a risky signal, merge, or turn arrives.",
    icon: "alert",
  },
];

function ValueSection() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
              Safety signals
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#173a0b]">
              A route planner built for caution.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-[#46623d]">
              The home screen is not just a promise. RouteRaksha gives drivers a practical
              safety layer they can read quickly before choosing a route.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((item, index) => (
              <article
                key={item.title}
                className={`rounded-lg border border-[#d8e5d3] p-5 shadow-[0_12px_30px_rgba(16,47,0,0.06)] ${
                  index === 1 ? "bg-indigo-500 text-white" : "bg-[#fbfcfa]"
                }`}
              >
                <span
                  className={`mb-5 grid size-11 place-items-center rounded-lg ${
                    index === 1 ? "bg-white/15 text-white" : "bg-indigo-500 text-white"
                  }`}
                >
                  <HomeIcon name={item.icon} className="size-5" strokeWidth={2.3} />
                </span>
                <h3 className={`text-lg font-black ${index === 1 ? "text-white" : "text-slate-950"}`}>
                  {item.title}
                </h3>
                <p className={`mt-3 text-sm font-semibold leading-7 ${index === 1 ? "text-indigo-100" : "text-slate-600"}`}>
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
