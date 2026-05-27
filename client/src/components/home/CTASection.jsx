import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HomeIcon from "./HomeIcon";

const benefits = ["Check route risk", "View blackspots", "Report accidents"];

function CTASection() {
  const { isLoggedIn } = useAuth();

  return (
    <section className="bg-[#fbfcfa] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-[#c8ddc0] bg-white shadow-[0_24px_70px_rgba(23,58,11,0.12)]">
          <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#46623d]">
                Start using RouteRaksha
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-[#173a0b] sm:text-5xl">
                Plan the route with the fewest surprises.
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#46623d] sm:text-base">
                Use blackspot awareness before a trip, then help the safety layer improve with
                verified accident reports.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {benefits.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#d8e5d3] bg-[#f7faf6] px-3 py-1.5 text-xs font-black text-[#173a0b]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:w-56 lg:flex-col">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/plan-route"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173a0b] px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,47,0,0.18)] hover:bg-[#102f00]"
                  >
                    <HomeIcon name="route" className="size-4" />
                    Plan Route
                  </Link>
                  <Link
                    to="/report-accident"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#173a0b] bg-white px-6 text-sm font-black text-[#173a0b] hover:bg-[#f2f8ef]"
                  >
                    <HomeIcon name="file" className="size-4" />
                    Report Accident
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="flex min-h-12 items-center justify-center rounded-full bg-[#173a0b] px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,47,0,0.18)] hover:bg-[#102f00]"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="flex min-h-12 items-center justify-center rounded-full border border-[#173a0b] bg-white px-6 text-sm font-black text-[#173a0b] hover:bg-[#f2f8ef]"
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
