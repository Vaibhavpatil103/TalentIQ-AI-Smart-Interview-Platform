import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { sendInterviewInvite } from "../lib/email.js";
import { callGroq } from "../lib/groq.js";

// ── applyToJob ────────────────────────────────────────────────
export async function applyToJob(req, res) {
  try {
    const { jobId, coverLetter } = req.body;

    // Validate job exists and is published
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "published") {
      return res.status(400).json({ message: "Job is not accepting applications" });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({
      jobId,
      candidateId: req.user.clerkId,
    });
    if (existing) {
      return res.status(409).json({ message: "Already applied to this job" });
    }

    const candidate = await User.findOne({ clerkId: req.user.clerkId });

    const application = await Application.create({
      jobId,
      candidateId: req.user.clerkId,
      candidateObjectId: req.user._id,
      recruiterId: job.companyId,
      resumeUrl: candidate?.resumeUrl || "",
      coverLetter: coverLetter || "",
      status: "applied",
    });

    // Increment applicant count on the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    return res.status(201).json({ application });
  } catch (error) {
    console.log("Error in applyToJob:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── getApplicationsForJob ─────────────────────────────────────
export async function getApplicationsForJob(req, res) {
  try {
    const { jobId } = req.params;

    // Verify recruiter owns the job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.companyId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const applications = await Application.find({ jobId })
      .populate(
        "candidateObjectId",
        "name email profileImage techStack resumeUrl"
      )
      .sort({ matchScore: -1, createdAt: -1 });

    return res.json({ applications });
  } catch (error) {
    console.log("Error in getApplicationsForJob:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── getMyApplications ─────────────────────────────────────────
export async function getMyApplications(req, res) {
  try {
    const applications = await Application.find({
      candidateId: req.user.clerkId,
    })
      .populate("jobId", "title company location jobType status")
      .sort({ createdAt: -1 });

    return res.json({ applications });
  } catch (error) {
    console.log("Error in getMyApplications:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── updateApplicationStatus ───────────────────────────────────
export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, recruiterNotes } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.recruiterId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status) application.status = status;
    if (recruiterNotes !== undefined) application.recruiterNotes = recruiterNotes;

    await application.save();
    return res.json({ application });
  } catch (error) {
    console.log("Error in updateApplicationStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── scheduleInterview ─────────────────────────────────────────
export async function scheduleInterview(req, res) {
  try {
    const { id } = req.params;
    const { scheduledAt, candidateEmail } = req.body;

    const application = await Application.findById(id).populate(
      "candidateObjectId",
      "name email"
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.recruiterId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = "interview_scheduled";
    application.interviewScheduledAt = scheduledAt;
    await application.save();

    // Send email invite if a candidate email was supplied
    if (candidateEmail) {
      try {
        await sendInterviewInvite({
          to: candidateEmail,
          candidateName:
            application.candidateObjectId?.name || "Candidate",
          interviewerName: req.user.name || "Your Interviewer",
          scheduledAt,
          sessionLink: process.env.CLIENT_URL + "/join",
          joinCode: "Will be provided separately",
        });
      } catch (emailErr) {
        // Non-fatal — log but don't fail the request
        console.warn("Failed to send interview invite email:", emailErr.message);
      }
    }

    return res.json({ application });
  } catch (error) {
    console.log("Error in scheduleInterview:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── getApplicationById ────────────────────────────────────────
export async function getApplicationById(req, res) {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate("jobId")
      .populate(
        "candidateObjectId",
        "name email profileImage techStack resumeUrl githubUrl"
      );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Auth check: recruiter who owns it OR candidate who submitted it
    const isRecruiter = application.recruiterId === req.user.clerkId;
    const isCandidate = application.candidateId === req.user.clerkId;

    if (!isRecruiter && !isCandidate) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json({ application });
  } catch (error) {
    console.log("Error in getApplicationById:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── sendOffer ─────────────────────────────────────────────────
export async function sendOffer(req, res) {
  try {
    const { id } = req.params;
    const { offeredSalary, message } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.recruiterId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.offerSent = true;
    application.offerSentAt = new Date();
    application.offeredSalary = offeredSalary;
    application.status = "offer_sent";
    application.offerStatus = "pending";
    if (message) application.recruiterNotes = message;

    await application.save();
    return res.json({ application });
  } catch (error) {
    console.log("Error in sendOffer:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── respondToOffer ────────────────────────────────────────────
export async function respondToOffer(req, res) {
  try {
    const { id } = req.params;
    const { response } = req.body; // "accepted" | "rejected" | "negotiating"

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.candidateId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.offerStatus = response;

    if (response === "accepted") {
      application.status = "hired";
    } else if (response === "rejected") {
      application.status = "rejected";
    }

    await application.save();
    return res.json({ application });
  } catch (error) {
    console.log("Error in respondToOffer:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── aiMatchResume ─────────────────────────────────────────────
export async function aiMatchResume(req, res) {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate("jobId")
      .populate("candidateObjectId", "name techStack resumeUrl");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.recruiterId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const job = application.jobId;
    const candidate = application.candidateObjectId;

    const prompt = `You are a technical recruiter AI assistant.

Job Requirements:
Title: ${job.title}
Required Skills: ${job.skills?.join(", ") || "Not specified"}
Experience Level: ${job.experienceLevel}
Description: ${job.description}

Candidate Profile:
Name: ${candidate.name}
Tech Stack: ${candidate.techStack?.join(", ") || "Not specified"}
Resume URL: ${candidate.resumeUrl || "Not provided"}

Analyze how well this candidate matches the job.
Return ONLY valid JSON with no extra text or markdown:
{
  "matchScore": number (0-100),
  "matchedSkills": [string],
  "missingSkills": [string],
  "aiSummary": string (2-3 sentences assessment)
}`;

    const raw = await callGroq(prompt, 600);

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json?\n?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    application.matchScore = parsed.matchScore ?? 0;
    application.matchedSkills = parsed.matchedSkills ?? [];
    application.missingSkills = parsed.missingSkills ?? [];
    application.aiSummary = parsed.aiSummary ?? "";
    await application.save();

    return res.json({ application });
  } catch (error) {
    console.log("Error in aiMatchResume:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
