import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import UserAvatar from "./UserAvatar";

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
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
        <path d="M9.5 12.5 11 14l4-4" />
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
  { label: "Report", to: "/report-accident", icon: "file" },
  { label: "Leaderboard", to: "/leaderboard", icon: "shield" },
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

    return () => document.removeEventListener("mousedown", closeProfileOnOutsideClick);
  }, [isProfileOpen]);

  function isActiveRoute(to) {
    return to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
  }

  function closeMenus() {
    setIsOpen(false);
    setIsProfileOpen(false);
  }

  function requestLogout() {
    closeMenus();
    setIsLogoutOpen(true);
  }

  function handleLogout() {
    logout();
    setIsLogoutOpen(false);
    navigate("/");
  }

  return (
    <>
      <header className="motion-nav rr-nav sticky top-0 z-50 border-b text-slate-950 backdrop-blur-xl">
        <nav className="mx-auto flex h-[4.9rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={closeMenus}>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-cyan-200 shadow-[0_12px_28px_rgba(7,17,31,0.16)]">
              <Icon name="shield" className="size-5" strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-black tracking-tight sm:text-xl">RouteRaksha</span>
              <span className="block truncate text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Safety intelligence
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = isActiveRoute(item.to);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black transition ${
                    active
                      ? "bg-slate-950 text-white shadow-[0_12px_28px_rgba(7,17,31,0.14)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`size-4 ${active ? "text-cyan-200" : "text-slate-400 group-hover:text-cyan-600"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isLoggedIn ? (
              <>
                <NotificationBell enabled={isLoggedIn} />
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    aria-label="Open profile menu"
                    aria-expanded={isProfileOpen}
                    onClick={() => setIsProfileOpen((current) => !current)}
                    className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white p-0.5 text-slate-950 shadow-sm hover:border-cyan-200 hover:bg-cyan-50"
                  >
                    <UserAvatar user={user} className="size-9" textClassName="text-xs" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_28px_80px_rgba(7,17,31,0.16)]">
                      <div className="rounded-xl bg-slate-950 p-4 text-white">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={user}
                            className="size-11"
                            fallbackClassName="rounded-xl"
                            imageClassName="rounded-xl"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{user?.name}</p>
                            <p className="truncate text-xs font-semibold text-slate-300">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 grid gap-1">
                        {[
                          ["My Profile", "/profile", "user"],
                          ["Plan Route", "/plan-route", "route"],
                          ["Report Accident", "/report-accident", "file"],
                          ["Report History", "/report-history", "history"],
                          ["Notifications", "/notifications", "mail"],
                        ].map(([label, to, icon]) => (
                          <Link
                            key={label}
                            to={to}
                            onClick={closeMenus}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                          >
                            <Icon name={icon} className="size-4 text-cyan-600" />
                            {label}
                          </Link>
                        ))}
                        {user?.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={closeMenus}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                          >
                            <Icon name="shield" className="size-4 text-cyan-600" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={requestLogout}
                          className="mt-1 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-left text-sm font-black text-red-700 hover:bg-red-100"
                        >
                          <Icon name="lock" className="size-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <Icon name="lock" className="size-4" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(7,17,31,0.2)] hover:bg-slate-800"
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
            className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:bg-slate-100 lg:hidden"
          >
            {isOpen ? <Icon name="x" className="size-5" /> : <Icon name="menu" className="size-5" />}
          </button>
        </nav>

        {isOpen && (
          <div className="border-t border-slate-200 bg-white/95 px-4 pb-5 pt-2 shadow-[0_24px_70px_rgba(7,17,31,0.12)] backdrop-blur lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              {navItems.map((item) => {
                const active = isActiveRoute(item.to);

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-black ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-cyan-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon name={item.icon} className={`size-5 ${active ? "text-cyan-200" : "text-cyan-600"}`} />
                      {item.label}
                    </span>
                    <span className={`size-2 rounded-full ${active ? "bg-cyan-200" : "bg-slate-300"}`} />
                  </Link>
                );
              })}

              {isLoggedIn ? (
                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center gap-3">
                    <UserAvatar
                      user={user}
                      className="size-10"
                      fallbackClassName="rounded-xl"
                      imageClassName="rounded-xl"
                      textClassName="text-xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{user?.name}</p>
                      <p className="truncate text-xs font-semibold text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  {[
                    ["My Profile", "/profile", "user"],
                    ["Notifications", "/notifications", "mail"],
                    ["Report History", "/report-history", "history"],
                  ].map(([label, to, icon]) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={closeMenus}
                      className="mb-2 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800"
                    >
                      <Icon name={icon} className="size-4 text-cyan-600" />
                      {label}
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={closeMenus}
                      className="mb-2 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={requestLogout}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-black text-slate-800"
                  >
                    <Icon name="lock" className="size-4" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-slate-950 px-4 py-3.5 text-center text-sm font-black text-white"
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
        <div className="logout-modal-backdrop fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="logout-modal-panel w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-[0_32px_90px_rgba(7,17,31,0.28)]"
          >
            <div className="bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300 text-slate-950">
                    <Icon name="shield" className="size-5" strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-sm font-black">RouteRaksha account</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                      Session control
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close logout confirmation"
                  onClick={() => setIsLogoutOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-white hover:bg-white/10"
                >
                  <Icon name="x" className="size-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Icon name="lock" className="size-7" strokeWidth={2.4} />
                </span>
                <div>
                  <h2 id="logout-title" className="text-2xl font-black leading-tight">
                    Logout from this session?
                  </h2>
                  <p id="logout-description" className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                    You will need to login again before planning routes, submitting reports, or
                    checking your reputation.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Signed in as
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <UserAvatar
                    user={user}
                    className="size-10"
                    fallbackClassName="rounded-xl"
                    imageClassName="rounded-xl"
                    textClassName="text-xs"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{user?.name}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-black text-slate-800 hover:bg-slate-50"
                >
                  Stay logged in
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-black text-white hover:bg-slate-800"
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
