import express from "express";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const router = express.Router();

// Language config: runtime command and file extension
const LANGUAGES = {
  javascript: { command: "node", ext: "js" },
  python: { command: "python", ext: "py" },
  java: { command: null, ext: "java", compile: true },
  cpp: { command: null, ext: "cpp", compile: true },
};

// Execution timeout (10 seconds)
const TIMEOUT_MS = 10000;

/**
 * POST /api/execute
 * body: { language, code }
 * Executes code locally using child_process with a timeout.
 */
router.post("/", async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({
      success: false,
      error: "Language and code are required",
    });
  }

  const langConfig = LANGUAGES[language];
  if (!langConfig) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: ${language}`,
    });
  }

  // Create a temp file for the code
  const tmpDir = os.tmpdir();
  const fileId = crypto.randomBytes(8).toString("hex");
  const fileName = `talentiq_${fileId}.${langConfig.ext}`;
  const filePath = path.join(tmpDir, fileName);

  try {
    fs.writeFileSync(filePath, code, "utf-8");

    let result;

    if (language === "java") {
      // Java: compile then run
      result = await runJava(filePath, tmpDir, fileId);
    } else if (language === "cpp") {
      // C++: compile then run
      result = await runCpp(filePath, tmpDir, fileId);
    } else {
      // Interpreted: python / javascript
      result = await runProcess(langConfig.command, [filePath]);
    }

    return res.json(result);
  } catch (error) {
    console.error("Error in execute:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal execution error",
    });
  } finally {
    // Cleanup temp files
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
  }
});

/**
 * Run a process with timeout and capture stdout/stderr
 */
function runProcess(command, args, cwd) {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let killed = false;

    const proc = spawn(command, args, {
      timeout: TIMEOUT_MS,
      cwd: cwd || undefined,
      stdio: ["pipe", "pipe", "pipe"],
      // Windows: don't open a new window
      windowsHide: true,
    });

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      // Limit output size (100KB)
      if (stdout.length > 100000) {
        proc.kill();
        killed = true;
      }
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      resolve({
        success: false,
        error: `Failed to start ${command}: ${err.message}. Make sure ${command} is installed and in PATH.`,
      });
    });

    proc.on("close", (exitCode) => {
      if (killed) {
        return resolve({
          success: false,
          output: stdout.slice(0, 5000),
          error: "Output too large — truncated",
        });
      }

      if (exitCode !== 0 || stderr) {
        return resolve({
          success: false,
          output: stdout || undefined,
          error: stderr || `Process exited with code ${exitCode}`,
        });
      }

      resolve({
        success: true,
        output: stdout || "No output",
      });
    });

    // Timeout handling
    setTimeout(() => {
      if (!proc.killed) {
        proc.kill();
        resolve({
          success: false,
          error: "Execution timed out (10 second limit)",
        });
      }
    }, TIMEOUT_MS + 500);
  });
}

/**
 * Compile and run Java code
 */
async function runJava(filePath, tmpDir, fileId) {
  // Java requires the class name to match the filename
  // Extract public class name from code
  const code = fs.readFileSync(filePath, "utf-8");
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : "Main";

  // Rename file to match class name
  const javaFile = path.join(tmpDir, `${className}.java`);
  if (filePath !== javaFile) {
    fs.copyFileSync(filePath, javaFile);
  }

  // Compile
  const compileResult = await runProcess("javac", [javaFile], tmpDir);
  if (!compileResult.success) {
    try {
      fs.unlinkSync(javaFile);
    } catch {
      /* ignore */
    }
    return {
      success: false,
      error: compileResult.error || compileResult.output,
    };
  }

  // Run
  const runResult = await runProcess("java", ["-cp", tmpDir, className]);

  // Cleanup
  try {
    fs.unlinkSync(javaFile);
    fs.unlinkSync(path.join(tmpDir, `${className}.class`));
  } catch {
    /* ignore */
  }

  return runResult;
}

/**
 * Compile and run C++ code
 */
async function runCpp(filePath, tmpDir, fileId) {
  const outputBin = path.join(tmpDir, `talentiq_${fileId}${process.platform === "win32" ? ".exe" : ""}`);

  // Compile
  const compileResult = await runProcess("g++", [filePath, "-o", outputBin]);
  if (!compileResult.success) {
    return {
      success: false,
      error: compileResult.error || compileResult.output,
    };
  }

  // Run
  const runResult = await runProcess(outputBin, []);

  // Cleanup
  try {
    fs.unlinkSync(outputBin);
  } catch {
    /* ignore */
  }

  return runResult;
}

export default router;
