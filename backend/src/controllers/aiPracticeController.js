import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { extractPdfText } = require("../lib/pdfHelper.cjs");
import { callGroq } from "../lib/groq.js";
import { callQwen } from "../lib/qwen.js";
import AIPracticeSession from "../models/AIPracticeSession.js";
import { awardXPInternal } from "./gamificationController.js";

// ─── Persona tone map ──────
const PERSONA_TONE = {
  Friendly: "Be warm, encouraging and supportive.",
  Neutral: "Be professional and objective.",
  Strict: "Be direct, challenging and no-nonsense.",
};

// ─── Difficulty order for adaptive logic ──────
const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard"];

export const startSession = async (req, res) => {
  try {
    const {
      mode,
      topic,
      difficulty,
      persona = "Neutral",
      interviewType = "Coding Interview",
      voiceModeEnabled = false,
    } = req.body;
    const userId = req.user.clerkId;
    const personaTone = PERSONA_TONE[persona] || PERSONA_TONE.Neutral;

    if (mode === "topic") {
      let prompt;
      const isBehavioral =
        interviewType === "Behavioral" ||
        interviewType === "HR Interview" ||
        topic === "Behavioral";

      if (isBehavioral) {
        prompt = `You are a ${persona} interviewer. ${personaTone}
Ask ONE behavioral interview question using STAR method format.
Difficulty: ${difficulty}.
Respond with only the question, no preamble.`;
      } else {
        prompt = `You are a ${persona} technical interviewer. ${personaTone}
Topic: ${topic}. Difficulty: ${difficulty}.
Ask ONE clear focused technical interview question.
Do not give hints. Respond with only the question.`;
      }

      const question = await callQwen(prompt);

      const session = await AIPracticeSession.create({
        userId,
        mode: "topic",
        topic,
        difficulty,
        persona,
        currentDifficulty: difficulty,
        voiceModeEnabled,
        consecutiveHighScores: 0,
        consecutiveLowScores: 0,
        messages: [{ role: "ai", content: question }],
        questionCount: 1,
      });

      return res.status(201).json({
        sessionId: session._id,
        question,
        mode: "topic",
        persona,
        voiceModeEnabled,
      });
    }

    if (mode === "resume") {
      if (!req.file)
        return res.status(400).json({ message: "Resume file is required" });
      const dataBuffer = fs.readFileSync(req.file.path);
      const resumeText = await extractPdfText(dataBuffer);
      fs.unlinkSync(req.file.path);

      const prompt = `You are a senior technical interviewer.
Here is a candidate's resume: ${resumeText}
Ask ONE specific relevant technical interview question.
Respond with only the question, no preamble.`;

      const question = await callGroq(prompt, 300);

      const session = await AIPracticeSession.create({
        userId,
        mode: "resume",
        resumeText,
        persona,
        voiceModeEnabled,
        currentDifficulty: "Medium",
        messages: [{ role: "ai", content: question }],
        questionCount: 1,
      });

      return res.status(201).json({
        sessionId: session._id,
        question,
        mode: "resume",
        persona,
        voiceModeEnabled,
      });
    }

    return res.status(400).json({ message: "Invalid mode." });
  } catch (error) {
    console.error("Error in startSession:", error);
    res
      .status(500)
      .json({ message: "Failed to start session", error: error.message });
  }
};

