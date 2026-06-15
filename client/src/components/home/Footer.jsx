import { Link } from "react-router-dom";
import HomeIcon from "./HomeIcon";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Plan route", to: "/plan-route" },
      { label: "Report accident", to: "/report-accident" },
      { label: "Risk history", to: "/report-history" },
      { label: "Notifications", to: "/notifications" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Leaderboard", to: "/leaderboard" },
      { label: "Admin panel", to: "/admin" },
    ],
  },
  {
    title: "Actions",
    links: [
      { label: "Create account", to: "/signup" },
      { label: "Login", to: "/login" },
      { label: "Profile", to: "/profile" },
      { label: "Get help", to: "/contact" },
    ],
  },
];

function SocialIcon({ name }) {
  const shared = {
    className: "size-4",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "linkedin") {
    return (
      <svg aria-hidden="true" {...shared}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg aria-hidden="true" {...shared}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5a10.5 10.5 0 0 0-6 0C8 2 7 2 7 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 6 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" {...shared}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_2fr]">
        <div>
          <Link to="/" className="group flex w-fit items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-slate-950 text-cyan-200 shadow-[0_12px_28px_rgba(7,17,31,0.16)] transition group-hover:-translate-y-0.5">
              <HomeIcon name="shield" className="size-5" strokeWidth={2.4} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">RouteRaksha</span>
              <span className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Road safety intelligence
              </span>
            </span>
          </Link>

          <p className="mt-5 max-w-md text-sm font-semibold leading-7 text-slate-600">
            A blackspot-aware route platform for safer commutes, verified reporting, and
            calmer road decisions.
          </p>

          <div className="mt-6 flex items-center gap-2">
            {[
              ["Instagram", "instagram", "https://www.instagram.com"],
              ["LinkedIn", "linkedin", "https://www.linkedin.com"],
              ["GitHub", "github", "https://github.com"],
            ].map(([label, icon, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <SocialIcon name={icon} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-950">
                {group.title}
              </h3>
              <div className="mt-4 grid gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="group flex w-fit items-center gap-2 text-sm font-bold text-slate-600 hover:text-cyan-700"
                  >
                    <span className="size-1.5 rounded-full bg-cyan-400 opacity-0 transition group-hover:opacity-100" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-slate-200 pt-6 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Built for safer travel decisions.</p>
        <div className="flex flex-wrap gap-2">
          {["Khargone pilot", "Community reports", "Safety scoring"].map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
