const DEFAULT_MODEL = "llama-3.3-70b-versatile";

async function requestGroq({ apiKey, model, messages }) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.5,
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Groq request failed.");
  }

  return data;
}

async function sendChatMessage(req, res) {
  const { messages = [], user = null } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return res.status(500).json({
      message: "Groq API key is missing. Add GROQ_API_KEY in server/.env.",
    });
  }

  const safeMessages = messages
    .filter((message) => ["user", "assistant"].includes(message.role) && message.content)
    .slice(-10);

  if (!safeMessages.length) {
    return res.status(400).json({ message: "Message is required." });
  }

  try {
    const promptMessages = [
      {
        role: "system",
        content:
          `You are RouteRaksha Assistant for a blackspot-aware road safety web app focused on Khargone district. Help users with nearby dangerous roads, safest route suggestions, blackspot meaning, accident reporting guidance, contact support, login requirements, and admin review. Mention Khargone examples such as Bistan road, Bhikangaon crossing, Sanawad road, and Dongargaon bridge when relevant. Be concise in 2-4 sentences, warm, and practical. ${
            user?.name
              ? `The current logged-in user's name is ${user.name}, email is ${user.email || "not available"}, and role is ${user.role || "user"}. Address them by name naturally when helpful.`
              : "The current visitor is not logged in."
          }`,
      },
      ...safeMessages,
    ];
    const data = await requestGroq({ apiKey, model, messages: promptMessages });
    const reply = data?.choices?.[0]?.message?.content || "No response.";

    return res.json({
      reply,
      content: [{ type: "text", text: reply }],
      model,
    });
  } catch (error) {
    console.error("Groq error:", error.message);

    return res.status(500).json({
      message: error.message || "Chat request failed.",
    });
  }
}

export { sendChatMessage };
