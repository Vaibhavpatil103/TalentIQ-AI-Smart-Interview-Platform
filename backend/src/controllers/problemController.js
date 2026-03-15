import Problem from "../models/Problem.js";
import XLSX from "xlsx";
import fs from "fs";

export async function getAllProblems(req, res) {
  try {
    const { difficulty, tag, search } = req.query;
    const filter = { isPublic: true };

    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (tag) {
      filter.tags = { $in: tag.split(",") };
    }
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const problems = await Problem.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ problems });
  } catch (error) {
    console.log("Error in getAllProblems controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getProblemById(req, res) {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);

    if (!problem) return res.status(404).json({ message: "Problem not found" });

    res.status(200).json({ problem });
  } catch (error) {
    console.log("Error in getProblemById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createProblem(req, res) {
  try {
    const problemData = {
      ...req.body,
      createdBy: req.user.clerkId,
    };

    const problem = await Problem.create(problemData);
    res.status(201).json({ problem });
  } catch (error) {
    console.log("Error in createProblem controller:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "A problem with this title already exists" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateProblem(req, res) {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!problem) return res.status(404).json({ message: "Problem not found" });

    res.status(200).json({ problem });
  } catch (error) {
    console.log("Error in updateProblem controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteProblem(req, res) {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) return res.status(404).json({ message: "Problem not found" });

    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProblem controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function importProblems(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read file as buffer (ESM-safe — XLSX.readFile doesn't work in ESM)
    const buffer = fs.readFileSync(req.file.path);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const batchId = new Date().toISOString();

    // Detect format: standard (Title column) or Love Babbar DSA sheet
    const keys = Object.keys(rows[0] || {});
    const isStandard = keys.includes("Title");
    const isBabbar = keys.some((k) => k.includes("Love Babbar") || k.includes("Problem"));

    let problems = [];

    if (isStandard) {
      problems = rows
        .map((row) => {
          const title = row.Title?.toString().trim();
          if (!title) return null;

          const difficulty = row.Difficulty?.toString().trim();
          if (!["Easy", "Medium", "Hard"].includes(difficulty)) return null;

          return {
            title,
            difficulty,
            category: row.Category?.toString().trim() || "General",
            description: {
              text: row.Description?.toString().trim() || "",
              notes: [],
            },
            tags: row.Tags
              ? row.Tags.toString().split(",").map((t) => t.trim()).filter(Boolean)
              : [],
            constraints: row.Constraints
              ? row.Constraints.toString().split("|").map((c) => c.trim()).filter(Boolean)
              : [],
            starterCode: {
              javascript: row.StarterCode_JS?.toString() || "",
              python: row.StarterCode_Python?.toString() || "",
              java: row.StarterCode_Java?.toString() || "",
              cpp: row.StarterCode_CPP?.toString() || "",
            },
            source: "excel",
            importBatch: batchId,
            isPublic: true,
          };
        })
        .filter(Boolean);
    } else if (isBabbar) {
      // Love Babbar DSA sheet format
      const titleKey = keys.find(
        (k) => k.includes("Love Babbar") || k.includes("Problem")
      ) || keys[0];

      let currentCategory = "General";

      for (const row of rows) {
        const title = row[titleKey]?.toString().trim();
        const topic = row.__EMPTY?.toString().trim();

        if (!title || title.includes("http") || title === "Problem: " || title === "<->") continue;

        if (topic && topic !== "Topic:") currentCategory = topic;

        problems.push({
          title,
          difficulty: "Medium",
          category: currentCategory,
          description: { text: title, notes: [] },
          tags: [currentCategory],
          constraints: [],
          starterCode: { javascript: "", python: "", java: "", cpp: "" },
          source: "excel",
          importBatch: batchId,
          isPublic: true,
        });
      }
    } else {
      try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
      return res.status(400).json({
        message: "Unrecognized Excel format. Expected 'Title' column or a Love Babbar DSA sheet.",
      });
    }

    if (problems.length === 0) {
      try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
      return res.status(400).json({ message: "No valid problems found in the file" });
    }

    let imported = 0;
    let skipped = 0;

    try {
      const result = await Problem.insertMany(problems, { ordered: false });
      imported = result.length;
      skipped = problems.length - imported;
    } catch (err) {
      if (err.code === 11000 || err.insertedDocs) {
        imported = err.insertedDocs?.length || err.result?.nInserted || 0;
        skipped = problems.length - imported;
      } else {
        throw err;
      }
    }

    // Cleanup temp file
    try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }

    res.status(200).json({ success: true, imported, skipped });
  } catch (error) {
    console.log("Error in importProblems controller:", error.message);
    try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch { /* ignore */ }
    res.status(500).json({ message: "Import failed", error: error.message });
  }
}

