/**
 * Import problems from Love Babbar DSA Sheet Excel.
 *
 * Extracts hyperlinks from Excel cells, scrapes each GFG/LeetCode page
 * for the full problem statement using Puppeteer, and inserts into MongoDB.
 *
 * Usage:
 *   node src/scripts/importProblems.js src/data/questions.xlsx
 *
 * Options:
 *   --limit N     Only process the first N problems (for testing)
 *   --skip  N     Skip the first N problems (resume after partial run)
 */

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import XLSX from "xlsx";
import puppeteer from "puppeteer";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import Problem from "../models/Problem.js";

// ───────────────────────────────────────────────
//  CONFIG
// ───────────────────────────────────────────────
const DELAY_MS = 2500; // delay between page loads to avoid rate-limiting
const PAGE_TIMEOUT = 30000;

// ───────────────────────────────────────────────
//  STEP 1 — Parse Excel & extract hyperlinks
// ───────────────────────────────────────────────
function parseExcel(filePath) {
  const buffer = fs.readFileSync(filePath);
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet["!ref"]);

  const items = [];
  let currentCategory = "General";

  for (let row = range.s.r; row <= range.e.r; row++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Column A = topic
    const cellB = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })]; // Column B = problem

    const topic = cellA?.v?.toString().trim();
    const title = cellB?.v?.toString().trim();
    const url = cellB?.l?.Target;

    // Update running category
    if (topic && topic !== "Topic:" && topic !== "") {
      currentCategory = topic;
    }

    // Skip header/empty/junk rows
    if (
      !title ||
      title === "Problem: " ||
      title === "Problem:" ||
      title === "Done [yes or no]" ||
      title === "<->" ||
      title.includes("youtube.com") ||
      title.includes("http") ||
      title.includes("Questions by Love Babbar") ||
      title.length < 3
    ) {
      continue;
    }

    items.push({
      title,
      category: currentCategory,
      url: url || null,
    });
  }

  return items;
}

// ───────────────────────────────────────────────
//  STEP 2 — Scrape GFG problem pages
// ───────────────────────────────────────────────

/**
 * Scrape a GFG practice/problem page (geeksforgeeks.org/problems/...)
 */
async function scrapeGfgPractice(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: PAGE_TIMEOUT });

  return await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.innerText.trim() : "";
    };

    // Difficulty
    let difficulty = "Medium";
    const diffEl =
      document.querySelector("[class*='difficulty']") ||
      document.querySelector(".problems-header .badge") ||
      document.querySelector("[class*='Difficulty']");
    if (diffEl) {
      const text = diffEl.innerText.trim().toLowerCase();
      if (text.includes("easy")) difficulty = "Easy";
      else if (text.includes("hard")) difficulty = "Hard";
      else difficulty = "Medium";
    }

    // Problem statement
    let description = "";
    const descEl =
      document.querySelector("[class*='problem_content']") ||
      document.querySelector("[class*='problem-statement']") ||
      document.querySelector(".problems-content") ||
      document.querySelector(".problem-statement") ||
      document.querySelector("div.content");
    if (descEl) {
      description = descEl.innerText.trim();
    }

    // Extract examples
    const examples = [];
    const exampleBlocks = document.querySelectorAll("[class*='example']");
    if (exampleBlocks.length > 0) {
      exampleBlocks.forEach((block) => {
        const text = block.innerText.trim();
        const inputMatch = text.match(/Input[:\s]*(.*?)(?=Output|$)/si);
        const outputMatch = text.match(/Output[:\s]*(.*?)(?=Explanation|$)/si);
        const explMatch = text.match(/Explanation[:\s]*(.*?)$/si);
        if (inputMatch || outputMatch) {
          examples.push({
            input: inputMatch ? inputMatch[1].trim() : "",
            output: outputMatch ? outputMatch[1].trim() : "",
            explanation: explMatch ? explMatch[1].trim() : "",
          });
        }
      });
    }

    // If no example blocks found, try to parse from the description text
    if (examples.length === 0 && description) {
      const exMatches = description.match(/Example\s*\d*[:\s]*(.*?)(?=Example\s*\d|Constraints|Your Task|Expected|$)/gsi);
      if (exMatches) {
        for (const ex of exMatches) {
          const inputMatch = ex.match(/Input[:\s]*(.*?)(?=Output|$)/si);
          const outputMatch = ex.match(/Output[:\s]*(.*?)(?=Explanation|$)/si);
          const explMatch = ex.match(/Explanation[:\s]*(.*?)$/si);
          if (inputMatch || outputMatch) {
            examples.push({
              input: inputMatch ? inputMatch[1].trim() : "",
              output: outputMatch ? outputMatch[1].trim() : "",
              explanation: explMatch ? explMatch[1].trim() : "",
            });
          }
        }
      }
    }

    // Constraints
    const constraints = [];
    const constraintMatch = description.match(/Constraints?\s*:?\s*([\s\S]*?)(?=Your Task|Expected|Company|$)/i);
    if (constraintMatch) {
      const lines = constraintMatch[1].split("\n").map((l) => l.trim()).filter(Boolean);
      constraints.push(...lines);
    }

    // Clean description: remove everything after "Example" section
    let cleanDesc = description;
    const exampleIdx = cleanDesc.search(/Examples?\s*:/i);
    if (exampleIdx > 0) {
      cleanDesc = cleanDesc.substring(0, exampleIdx).trim();
    }

    return { difficulty, description: cleanDesc, examples, constraints };
  });
}