export const respondToAnswer = async (req, res) => {
  try {
    const { sessionId, userAnswer, timeTaken } = req.body;
    const session = await AIPracticeSession.findById(sessionId);
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    session.messages.push({
      role: "user",
      content: userAnswer,
      timeTaken: timeTaken || 0,
    });
    session.questionCount += 1;

    // ─── A) Internal answer scoring using Qwen ──────
    const lastQuestion =
      session.messages
        .filter((m) => m.role === "ai")
        .slice(-1)[0]?.content || "";

    const scoringPrompt = `Rate this interview answer 1-5.
Question: "${lastQuestion}"
Answer: "${userAnswer}"
Return ONLY a single digit 1-5. Nothing else.
1=very poor 2=poor 3=average 4=good 5=excellent`;

    const scoreText = await callQwen(scoringPrompt);
    const answerScore = Math.min(
      5,
      Math.max(1, parseInt(scoreText.trim()) || 3)
    );

    // ─── B) Adaptive difficulty logic ──────
    let currentDiff =
      session.currentDifficulty || session.difficulty || "Medium";
    let high = session.consecutiveHighScores || 0;
    let low = session.consecutiveLowScores || 0;
    let difficultyChanged = false;
    let newDifficulty = currentDiff;

    if (answerScore >= 4) {
      high += 1;
      low = 0;
      if (high >= 2) {
        const idx = DIFFICULTY_ORDER.indexOf(currentDiff);
        if (idx < 2) {
          newDifficulty = DIFFICULTY_ORDER[idx + 1];
          high = 0;
          difficultyChanged = true;
        }
      }
    } else if (answerScore <= 2) {
      low += 1;
      high = 0;
      if (low >= 2) {
        const idx = DIFFICULTY_ORDER.indexOf(currentDiff);
        if (idx > 0) {
          newDifficulty = DIFFICULTY_ORDER[idx - 1];
          low = 0;
          difficultyChanged = true;
        }
      }
    } else {
      high = 0;
      low = 0;
    }

    session.currentDifficulty = newDifficulty;
    session.consecutiveHighScores = high;
    session.consecutiveLowScores = low;

    // ─── C) Persona-aware follow-up using Groq ──────
    const personaTone =
      session.persona === "Friendly"
        ? "Be warm and encouraging."
        : session.persona === "Strict"
        ? "Be direct and challenging."
        : "Be professional and neutral.";

    const conversationHistory = session.messages
      .map(
        (m) =>
          `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`
      )
      .join("\n\n");

    let aiResponse;

    if (session.mode === "topic") {
      const prompt = `You are a technical interviewer. ${personaTone}
Next question difficulty: ${newDifficulty}.
Conversation so far:
${conversationHistory}
If answer incomplete: ask ONE probing follow-up.
If answered well: ask a new ${newDifficulty} difficulty question on same topic.
If 5th or more question: respond exactly 'INTERVIEW_COMPLETE'
Respond with only the question or INTERVIEW_COMPLETE.`;
      aiResponse = await callGroq(prompt, 500);
    } else {
      const prompt = `You are a technical interviewer. ${personaTone}
Resume: ${session.resumeText}
Conversation so far:
${conversationHistory}
Ask a follow-up probing deeper OR move to another resume skill.
If 5th+ exchange: 'INTERVIEW_COMPLETE'
Respond with only the question or INTERVIEW_COMPLETE.`;
      aiResponse = await callGroq(prompt, 500);
    }

    if (aiResponse.includes("INTERVIEW_COMPLETE")) {
      await session.save();
      return res.json({
        reply: null,
        isComplete: true,
        difficultyChanged,
        newDifficulty: difficultyChanged ? newDifficulty : null,
        answerScore,
      });
    }

    session.messages.push({ role: "ai", content: aiResponse });
    await session.save();

    return res.json({
      reply: aiResponse,
      isComplete: false,
      difficultyChanged,
      newDifficulty: difficultyChanged ? newDifficulty : null,
      answerScore,
    });
  } catch (error) {
    console.error("Error in respondToAnswer:", error);
    res
      .status(500)
      .json({ message: "Failed to process answer", error: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId, totalDuration } = req.body;
    const session = await AIPracticeSession.findById(sessionId);
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    session.totalDuration = totalDuration;

    const conversationTranscript = session.messages
      .map((m) => {
        const label = m.role === "ai" ? "Interviewer" : "Candidate";
        const timeInfo = m.timeTaken ? ` (answered in ${m.timeTaken}s)` : "";
        return `${label}${timeInfo}: ${m.content}`;
      })
      .join("\n\n");

    const topicContext =
      session.mode === "topic"
        ? `${session.topic} (${session.difficulty})`
        : "Resume-based interview";

    const prompt = `You are evaluating a mock technical interview.
Interviewer persona: ${session.persona || "Neutral"}
Interview topic/context: ${topicContext}
Total questions: ${session.questionCount}
Total time: ${totalDuration} seconds
Full conversation:
${conversationTranscript}

Return ONLY valid JSON with NO markdown fences, NO explanation:
{
  "overallScore": number (1-10),
  "communication": number (1-10),
  "technicalDepth": number (1-10),
  "problemSolving": number (1-10),
  "confidence": number (1-10),
  "clarity": number (1-10),
  "depth": number (1-10),
  "correctness": number (1-10),
  "strengths": [string, string, string],
  "improvements": [string, string, string],
  "summary": string (2-3 sentences),
  "companyReadiness": {
    "Google": number (0-100),
    "Amazon": number (0-100),
    "Meta": number (0-100),
    "Microsoft": number (0-100)
  },
  "questionBreakdown": [
    {
      "question": string,
      "score": number (1-10),
      "comment": string (one sentence),
      "idealAnswer": string (2-3 sentences of the ideal answer),
      "clarityScore": number (1-10),
      "depthScore": number (1-10),
      "correctnessScore": number (1-10),
      "weaknessTags": [string] (e.g. "missed edge case", "poor time complexity", "good structure"),
      "gapExplanation": string (one sentence explaining the gap between user answer and ideal)
    }
  ]
}`;

    let feedbackText = await callQwen(prompt);
    feedbackText = feedbackText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");

    let feedback;
    try {
      feedback = JSON.parse(feedbackText);
    } catch {
      feedback = {
        overallScore: 0,
        communication: 0,
        technicalDepth: 0,
        problemSolving: 0,
        confidence: 0,
        clarity: 0,
        depth: 0,
        correctness: 0,
        strengths: ["Feedback generation failed"],
        improvements: ["Feedback generation failed"],
        summary: "Feedback generation failed.",
        companyReadiness: { Google: 0, Amazon: 0, Meta: 0, Microsoft: 0 },
        questionBreakdown: [],
      };
    }

    session.feedback = feedback;
    session.status = "completed";
    await session.save();

    let xpResult = null;
    try {
      xpResult = await awardXPInternal(session.userId, {
        overallScore: feedback.overallScore,
        topic: session.topic,
        mode: session.mode,
        voiceModeEnabled: session.voiceModeEnabled,
        persona: session.persona,
        difficulty: session.currentDifficulty || session.difficulty,
        companyReadiness: feedback.companyReadiness,
      });
    } catch (xpErr) {
      console.error("XP award failed (non-critical):", xpErr.message);
    }

    return res.json({ feedback, xpResult });
  } catch (error) {
    console.error("Error in endSession:", error);
    res
      .status(500)
      .json({ message: "Failed to end session", error: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalCount = await AIPracticeSession.countDocuments({
      userId,
      status: "completed",
    });
    const sessions = await AIPracticeSession.find({
      userId,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-messages -resumeText");
    return res.json({
      sessions,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sessions", error: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await AIPracticeSession.findById(req.params.id);
    if (!session)
      return res.status(404).json({ message: "Session not found" });
    if (session.userId !== req.user.clerkId)
      return res.status(403).json({ message: "Unauthorized" });
    return res.json({ session });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch session", error: error.message });
  }
};