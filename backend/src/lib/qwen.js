import OpenAI from "openai";
import { callGroq } from "./groq.js";

const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function callQwen(prompt, maxTokens = 1500) {
  try {
    const response = await nvidia.chat.completions.create({
      model: "deepseek-ai/deepseek-v3.2",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 1,
      top_p: 0.95,
      stream: false,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.log("⚠ DeepSeek V3.2 (NVIDIA) failed:", error.message);
    console.log("↪ Falling back to Groq Llama...");
    return await callGroq(prompt, maxTokens);
  }
}
