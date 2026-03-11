import { inngest } from "../lib/inngestClient.js";
import Anthropic from "@anthropic-ai/sdk";
import Session from "../models/Session.js";
import { connectDB } from "../lib/db.js";

export const aiCodeReview = inngest.createFunction(
  { id: "ai-code-review", name: "AI Code Review" },
  { event: "session/completed" },
  async ({ event, step }) => {
    const { sessionId, code, language, problemTitle } = event.data;

    await step.run("connect-db", async () => {
      await connectDB();
    });

    const review = await step.run("call-claude", async () => {
      const apiKey = process.env.CLAUDE_API_KEY;
      if (!apiKey) {
        console.warn("CLAUDE_API_KEY not configured — skipping AI review");
        return {
          scores: { correctness: 0, efficiency: 0, readability: 0 },
          suggestions: "AI review not available — API key not configured.",
        };
      }

      const anthropic = new Anthropic({ apiKey });

      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are a senior software engineer reviewing code from a technical interview.

Review this ${language} solution for the problem "${problemTitle}".

Code:
\`\`\`${language}
${code}
\`\`\`

Score the solution 1-5 on each dimension:
- correctness: Does it solve the problem correctly?
- efficiency: Is the time/space complexity optimal?
- readability: Is the code clean, well-structured, and readable?

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "scores": {
    "correctness": <number>,
    "efficiency": <number>,
    "readability": <number>
  },
  "suggestions": "<1-3 sentence improvement suggestions>"
}`,
          },
        ],
      });

      try {
        return JSON.parse(msg.content[0].text);
      } catch (e) {
        return {
          scores: { correctness: 3, efficiency: 3, readability: 3 },
          suggestions: msg.content[0].text,
        };
      }
    });

    await step.run("save-to-db", async () => {
      await connectDB();
      await Session.findByIdAndUpdate(sessionId, {
        aiReview: {
          scores: review.scores,
          suggestions: review.suggestions,
          completedAt: new Date(),
        },
      });
    });

    return { success: true, sessionId, review };
  }
);
