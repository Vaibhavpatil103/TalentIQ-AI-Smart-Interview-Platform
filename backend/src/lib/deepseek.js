import { callGroq } from "./groq.js"

// DeepSeek has no balance — routing scorecard evaluation to Groq instead
// Groq's llama-3.3-70b-versatile handles JSON evaluation well
export async function callDeepSeek(prompt, maxTokens = 1500) {
  return await callGroq(prompt, maxTokens)
}