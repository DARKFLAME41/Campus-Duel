// client/src/services/onlineQuestionService.js

// 1. BUG BATTLE PROBLEMS (Starter code contains intentional bugs to find & fix)
const BUG_BATTLE_POOL = [
  {
    title: "Fix the Palindrome Bug",
    category: "Debugging & Strings",
    difficulty: "Medium",
    description: "The solution below is broken! It contains 2 bugs: case sensitivity is ignored and loop bounds cause index out of bounds. Find and fix both bugs to make all tests pass.",
    example: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true',
    constraints: ["1 <= s.length <= 2 * 10^5", "Must run in O(N) time"],
    starters: {
      javascript: `// BUGGY CODE - FIX THE BUGS!
function isPalindrome(s) {
  // Bug 1: Fails to normalize string to lowercase
  // Bug 2: Off-by-one loop condition causes undefined index!
  let clean = s.replace(/[^a-zA-Z0-9]/g, ""); 
  for (let i = 0; i <= clean.length; i++) {
    if (clean[i] !== clean[clean.length - i]) {
      return false;
    }
  }
  return true;
}`,
      python: `# BUGGY CODE - FIX THE BUGS!
def is_palindrome(s):
    # Bug 1: Missing lower() normalization
    # Bug 2: Off-by-one index error in comparison
    clean = [c for c in s if c.isalnum()]
    for i in range(len(clean)):
        if clean[i] != clean[len(clean) - i]:
            return False
    return True`,
      java: `// BUGGY CODE - FIX THE BUGS!
class Solution {
    public boolean isPalindrome(String s) {
        String clean = s.replaceAll("[^a-zA-Z0-9]", "");
        for (int i = 0; i <= clean.length(); i++) {
            if (clean.charAt(i) != clean.charAt(clean.length() - i)) return false;
        }
        return true;
    }
}`,
      cpp: `// BUGGY CODE - FIX THE BUGS!
class Solution {
public:
    bool isPalindrome(string s) {
        string clean = "";
        for(char c : s) if(isalnum(c)) clean += c;
        for(int i=0; i<=clean.length(); i++) {
            if(clean[i] != clean[clean.length() - i]) return false;
        }
        return true;
    }
};`,
      c: `// BUGGY CODE - FIX THE BUGS!
bool isPalindrome(char* s) {
    return false;
}`
    }
  },
  {
    title: "Fix the Array Maximum Bug",
    category: "Debugging & Arrays",
    difficulty: "Easy",
    description: "The function below should return the maximum value in an integer array. However, it fails on negative numbers due to improper initial variable assignment!",
    example: "Input: nums = [-5, -2, -9, -1]\nOutput: -1 (Currently returns 0 incorrectly!)",
    constraints: ["1 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    starters: {
      javascript: `// BUGGY CODE - FIX THE BUG!
function findMax(nums) {
  // Bug: Initialized maxVal to 0 instead of negative infinity or nums[0]!
  let maxVal = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > maxVal) {
      maxVal = nums[i];
    }
  }
  return maxVal;
}`,
      python: `# BUGGY CODE - FIX THE BUG!
def find_max(nums):
    # Bug: Initial max set to 0 breaks for all-negative arrays
    max_val = 0
    for num in nums:
        if num > max_val:
            max_val = num
    return max_val`,
      java: `// BUGGY CODE - FIX THE BUG!
class Solution {
    public int findMax(int[] nums) {
        int maxVal = 0;
        for (int n : nums) {
            if (n > maxVal) maxVal = n;
        }
        return maxVal;
    }
}`,
      cpp: `// BUGGY CODE - FIX THE BUG!
class Solution {
public:
    int findMax(vector<int>& nums) {
        int maxVal = 0;
        for (int n : nums) if (n > maxVal) maxVal = n;
        return maxVal;
    }
};`,
      c: `int findMax(int* nums, int numsSize) {
    int maxVal = 0;
    for(int i=0; i<numsSize; i++) if(nums[i] > maxVal) maxVal = nums[i];
    return maxVal;
}`
    }
  },
  {
    title: "Fix the Anagram Counter Bug",
    category: "Debugging & Hashing",
    difficulty: "Medium",
    description: "This function checks if two strings are valid anagrams. It fails because frequency maps aren't properly decremented and checked for empty counts.",
    example: "Input: s = \"rat\", t = \"car\"\nOutput: false (Currently returns true!)",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4"],
    starters: {
      javascript: `// BUGGY CODE - FIX THE BUG!
function isAnagram(s, t) {
  // Bug: Length check is missing and map fails to verify 0 counts!
  let map = {};
  for (let char of s) map[char] = (map[char] || 0) + 1;
  for (let char of t) {
    if (!map[char]) return true; // Wrong logic!
    map[char]--;
  }
  return true;
}`,
      python: `# BUGGY CODE - FIX THE BUG!
def is_anagram(s, t):
    # Bug: Incorrect frequency comparison
    if len(s) != len(t): return True # Wrong comparison operator
    counts = {}
    for c in s: counts[c] = counts.get(c, 0) + 1
    for c in t: counts[c] = counts.get(c, 0) - 1
    return all(v == 1 for v in counts.values()) # Should be 0!`,
      java: `// BUGGY CODE - FIX THE BUG!
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return true; // Bug!
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        for (char c : t.toCharArray()) counts[c - 'a']--;
        for (int c : counts) if (c != 0) return true; // Bug!
        return false;
    }
}`,
      cpp: `// BUGGY CODE - FIX THE BUG!
class Solution {
public:
    bool isAnagram(string s, string t) {
        if(s.size() != t.size()) return true;
        return false;
    }
};`,
      c: `bool isAnagram(char* s, char* t) { return false; }`
    }
  },
  {
    title: "Fix the Binary Search Index Bug",
    category: "Debugging & Searching",
    difficulty: "Medium",
    description: "Binary search implementation has an infinite loop bug caused by integer overflow in midpoint calculation and incorrect pointer incrementing.",
    example: "Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4",
    constraints: ["1 <= nums.length <= 10^4"],
    starters: {
      javascript: `// BUGGY CODE - FIX THE BUGS!
function search(nums, target) {
  let left = 0, right = nums.length; // Bug 1: right should be nums.length - 1
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) {
      left = mid; // Bug 2: Infinite loop! Should be mid + 1
    } else {
      right = mid; // Bug 3: Should be mid - 1
    }
  }
  return -1;
}`,
      python: `# BUGGY CODE - FIX THE BUGS!
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: left = mid # Bug: Infinite loop!
        else: right = mid # Bug!
    return -1`,
      java: `// BUGGY CODE - FIX THE BUGS!
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid;
            else right = mid;
        }
        return -1;
    }
}`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = nums.size() - 1;
        while(l <= r) {
            int m = (l + r)/2;
            if(nums[m] == target) return m;
            if(nums[m] < target) l = m; else r = m;
        }
        return -1;
    }
};`,
      c: `int search(int* nums, int numsSize, int target) { return -1; }`
    }
  }
];

// 2. SPEED CODING PROBLEMS (Short 60s micro challenges)
const SPEED_CODING_POOL = [
  {
    title: "Reverse String Sprint",
    category: "Strings",
    difficulty: "Easy",
    description: "Speed Sprint: Write a function to reverse an input string in under 60 seconds!",
    example: 'Input: s = "hello"\nOutput: "olleh"',
    constraints: ["1 <= s.length <= 10^5", "60 Seconds limit!"],
    starters: {
      javascript: `function reverseString(s) {\n  // Speed challenge: Return reversed string\n  return s.split("").reverse().join("");\n}`,
      python: `def reverse_string(s):\n    # Speed challenge: Return reversed string\n    return s[::-1]`,
      java: `class Solution {\n    public String reverseString(String s) {\n        return new StringBuilder(s).reverse().toString();\n    }\n}`,
      cpp: `class Solution {\npublic:\n    string reverseString(string s) {\n        reverse(s.begin(), s.end());\n        return s;\n    }\n};`,
      c: `void reverseString(char* s) {\n}`
    }
  },
  {
    title: "Count Vowels Rapid",
    category: "Strings & Logic",
    difficulty: "Easy",
    description: "Speed Sprint: Return total number of vowels (a, e, i, o, u) in a string before time runs out!",
    example: 'Input: s = "campusduel"\nOutput: 4',
    constraints: ["1 <= s.length <= 10^4", "60 Seconds limit!"],
    starters: {
      javascript: `function countVowels(s) {\n  // Return number of vowels\n}`,
      python: `def count_vowels(s):\n    # Return number of vowels\n    pass`,
      java: `class Solution {\n    public int countVowels(String s) {\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int countVowels(string s) {\n        return 0;\n    }\n};`,
      c: `int countVowels(char* s) { return 0; }`
    }
  }
];