/**
 * Scrape a GFG article page (geeksforgeeks.org/article-slug/)
 */
async function scrapeGfgArticle(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: PAGE_TIMEOUT });

  return await page.evaluate(() => {
    let description = "";
    const articleEl =
      document.querySelector("article") ||
      document.querySelector(".entry-content") ||
      document.querySelector("[class*='article']") ||
      document.querySelector("main");

    if (articleEl) {
      // Get just the first few paragraphs as the problem statement
      const paragraphs = articleEl.querySelectorAll("p");
      const textParts = [];
      for (let i = 0; i < Math.min(5, paragraphs.length); i++) {
        const text = paragraphs[i].innerText.trim();
        if (text && !text.includes("Recommended") && !text.includes("Please try")) {
          textParts.push(text);
        }
      }
      description = textParts.join("\n\n");
    }

    // Try to get examples from pre/code blocks
    const examples = [];
    const preBlocks = document.querySelectorAll("pre, .code-block");
    for (let i = 0; i < Math.min(4, preBlocks.length); i += 2) {
      const input = preBlocks[i]?.innerText?.trim() || "";
      const output = preBlocks[i + 1]?.innerText?.trim() || "";
      if (input && output) {
        examples.push({ input, output, explanation: "" });
      }
    }

    return { difficulty: "Medium", description, examples, constraints: [] };
  });
}

/**
 * Scrape a LeetCode page — LeetCode blocks scrapers heavily,
 * so we just store the title + URL as description.
 */
function scrapeLeetCodeFallback(title, url) {
  return {
    difficulty: "Medium",
    description: `${title}\n\nProblem link: ${url}`,
    examples: [],
    constraints: [],
  };
}

