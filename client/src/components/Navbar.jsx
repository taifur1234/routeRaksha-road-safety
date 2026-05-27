import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 3v6h6" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M12 19h3.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H12" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </>
    ),
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
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

const navItems = [
  { label: "Home", to: "/", icon: "home" },
  { label: "Plan Route", to: "/plan-route", icon: "route" },
  { label: "Report Accident", to: "/report-accident", icon: "file" },
  { label: "About", to: "/about", icon: "info" },
  { label: "Contact", to: "/contact", icon: "mail" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function closeProfileOnOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", closeProfileOnOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", closeProfileOnOutsideClick);
    };
  }, [isProfileOpen]);

  function isActiveRoute(to) {
    return to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
  }

  function requestLogout() {
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsLogoutOpen(true);
  }

  function handleLogout() {
    logout();
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsLogoutOpen(false);
    navigate("/");
  }

  function cancelLogout() {
    setIsLogoutOpen(false);
  }

  function closeMenus() {
    setIsOpen(false);
    setIsProfileOpen(false);
  }

  return (
    <>
      <header className="motion-nav sticky top-0 z-50 border-b border-[#d8e5d3] bg-[#fbfcfa]/95 text-[#173a0b] shadow-[0_10px_30px_rgba(16,47,0,0.07)] backdrop-blur-xl">
      <nav className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={closeMenus}>
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00] shadow-[0_10px_24px_rgba(16,47,0,0.12)]">
            <Icon name="shield" className="size-6" strokeWidth={2.4} />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-black tracking-tight text-[#173a0b] sm:text-xl">
              RouteRaksha
            </span>
            <span className="block truncate text-xs font-bold uppercase tracking-[0.18em] text-[#46623d]">
              Safer road alerts
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.to);

            return (
              <Link
                key={item.label}
                to={item.to}
                className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black transition ${
                  isActive
                    ? "bg-[#e5eedf] text-[#173a0b]"
                    : "text-[#46623d] hover:bg-[#f1f6f0] hover:text-[#173a0b]"
                }`}
              >
                <Icon
                  name={item.icon}
                  className={`size-4 transition ${
                    isActive ? "text-[#173a0b]" : "text-[#6f8668] group-hover:text-[#173a0b]"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-label="Open profile menu"
                aria-expanded={isProfileOpen}
                onClick={() => setIsProfileOpen((current) => !current)}
                className="grid size-11 place-items-center rounded-full border border-[#d8e5d3] bg-[#f1f6f0] text-[#173a0b] transition hover:border-[#9cec6d] hover:bg-[#e5eedf]"
              >
                <Icon name="user" className="size-5" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-3 shadow-[0_24px_60px_rgba(16,47,0,0.16)]">
                  <div className="rounded-lg bg-[#f1f6f0] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                        <Icon name="user" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#173a0b]">{user?.name}</p>
                        <p className="truncate text-xs font-semibold text-[#46623d]">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid gap-1">
                    <Link
                      to="/plan-route"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[#46623d] transition hover:bg-[#e5eedf] hover:text-[#173a0b]"
                    >
                      <Icon name="route" className="size-4 text-[#173a0b]" />
                      Plan Route
                    </Link>
                    <Link
                      to="/report-accident"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[#46623d] transition hover:bg-[#e5eedf] hover:text-[#173a0b]"
                    >
                      <Icon name="file" className="size-4 text-[#173a0b]" />
                      Report Accident
                    </Link>
                    <Link
                      to="/report-history"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[#46623d] transition hover:bg-[#e5eedf] hover:text-[#173a0b]"
                    >
                      <Icon name="history" className="size-4 text-[#173a0b]" />
                      Report History
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[#46623d] transition hover:bg-[#e5eedf] hover:text-[#173a0b]"
                      >
                        <Icon name="shield" className="size-4 text-[#173a0b]" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={requestLogout}
                      className="mt-1 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-left text-sm font-black text-red-700 transition hover:bg-red-100"
                    >
                      <Icon name="lock" className="size-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full border border-[#d8e5d3] bg-white px-4 py-2.5 text-sm font-black text-[#173a0b] transition hover:border-[#9cec6d] hover:bg-[#f1f6f0]"
              >
                <Icon name="lock" className="size-4" />
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[#173a0b] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,47,0,0.18)] transition hover:bg-[#102f00]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="grid size-11 place-items-center rounded-lg border border-[#d8e5d3] bg-[#f1f6f0] text-[#173a0b] transition hover:border-[#9cec6d] hover:bg-[#e5eedf] lg:hidden"
        >
          {isOpen ? <Icon name="x" className="size-5" /> : <Icon name="menu" className="size-5" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-[#d8e5d3] bg-[#fbfcfa] px-4 pb-5 pt-2 shadow-[0_20px_50px_rgba(16,47,0,0.12)] lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.to);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3.5 text-sm font-black transition ${
                    isActive
                      ? "border-[#9cec6d] bg-[#e5eedf] text-[#173a0b]"
                      : "border-[#d8e5d3] bg-[#f6f8f4] text-[#46623d] hover:bg-[#e5eedf] hover:text-[#173a0b]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon name={item.icon} className="size-5 text-[#173a0b]" />
                    {item.label}
                  </span>
                  <span className="size-2 rounded-full bg-[#9cec6d]" />
                </Link>
              );
            })}

            {isLoggedIn ? (
              <div className="mt-2 rounded-lg border border-[#d8e5d3] bg-[#f6f8f4] p-3">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                    <Icon name="user" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#173a0b]">{user?.name}</p>
                    <p className="truncate text-xs font-semibold text-[#46623d]">{user?.email}</p>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMenus}
                    className="mb-2 flex items-center justify-center rounded-lg border border-[#d8e5d3] bg-white px-4 py-3 text-sm font-black text-[#173a0b]"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/report-history"
                  onClick={closeMenus}
                  className="mb-2 flex items-center justify-center gap-2 rounded-lg border border-[#d8e5d3] bg-white px-4 py-3 text-sm font-black text-[#173a0b]"
                >
                  <Icon name="history" className="size-4" />
                  Report History
                </Link>
                <button
                  type="button"
                  onClick={requestLogout}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#d8e5d3] bg-white px-4 py-3.5 text-sm font-black text-[#173a0b]"
                >
                  <Icon name="lock" className="size-4" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-[#173a0b] px-4 py-3.5 text-center text-sm font-black text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      </header>

      {isLogoutOpen && (
        <div className="logout-modal-backdrop fixed inset-0 z-[80] grid place-items-center bg-[#102f00]/45 px-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="logout-modal-panel w-full max-w-lg overflow-hidden rounded-2xl border border-[#d8e5d3] bg-[#fbfcfa] text-[#173a0b] shadow-[0_32px_90px_rgba(16,47,0,0.28)]"
          >
            <div className="bg-[#e5eedf] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#9cec6d] text-[#102f00] shadow-[0_10px_24px_rgba(16,47,0,0.12)]">
                    <Icon name="shield" className="size-5" strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#173a0b]">RouteRaksha account</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#46623d]">
                      Session control
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close logout confirmation"
                  onClick={cancelLogout}
                  className="grid size-9 place-items-center rounded-full text-[#173a0b] hover:bg-[#fbfcfa]"
                >
                  <Icon name="x" className="size-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#173a0b] text-[#9cec6d]">
                  <Icon name="lock" className="size-7" strokeWidth={2.4} />
                </span>
                <div>
                  <h2 id="logout-title" className="text-2xl font-black leading-tight">
                    Are you sure you want to logout?
                  </h2>
                  <p
                    id="logout-description"
                    className="mt-3 text-sm font-semibold leading-6 text-[#46623d]"
                  >
                    Your current session will end. You will need to login again before planning
                    safer routes or submitting accident reports.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#d8e5d3] bg-[#f1f6f0] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#46623d]">
                  Signed in as
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                    <Icon name="user" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#173a0b]">{user?.name}</p>
                    <p className="truncate text-xs font-semibold text-[#46623d]">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                type="button"
                onClick={cancelLogout}
                  className="flex min-h-12 items-center justify-center rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
              >
                Stay logged in
              </button>
              <button
                type="button"
                onClick={handleLogout}
                  className="flex min-h-12 items-center justify-center rounded-full bg-[#173a0b] px-5 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,47,0,0.18)] transition hover:bg-[#102f00]"
              >
                Yes, logout
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
