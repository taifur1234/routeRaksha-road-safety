import { Link } from "react-router-dom";
import HomeIcon from "./HomeIcon";

const footerLinks = [
  {
    title: "Our Product",
    links: [
      { label: "Route planning", to: "/plan-route" },
      { label: "Blackspot alerts", to: "/plan-route" },
      { label: "Community reports", to: "/report-accident" },
      { label: "Admin review", to: "/admin" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Daily commute", to: "/plan-route" },
      { label: "School routes", to: "/plan-route" },
      { label: "Night travel", to: "/plan-route" },
      { label: "Local reporting", to: "/report-accident" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Safety mission", to: "/about" },
      { label: "Road data", to: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Report accident", to: "/report-accident" },
      { label: "Plan route", to: "/plan-route" },
      { label: "Account login", to: "/login" },
      { label: "Help", to: "/contact" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com", icon: "github" },
  { label: "Twitter", href: "https://twitter.com", icon: "twitter" },
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

  if (name === "instagram") {
    return (
      <svg aria-hidden="true" {...shared}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </svg>
    );
  }

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

  if (name === "twitter") {
    return (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.54 7.1c.02.21.02.42.02.63 0 6.43-4.9 13.85-13.85 13.85A13.75 13.75 0 0 1 .25 19.4c.38.04.75.06 1.15.06a9.74 9.74 0 0 0 6.04-2.08 4.87 4.87 0 0 1-4.55-3.38c.3.04.6.08.92.08.44 0 .88-.06 1.29-.17A4.86 4.86 0 0 1 1.2 9.14v-.06c.65.36 1.4.59 2.2.62a4.86 4.86 0 0 1-2.16-4.05c0-.9.24-1.73.66-2.45a13.82 13.82 0 0 0 10.02 5.08 5.48 5.48 0 0 1-.12-1.11 4.86 4.86 0 0 1 8.41-3.33 9.55 9.55 0 0 0 3.08-1.17 4.85 4.85 0 0 1-2.14 2.68 9.76 9.76 0 0 0 2.8-.75 10.45 10.45 0 0 1-2.41 2.5z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" {...shared}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#d8e5d3] bg-[#f1f6f0] px-4 py-12 text-[#173a0b] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-[1fr_3fr]">
        <div>
          <Link
            to="/"
            className="group flex w-fit items-center gap-3 text-[#173a0b]"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-indigo-500 text-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-[#173a0b] group-hover:shadow-lg">
              <HomeIcon name="shield" className="size-5" strokeWidth={2.4} />
            </span>
            <span className="font-black leading-tight transition group-hover:text-[#102f00]">
              RouteRaksha
              <span className="block text-xs uppercase tracking-[0.18em] text-[#46623d]">
                Safer road alerts
              </span>
            </span>
          </Link>
          <div className="mt-5 flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="grid size-10 place-items-center rounded-lg border border-[#d8e5d3] bg-white text-[#46623d] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#173a0b] hover:bg-[#173a0b] hover:text-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cec6d]/40"
              >
                <SocialIcon name={social.icon} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#173a0b]">
                {group.title}
              </h3>
              <div className="mt-4 grid gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="group flex w-fit items-center gap-2 text-sm font-semibold text-[#46623d] transition duration-200 hover:translate-x-1 hover:text-[#173a0b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cec6d]/35"
                  >
                    <span className="size-1.5 rounded-full bg-[#9cec6d] opacity-0 transition group-hover:opacity-100" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-[#d8e5d3] pt-6 text-sm font-semibold text-[#46623d] sm:flex-row sm:items-center sm:justify-between">
        <p>Enter the fold. Get safer route updates.</p>
        <form className="flex w-full max-w-md overflow-hidden rounded-full border border-[#173a0b]/20 bg-white shadow-sm transition duration-200 focus-within:border-[#173a0b] focus-within:shadow-[0_0_0_4px_rgba(156,236,109,0.25)]">
          <input
            type="email"
            aria-label="Email address"
            placeholder="you@example.com"
            className="min-h-11 flex-1 bg-transparent px-4 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478]"
          />
          <button
            type="button"
            className="bg-[#173a0b] px-5 text-sm font-black text-white transition hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cec6d]/40"
          >
            Subscribe
          </button>
        </form>
      </div>
    </footer>
  );
}

export default Footer;
