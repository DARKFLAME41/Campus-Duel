export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Medium",
    category: "Arrays",
    tags: ["Array", "Hashing"],
    time: "10 min",
    description:
      "Given an array of integers and a target, return the indices of the two numbers whose sum equals the target.",
    input: "nums = [2, 7, 11, 15], target = 9",
    output: "[0, 1]",
    constraints: "2 ≤ nums.length ≤ 10⁴; -10⁹ ≤ nums[i] ≤ 10⁹",
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks",
    tags: ["Stack", "Strings"],
    time: "8 min",
    description:
      "Determine whether an input string containing brackets is valid and correctly nested.",
    input: 's = "({[]})"',
    output: "true",
    constraints: "1 ≤ s.length ≤ 10⁴",
  },
  {
    id: 3,
    title: "Longest Increasing Path",
    difficulty: "Hard",
    category: "Dynamic Programming",
    tags: ["DP", "Graphs", "Memoization"],
    time: "15 min",
    description:
      "Find the length of the longest strictly increasing path in a matrix.",
    input: "matrix = [[9,9,4],[6,6,8],[2,1,1]]",
    output: "4",
    constraints: "1 ≤ rows, cols ≤ 200",
  },
];

export const categories = [
  "Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Trees",
  "Graphs", "Sorting", "Searching", "Recursion", "Dynamic Programming",
  "Greedy", "Hashing", "Bit Manipulation", "Mathematics", "OOP", "SQL", "Debugging"
];

export const modes = [
  { key: "CODE_DUEL", icon: "⚔️", title: "Code Duel", text: "Solve the same problem against a live opponent.", duration: "10 min", elo: "High" },
  { key: "BUG_BATTLE", icon: "🐞", title: "Bug Battle", text: "Find and fix a broken solution before your rival.", duration: "5 min", elo: "Medium" },
  { key: "SPEED_CODING", icon: "⚡", title: "Speed Coding", text: "Tiny problems. Fast reactions. Faster code.", duration: "30 sec", elo: "Low" },
  { key: "CODE_GOLF", icon: "🧠", title: "Code Golf", text: "Write the shortest correct solution.", duration: "7 min", elo: "Medium" },
];

export const leaderboard = [
  ["1", "Hari Shankar", "National Engineering College", "CSE", 1428, 71],
  ["2", "Alex Kumar", "PSG College", "IT", 1397, 68],
  ["3", "Priya S", "CIT", "CSE", 1364, 66],
  ["4", "Rahul M", "National Engineering College", "ECE", 1321, 63],
  ["5", "Aakash R", "Kongu Engineering College", "CSE", 1299, 61],
];

export const achievements = [
  ["🔥", "First Blood", "Win your first duel.", true],
  ["⚔️", "Duelist", "Win 10 Code Duels.", true],
  ["🐞", "Bug Hunter", "Win 10 Bug Battles.", true],
  ["🧠", "Code Master", "Reach 1500 ELO.", false],
  ["🔥", "Unstoppable", "Win 10 matches consecutively.", false],
  ["🏆", "Arena Champion", "Reach #1 on the leaderboard.", false],
  ["⚡", "Speed Demon", "Win 20 Speed Coding matches.", true],
];