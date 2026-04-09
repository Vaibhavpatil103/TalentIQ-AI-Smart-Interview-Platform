import Job from "../models/Job.js";
import Application from "../models/Application.js";
import User from "../models/User.js";

// ── createJob ─────────────────────────────────────────────────
export async function createJob(req, res) {
  try {
    const {
      title,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      jobType,
      salaryMin,
      salaryMax,
      experienceLevel,
      deadline,
    } = req.body;

    const recruiter = await User.findOne({ clerkId: req.user.clerkId });

    const job = await Job.create({
      title,
      company: recruiter?.company || "TalentIQ",
      companyId: req.user.clerkId,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      skills: skills || [],
      location,
      jobType,
      salaryMin,
      salaryMax,
      experienceLevel,
      deadline,
      status: "draft",
      createdBy: req.user._id,
    });

    return res.status(201).json({ job });
  } catch (error) {
    console.log("Error in createJob:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── getMyJobs ─────────────────────────────────────────────────
export async function getMyJobs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const filter = { companyId: req.user.clerkId };

    const [jobs, totalCount] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.json({
      jobs,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.log("Error in getMyJobs:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── getAllPublishedJobs ────────────────────────────────────────
export async function getAllPublishedJobs(req, res) {
  try {
    const { search, skills, jobType, location, experienceLevel } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const filter = { status: "published" };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    if (skills) {
      filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
    }

    if (jobType) filter.jobType = jobType;

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (experienceLevel) filter.experienceLevel = experienceLevel;

    const [jobs, totalCount] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.json({
      jobs,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.log("Error in getAllPublishedJobs:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── getJobById ────────────────────────────────────────────────
export async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("createdBy", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.json({ job });
  } catch (error) {
    console.log("Error in getJobById:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── updateJob ─────────────────────────────────────────────────
export async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.companyId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    const allowedFields = [
      "title",
      "description",
      "requirements",
      "responsibilities",
      "skills",
      "location",
      "jobType",
      "salaryMin",
      "salaryMax",
      "experienceLevel",
      "deadline",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();
    return res.json({ job });
  } catch (error) {
    console.log("Error in updateJob:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── deleteJob ─────────────────────────────────────────────────
export async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.companyId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    // Clean up all related applications
    await Application.deleteMany({ jobId: id });
    await Job.findByIdAndDelete(id);

    return res.json({ message: "Job deleted" });
  } catch (error) {
    console.log("Error in deleteJob:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── publishJob ────────────────────────────────────────────────
export async function publishJob(req, res) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.companyId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    job.status = "published";
    await job.save();
    return res.json({ job });
  } catch (error) {
    console.log("Error in publishJob:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── closeJob ──────────────────────────────────────────────────
export async function closeJob(req, res) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.companyId !== req.user.clerkId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    job.status = "closed";
    await job.save();
    return res.json({ job });
  } catch (error) {
    console.log("Error in closeJob:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// ── getJobStats ───────────────────────────────────────────────
export async function getJobStats(req, res) {
  try {
    const clerkId = req.user.clerkId;

    // Get all job IDs owned by this recruiter
    const myJobs = await Job.find({ companyId: clerkId }, "_id status");
    const myJobIds = myJobs.map((j) => j._id);

    const [
      totalJobs,
      publishedJobs,
      totalApplications,
      shortlisted,
      interviewed,
      hired,
      pendingReview,
    ] = await Promise.all([
      Job.countDocuments({ companyId: clerkId }),
      Job.countDocuments({ companyId: clerkId, status: "published" }),
      Application.countDocuments({ jobId: { $in: myJobIds } }),
      Application.countDocuments({ jobId: { $in: myJobIds }, status: "shortlisted" }),
      Application.countDocuments({ jobId: { $in: myJobIds }, status: "interviewed" }),
      Application.countDocuments({ jobId: { $in: myJobIds }, status: "hired" }),
      Application.countDocuments({ jobId: { $in: myJobIds }, status: "applied" }),
    ]);

    return res.json({
      totalJobs,
      publishedJobs,
      totalApplications,
      shortlisted,
      interviewed,
      hired,
      pendingReview,
    });
  } catch (error) {
    console.log("Error in getJobStats:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
