import { callGroq } from "./groq.js";

/**
 * We bypass the NVIDIA DeepSeek API completely here to resolve the
 * massive slow-down issues during AI practice sessions. Groq is
 * used as a highly responsive alternative for all requests previously 
 * assigned to 'Qwen' or 'DeepSeek'.
 */
export async function callQwen(prompt, maxTokens = 1500) {
  return await callGroq(prompt, maxTokens);
}
