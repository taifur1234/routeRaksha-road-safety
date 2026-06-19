import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/home/Footer";

const partners = ["SafeCommute", "Indore Riders", "CityWatch", "RoadHelp", "Transit Lab"];

const useCases = [
  "Daily commuters checking accident-prone turns before leaving home.",
  "Families choosing calmer routes for school, office, and late-night travel.",
  "Local communities reporting unsafe road sections so others can slow down early.",
];

const stats = [
  { value: "100K+", label: "Road risk checks" },
  { value: "5,000+", label: "Community reports" },
  { value: "160", label: "Mapped zones" },
];

const resources = [
  {
    title: "Risk score preview",
    text: "Compare route choices with a quick safety view before you start moving.",
    image: "/images/risk-score-preview-card.png",
    to: "/plan-route",
  },
  {
    title: "Report black spots",
    text: "Share accident locations and help the safety layer get sharper for everyone.",
    image: "/images/report-blackspots-card.png",
    to: "/report-accident",
  },
  {
    title: "Safer travel habits",
    text: "Use road context to slow down, reroute, or stay alert near risky stretches.",
    image: "/images/safer-travel-habits-card.png",
    to: "/contact",
  },
];

function AboutPage() {
  const [isOverviewPlaying, setIsOverviewPlaying] = useState(false);

  return (
    <main className="motion-page bg-slate-50 text-slate-900">
      <section className="relative isolate overflow-hidden bg-slate-100">
        <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/80 to-transparent" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
          <div>
            <p className="inline-flex rounded-full border border-indigo-100 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-indigo-700 shadow-sm backdrop-blur">
              Champions of safer roads
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              What is RouteRaksha?
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-slate-600">
              RouteRaksha helps people spot accident-prone roads, compare safer route
              choices, and submit local reports that make travel awareness stronger.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/plan-route"
                className="flex min-h-11 items-center justify-center rounded-full bg-indigo-500 px-6 text-sm font-black text-white hover:bg-indigo-600"
              >
                Plan your safer route
              </Link>
              <Link
                to="/report-accident"
                className="flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-black text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Report a black spot
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src="/images/about-blackspot-road.png"
              alt="Black spot warning road safety illustration"
              className="h-[18rem] w-full rounded-2xl object-cover shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:h-[24rem]"
              loading="eager"
            />
            <div className="absolute -bottom-5 left-5 grid w-[calc(100%-2.5rem)] grid-cols-3 overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur">
              <div className="p-4 text-center">
                <p className="text-xl font-black text-slate-950">AI</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Risk layer</p>
              </div>
              <div className="bg-indigo-100 p-4 text-center">
                <p className="text-xl font-black text-indigo-950">Live</p>
                <p className="mt-1 text-xs font-bold text-indigo-700">Reports</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xl font-black text-slate-950">Map</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Awareness</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-9 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-black text-slate-950 sm:text-3xl">
            Communities using RouteRaksha
          </h2>
          <div className="mt-7 grid grid-cols-2 items-center gap-5 text-center sm:grid-cols-5">
            {partners.map((partner) => (
              <p key={partner} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm font-black text-slate-700 shadow-sm sm:text-base">
                {partner}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950">
          What does RouteRaksha do?
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
          It adds a safety layer to route planning. Instead of only checking distance and
          time, users can understand accident risk, blackspot history, and community alerts.
        </p>

        <div className="mx-auto mt-8 hidden max-w-4xl overflow-hidden rounded-lg bg-slate-950 text-left shadow-[0_22px_50px_rgba(15,23,42,0.18)] lg:block">
          <div className="relative min-h-[18rem] sm:min-h-[25rem]">
            {isOverviewPlaying ? (
              <div className="route-overview-video absolute inset-0 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(99,102,241,0.32),transparent_30%),linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#111827_100%)]" />
                <div className="absolute inset-x-8 top-8 flex items-center justify-between gap-4 text-white">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">
                      Now playing
                    </p>
                    <p className="mt-2 text-xl font-black sm:text-2xl">
                      RouteRaksha overview
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOverviewPlaying(false)}
                    className="rounded-full border border-white/30 px-4 py-2 text-xs font-black text-white hover:bg-white/10"
                  >
                    Replay poster
                  </button>
                </div>

                <div className="route-overview-map absolute left-8 right-8 top-[7.5rem] h-36 rounded-lg border border-white/10 bg-white/10 p-5 shadow-inner sm:h-48">
                  <span className="route-overview-road route-overview-road-a" />
                  <span className="route-overview-road route-overview-road-b" />
                  <span className="route-overview-road route-overview-road-c" />
                  <span className="route-overview-pin route-overview-pin-a" />
                  <span className="route-overview-pin route-overview-pin-b" />
                  <span className="route-overview-pin route-overview-pin-c" />
                  <span className="route-overview-car" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-5 pt-16 text-white">
                  <div className="route-overview-progress mb-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <span className="block h-full rounded-full bg-indigo-400" />
                  </div>
                  <p className="route-overview-caption text-lg font-black">
                    Check risk, compare routes, and report black spots before the trip starts.
                  </p>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/80">
                    This quick overview shows how RouteRaksha turns local reports into safer
                    route awareness.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <img
                  src="/images/open-road-route.jpg"
                  alt="Open road with route planning context"
                  className="absolute inset-0 h-full w-full object-cover opacity-75"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                <button
                  type="button"
                  aria-label="Play RouteRaksha overview"
                  onClick={() => setIsOverviewPlaying(true)}
                  className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-600"
                >
                  <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                </button>
              </>
            )}
            {!isOverviewPlaying && (
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-lg font-black">RouteRaksha: Road risk before road speed</p>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/80">
                  A clear safety view for planning, alerts, and community reporting.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr]">
            <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              What is RouteRaksha used for?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {useCases.map((useCase) => (
                <div key={useCase} className="flex gap-3">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_0_5px_rgba(99,102,241,0.12)]" />
                  <p className="text-sm font-semibold leading-7 text-slate-600">{useCase}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-9 text-sm font-semibold leading-7 text-slate-600">
            The product supports awareness before action: users check the route, understand
            danger points, and then decide whether to slow down, choose another path, or report
            what they know. RouteRaksha is built for practical safety decisions, not noisy map
            clutter.
          </p>

          <div className="mt-9 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-8 text-center ${index === 1 ? "bg-indigo-100" : "bg-white"}`}
              >
                <p className="text-3xl font-black text-slate-950">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-2xl font-black text-slate-950">RouteRaksha is not...</p>
        <h2 className="mx-auto mt-8 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-indigo-700 sm:text-7xl">
          Just another map app.
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-lg font-black text-slate-950">
          Level up your road safety decisions
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
          RouteRaksha keeps the interface calm and the signal useful: risk context,
          accident reports, and safer-route actions.
        </p>

        <div className="mt-10 grid gap-6 text-left md:grid-cols-3">
          {resources.map((resource) => (
            <article key={resource.title} className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm">
              <img
                src={resource.image}
                alt={resource.title}
                className="h-52 w-full rounded-xl object-cover"
                loading="lazy"
              />
              <h3 className="mt-4 px-1 text-lg font-black text-slate-950">{resource.title}</h3>
              <p className="mt-2 px-1 text-sm font-semibold leading-6 text-slate-600">
                {resource.text}
              </p>
              <Link
                to={resource.to}
                className="mx-1 mt-4 inline-flex text-sm font-black text-indigo-700 underline decoration-indigo-300 decoration-4 underline-offset-4"
              >
                Learn more
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-100 px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-slate-950">
          Start planning with safer context
        </h2>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="flex min-h-11 items-center justify-center rounded-full bg-indigo-500 px-6 text-sm font-black text-white hover:bg-indigo-600"
          >
            Start free
          </Link>
          <Link
            to="/contact"
            className="flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-black text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Request a demo
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default AboutPage;
