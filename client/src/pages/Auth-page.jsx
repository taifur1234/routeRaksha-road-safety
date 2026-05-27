import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { validateAuthForm } from "../utils/validation";

const REMEMBERED_LOGIN_KEY = "routeRakshaRememberedLogin";

function readRememberedLogin() {
  try {
    const value = localStorage.getItem(REMEMBERED_LOGIN_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeRememberedLogin({ email }) {
  localStorage.setItem(
    REMEMBERED_LOGIN_KEY,
    JSON.stringify({
      email: email.trim(),
    }),
  );
}

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    close: <path d="M18 6 6 18M6 6l12 12" />,
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.7 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2" />
        <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4.1-.8" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    google: (
      <>
        <path
          d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.52Z"
          fill="#4285F4"
          stroke="none"
        />
        <path
          d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
          fill="#34A853"
          stroke="none"
        />
        <path
          d="M6.41 13.88A6.01 6.01 0 0 1 6.1 12c0-.65.11-1.29.31-1.88V7.53H3.07a10 10 0 0 0 0 8.94l3.34-2.59Z"
          fill="#FBBC05"
          stroke="none"
        />
        <path
          d="M12 6c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.53l3.34 2.59C7.2 7.76 9.4 6 12 6Z"
          fill="#EA4335"
          stroke="none"
        />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9.5 12.5 11 14l4-4" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const [form, setForm] = useState(() => {
    const rememberedLogin = !isSignup ? readRememberedLogin() : null;

    return {
      name: "",
      email: rememberedLogin?.email || "",
      password: "",
      remember: false,
    };
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationError = validateAuthForm({
      isSignup,
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = isSignup ? await signup(form) : await login(form);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (!isSignup && form.remember) {
      writeRememberedLogin(form);
    }

    navigate(result.redirectTo || "/");
  }

  async function handleGoogleLogin() {
    setError("");
    setIsGoogleLoading(true);

    const result = await loginWithGoogle();

    setIsGoogleLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.redirecting) {
      return;
    }

    navigate(result.redirectTo || "/");
  }

  return (
    <main className="motion-page auth-page h-[100dvh] overflow-hidden bg-[#f7faf6] text-[#11200d]">
      <Link
        to="/"
        aria-label="Close auth page"
        className="fixed right-3 top-3 z-20 grid size-9 place-items-center rounded-full text-[#173a0b] hover:bg-[#e5eedf] sm:right-5 sm:top-5 sm:size-10"
      >
        <Icon name="close" className="size-5" />
      </Link>

      <section className="grid h-full overflow-hidden lg:grid-cols-[0.49fr_1fr]">
        <aside className="auth-side relative hidden h-full overflow-hidden bg-[#103000] px-10 py-9 text-[#a5f278] lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="relative z-10 flex w-fit items-center gap-2 text-xl font-black tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-[#9cec6d] text-[#103000]">
              <Icon name="shield" className="size-5" strokeWidth={2.4} />
            </span>
            RouteRaksha
          </Link>

          <div className="relative z-10 max-w-md pb-4">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-white/70">
              Black spot AI
            </p>
            <h1 className="max-w-sm text-5xl font-black uppercase leading-[0.92] tracking-tight xl:text-6xl">
              Safer roads start here
            </h1>
            <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-white/80 xl:text-lg xl:leading-8">
              Plan smarter routes, avoid accident-prone stretches, and report risky spots
              before they become someone else's problem.
            </p>
            <p className="auth-height-optional mt-6 text-sm font-black text-white">
              Built for cautious riders.{" "}
              <span className="border-b-2 border-[#9cec6d] text-[#a5f278]">
                Powered by local reports
              </span>
            </p>
          </div>
        </aside>

        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fbfcfa] px-4 py-4 sm:px-6 lg:px-12 lg:py-5">
          <div className="mx-auto flex min-h-0 w-full max-w-[36rem] flex-1 flex-col justify-center py-1 sm:py-2">
            <Link
              to="/"
              className="auth-logo mx-auto mb-5 flex w-fit items-center gap-2 text-xl font-black tracking-tight text-[#173a0b] sm:mb-6 sm:text-2xl lg:mb-7 lg:text-3xl"
            >
              <span className="grid size-8 place-items-center rounded-xl bg-[#9cec6d] sm:size-9 lg:size-10">
                <Icon name="shield" className="size-5 sm:size-6" strokeWidth={2.4} />
              </span>
              RouteRaksha
            </Link>

            <form onSubmit={handleSubmit} className="auth-form mx-auto w-full max-w-[29rem]">
              <div className="text-center">
                <h2 className="auth-heading text-2xl font-black tracking-tight text-black sm:text-3xl lg:text-4xl">
                  {isSignup ? "Create account." : "Welcome back."}
                </h2>
                <p className="auth-switch mt-2 text-sm font-semibold text-neutral-600 sm:text-base lg:text-lg">
                  {isSignup ? "Already protected?" : "New to RouteRaksha?"}{" "}
                  <Link
                    to={isSignup ? "/login" : "/signup"}
                    className="font-black text-[#173a0b] underline decoration-[#9cec6d] decoration-4 underline-offset-4"
                  >
                    {isSignup ? "Log in" : "Sign up"}
                  </Link>
                </p>
              </div>

              <div className="auth-fields mt-5 grid gap-3 sm:mt-6 sm:gap-4 lg:mt-7">
                {isSignup && (
                  <label className="grid gap-2 text-sm font-semibold text-neutral-600 sm:text-base">
                    Your full name
                    <input
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      maxLength={60}
                      className="min-h-11 rounded-xl border border-neutral-400 bg-white px-4 text-base font-semibold text-black outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30 sm:min-h-12 lg:min-h-14"
                    />
                  </label>
                )}

                <label className="grid gap-2 text-sm font-semibold text-neutral-600 sm:text-base">
                  Your email address
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    maxLength={254}
                    className="min-h-11 rounded-xl border border-neutral-400 bg-white px-4 text-base font-semibold text-black outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30 sm:min-h-12 lg:min-h-14"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-neutral-600 sm:text-base">
                  Your password
                  <span className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      maxLength={128}
                      className="min-h-11 w-full rounded-xl border border-neutral-400 bg-white px-4 pr-12 text-base font-semibold text-black outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30 sm:min-h-12 lg:min-h-14"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((current) => !current)}
                      className="auth-eye-toggle absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[#173a0b] hover:bg-[#e5eedf]"
                    >
                      <Icon name={showPassword ? "eyeOff" : "eye"} className="size-5" />
                    </button>
                  </span>
                  {isSignup && (
                    <span className="text-xs font-bold text-neutral-500">
                      Use 8+ characters with at least one letter and one number.
                    </span>
                  )}
                </label>
              </div>

              {error && (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 sm:mt-4">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-[#9cec6d] px-5 text-base font-black text-[#102f00] shadow-[0_16px_30px_rgba(45,92,16,0.16)] hover:bg-[#8be85b] sm:mt-5 sm:min-h-[3.25rem] lg:mt-6 lg:min-h-14 lg:text-lg"
              >
                {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Log in"}
              </button>

              {!isSignup && (
                <div className="mt-3 flex items-center justify-between gap-3 text-sm font-semibold text-neutral-700 sm:mt-4 sm:text-base">
                  <label className="flex w-fit cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(event) => updateField("remember", event.target.checked)}
                      className="size-4 rounded accent-[#173a0b] sm:size-5"
                    />
                    <span>Remember email</span>
                  </label>
                  <a href="mailto:support@routeraksha.local" className="hidden font-black text-[#173a0b] underline underline-offset-4 sm:inline">
                    Trouble logging in?
                  </a>
                </div>
              )}

              <div className="auth-google mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white px-5 text-sm font-black text-neutral-800 shadow-sm hover:border-[#9cec6d] hover:bg-[#f8fff2] sm:min-h-[3.25rem] sm:text-base"
                  aria-label="Continue with Google"
                >
                  <Icon name="google" className="size-6" strokeWidth={0} />
                  {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                </button>
              </div>

              <p className="auth-optional mt-5 hidden text-center text-sm font-black sm:block lg:mt-6 lg:text-base">
                <Link to="/about" className="text-[#173a0b] underline decoration-[#9cec6d] decoration-4 underline-offset-4">
                  How RouteRaksha keeps your trip safer
                </Link>
              </p>
            </form>
          </div>

          <p className="auth-optional mx-auto hidden w-full max-w-[42rem] border-t border-neutral-200 py-3 text-center text-xs font-semibold text-neutral-500 sm:block">
            (c) RouteRaksha 2026
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
