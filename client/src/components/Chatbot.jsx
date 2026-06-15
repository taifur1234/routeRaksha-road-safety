import { useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const quickQuestions = [
  "How do I plan a safer route?",
  "Which Khargone roads are risky?",
  "Suggest the safest route behavior",
  "What is a blackspot?",
  "How can I report an accident?",
  "Why do I need to login?",
  "How does admin review work?",
];

const avatarColors = [
  "#188038",
  "#f9ab00",
  "#167a43",
  "#0b3d25",
  "#2f8f4e",
  "#6aa84f",
  "#b7791f",
  "#547065",
];

function getUserDisplayName(user) {
  return user?.name?.trim() || user?.displayName?.trim() || user?.email?.split("@")[0] || "Guest";
}

function getAvatarInitial(name) {
  const firstLetter = Array.from(String(name || "Guest").trim()).find((char) => /[a-z0-9]/i.test(char));
  return (firstLetter || "G").toUpperCase();
}

function getAvatarColor(seed) {
  const value = String(seed || "Guest");
  const hash = Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function UserAvatar({ user, name, className = "size-8", textClassName = "text-xs" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photoURL = typeof user?.photoURL === "string" ? user.photoURL.trim() : "";

  if (photoURL && !imageFailed) {
    return (
      <img
        src={photoURL}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`grid ${className} shrink-0 place-items-center rounded-full text-white shadow-sm`}
      style={{ backgroundColor: getAvatarColor(user?.email || name) }}
      aria-hidden="true"
    >
      <span className={`${textClassName} font-black leading-none`}>{getAvatarInitial(name)}</span>
    </span>
  );
}

function getFallbackReply(text) {
  const query = text.toLowerCase();

  if (query.includes("nearby") || query.includes("khargone") || query.includes("dangerous road")) {
    return "In the current Khargone demo layer, watch Bistan road, Bhikangaon crossing, Sanawad road, and the Dongargaon bridge approach. Use Plan Route with GPS to sort Dangerous Areas Near You by distance.";
  }

  if (query.includes("safest") || query.includes("safe route") || query.includes("plan")) {
    return "Open Plan Route, enter source and destination, then compare the danger score, severity mix, and highlighted red or orange route segments. Prefer the route with fewer high-risk blackspots, even if it adds a few minutes.";
  }

  if (query.includes("blackspot")) {
    return "A blackspot is an accident-prone road stretch or junction. RouteRaksha marks it with severity, confidence, accident frequency, and verification status like Government Verified, Community Verified, or Under Review.";
  }

  if (query.includes("report")) {
    return "Go to Report Accident, click the map or use GPS for coordinates, add accident type, time, day or night, severity, notes, and an optional image. Duplicate reports near the same area are blocked to keep the safety layer clean.";
  }

  if (query.includes("admin") || query.includes("review")) {
    return "Admins review pending reports, approve verified blackspots, reject unclear duplicates, edit severity and confidence, and remove fake reports before data is used for route warnings.";
  }

  if (query.includes("login")) {
    return "Login is required for route planning, reporting, and history so reports can be linked to a real account and reviewed responsibly.";
  }

  return "I can help with nearby dangerous roads, safest route suggestions, blackspot meaning, and reporting guidance. The AI service is unavailable right now, so I am using RouteRaksha's built-in safety responses.";
}

function Icon({ name, className = "size-5" }) {
  const icons = {
    bot: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="4" />
        <path d="M9 8V5a3 3 0 0 1 6 0v3" />
        <path d="M9 14h.01" />
        <path d="M15 14h.01" />
        <path d="M10 18h4" />
      </>
    ),
    close: <path d="M18 6 6 18M6 6l12 12" />,
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4z" />
        <path d="M22 2 11 13" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
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
      strokeWidth="2"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function Chatbot() {
  const { user, isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I am RouteRaksha Assistant. Ask me about safer routes, blackspots, reports, or admin review.",
    },
  ]);
  const formRef = useRef(null);

  const apiMessages = useMemo(
    () => messages.filter((message) => ["user", "assistant"].includes(message.role)),
    [messages],
  );
  const displayName = getUserDisplayName(user);
  const firstName = displayName.split(" ")[0] || displayName;

  async function sendMessage(text) {
    if (!text || isLoading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...apiMessages, { role: "user", content: text }],
          user: isLoggedIn
            ? {
                name: user?.name,
                email: user?.email,
                role: user?.role || "user",
              }
            : null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chat failed.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: getFallbackReply(text),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendMessage(input.trim());
  }

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {isOpen && (
        <section className="logout-modal-panel flex h-[34rem] w-[min(calc(100vw-2.5rem),25rem)] flex-col overflow-hidden rounded-2xl border border-[#cfe4d2] bg-white text-[#082015] shadow-[0_28px_90px_rgba(8,32,21,0.24)]">
          <header className="relative overflow-hidden bg-[#082015] px-4 py-4 text-white">
            <div className="absolute inset-0 rr-grid opacity-20" />
            <div className="absolute inset-y-0 right-9 w-1 bg-[repeating-linear-gradient(to_bottom,#f5c451_0_18px,transparent_18px_34px)] opacity-70" />
            <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#8ef35f] text-[#082015] shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
                <Icon name="bot" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-black">RouteRaksha Assistant</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs font-bold text-[#baf89f]">
                  <span className="size-2 rounded-full bg-[#8ef35f] shadow-[0_0_12px_rgba(142,243,95,0.9)]" />
                  {isLoggedIn ? `Chatting with ${firstName}` : "Online now"}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chatbot"
              onClick={() => setIsOpen(false)}
              className="grid size-9 place-items-center rounded-full text-white hover:bg-white/10"
            >
              <Icon name="close" className="size-4" />
            </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f0f8ef] p-4">
            <div className="rounded-2xl border border-[#cfe4d2] bg-white p-3 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#547065]">
                Quick questions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                    className="rounded-full border border-[#cfe4d2] bg-white px-3 py-2 text-left text-xs font-black text-[#547065] hover:border-[#8ef35f] hover:bg-[#e5f7e1] hover:text-[#0b3d25] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e5f7e1] text-[#167a43]">
                      <Icon name="bot" className="size-4" />
                    </span>
                  )}
                  <div className={`max-w-[78%] ${isUser ? "text-right" : "text-left"}`}>
                    <p className="mb-1 px-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#547065]">
                      {isUser ? "You" : "Assistant"}
                    </p>
                    <p
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${
                        isUser
                          ? "rounded-br-md bg-[#167a43] text-white shadow-[0_12px_26px_rgba(22,122,67,0.24)]"
                          : "rounded-bl-md border border-[#cfe4d2] bg-white text-[#082015]"
                      }`}
                    >
                      {message.content}
                    </p>
                  </div>
                  {isUser && (
                    <span className="shrink-0">
                      <UserAvatar user={user} name={displayName} />
                    </span>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-end gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e5f7e1] text-[#167a43]">
                  <Icon name="bot" className="size-4" />
                </span>
                <div>
                  <p className="mb-1 px-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#547065]">
                    Assistant is typing
                  </p>
                  <div className="rounded-2xl rounded-bl-md border border-[#cfe4d2] bg-white px-4 py-3 shadow-sm">
                    <span className="chat-typing-dot" />
                    <span className="chat-typing-dot" />
                    <span className="chat-typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="border-t border-[#cfe4d2] bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask RouteRaksha..."
                className="min-h-11 min-w-0 flex-1 rounded-full border border-[#cfe4d2] px-4 text-sm font-semibold text-[#082015] outline-none placeholder:text-[#547065] focus:border-[#167a43] focus:ring-4 focus:ring-[#8ef35f]/25"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-[#167a43] text-white hover:bg-[#0b3d25] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <Icon name="send" className="size-4" />
              </button>
            </div>
          </form>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          aria-label="Open RouteRaksha chatbot"
          onClick={() => setIsOpen(true)}
          className="grid size-14 place-items-center rounded-full bg-[#082015] text-[#8ef35f] shadow-[0_18px_42px_rgba(8,32,21,0.28)] hover:bg-[#167a43] hover:text-white"
        >
          <Icon name="bot" className="size-6" />
        </button>
      )}
    </div>
  );
}

export default Chatbot;