// 3. CODE GOLF PROBLEMS (Shortest character count wins)
const CODE_GOLF_POOL = [
  {
    title: "Sum of Digits (Shortest Code)",
    category: "Math & Strings",
    difficulty: "Medium",
    description: "Given a non-negative integer n, return the sum of all its digits using the FEWEST possible characters.",
    example: "Input: n = 38\nOutput: 11 (3 + 8 = 11)",
    constraints: ["0 <= n <= 2 * 10^9", "Shortest code character count wins!"],
    starters: {
      javascript: `const sumDigits = n => [...''+n].reduce((a,b)=>+a++b,0);`,
      python: `def sum_digits(n): return sum(map(int,str(n)))`,
      java: `class Solution {\n    public int sumDigits(int n) {\n        int s = 0; while(n>0){ s += n%10; n /= 10; } return s;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int sumDigits(int n) {\n        int s=0; while(n){ s+=n%10; n/=10; } return s;\n    }\n};`,
      c: `int sumDigits(int n) { int s=0; while(n){ s+=n%10; n/=10; } return s; }`
    }
  }
];

// 4. CODE DUEL PROBLEMS (Standard competitive DSA algorithms)
const CODE_DUEL_POOL = [
  {
    title: "Two Sum",
    category: "Arrays & Hashing",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    starters: {
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n}`,
      python: `def two_sum(nums, target):\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};`,
      c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 0;\n    return 0;\n}`
    }
  },
  {
    title: "Valid Parentheses",
    category: "Stacks & Strings",
    difficulty: "Easy",
    description: "Given a string s containing just parentheses '()[]{}', determine if the string is valid and properly nested.",
    example: 'Input: s = "()[]{}"\nOutput: true',
    constraints: ["1 <= s.length <= 10^4"],
    starters: {
      javascript: `function isValid(s) {\n  // Check valid stack parentheses\n}`,
      python: `def is_valid(s):\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};`,
      c: `bool isValid(char* s) { return false; }`
    }
  },
  {
    title: "Container With Most Water",
    category: "Two Pointers",
    difficulty: "Medium",
    description: "Given height array n, find two lines forming a container that holds maximum water.",
    example: "Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49",
    constraints: ["2 <= n <= 10^5"],
    starters: {
      javascript: `function maxArea(height) {\n  // Two pointer solution\n}`,
      python: `def max_area(height):\n    pass`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};`,
      c: `int maxArea(int* height, int heightSize) { return 0; }`
    }
  }
];

export function getPlayedTitles() {
  try {
    return JSON.parse(sessionStorage.getItem("cd_played_questions") || "[]");
  } catch {
    return [];
  }
}

export function recordPlayedTitle(title) {
  try {
    const played = getPlayedTitles();
    if (!played.includes(title)) {
      played.push(title);
      sessionStorage.setItem("cd_played_questions", JSON.stringify(played));
    }
  } catch {}
}

export async function fetchUniqueOnlineQuestion(modeKey = "CODE_DUEL", requestedDifficulty = "Medium") {
  const playedTitles = getPlayedTitles();
  let questionData = null;

  // Determine difficulty query for API
  // Speed coding forces EASY difficulty for rapid challenges
  const diffQuery = modeKey === "SPEED_CODING"
    ? "EASY"
    : (requestedDifficulty.toLowerCase() === "easy" ? "EASY" : requestedDifficulty.toLowerCase() === "hard" ? "HARD" : "MEDIUM");

  // Attempt to fetch live question from Alfa LeetCode API for ALL modes
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/problems?limit=50&difficulty=${diffQuery}`, {
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok) {
      const data = await res.json();
      const problemList = data.problemsetQuestionList || [];
      let available = problemList.filter(q => !playedTitles.includes(q.title));
      if (available.length === 0 && problemList.length > 0) {
        available = problemList;
      }
      if (available.length > 0) {
        const picked = available[Math.floor(Math.random() * available.length)];
        const detailRes = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${picked.titleSlug}`, {
          signal: AbortSignal.timeout(2500)
        });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const title = detail.questionTitle || picked.title;
          const cleanDesc = (detail.question || detail.content || "Solve problem.").replace(/<[^>]*>?/gm, "").slice(0, 500);

          let starters;
          if (modeKey === "BUG_BATTLE") {
            // Inject intentional buggy starter code for Bug Battle mode
            starters = {
              javascript: `// BUGGY CODE - FIX THE BUG!\nfunction solution() {\n  // Bug: Returns incorrect default value\n  return false;\n}`,
              python: `# BUGGY CODE - FIX THE BUG!\ndef solution():\n    # Bug: Returns incorrect default value\n    return False`,
              java: `// BUGGY CODE - FIX THE BUG!\nclass Solution {\n    public boolean solution() {\n        return false;\n    }\n}`,
              cpp: `// BUGGY CODE - FIX THE BUG!\nclass Solution {\npublic:\n    bool solution() {\n        return false;\n    }\n};`,
              c: `// BUGGY CODE - FIX THE BUG!\nbool solution() {\n    return false;\n}`
            };
          } else {
            starters = {
              javascript: `function solution() {\n  // Write solution for ${title}\n}`,
              python: `def solution():\n    pass`,
              java: `class Solution {\n    public void solution() {}\n}`,
              cpp: `class Solution {\npublic:\n    void solution() {}\n};`,
              c: `void solution() {}`
            };
          }

          questionData = {
            title,
            category: detail.topicTags?.[0]?.name || "Algorithms",
            difficulty: detail.difficulty || picked.difficulty,
            description: cleanDesc,
            example: detail.exampleTestcases || "Standard test case",
            constraints: ["Standard execution constraints apply."],
            starters
          };
        }
      }
    }
  } catch (e) {
    // Graceful fallback to local pools if API fails or times out
  }

  // Fallback to local pool if online fetch didn't produce a question
  if (!questionData) {
    let pool;
    if (modeKey === "BUG_BATTLE") pool = BUG_BATTLE_POOL;
    else if (modeKey === "SPEED_CODING") pool = SPEED_CODING_POOL;
    else if (modeKey === "CODE_GOLF") pool = CODE_GOLF_POOL;
    else pool = CODE_DUEL_POOL;

    let unplayed = pool.filter(p => !playedTitles.includes(p.title));
    if (unplayed.length === 0) {
      if (modeKey === "BUG_BATTLE") sessionStorage.removeItem("cd_played_questions");
      unplayed = pool;
    }
    questionData = unplayed[Math.floor(Math.random() * unplayed.length)];
  }

  recordPlayedTitle(questionData.title);

  const eyebrowMap = {
    CODE_DUEL: "⚔ CODE DUEL · ONLINE LIVE",
    BUG_BATTLE: "🐞 BUG BATTLE · BUG HUNT",
    SPEED_CODING: "⚡ SPEED CODING · 60s SPRINT",
    CODE_GOLF: "🧠 CODE GOLF · SHORTEST CODE"
  };

  return {
    key: modeKey,
    title: questionData.title,
    eyebrow: eyebrowMap[modeKey] || "⚔ COMPETITIVE DUEL",
    category: questionData.category,
    difficulty: questionData.difficulty,
    durationSec: modeKey === "SPEED_CODING" ? 60 : modeKey === "BUG_BATTLE" ? 300 : 600,
    banner: modeKey === "BUG_BATTLE" ? {
      type: "warning",
      text: "🐞 BUG HUNT MODE: The code below contains 1 or 2 intentional bugs! Find and fix them before your rival!"
    } : modeKey === "SPEED_CODING" ? {
      type: "speed",
      text: "⚡ SPEED SPRINT: 60 Seconds on the clock! Write the solution as fast as possible!"
    } : modeKey === "CODE_GOLF" ? {
      type: "golf",
      text: "🧠 CODE GOLF: Write the shortest code with fewest characters!"
    } : null,
    starters: questionData.starters,
    description: questionData.description,
    example: questionData.example,
    constraints: Array.isArray(questionData.constraints) ? questionData.constraints : [questionData.constraints]
  };
}
