import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      text: { type: String, required: true },
      notes: [{ type: String }],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [{ type: String }],
    examples: [
      {
        input: { type: String },
        output: { type: String },
        explanation: { type: String },
      },
    ],
    constraints: [{ type: String }],
    starterCode: {
      javascript: { type: String },
      python: { type: String },
      java: { type: String },
      cpp: { type: String },
    },
    expectedOutput: {
      javascript: { type: String },
      python: { type: String },
      java: { type: String },
      cpp: { type: String },
    },
    testCases: [
      {
        input: { type: String },
        expectedOutput: { type: String },
        isHidden: { type: Boolean, default: false },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String, // Clerk userId
    },
    source: { type: String, enum: ["manual", "excel"], default: "manual" },
    importBatch: { type: String },
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