// ───────────────────────────────────────────────
//  STEP 3 — Main
// ───────────────────────────────────────────────
async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Usage: node src/scripts/importProblems.js <path-to-xlsx>");
    process.exit(1);
  }

  // Parse CLI flags
  const args = process.argv.slice(3);
  let limit = Infinity;
  let skip = 0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) limit = parseInt(args[i + 1]);
    if (args[i] === "--skip" && args[i + 1]) skip = parseInt(args[i + 1]);
  }

  const absolutePath = path.resolve(filePath);
  console.log(`📄 Reading Excel: ${absolutePath}`);

  const items = parseExcel(absolutePath);
  console.log(`📊 Found ${items.length} problems in Excel`);

  // Deduplicate by title (some problems appear twice like Kadane's)
  const seen = new Set();
  const uniqueItems = items.filter((item) => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`🔍 ${uniqueItems.length} unique problems after dedup`);

  // Apply skip & limit
  const toProcess = uniqueItems.slice(skip, skip + limit);
  console.log(`🚀 Processing ${toProcess.length} problems (skip=${skip}, limit=${limit})`);

  // Launch Puppeteer
  console.log("🌐 Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  // Block images and fonts to speed up loading
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "font", "media", "stylesheet"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const batchId = new Date().toISOString();
  const problems = [];
  let scraped = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const item = toProcess[i];
    const idx = skip + i + 1;
    console.log(`\n🔎 Scraping ${idx}/${skip + toProcess.length}: "${item.title}"`);

    let scraped_data;

    try {
      if (!item.url) {
        // No hyperlink — just store title
        console.log("   ⚠️  No URL — storing title only");
        scraped_data = {
          difficulty: "Medium",
          description: item.title,
          examples: [],
          constraints: [],
        };
      } else if (item.url.includes("leetcode.com")) {
        // LeetCode — can't easily scrape, use fallback
        console.log("   ℹ️  LeetCode URL — storing title + link");
        scraped_data = scrapeLeetCodeFallback(item.title, item.url);
      } else if (item.url.includes("/problems/") || item.url.includes("practice.geeksforgeeks")) {
        // GFG practice page
        console.log(`   🌐 GFG Practice: ${item.url}`);
        scraped_data = await scrapeGfgPractice(page, item.url);
      } else {
        // GFG article page
        console.log(`   🌐 GFG Article: ${item.url}`);
        scraped_data = await scrapeGfgArticle(page, item.url);
      }

      problems.push({
        title: item.title,
        difficulty: scraped_data.difficulty,
        category: item.category,
        description: {
          text: scraped_data.description || item.title,
          notes: [],
        },
        tags: [item.category],
        examples: scraped_data.examples.slice(0, 3), // max 3 examples
        constraints: scraped_data.constraints.slice(0, 10),
        starterCode: { javascript: "", python: "", java: "", cpp: "" },
        source: "excel",
        importBatch: batchId,
        isPublic: true,
      });

      scraped++;
      console.log(
        `   ✅ Scraped (${scraped_data.difficulty}) — ${scraped_data.description?.substring(0, 80) || "no desc"}...`
      );
    } catch (err) {
      failed++;
      console.error(`   ❌ Failed: ${err.message}`);

      // Still insert with just the title
      problems.push({
        title: item.title,
        difficulty: "Medium",
        category: item.category,
        description: { text: item.title + (item.url ? `\n\nLink: ${item.url}` : ""), notes: [] },
        tags: [item.category],
        examples: [],
        constraints: [],
        starterCode: { javascript: "", python: "", java: "", cpp: "" },
        source: "excel",
        importBatch: batchId,
        isPublic: true,
      });
    }

    // Delay between requests
    if (i < toProcess.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  await browser.close();
  console.log(`\n🌐 Browser closed. Scraped: ${scraped}, Failed: ${failed}`);

  // ── Insert into MongoDB ──
  if (problems.length === 0) {
    console.log("❌ No problems to insert.");
    process.exit(0);
  }

  console.log(`\n🔗 Connecting to MongoDB...`);
  const uri = process.env.DB_URL || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ DB_URL not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  try {
    const result = await Problem.insertMany(problems, { ordered: false });
    console.log(`\n✅ Imported ${result.length} problems, skipped ${problems.length - result.length} duplicates`);
  } catch (err) {
    if (err.code === 11000 || err.insertedDocs) {
      const inserted = err.insertedDocs?.length || err.result?.nInserted || 0;
      const skipped = problems.length - inserted;
      console.log(`\n✅ Imported ${inserted} problems, skipped ${skipped} duplicates`);
    } else {
      console.error("❌ MongoDB insert failed:", err.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
