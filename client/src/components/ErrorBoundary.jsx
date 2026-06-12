import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#fbfcfa] px-4 text-[#173a0b]">
          <section className="max-w-md rounded-lg border border-[#d8e5d3] bg-white p-6 text-center shadow-[0_18px_42px_rgba(16,47,0,0.08)]">
            <h1 className="text-2xl font-black">Something went wrong</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#46623d]">
              Refresh the page and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 min-h-11 rounded-full bg-[#173a0b] px-5 text-sm font-black text-white"
            >
              Refresh
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
