import { Component } from "react";
import { Link } from "react-router-dom";
import HomeIcon from "./home/HomeIcon";

function ErrorCode({ value }) {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[22rem] place-items-center rounded-lg border border-white/10 bg-white/10 text-white shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="absolute inset-6 rounded-lg border border-white/10" />
      <div className="absolute left-1/2 top-8 h-[70%] w-1 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,#7ce7b2_0_28px,transparent_28px_52px)] opacity-70" />
      <span className="rr-500-pulse absolute left-1/2 top-[28%] size-8 -translate-x-1/2 rounded-full bg-[#f0645a] shadow-[0_0_0_16px_rgba(240,100,90,0.2)]" />
      <span className="rr-500-pulse rr-500-pulse-alt absolute left-1/2 top-[64%] size-8 -translate-x-1/2 rounded-full bg-[#f3b544] shadow-[0_0_0_16px_rgba(243,181,68,0.2)]" />
      <div className="relative text-center">
        <p className="text-8xl font-black leading-none tracking-tight">{value}</p>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-[#baf7da]">
          System detour
        </p>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorId: "",
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      errorId: `RR-${Date.now().toString(36).toUpperCase()}`,
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error("RouteRaksha runtime crash", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="rr-crash-page min-h-screen overflow-hidden bg-[#101820] px-4 py-8 text-white sm:px-6 lg:px-8">
          <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#baf7da] backdrop-blur">
                <HomeIcon name="alert" className="size-4" strokeWidth={2.4} />
                Error 500
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Safety system hit a bad turn.
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-[#dce8e5] sm:text-lg">
                Something inside the app crashed, so RouteRaksha paused the page instead of showing a broken screen. Refresh once, or return to a stable route.
              </p>

              <div className="mt-6 max-w-xl rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                  Crash reference
                </p>
                <p className="mt-2 font-mono text-sm font-black text-white">{this.state.errorId}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#7ce7b2] px-6 text-sm font-black text-[#101820] shadow-[0_18px_42px_rgba(124,231,178,0.2)]"
                >
                  <HomeIcon name="route" className="size-4" />
                  Refresh page
                </button>
                <Link
                  to="/"
                  onClick={() => this.setState({ hasError: false, errorId: "" })}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-black text-white backdrop-blur"
                >
                  <HomeIcon name="shield" className="size-4" />
                  Go home
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 bg-[radial-gradient(circle_at_50%_35%,rgba(124,231,178,0.2),transparent_32rem)]" />
              <ErrorCode value="500" />
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
