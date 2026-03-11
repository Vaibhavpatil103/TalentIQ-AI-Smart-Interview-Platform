/**
 * Seed script — migrates problems from the frontend's static data into MongoDB
 * Usage: node src/scripts/seedProblems.js
 */

import "../lib/env.js";
import { connectDB } from "../lib/db.js";
import Problem from "../models/Problem.js";

const PROBLEMS_DATA = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array • Hash Table",
    tags: ["array", "hash-table"],
    description: {
      text: "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.",
      notes: [
        "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "You can return the answer in any order.",
      ],
    },
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists"],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]\nconsole.log(twoSum([3, 2, 4], 6)); // Expected: [1, 2]\nconsole.log(twoSum([3, 3], 6)); // Expected: [0, 1]`,
      python: `def twoSum(nums, target):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(twoSum([2, 7, 11, 15], 9))  # Expected: [0, 1]\nprint(twoSum([3, 2, 4], 6))  # Expected: [1, 2]\nprint(twoSum([3, 3], 6))  # Expected: [0, 1]`,
      java: `import java.util.*;\n\nclass Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n        return new int[0];\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9))); // Expected: [0, 1]\n        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6))); // Expected: [1, 2]\n        System.out.println(Arrays.toString(twoSum(new int[]{3, 3}, 6))); // Expected: [0, 1]\n    }\n}`,
    },
    expectedOutput: {
      javascript: "[0,1]\n[1,2]\n[0,1]",
      python: "[0, 1]\n[1, 2]\n[0, 1]",
      java: "[0, 1]\n[1, 2]\n[0, 1]",
    },
    isPublic: true,
  },
  {
    title: "Reverse String",
    difficulty: "Easy",
    category: "String • Two Pointers",
    tags: ["string", "two-pointers"],
    description: {
      text: "Write a function that reverses a string. The input string is given as an array of characters s.",
      notes: ["You must do this by modifying the input array in-place with O(1) extra memory."],
    },
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁵", "s[i] is a printable ascii character"],
    starterCode: {
      javascript: `function reverseString(s) {\n  // Write your solution here\n  \n}\n\n// Test cases\nlet test1 = ["h","e","l","l","o"];\nreverseString(test1);\nconsole.log(test1); // Expected: ["o","l","l","e","h"]\n\nlet test2 = ["H","a","n","n","a","h"];\nreverseString(test2);\nconsole.log(test2); // Expected: ["h","a","n","n","a","H"]`,
      python: `def reverseString(s):\n    # Write your solution here\n    pass\n\n# Test cases\ntest1 = ["h","e","l","l","o"]\nreverseString(test1)\nprint(test1)  # Expected: ["o","l","l","e","h"]\n\ntest2 = ["H","a","n","n","a","h"]\nreverseString(test2)\nprint(test2)  # Expected: ["h","a","n","n","a","H"]`,
      java: `import java.util.*;\n\nclass Solution {\n    public static void reverseString(char[] s) {\n        // Write your solution here\n        \n    }\n    \n    public static void main(String[] args) {\n        char[] test1 = {'h','e','l','l','o'};\n        reverseString(test1);\n        System.out.println(Arrays.toString(test1)); // Expected: [o, l, l, e, h]\n        \n        char[] test2 = {'H','a','n','n','a','h'};\n        reverseString(test2);\n        System.out.println(Arrays.toString(test2)); // Expected: [h, a, n, n, a, H]\n    }\n}`,
    },
    expectedOutput: {
      javascript: '["o","l","l","e","h"]\n["h","a","n","n","a","H"]',
      python: "['o', 'l', 'l', 'e', 'h']\n['h', 'a', 'n', 'n', 'a', 'H']",
      java: "[o, l, l, e, h]\n[h, a, n, n, a, H]",
    },
    isPublic: true,
  },
  {
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "String • Two Pointers",
    tags: ["string", "two-pointers"],
    description: {
      text: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.",
      notes: ["Given a string s, return true if it is a palindrome, or false otherwise."],
    },
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: "false", explanation: '"raceacar" is not a palindrome.' },
      { input: 's = " "', output: "true", explanation: 's is an empty string "" after removing non-alphanumeric characters.' },
    ],
    constraints: ["1 ≤ s.length ≤ 2 * 10⁵", "s consists only of printable ASCII characters"],
    starterCode: {
      javascript: `function isPalindrome(s) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(isPalindrome("A man, a plan, a canal: Panama")); // Expected: true\nconsole.log(isPalindrome("race a car")); // Expected: false\nconsole.log(isPalindrome(" ")); // Expected: true`,
      python: `def isPalindrome(s):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(isPalindrome("A man, a plan, a canal: Panama"))  # Expected: True\nprint(isPalindrome("race a car"))  # Expected: False\nprint(isPalindrome(" "))  # Expected: True`,
      java: `class Solution {\n    public static boolean isPalindrome(String s) {\n        // Write your solution here\n        \n        return false;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // Expected: true\n        System.out.println(isPalindrome("race a car")); // Expected: false\n        System.out.println(isPalindrome(" ")); // Expected: true\n    }\n}`,
    },
    expectedOutput: {
      javascript: "true\nfalse\ntrue",
      python: "True\nFalse\nTrue",
      java: "true\nfalse\ntrue",
    },
    isPublic: true,
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Array • Dynamic Programming",
    tags: ["array", "dynamic-programming"],
    description: {
      text: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      notes: [],
    },
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1", explanation: "The subarray [1] has the largest sum 1." },
      { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "The subarray [5,4,-1,7,8] has the largest sum 23." },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Expected: 6\nconsole.log(maxSubArray([1])); // Expected: 1\nconsole.log(maxSubArray([5,4,-1,7,8])); // Expected: 23`,
      python: `def maxSubArray(nums):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6\nprint(maxSubArray([1]))  # Expected: 1\nprint(maxSubArray([5,4,-1,7,8]))  # Expected: 23`,
      java: `class Solution {\n    public static int maxSubArray(int[] nums) {\n        // Write your solution here\n        \n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})); // Expected: 6\n        System.out.println(maxSubArray(new int[]{1})); // Expected: 1\n        System.out.println(maxSubArray(new int[]{5,4,-1,7,8})); // Expected: 23\n    }\n}`,
    },
    expectedOutput: {
      javascript: "6\n1\n23",
      python: "6\n1\n23",
      java: "6\n1\n23",
    },
    isPublic: true,
  },
  {
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Array • Two Pointers",
    tags: ["array", "two-pointers"],
    description: {
      text: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).",
      notes: [
        "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
        "Return the maximum amount of water a container can store.",
        "Notice that you may not slant the container.",
      ],
    },
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49." },
      { input: "height = [1,1]", output: "1" },
    ],
    constraints: ["n == height.length", "2 ≤ n ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"],
    starterCode: {
      javascript: `function maxArea(height) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(maxArea([1,8,6,2,5,4,8,3,7])); // Expected: 49\nconsole.log(maxArea([1,1])); // Expected: 1`,
      python: `def maxArea(height):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(maxArea([1,8,6,2,5,4,8,3,7]))  # Expected: 49\nprint(maxArea([1,1]))  # Expected: 1`,
      java: `class Solution {\n    public static int maxArea(int[] height) {\n        // Write your solution here\n        \n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7})); // Expected: 49\n        System.out.println(maxArea(new int[]{1,1})); // Expected: 1\n    }\n}`,
    },
    expectedOutput: {
      javascript: "49\n1",
      python: "49\n1",
      java: "49\n1",
    },
    isPublic: true,
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("🌱 Seeding problems...\n");

    for (const problemData of PROBLEMS_DATA) {
      const existing = await Problem.findOne({ title: problemData.title });
      if (existing) {
        console.log(`  ⏭️  Skipping "${problemData.title}" — already exists`);
        continue;
      }
      await Problem.create(problemData);
      console.log(`  ✅ Created "${problemData.title}"`);
    }

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
