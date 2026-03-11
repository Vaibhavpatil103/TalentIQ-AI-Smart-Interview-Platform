import Problem from "../models/Problem.js";

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
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
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
