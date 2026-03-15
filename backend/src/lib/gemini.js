import { GoogleGenerativeAI } from "@google/generative-ai";
import { callQwen } from "./qwen.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function callGeminiWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await geminiModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        const retryDelay = error.errorDetails
          ?.find((d) => d["@type"]?.includes("RetryInfo"))
          ?.retryDelay?.replace("s", "");
        const waitMs = retryDelay ? parseInt(retryDelay) * 1000 : 2 ** i * 5000;
        console.log(`Gemini rate limited. Retrying in ${waitMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      } else if (error.status === 429) {
        // All retries exhausted — fall back to Qwen 3.5-122B via NVIDIA
        console.log("⚠ Gemini quota exhausted. Falling back to Qwen 3.5-122B (NVIDIA)...");
        return await callQwen(prompt, 1500);
      } else {
        throw error;
      }
    }
  }
}
