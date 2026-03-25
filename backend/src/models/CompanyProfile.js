import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    recruiterId: { type: String, required: true, unique: true }, // Clerk ID
    companyName: { type: String, required: true },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    about: { type: String, default: "" },
    industry: {
      type: String,
      enum: [
        "Technology",
        "Finance",
        "Healthcare",
        "Education",
        "E-commerce",
        "Media",
        "Consulting",
        "Other",
      ],
      default: "Technology",
    },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      default: "1-10",
    },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    techStack: [{ type: String }],
    totalJobsPosted: { type: Number, default: 0 },
    totalHired: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("CompanyProfile", companyProfileSchema);
