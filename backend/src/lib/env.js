import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// ─── Environment Variable Schema ────────────────────────────────
// Required vars crash the server on startup if missing.
// Optional vars have defaults or are only needed for specific features.
const envSchema = z.object({
  // Core
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DB_URL: z.string().min(1, "DB_URL is required"),
  CLIENT_URL: z.string().min(1, "CLIENT_URL is required"),

  // Auth (Clerk)
  CLERK_PUBLISHABLE_KEY: z.string().min(1, "CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

  // Stream.io (Video/Chat)
  STREAM_API_KEY: z.string().min(1, "STREAM_API_KEY is required"),
  STREAM_API_SECRET: z.string().min(1, "STREAM_API_SECRET is required"),

  // Background Jobs
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // AI Providers (at least one should be set)
  CLAUDE_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  NVIDIA_API_KEY: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),

  // Other
  AGORA_APP_ID: z.string().optional(),
  AGORA_APP_CERTIFICATE: z.string().optional(),
});

// ─── Validate & Export ──────────────────────────────────────────
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Environment variable validation failed:");
  for (const issue of result.error.issues) {
    console.error(`   → ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("\nPlease check your .env file and ensure all required variables are set.");
  console.error("See backend/.env.example for the full list of variables.\n");
  process.exit(1);
}

export const ENV = result.data;
