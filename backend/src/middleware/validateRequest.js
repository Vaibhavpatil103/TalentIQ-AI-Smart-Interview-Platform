import { z } from "zod";

// Generic validation middleware factory
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues.map((e) => ({
          field: (e.path || []).join("."),
          message: e.message,
        })),
      });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- Schemas ---

export const createProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.object({
    text: z.string().min(1, "Description text is required"),
    notes: z.array(z.string()).optional(),
  }),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().optional(),
      })
    )
    .optional(),
  constraints: z.array(z.string()).optional(),
  starterCode: z
    .object({
      javascript: z.string().optional(),
      python: z.string().optional(),
      java: z.string().optional(),
      cpp: z.string().optional(),
    })
    .optional(),
  expectedOutput: z
    .object({
      javascript: z.string().optional(),
      python: z.string().optional(),
      java: z.string().optional(),
      cpp: z.string().optional(),
    })
    .optional(),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean().optional(),
      })
    )
    .optional(),
  isPublic: z.boolean().optional(),
});

export const updateProblemSchema = createProblemSchema.partial();

export const createFeedbackSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  candidateId: z.string().min(1, "Candidate ID is required"),
  codeQuality: z.number().min(1).max(5),
  problemSolving: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  decision: z.enum(["hire", "no-hire", "maybe"]),
  notes: z.string().optional(),
});

export const updateProfileSchema = z.object({
  company: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.array(z.string()).optional(),
});

export const scheduleSessionSchema = z.object({
  problem: z.string().min(1, "Problem is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  scheduledAt: z.string().datetime().optional(),
  candidateEmail: z.string().email().optional(),
});
