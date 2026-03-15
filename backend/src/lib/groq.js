import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Llama 3.3 — fast, great for follow-up chat & conversations
export async function callGroq(prompt, maxTokens = 500, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      const isRateLimit = error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.toLowerCase().includes("rate limit");

      if (isRateLimit && i < retries - 1) {
        const waitMs = Math.pow(2, i) * 3000;
        console.warn(`Groq rate limited. Retrying in ${waitMs / 1000}s... (attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      } else {
        console.error("Groq API error:", error?.message || error);
        throw error;
      }
    }
  }
}
