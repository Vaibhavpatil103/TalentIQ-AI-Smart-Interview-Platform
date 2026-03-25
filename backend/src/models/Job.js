import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyId: { type: String, required: true }, // Clerk ID of recruiter/interviewer
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    skills: [{ type: String }],
    location: { type: String, default: "Remote" },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: "USD" },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      default: "mid",
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    deadline: { type: Date },
    applicantCount: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
