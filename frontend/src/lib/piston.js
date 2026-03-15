// Code execution — calls our backend proxy which tries multiple Piston endpoints
import { axiosInstance } from "./axios";

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
};

/**
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  const languageConfig = LANGUAGE_VERSIONS[language];

  if (!languageConfig) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  try {
    const { data } = await axiosInstance.post("/execute", {
      language,
      code,
    });

    return data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        `Failed to execute code: ${error.message}`,
    };
  }
}
