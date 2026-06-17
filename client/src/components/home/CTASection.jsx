import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HomeIcon from "./HomeIcon";

const benefits = ["Route risk scoring", "Blackspot reporting", "Emergency context"];

function CTASection() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="px-4 pb-10 pt-0 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.6rem] bg-[#08111f] p-5 text-white shadow-[0_30px_90px_rgba(7,17,31,0.26)] sm:p-9 lg:p-12">
          <div className="absolute inset-0 rr-grid opacity-15" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,216,0.18),transparent_42%,rgba(24,194,143,0.16))]" />

          <div className="relative grid gap-6 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                Start with the product
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:mt-4 sm:text-5xl">
                Make every route choice feel informed, calm, and defensible.
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300 sm:mt-5 sm:text-base sm:leading-8">
                Plan a trip, compare risk, or contribute a report. RouteRaksha is ready for
                a real startup demo flow, not just a landing page.
              </p>
              <div className="mt-5 hidden flex-wrap gap-2 sm:flex sm:mt-7">
                {benefits.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-60 lg:grid-cols-1">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/plan-route"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-slate-950 hover:bg-cyan-50"
                  >
                    <HomeIcon name="route" className="size-4" />
                    Plan Route
                  </Link>
                  <Link
                    to="/report-accident"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-black text-white hover:bg-white/20"
                  >
                    <HomeIcon name="file" className="size-4" />
                    Report Accident
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-slate-950 hover:bg-cyan-50"
                  >
                    Create account
                  </Link>
                  <Link
                    to="/login"
                    className="flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-black text-white hover:bg-white/20"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
