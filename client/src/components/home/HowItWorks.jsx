import HomeIcon from "./HomeIcon";

const steps = [
  {
    title: "Start with account",
    text: "Sign in so route planning and reports stay connected to one verified user.",
    icon: "user",
  },
  {
    title: "Add the journey",
    text: "Enter pickup and destination, then compare route options with safety context.",
    icon: "route",
  },
  {
    title: "Read the risk",
    text: "Blackspot zones, report counts, and severity cues stay visible before travel.",
    icon: "map",
  },
  {
    title: "Improve the layer",
    text: "Submit accident details so future routes become more useful for everyone.",
    icon: "file",
  },
];

function HowItWorks() {
  return (
    <section className="bg-[#f1f6f0] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[#173a0b]">
              Four small steps before a safer decision.
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-7 text-[#46623d]">
            RouteRaksha keeps the flow familiar, but adds road-risk context where normal
            navigation usually stays silent.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-5 shadow-[0_12px_30px_rgba(16,47,0,0.06)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-lg bg-indigo-500 text-white shadow-[0_12px_24px_rgba(99,102,241,0.22)]">
                  <HomeIcon name={step.icon} className="size-5" strokeWidth={2.3} />
                </span>
                <span className="text-sm font-black text-[#46623d]">0{index + 1}</span>
              </div>
              <h3 className="text-lg font-black text-[#173a0b]">{step.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#46623d]">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
