import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/home/Footer";
import HomeIcon from "../components/home/HomeIcon";
import { cleanText, isValidEmail } from "../utils/validation";

const SESSION_KEY = "routeRakshaSession";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Icon({ name, className = "size-5", strokeWidth = 2 }) {
  const icons = {
    close: <path d="M18 6 6 18M6 6l12 12" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    message: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </>
    ),
    phone: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.13.96.34 1.9.63 2.8a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.29 1.84.5 2.8.63A2 2 0 0 1 22 16.92Z" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4z" />
        <path d="M22 2 11 13" />
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
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
    >
      {icons[name]}
    </svg>
  );
}

const contactMethods = [
  {
    title: "Email us",
    text: "For feedback, project support, and data correction requests.",
    value: "support@routeraksha.local",
    icon: "mail",
  },
  {
    title: "Call the team",
    text: "For urgent demo or collaboration conversations.",
    value: "+91 98765 43210",
    icon: "phone",
  },
  {
    title: "Visit base",
    text: "Built for local road-safety teams and community contributors.",
    value: "Indore, Madhya Pradesh",
    icon: "location",
  },
];

const helpTopics = [
  "Blackspot data correction",
  "Accident report help",
  "Product feedback",
  "Partnership request",
];

function ContactPage() {
  const { isLoggedIn } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    topic: helpTopics[0],
    message: "",
  });

  function readSession() {
    try {
      return (
        JSON.parse(localStorage.getItem(SESSION_KEY) || "null") ||
        JSON.parse(sessionStorage.getItem(`${SESSION_KEY}Temp`) || "null")
      );
    } catch {
      return null;
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSubmitted(false);
  }

  function validateContactForm() {
    if (cleanText(form.firstName).length < 2 || cleanText(form.lastName).length < 2) {
      return "First and last name must be at least 2 characters.";
    }

    if (!isValidEmail(form.email)) {
      return "Please enter a valid email address.";
    }

    if (!helpTopics.includes(form.topic)) {
      return "Please choose a valid help topic.";
    }

    const message = cleanText(form.message);

    if (message.length < 20 || message.length > 1200) {
      return "Message must be between 20 and 1200 characters.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitted(false);

    if (!isLoggedIn) {
      setIsLoginPopupOpen(true);
      return;
    }

    const validationError = validateContactForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const session = readSession();
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token || ""}`,
        },
        body: JSON.stringify({
          firstName: cleanText(form.firstName),
          lastName: cleanText(form.lastName),
          email: cleanText(form.email),
          topic: form.topic,
          message: cleanText(form.message),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not send message.");
      }

      setSubmitted(true);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        topic: helpTopics[0],
        message: "",
      });
    } catch (submitError) {
      setError(submitError.message || "Could not send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <main className="motion-page bg-[#fbfcfa] text-[#113006]">
      <section className="bg-[#e5eedf] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#173a0b]">
              Contact RouteRaksha
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight text-[#173a0b] sm:text-5xl lg:text-6xl">
              Get in touch
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-[#294a20]">
              Have a question about safer routes, blackspot reports, or collaboration?
              Send us a message and the RouteRaksha team will review it.
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-3">
              {contactMethods.map((method) => (
                <article
                  key={method.title}
                  className="flex flex-col justify-center rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-6 shadow-[0_14px_35px_rgba(16,47,0,0.08)]"
                >
                  <span className="grid size-11 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                    <Icon name={method.icon} className="size-5" strokeWidth={2.3} />
                  </span>
                  <h2 className="mt-5 text-xl font-black text-[#173a0b]">{method.title}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                    {method.text}
                  </p>
                  <p className="mt-4 text-sm font-black text-[#173a0b]">{method.value}</p>
                </article>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex h-full flex-col rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-5 shadow-[0_22px_55px_rgba(16,47,0,0.1)] sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                  <Icon name="message" className="size-5" strokeWidth={2.3} />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-[#173a0b]">Send us a message</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">
                    Share clear details so we can understand the route, report, or request.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  First name
                  <input
                    value={form.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    placeholder="Your first name"
                    maxLength={40}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  Last name
                  <input
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    placeholder="Your last name"
                    maxLength={40}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5">
                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                    maxLength={254}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  What can we help with?
                  <select
                    value={form.topic}
                    onChange={(event) => updateField("topic", event.target.value)}
                    className="min-h-12 rounded-lg border border-[#cddcc7] bg-white px-4 text-sm font-semibold text-[#173a0b] outline-none focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  >
                    {helpTopics.map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-black text-[#173a0b]">
                  Message
                  <textarea
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    rows="4"
                    placeholder="Tell us about the road, location, feature request, or issue..."
                    maxLength={1200}
                    className="resize-none rounded-lg border border-[#cddcc7] bg-white px-4 py-3 text-sm font-semibold text-[#173a0b] outline-none placeholder:text-[#7f9478] focus:border-[#173a0b] focus:ring-4 focus:ring-[#9cec6d]/30"
                  />
                </label>
              </div>

              {error && (
                <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                  {error}
                </p>
              )}

              {submitted && (
                <p className="mt-5 rounded-lg border border-[#9cec6d] bg-[#efffe8] px-4 py-3 text-sm font-black text-[#173a0b]">
                  Message submitted. Our team will review it shortly.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173a0b] px-6 text-sm font-black text-white hover:bg-[#102f00] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Icon name="send" className="size-4" />
                {isSubmitting ? "Sending..." : "Send message"}
              </button>

              <p className="mt-4 text-center text-sm font-semibold text-[#46623d]">
                Accident location details?{" "}
                <Link
                  to="/report-accident"
                  className="font-black text-[#173a0b] underline decoration-[#9cec6d] decoration-4 underline-offset-4"
                >
                  Submit a report instead
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg bg-[#f1f6f0] p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#173a0b]">
              Faster review
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#173a0b]">
              Include location context with every safety issue.
            </h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-[#46623d]">
              Add road name, landmark, direction, time of day, and why the spot feels risky.
              Better context helps the team review blackspot reports clearly.
            </p>
            <Link
              to="/report-accident"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#9cec6d] px-6 text-sm font-black text-[#102f00] hover:bg-[#8be85b]"
            >
              <HomeIcon name="file" className="size-4" />
              Report accident
            </Link>
          </div>

          <div className="rounded-lg bg-[#173a0b] p-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9cec6d]">
              Built for clarity
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight">
              We route every message to the right safety workflow.
            </h2>
            <div className="mt-6 grid gap-3">
              {helpTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="size-2 rounded-full bg-[#9cec6d]" />
                  <p className="text-sm font-bold text-white/85">{topic}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </main>

      {isLoginPopupOpen && (
        <div className="logout-modal-backdrop fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-y-auto bg-[#102f00]/45 px-4 py-6 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="contact-login-title"
            aria-describedby="contact-login-description"
            className="logout-modal-panel w-full max-w-lg overflow-hidden rounded-2xl border border-[#d8e5d3] bg-[#fbfcfa] text-[#173a0b] shadow-[0_32px_90px_rgba(16,47,0,0.28)]"
          >
            <div className="bg-[#e5eedf] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#9cec6d] text-[#102f00] shadow-[0_10px_24px_rgba(16,47,0,0.12)]">
                    <Icon name="shield" className="size-5" strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#173a0b]">RouteRaksha contact</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#46623d]">
                      Login required
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close login required popup"
                  onClick={() => setIsLoginPopupOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-[#173a0b] hover:bg-[#fbfcfa]"
                >
                  <Icon name="close" className="size-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#173a0b] text-[#9cec6d]">
                  <Icon name="mail" className="size-7" strokeWidth={2.4} />
                </span>
                <div>
                  <h2 id="contact-login-title" className="text-2xl font-black leading-tight">
                    Please login to send a message.
                  </h2>
                  <p
                    id="contact-login-description"
                    className="mt-3 text-sm font-semibold leading-6 text-[#46623d]"
                  >
                    Contact messages are accepted from signed-in RouteRaksha users only, so
                    our team can reply and track your request properly.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#d8e5d3] bg-[#f1f6f0] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#46623d]">
                  Message status
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-[#9cec6d] text-[#102f00]">
                    <Icon name="message" className="size-5" />
                  </span>
                  <p className="text-sm font-bold leading-6 text-[#173a0b]">
                    Your message has not been sent yet.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIsLoginPopupOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-full border border-[#173a0b] bg-white px-5 text-sm font-black text-[#173a0b] transition hover:bg-[#f1f6f0]"
                >
                  Stay here
                </button>
                <Link
                  to="/login"
                  className="flex min-h-12 items-center justify-center rounded-full bg-[#173a0b] px-5 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,47,0,0.18)] transition hover:bg-[#102f00]"
                >
                  Login now
                </Link>
              </div>

              <p className="mt-4 text-center text-sm font-semibold text-[#46623d]">
                New to RouteRaksha?{" "}
                <Link
                  to="/signup"
                  className="font-black text-[#173a0b] underline decoration-[#9cec6d] decoration-4 underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ContactPage;
