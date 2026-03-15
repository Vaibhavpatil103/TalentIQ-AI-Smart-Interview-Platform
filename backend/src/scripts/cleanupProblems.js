/**
 * Cleanup script — removes all problems imported via Excel
 * that don't have a full problem description (just title-only junk).
 *
 * Usage:
 *   node src/scripts/cleanupProblems.js
 */

import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import Problem from "../models/Problem.js";

async function main() {
  const uri = process.env.DB_URL || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ DB_URL not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Delete all excel-sourced problems (from bad earlier imports)
  const result = await Problem.deleteMany({ source: "excel" });
  console.log(`🗑️  Deleted ${result.deletedCount} excel-imported problems`);

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
