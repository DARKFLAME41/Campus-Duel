import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Activity, ArrowLeft, BarChart3, Bell, Bot, Bug, Check, CheckCircle2, ChevronRight,
  Clock3, Code2, Crown, Eye, Flame, Gauge, GitCompare, GraduationCap, Home,
  Info, LayoutDashboard, Lock, LogOut, Menu, Palette, Play, Radio, RotateCw, Save, Search, Send, Settings, Shield,
  Swords, Trophy, User, Users, Volume2, X, Zap
} from "lucide-react";
import { achievements, categories, leaderboard, modes, problems } from "./data";
import { socket } from "./socket";
import { fetchUniqueOnlineQuestion } from "./services/onlineQuestionService";
import { AdminLogin, AdminDashboard, AdminProtectedRoute } from "./AdminPanel";

const starter = {
  javascript: `function twoSum(nums, target) {
  // Write your solution here
}`,
  python: `def two_sum(nums, target):
    # Write your solution here
    pass`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
  c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    *returnSize = 0;
    return 0;
}`,
};


function triggerConfetti() {
  try {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#8b5cf6", "#22d3ee", "#38d996", "#f6c453", "#ef476f", "#a78bfa", "#ffd700"];

    for (let i = 0; i < 130; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.85) * 20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    const start = Date.now();
    let animId;

    function render() {
      const elapsed = Date.now() - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - elapsed / 3200);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < 3200) {
        animId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animId);
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
      }
    }

    render();
  } catch {}
}

function getUser() {
  try {
    const u = JSON.parse(localStorage.getItem("campusDuelUser") || "null");
    if (!u) return null;
    return {
      ...u,
      elo: typeof u.elo === "number" ? u.elo : 1200,
      rank: u.rank || null,
      streak: typeof u.streak === "number" ? u.streak : 0,
      solved: typeof u.solved === "number" ? u.solved : 0,
      wins: typeof u.wins === "number" ? u.wins : 0,
      losses: typeof u.losses === "number" ? u.losses : 0,
      codeDuelsWon: typeof u.codeDuelsWon === "number" ? u.codeDuelsWon : 0,
      bugBattlesWon: typeof u.bugBattlesWon === "number" ? u.bugBattlesWon : 0,
      speedCodingWon: typeof u.speedCodingWon === "number" ? u.speedCodingWon : 0,
      eloHistory: Array.isArray(u.eloHistory) && u.eloHistory.length > 0 ? u.eloHistory : [1200],
      matchHistory: Array.isArray(u.matchHistory) ? u.matchHistory : []
    };
  } catch {
    return null;
  }
}
function saveUser(user) {
  localStorage.setItem("campusDuelUser", JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem("campusDuelUser");
  localStorage.removeItem("campusDuelToken");
  localStorage.removeItem("campusDuelAdminUser");
  localStorage.removeItem("campusDuelAdminToken");
}

export function getRoleDashboard(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "faculty":
    case "setter":
    case "moderator":
    case "student":
    default:
      return "/";
  }
}

const APP_THEMES = [
  {
    id: "dark-arena",
    name: "Dark Arena",
    description: "Default deep space theme",
    preview: ["#07090f", "#8b5cf6", "#22d3ee"],
    vars: { "--bg": "#07090f", "--panel": "#0d111a", "--panel2": "#111722", "--line": "#202734", "--muted": "#8d96a8", "--text": "#eef1f8", "--accent": "#8b5cf6", "--cyan": "#22d3ee", "--green": "#38d996", "--red": "#ff5c7a", "--yellow": "#f6c453" },
    bodyBg: "radial-gradient(circle at 75% -20%,#1d1436 0,transparent 35%),#07090f",
    sidebarBg: "#090c13",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with gold accents",
    preview: ["#050810", "#f6c453", "#60a5fa"],
    vars: { "--bg": "#050810", "--panel": "#090d18", "--panel2": "#0e1420", "--line": "#1a2235", "--muted": "#7a8499", "--text": "#e8edf8", "--accent": "#f6c453", "--cyan": "#60a5fa", "--green": "#34d399", "--red": "#f87171", "--yellow": "#fbbf24" },
    bodyBg: "radial-gradient(circle at 80% -10%,#1a1206 0,transparent 35%),#050810",
    sidebarBg: "#06090f",
  },
  {
    id: "cyber-green",
    name: "Cyber Green",
    description: "Hacker-style terminal vibes",
    preview: ["#030a07", "#00ff88", "#00d4ff"],
    vars: { "--bg": "#030a07", "--panel": "#061410", "--panel2": "#091a14", "--line": "#0f2a20", "--muted": "#5a8070", "--text": "#d4f5e9", "--accent": "#00ff88", "--cyan": "#00d4ff", "--green": "#00ff88", "--red": "#ff4466", "--yellow": "#ffe066" },
    bodyBg: "radial-gradient(circle at 20% 80%,#001a0d 0,transparent 40%),#030a07",
    sidebarBg: "#040d08",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Calm deep ocean palette",
    preview: ["#04080f", "#38bdf8", "#818cf8"],
    vars: { "--bg": "#04080f", "--panel": "#080f1c", "--panel2": "#0d1525", "--line": "#152030", "--muted": "#6b8299", "--text": "#ddeeff", "--accent": "#38bdf8", "--cyan": "#818cf8", "--green": "#34d399", "--red": "#fb7185", "--yellow": "#fcd34d" },
    bodyBg: "radial-gradient(circle at 60% -20%,#071830 0,transparent 40%),#04080f",
    sidebarBg: "#050b16",
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Bold red warrior aesthetic",
    preview: ["#0a0507", "#ef4444", "#fb923c"],
    vars: { "--bg": "#0a0507", "--panel": "#130a0c", "--panel2": "#180d10", "--line": "#2a1018", "--muted": "#8a6870", "--text": "#f5e0e4", "--accent": "#ef4444", "--cyan": "#fb923c", "--green": "#4ade80", "--red": "#ef4444", "--yellow": "#fb923c" },
    bodyBg: "radial-gradient(circle at 85% 20%,#2a0808 0,transparent 35%),#0a0507",
    sidebarBg: "#0b0608",
  },
  // ── Light Themes ──
  {
    id: "snow-white",
    name: "Snow White",
    description: "Clean minimal light mode",
    preview: ["#f8fafc", "#6366f1", "#06b6d4"],
    isLight: true,
    vars: { "--bg": "#f8fafc", "--panel": "#ffffff", "--panel2": "#f1f5f9", "--line": "#e2e8f0", "--muted": "#64748b", "--text": "#0f172a", "--accent": "#6366f1", "--cyan": "#06b6d4", "--green": "#10b981", "--red": "#ef4444", "--yellow": "#f59e0b" },
    bodyBg: "radial-gradient(circle at 70% -10%, #ede9fe 0, transparent 40%), #f8fafc",
    sidebarBg: "#ffffff",
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    description: "Gentle purple pastel vibes",
    preview: ["#faf5ff", "#7c3aed", "#ec4899"],
    isLight: true,
    vars: { "--bg": "#faf5ff", "--panel": "#ffffff", "--panel2": "#f3e8ff", "--line": "#ddd6fe", "--muted": "#7c6b96", "--text": "#2e1065", "--accent": "#7c3aed", "--cyan": "#ec4899", "--green": "#059669", "--red": "#dc2626", "--yellow": "#d97706" },
    bodyBg: "radial-gradient(circle at 30% 20%, #ede9fe 0, transparent 45%), #faf5ff",
    sidebarBg: "#f5f3ff",
  },
  {
    id: "warm-parchment",
    name: "Warm Parchment",
    description: "Cozy warm beige tones",
    preview: ["#fef9f0", "#b45309", "#0891b2"],
    isLight: true,
    vars: { "--bg": "#fef9f0", "--panel": "#ffffff", "--panel2": "#fef3c7", "--line": "#fde68a", "--muted": "#92400e", "--text": "#1c1917", "--accent": "#b45309", "--cyan": "#0891b2", "--green": "#15803d", "--red": "#dc2626", "--yellow": "#b45309" },
    bodyBg: "radial-gradient(circle at 80% 10%, #fef3c7 0, transparent 40%), #fef9f0",
    sidebarBg: "#fffbeb",
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    description: "Crisp green-tinted daylight",
    preview: ["#f0fdf9", "#0d9488", "#7c3aed"],
    isLight: true,
    vars: { "--bg": "#f0fdf9", "--panel": "#ffffff", "--panel2": "#ccfbf1", "--line": "#99f6e4", "--muted": "#0f766e", "--text": "#042f2e", "--accent": "#0d9488", "--cyan": "#7c3aed", "--green": "#0d9488", "--red": "#e11d48", "--yellow": "#d97706" },
    bodyBg: "radial-gradient(circle at 20% 80%, #ccfbf1 0, transparent 40%), #f0fdf9",
    sidebarBg: "#f0fdf9",
  },
];

function applyTheme(themeId) {
  const theme = APP_THEMES.find(t => t.id === themeId) || APP_THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));

  const bg      = theme.vars["--bg"];
  const panel   = theme.vars["--panel"];
  const panel2  = theme.vars["--panel2"];
  const accent  = theme.vars["--accent"];
  const text    = theme.vars["--text"];
  const muted   = theme.vars["--muted"];
  const line    = theme.vars["--line"];
  const green   = theme.vars["--green"];

  let styleEl = document.getElementById("cd-theme-overrides");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "cd-theme-overrides";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    body { background: ${theme.bodyBg} !important; color: ${text}; }
    /* Sidebar */
    .sidebar { background: ${theme.sidebarBg} !important; border-right-color: ${line} !important; }
    .sidebar nav a { color: ${muted} !important; }
    .sidebar nav a.active, .sidebar nav a:hover { background: ${panel2} !important; color: ${text} !important; }
    .mini-player { background: ${panel2} !important; border-color: ${line} !important; }
    .mini-player.clickable:hover { background: ${panel} !important; }
    .mini-player b, .mini-player small { color: ${text} !important; }
    .sidebar .ghost-btn { border-color: ${line} !important; color: ${muted} !important; }
    /* Topbar */
    .topbar { background: ${bg}ee !important; border-bottom-color: ${line} !important; }
    .crumb { color: ${muted} !important; }
    .icon-btn { color: ${muted} !important; }
    .user-dropdown-menu { background: ${panel} !important; border-color: ${line} !important; }
    .user-dropdown-menu button { color: ${text} !important; }
    .user-dropdown-menu button:hover { background: ${panel2} !important; }
    .user-dropdown-header b { color: ${text} !important; }
    .user-dropdown-header small { color: ${muted} !important; }
    .user-dropdown-header { border-bottom-color: ${line} !important; }
    .dropdown-divider { background: ${line} !important; }
    /* Brand & Avatar */
    .brand-mark { background: linear-gradient(135deg, ${accent}, ${accent}88) !important; box-shadow: 0 8px 30px ${accent}33 !important; }
    .brand b { color: ${text} !important; }
    .brand span { color: ${muted} !important; }
    .avatar { background: linear-gradient(135deg, ${accent}cc, ${accent}55) !important; }
    .avatar.clickable:hover { box-shadow: 0 0 0 2px ${accent} !important; }
    .profile-avatar { background: linear-gradient(135deg, ${accent}cc, ${accent}55) !important; }
    /* Buttons */
    .primary-btn { background: linear-gradient(135deg, ${accent}, ${accent}cc) !important; color: #fff !important; box-shadow: 0 8px 25px ${accent}22 !important; }
    .selected-dot { background: ${accent} !important; }
    .ghost-btn { border-color: ${line} !important; color: ${muted} !important; background: transparent !important; }
    /* Dashboard */
    .hero-card { background: linear-gradient(110deg, ${panel2}, ${panel}) !important; border-color: ${line} !important; }
    .hero-card h1, .hero-card p, .hero-card strong { color: ${text} !important; }
    .hero-orb { border-color: ${accent}55 !important; background: ${panel2} !important; box-shadow: 0 0 80px ${accent}22 !important; }
    .hero-orb small { color: ${accent} !important; }
    .stat-card { background: ${panel} !important; border-color: ${line} !important; }
    .stat-card small { color: ${muted} !important; }
    .stat-card strong { color: ${text} !important; }
    .stat-icon { background: ${panel2} !important; color: ${accent} !important; }
    .stat-card span { color: ${green} !important; }
    /* Panels & Cards */
    .panel { background: ${panel} !important; border-color: ${line} !important; }
    .panel-title { color: ${muted} !important; }
    .panel-title h3 { color: ${text} !important; }
    .mode-card { background: ${panel} !important; border-color: ${line} !important; }
    .mode-card h3 { color: ${text} !important; }
    .mode-card p { color: ${muted} !important; }
    .mode-card:hover, .mode-card.selected { border-color: ${accent} !important; }
    .mode-card.selected { background: ${panel2} !important; }
    .mode-elo { background: ${panel2} !important; color: ${accent} !important; }
    .mode-meta { color: ${muted} !important; border-top-color: ${line} !important; }
    .insight { background: ${panel2} !important; color: ${accent} !important; }
    .insight p { color: ${muted} !important; }
    .match-row { border-bottom-color: ${line} !important; }
    .match-row b { color: ${text} !important; }
    .match-row small { color: ${muted} !important; }
    .mode-icon { background: ${panel2} !important; }
    /* Eyebrow labels */
    .eyebrow { color: ${accent} !important; }
    /* Skill bars */
    .bar { background: ${panel2} !important; }
    .bar i { background: linear-gradient(90deg, ${accent}88, ${accent}) !important; }
    .skill > div:first-child span { color: ${text} !important; }
    /* Achievements */
    .achievement { background: ${panel2} !important; border-color: ${line} !important; }
    .achievement b { color: ${text} !important; }
    .achievement small { color: ${muted} !important; }
    .achievement.unlocked { border-color: ${accent}66 !important; }
    /* Tabs */
    .tabs { background: ${panel2} !important; border-color: ${line} !important; }
    .tabs button { color: ${muted} !important; }
    .tabs button.active { background: ${panel} !important; color: ${accent} !important; }
    .result-tabs button { color: ${muted} !important; }
    .result-tabs button.active { color: ${accent} !important; border-bottom-color: ${accent} !important; }
    /* Arena */
    .arena-header { background: ${panel} !important; border-bottom-color: ${line} !important; }
    .arena-title h2 { color: ${text} !important; }
    .arena-grid { background: ${bg} !important; }
    .problem-panel { background: ${panel} !important; border-right-color: ${line} !important; }
    .problem-panel h2 { color: ${text} !important; }
    .problem-panel p, .problem-panel li { color: ${muted} !important; }
    .problem-panel h4 { color: ${text} !important; }
    .problem-panel pre { background: ${panel2} !important; border-color: ${line} !important; color: ${text} !important; }
    .problem-tag { background: ${panel2} !important; color: ${muted} !important; }
    .problem-info span { background: ${panel2} !important; color: ${muted} !important; }
    .opponent-card { border-top-color: ${line} !important; }
    .opponent-card b { color: ${text} !important; }
    .pulse-dot { background: ${green} !important; box-shadow: 0 0 0 5px ${green}1a !important; }
    .opponent-status span { color: ${text} !important; }
    .opponent-card small { color: ${muted} !important; }
    .editor-panel { background: ${bg} !important; }
    .editor-toolbar { background: ${panel} !important; border-bottom-color: ${line} !important; }
    .toolbar-left { color: ${muted} !important; }
    .toolbar-left select { background: ${panel2} !important; border-color: ${line} !important; color: ${text} !important; }
    .opponent-live { color: ${muted} !important; }
    .editor-actions { background: ${panel} !important; border-top-color: ${line} !important; }
    .results-panel { background: ${panel} !important; border-top-color: ${line} !important; }
    .result-tabs { border-bottom-color: ${line} !important; }
    .test-list span { background: ${panel2} !important; color: ${text} !important; }
    .console { color: ${muted} !important; }
    .result-summary { color: ${green} !important; }
    .attack-modal { background: ${panel} !important; }
    .attack-modal h2 { color: ${text} !important; }
    .attack-modal p { color: ${muted} !important; }
    /* Settings */
    .settings-page h1, .settings-page h2, .settings-page h3 { color: ${text} !important; }
    .settings-desc { color: ${muted} !important; }
    .settings-nav button { background: ${panel} !important; border-color: ${line} !important; color: ${muted} !important; }
    .settings-nav button:hover, .settings-nav button.active { background: ${panel2} !important; border-color: ${accent} !important; color: ${text} !important; }
    .settings-grid label { color: ${muted} !important; }
    .settings-grid input, .settings-grid select { background: ${panel2} !important; border-color: ${line} !important; color: ${text} !important; }
    .settings-grid input:focus, .settings-grid select:focus { border-color: ${accent} !important; box-shadow: 0 0 0 3px ${accent}1a !important; }
    .settings-toggle-row { background: ${panel2} !important; border-color: ${line} !important; }
    .settings-toggle-row b { color: ${text} !important; }
    .settings-toggle-row small { color: ${muted} !important; }
    /* Config selects in duel selection */
    .config-fields select { background: ${panel2} !important; border-color: ${line} !important; color: ${text} !important; }
    .match-config h3 { color: ${text} !important; }
    .match-config p { color: ${muted} !important; }
    /* Leaderboard */
    .table-head { color: ${muted} !important; }
    .leader-row { border-top-color: ${line} !important; color: ${text} !important; }
    .leader-row.me { background: ${panel2} !important; }
    /* Profile */
    .profile-hero h1 { color: ${text} !important; }
    .profile-hero p { color: ${muted} !important; }
    .profile-badges span { background: ${panel2} !important; color: ${muted} !important; border-color: ${line} !important; }
    /* Admin */
    .admin-icon { background: ${panel2} !important; }
    .admin-row { border-top-color: ${line} !important; }
    .admin-row b { color: ${text} !important; }
    .admin-row small { color: ${muted} !important; }
    .search { border-color: ${line} !important; background: ${panel} !important; }
    .search input { color: ${text} !important; }
    /* Section headings */
    .section-head h1, .section-head h2, .section-head p { color: ${text} !important; }
    /* Auth page */
    .auth-page { background: ${theme.bodyBg} !important; }
    .auth-visual { border-right-color: ${line} !important; }
    .auth-copy h1 { color: ${text} !important; }
    .auth-copy p { color: ${muted} !important; }
    .auth-copy h1 em { color: ${accent} !important; }
    .auth-features span { background: ${panel} !important; color: ${muted} !important; border-color: ${line} !important; }
    .auth-panel { background: ${panel2} !important; }
    .auth-card { background: ${panel} !important; border-color: ${line} !important; }
    .auth-card h2 { color: ${text} !important; }
    .auth-muted { color: ${muted} !important; }
    .auth-tabs { background: ${panel2} !important; }
    .auth-tabs button { color: ${muted} !important; }
    .auth-tabs button.active { background: ${panel} !important; color: ${accent} !important; }
    .auth-card label { color: ${muted} !important; }
    .auth-card input, .auth-card select { background: ${panel2} !important; border-color: ${line} !important; color: ${text} !important; }
    .auth-card input:focus, .auth-card select:focus { border-color: ${accent} !important; box-shadow: 0 0 0 3px ${accent}1a !important; }
    /* Theme cards */
    .theme-card { background: ${panel2} !important; border-color: ${line} !important; }
    .theme-card.selected { border-color: ${accent} !important; box-shadow: 0 0 0 2px ${accent}, 0 12px 30px #0003 !important; }
    .theme-check { background: ${accent} !important; }
    .theme-info b { color: ${text} !important; }
    .theme-info small { color: ${muted} !important; }
  `;
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem("campusDuelSettings") || "null") || {
      defaultLanguage: "javascript",
      editorTheme: "vs-dark",
      fontSize: 14,
      tabSize: 2,
      minimap: false,
      soundEffects: true,
      notifications: true,
      defaultDifficulty: "Medium",
      appTheme: "dark-arena",
    };
  } catch {
    return {
      defaultLanguage: "javascript",
      editorTheme: "vs-dark",
      fontSize: 14,
      tabSize: 2,
      minimap: false,
      soundEffects: true,
      notifications: true,
      defaultDifficulty: "Medium",
      appTheme: "dark-arena",
    };
  }
}
function saveSettings(settings) {
  localStorage.setItem("campusDuelSettings", JSON.stringify(settings));
}

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    department: "",
    year: "2028",
    role: "student",
    roleDetails: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = e => setForm(v => ({ ...v, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password || (mode === "register" && !form.name)) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    try {
      const response = await fetch(`${api}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Authentication failed.");

      // Accept common JWT response shapes without hard-coding one backend contract.
      const rawUser = data.user || data.data?.user || {};
      const user = {
        name: rawUser.name || form.name || form.email.split("@")[0],
        email: rawUser.email || form.email,
        college: rawUser.college || form.college || "Not set",
        department: rawUser.department || form.department || "Not set",
        year: rawUser.year || form.year || "2028",
        role: rawUser.role || form.role || "student",
        roleDetails: rawUser.roleDetails || form.roleDetails || "",
        elo: typeof rawUser.elo === "number" ? rawUser.elo : 1200,
        rank: rawUser.rank || null,
        streak: typeof rawUser.streak === "number" ? rawUser.streak : 0,
        solved: typeof rawUser.solved === "number" ? rawUser.solved : 0
      };
      if (data.token) localStorage.setItem("campusDuelToken", data.token);
      if (data.accessToken) localStorage.setItem("campusDuelToken", data.accessToken);
      if (user.role === "admin") {
        localStorage.setItem("campusDuelAdminToken", data.token || data.accessToken || "");
        localStorage.setItem("campusDuelAdminUser", JSON.stringify(user));
      }
      saveUser(user);
      nav(getRoleDashboard(user.role), { replace: true });
    } catch (err) {
      if (import.meta.env.VITE_DEMO_AUTH === "true") {
        const user = {
          name: form.name || form.email.split("@")[0],
          email: form.email,
          college: form.college || "Not set",
          department: form.department || "Not set",
          year: form.year || "2028",
          role: form.role || "student",
          roleDetails: form.roleDetails || "",
          elo: 1200, rank: null, streak: 0, solved: 0
        };
        if (user.role === "admin") {
          localStorage.setItem("campusDuelAdminToken", "demo-admin-token");
          localStorage.setItem("campusDuelAdminUser", JSON.stringify(user));
        }
        saveUser(user);
        nav(getRoleDashboard(user.role), { replace: true });
      } else {
        setError(err.message || "Authentication failed. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-page">
    <div className="auth-visual">
      <div className="brand auth-brand"><div className="brand-mark">⚔</div><div><b>Campus Duel</b><span>REAL-TIME CODING ARENA</span></div></div>
      <div className="auth-copy">
        <span className="eyebrow">⚔ COMPETE · CODE · CONQUER</span>
        <h1>Don't just solve code.<br/><em>Defeat your opponent.</em></h1>
        <p>Real-time coding duels, ELO rankings, attack mechanics and campus competition — built for students who want to compete.</p>
        <div className="auth-features"><span>⚔ Live Code Duels</span><span>🏆 ELO Rankings</span><span>💀 Attack Mode</span><span>⚡ Sprint & Practice</span></div>
      </div>
    </div>
    <div className="auth-panel">
      <div className="auth-card">
        <div className="auth-tabs"><button className={mode==="login"?"active":""} onClick={()=>{setMode("login");setError("")}}>Login</button><button className={mode==="register"?"active":""} onClick={()=>{setMode("register");setError("")}}>Register</button></div>
        <span className="eyebrow">{mode==="login"?"WELCOME BACK":"CREATE YOUR DUELIST ACCOUNT"}</span>
        <h2>{mode==="login"?"Enter the arena":"Join Campus Duel"}</h2>
        <p className="auth-muted">{mode==="login"?"Sign in to continue your competitive journey.":"Create a fresh account with your designated campus role."}</p>
        <form onSubmit={submit}>
          {mode==="register" && (
            <>
              <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" required/></label>
              <label>
                Role on Platform
                <select name="role" value={form.role} onChange={update} style={{ background: "var(--panel2)", color: "var(--text)", border: "1px solid var(--line)", padding: "10px", borderRadius: "8px", width: "100%" }}>
                  <option value="student">🎓 Student (Competitor)</option>
                  <option value="faculty">👨‍🏫 Faculty / Professor</option>
                  <option value="setter">✍️ Problem Setter / Curator</option>
                  <option value="moderator">🛡️ Campus Lead / Referee</option>
                  <option value="admin">👑 System Administrator</option>
                </select>
              </label>
              <div className="auth-two">
                <label>{form.role === "admin" ? "Organization" : "College"}<input name="college" value={form.college} onChange={update} placeholder={form.role === "admin" ? "Platform Team" : "College Name"}/></label>
                <label>Department<input name="department" value={form.department} onChange={update} placeholder="CSE / IT / ECE"/></label>
              </div>

              {form.role === "student" && (
                <label>Graduation year<select name="year" value={form.year} onChange={update}><option>2027</option><option>2028</option><option>2029</option><option>2030</option></select></label>
              )}

              {form.role === "faculty" && (
                <label>Academic Title / Designation<input name="roleDetails" value={form.roleDetails} onChange={update} placeholder="e.g. Assistant Professor, HOD, Lab Head"/></label>
              )}

              {form.role === "setter" && (
                <label>Problem Specialty / Handle<input name="roleDetails" value={form.roleDetails} onChange={update} placeholder="e.g. Dynamic Programming / LeetCode Handle"/></label>
              )}

              {form.role === "moderator" && (
                <label>Student Club / Campus Title<input name="roleDetails" value={form.roleDetails} onChange={update} placeholder="e.g. Coding Club Lead, GDSC Organizer"/></label>
              )}

              {form.role === "admin" && (
                <label>Administrative Unit<input name="roleDetails" value={form.roleDetails} onChange={update} placeholder="e.g. Arena Operations"/></label>
              )}
            </>
          )}
          <label>Email<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required/></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="••••••••" autoComplete={mode==="login"?"current-password":"new-password"} required/></label>
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-btn auth-submit" disabled={loading}>{loading ? "Connecting..." : mode==="login" ? "Enter Campus Duel" : "Create Account"} <ChevronRight size={16}/></button>
        </form>
        <small className="fresh-db-note">Fresh account system · no demo users or seeded player data</small>
      </div>
    </div>
  </div>;
}

function Protected({ children }) {
  return getUser() ? children : <Navigate to="/auth" replace />;
}

function AdminProtected({ children }) {
  const user = getUser();
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}

function RoleProtected({ allowedRoles = [], children }) {
  const user = getUser();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === "admin" || (Array.isArray(allowedRoles) && allowedRoles.includes(user.role))) {
    return children;
  }
  return <Navigate to="/" replace />;
}

function Shell({ children }) {
  const location = useLocation();
  const nav = useNavigate();
  const currentUser = getUser() || { name: "Duelist", elo: 1200 };
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const initials = (currentUser?.name || "DU").slice(0, 2).toUpperCase();

  const role = currentUser?.role || "student";
  const isAdmin = role === "admin";
  const isFaculty = role === "faculty";
  const isSetter = role === "setter";
  const isModerator = role === "moderator";
  const isStudent = role === "student" || !role;

  // Role-specific home label & icon
  const dashboardLink = (() => {
    if (isFaculty)   return ["/", "Classroom Hub", GraduationCap];
    if (isSetter)    return ["/", "Problem Studio", Code2];
    if (isModerator) return ["/", "Referee Console", Shield];
    if (isAdmin)     return ["/admin/dashboard", "Admin Panel", Crown];
    return ["/", "Dashboard", LayoutDashboard];
  })();

  // Shared nav links available to all roles
  const sharedLinks = [
    ["/duel", "Play Duel", Swords],
    ["/leaderboard", "Leaderboard", Trophy],
    ["/profile", "Profile", Users],
  ];

  // Role-specific extra links
  const roleLinks = [
    ...(isFaculty   ? [["/faculty", "Room Manager", Users]] : []),
    ...(isSetter    ? [["/studio", "Write Problem", Code2]] : []),
    ...(isModerator ? [["/referee", "Live Monitor", Shield]] : []),
    ...(isAdmin     ? [["/faculty", "Faculty View", GraduationCap], ["/studio", "Problem Studio", Code2], ["/referee", "Referee", Shield]] : []),
  ];

  const links = [dashboardLink, ...sharedLinks, ...roleLinks];

  const roleLabel = isFaculty ? "👨‍🏫 Faculty" : isSetter ? "✍️ Setter" : isModerator ? "🛡️ Referee" : isAdmin ? "👑 Admin" : "🎓 Student";

  return <div className="app-shell">
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark">⚔</div><div><b>Campus Duel</b><span>CODING ARENA</span></div></div>
      <nav>{links.map(([to, label, Icon]) => <Link key={`${to}-${label}`} className={location.pathname === to || (to === "/" && location.pathname === "/") ? "active" : ""} to={to} onClick={() => setOpen(false)}><Icon size={18}/>{label}</Link>)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-player" title="Duelist Profile">
          <div className="avatar">{initials}</div>
          <div>
            <b>{currentUser.name}</b>
            <small style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span>{currentUser.elo || 1200} ELO</span>
              <span style={{ background: "var(--panel2)", border: "1px solid var(--line)", padding: "1px 5px", borderRadius: "4px", fontSize: "0.7rem", color: "var(--accent)" }}>
                {roleLabel}
              </span>
            </small>
          </div>
        </div>
        <button className="ghost-btn" onClick={() => { clearUser(); localStorage.removeItem("campusDuelToken"); nav("/auth"); }}><LogOut size={16}/> Sign out</button>
      </div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setOpen(v => !v)}><Menu/></button>
        <div className="crumb">REAL-TIME COMPETITIVE CODING ARENA</div>
        <div className="top-actions">
          <button className="icon-btn" onClick={() => nav("/settings")} title="Settings"><Settings size={18}/></button>
          <button className="icon-btn" title="Notifications"><Bell size={18}/><i/></button>
          <div className="top-user-container">
            <button className="avatar small clickable" onClick={() => setUserMenuOpen(v => !v)} title="User Menu">
              {initials}
            </button>
            {userMenuOpen && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <b>{currentUser?.name || "Duelist"}</b>
                  <small>{currentUser?.email || "duelist@campus.edu"}</small>
                </div>
                <button onClick={() => { setUserMenuOpen(false); nav("/profile"); }}>
                  <Users size={15}/> View Profile
                </button>
                <button onClick={() => { setUserMenuOpen(false); nav("/settings"); }}>
                  <Settings size={15}/> Settings
                </button>
                <div className="dropdown-divider" />
                <button className="danger" onClick={() => { setUserMenuOpen(false); clearUser(); localStorage.removeItem("campusDuelToken"); nav("/auth"); }}>
                  <LogOut size={15}/> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {children}
    </main>
  </div>;
}

function JoinRoomByCodeCard() {
  const nav = useNavigate();
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleJoinByCode(e) {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setJoining(true);
    setErrorMsg("");

    const code = joinCodeInput.trim().toUpperCase();
    const token = localStorage.getItem("campusDuelToken");
    const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    try {
      const res = await fetch(`${api}/rooms/join-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ joinCode: code })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to join room.");

      nav(`/arena?room=${data.room.code}&joinCode=${data.room.code}`);
    } catch (err) {
      nav(`/arena?room=${code}&joinCode=${code}`);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="panel join-room-card" style={{ background: "linear-gradient(135deg, var(--panel), var(--panel2))", border: "1px solid var(--line)", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <span className="eyebrow" style={{ color: "var(--cyan)" }}><GraduationCap size={14}/> CLASSROOM & FACULTY ROOMS</span>
          <h3 style={{ margin: "4px 0 2px" }}>Join Room via Join Code</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>Enter the unique Join Code (e.g. <b>FAC-8042</b>) provided by your Faculty.</p>
        </div>
        <div style={{ background: "rgba(34, 211, 238, 0.1)", border: "1px solid rgba(34, 211, 238, 0.2)", padding: "10px", borderRadius: "10px" }}>
          <GraduationCap size={26} color="var(--cyan)"/>
        </div>
      </div>
      <form onSubmit={handleJoinByCode} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={joinCodeInput}
          onChange={(e) => setJoinCodeInput(e.target.value)}
          placeholder="Enter Join Code (e.g. FAC-8042)"
          style={{
            flex: 1,
            minWidth: "220px",
            background: "var(--bg)",
            border: "1px solid var(--line)",
            padding: "11px 16px",
            borderRadius: "8px",
            color: "var(--text)",
            fontSize: "0.95rem",
            fontWeight: "bold",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            outline: "none"
          }}
          required
        />
        <button className="primary-btn" type="submit" disabled={joining} style={{ padding: "11px 24px", borderRadius: "8px" }}>
          {joining ? "Joining..." : "Join Room"} <ChevronRight size={16}/>
        </button>
      </form>
      {errorMsg && <div style={{ color: "var(--red)", fontSize: "0.82rem", marginTop: "8px" }}>{errorMsg}</div>}
    </div>
  );
}

function Dashboard() {
  const nav = useNavigate();
  const currentUser = getUser() || { name: "Duelist", elo: 1200, rank: null, streak: 0, solved: 0 };
  const isNewAccount = (!currentUser.solved || currentUser.solved === 0) && (!currentUser.wins || currentUser.wins === 0);

  const historyMatches = (currentUser.matchHistory && currentUser.matchHistory.length > 0)
    ? currentUser.matchHistory
    : [
        { opponent: "Alex Kumar", eloChange: "+25 ELO", result: "WIN", time: "02:41", icon: "⚔️", mode: "Code Duel" },
        { opponent: "Priya S", eloChange: "-15 ELO", result: "LOSS", time: "05:18", icon: "🐞", mode: "Bug Battle" },
        { opponent: "Rahul M", eloChange: "+25 ELO", result: "WIN", time: "03:54", icon: "⚡", mode: "Speed Coding" }
      ];

  return <div className="page dashboard">
    <section className="hero-card">
      <div><span className="eyebrow"><Radio size={14}/> LIVE ARENA</span><h1>Welcome back, {currentUser.name} <span>👋</span></h1><p>Don't just solve code. <strong>Defeat your opponent.</strong></p><button className="primary-btn big" onClick={() => nav("/duel")}>Find a Duel <Swords size={18}/></button></div>
      <div className="hero-orb"><span>⚔</span><small>CODE<br/>DUEL</small></div>
    </section>

    {/* Student Join Faculty Room Code Card */}
    <JoinRoomByCodeCard />

    <div className="stat-grid">
      <Stat icon={<Trophy/>} label="ELO Rating" value={currentUser.elo || 1200} meta={isNewAccount ? "Initial rating" : `${currentUser.elo - 1200 >= 0 ? "+" : ""}${currentUser.elo - 1200} ELO overall`} />
      <Stat icon={<Flame/>} label="Win Streak" value={currentUser.streak || 0} meta={`Best: ${Math.max(currentUser.streak || 0, currentUser.wins || 0)}`} />
    </div>
    <section className="section-head"><div><span className="eyebrow">QUICK PLAY</span><h2>Choose your arena</h2></div><Link to="/duel" className="text-link">View all <ChevronRight size={16}/></Link></section>
    <div className="mode-grid">{modes.map(m => <ModeCard key={m.key} mode={m} onClick={() => nav(`/duel?mode=${m.key}`)}/>)}</div>
    <div className="two-col">
      <section className="panel"><div className="panel-title"><div><span className="eyebrow">RECENT MATCHES</span><h3>Battle history</h3></div><HistoryIcon/></div>
        {historyMatches.map((r, i) => (
          <div className="match-row" key={i}>
            <div className="mode-icon">{r.icon || "⚔️"}</div>
            <div>
              <b>{r.opponent || "Opponent"} ({r.mode || "Duel"})</b>
              <small>{r.eloChange || "+25 ELO"} · Time: {r.time || "02:00"}</small>
            </div>
            <span className={`result ${(r.result || "WIN").toLowerCase()}`}>{r.result || "WIN"}</span>
          </div>
        ))}
      </section>
      <section className="panel insight-panel"><div className="panel-title"><div><span className="eyebrow">AI ARENA INSIGHT</span><h3>Performance summary</h3></div><Bot size={20}/></div>
        <div className="insight"><Bot size={18}/><div><b>Performance insight</b><p>You're strongest in Arrays & Sorting. Try <strong>5 Medium Graph problems</strong> next to rank up.</p></div></div>
        <div className="match-row" style={{marginTop:"10px"}}><div><b>Recent Mastery</b><small>Arrays & Hashing · 92% Accuracy</small></div><span className="result win">92%</span></div>
        <div className="match-row"><div><b>Recommended Practice</b><small>Dynamic Programming & Graphs</small></div><span className="result loss">Focus</span></div>
      </section>
    </div>
  </div>;
}

function Stat({icon,label,value,meta}) { return <div className="stat-card"><div className="stat-icon">{icon}</div><small>{label}</small><strong>{value}</strong><span>{meta}</span></div>; }
function HistoryIcon(){ return <Activity size={20}/>; }
function ModeCard({mode,onClick}) { return <button className="mode-card" onClick={onClick}><div className="mode-top"><span className="mode-emoji">{mode.icon}</span><span className="mode-elo">{mode.elo} ELO</span></div><h3>{mode.title}</h3><p>{mode.text}</p><div className="mode-meta"><span><Clock3 size={14}/>{mode.duration}</span><ChevronRight size={17}/></div></button>; }

function DuelSelection() {
  const nav = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialMode = searchParams.get("mode") || "CODE_DUEL";
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode && modes.some(m => m.key === qMode)) {
      setMode(qMode);
    }
  }, [location.search, searchParams]);

  return <div className="page">
    <section className="section-head"><div><span className="eyebrow">⚔ CHOOSE YOUR DUEL</span><h1>Pick your battleground</h1><p>Every mode rewards a different kind of coding skill.</p></div></section>
    <div className="mode-grid large">{modes.map(m => <button key={m.key} className={`mode-card selectable ${mode===m.key?"selected":""}`} onClick={()=>setMode(m.key)}><div className="mode-top"><span className="mode-emoji">{m.icon}</span>{mode===m.key&&<span className="selected-dot"><Check size={13}/></span>}</div><h3>{m.title}</h3><p>{m.text}</p><div className="mode-meta"><span><Clock3 size={14}/>{m.duration}</span><span>{m.elo} rating</span></div></button>)}</div>
    <section className="match-config panel"><div><span className="eyebrow">MATCH SETTINGS</span><h3>{modes.find(m=>m.key===mode)?.title || "Code Duel"}</h3><p>Matchmaking starts near your current ELO and expands gradually if no opponent is found.</p></div><div className="config-fields"><label>Difficulty<select><option>Medium</option><option>Easy</option><option>Hard</option></select></label><label>Category<select><option>Any category</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div><button className="primary-btn big" onClick={()=>nav(`/arena?mode=${mode}`)}>Find Opponent <Swords size={18}/></button></section>
  </div>;
}

const modeConfigs = {
  CODE_DUEL: {
    key: "CODE_DUEL",
    title: "Two Sum",
    eyebrow: "⚔ CODE DUEL · LIVE",
    category: "Arrays & Hashing",
    difficulty: "Medium",
    durationSec: 10 * 60,
    banner: null,
    starters: starter,
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Exactly one valid answer exists."]
  },
  BUG_BATTLE: {
    key: "BUG_BATTLE",
    title: "Fix the Palindrome Bug",
    eyebrow: "🐞 BUG BATTLE · LIVE",
    category: "Debugging & Strings",
    difficulty: "Medium",
    durationSec: 5 * 60,
    banner: {
      type: "warning",
      text: "🐞 BUG HUNT MODE: The code below contains 2 intentional bugs (case sensitivity & array bounds bug). Find and fix them before your opponent!"
    },
    starters: {
      javascript: `// BUGGY CODE - FIX THE BUGS!
function isPalindrome(s) {
  // Bug 1: Fails to convert string to lowercase
  // Bug 2: Loop condition i <= clean.length causes index out of bounds!
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
    },
    description: "Given a string s, return true if it is a palindrome considering alphanumeric characters, ignoring cases. Fix the broken solution code!",
    example: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true',
    constraints: ["1 ≤ s.length ≤ 2 * 10⁵", "Contains ASCII characters", "Must run in O(N) time"]
  },
  SPEED_CODING: {
    key: "SPEED_CODING",
    title: "Reverse String Sprint",
    eyebrow: "⚡ SPEED CODING · LIVE",
    category: "Strings",
    difficulty: "Easy",
    durationSec: 60,
    banner: {
      type: "speed",
      text: "⚡ SPEED SPRINT: 60 Seconds on the clock! Write the fastest valid string reversal code!"
    },
    starters: {
      javascript: `function reverseString(s) {
  // Speed challenge: Return reversed string
  return s.split("").reverse().join("");
}`,
      python: `def reverse_string(s):
    # Speed challenge: Return reversed string
    return s[::-1]`,
      java: `class Solution {
    public String reverseString(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}`,
      cpp: `class Solution {
public:
    string reverseString(string s) {
        reverse(s.begin(), s.end());
        return s;
    }
};`,
      c: `void reverseString(char* s, int sSize) {
    int i = 0, j = sSize - 1;
    while(i < j) { char t = s[i]; s[i++] = s[j]; s[j--] = t; }
}`
    },
    description: "Write a function that reverses an input string or array as quickly as possible.",
    example: 'Input: s = "hello"\nOutput: "olleh"',
    constraints: ["1 ≤ s.length ≤ 10⁵", "Must finish before the 60s timer expires!"]
  },
  CODE_GOLF: {
    key: "CODE_GOLF",
    title: "Sum of Digits (Shortest Code)",
    eyebrow: "🧠 CODE GOLF · LIVE",
    category: "Math & Strings",
    difficulty: "Medium",
    durationSec: 7 * 60,
    banner: {
      type: "golf",
      text: "🧠 CODE GOLF: Write the shortest solution with the fewest characters! Character count matters."
    },
    starters: {
      javascript: `const sumDigits = n => [...''+n].reduce((a,b)=>+a++b,0);`,
      python: `def sum_digits(n): return sum(map(int,str(n)))`,
      java: `class Solution {
    public int sumDigits(int n) {
        int s = 0; while(n>0){ s += n%10; n /= 10; } return s;
    }
}`,
      cpp: `class Solution {
public:
    int sumDigits(int n) {
        int s=0; while(n){ s+=n%10; n/=10; } return s;
    }
};`,
      c: `int sumDigits(int n) {
    int s=0; while(n){ s+=n%10; n/=10; } return s;
}`
    },
    description: "Given a non-negative integer n, return the sum of all its digits using the fewest possible characters.",
    example: "Input: n = 38\nOutput: 11 (3 + 8 = 11)",
    constraints: ["0 ≤ n ≤ 2 * 10⁹", "Shortest code wins!"]
  }
};

function Arena() {
  const nav = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const modeKey = searchParams.get("mode") || "CODE_DUEL";
  const defaultFallbackConfig = modeConfigs[modeKey] || modeConfigs.CODE_DUEL;
  const userSettings = getSettings();

  const [dynamicQuestion, setDynamicQuestion] = useState(null);
  const [fetchingQuestion, setFetchingQuestion] = useState(true);

  const modeConfig = dynamicQuestion || defaultFallbackConfig;

  const [language, setLanguage] = useState(userSettings.defaultLanguage || "javascript");
  const [code, setCode] = useState(() => modeConfig.starters[userSettings.defaultLanguage] || modeConfig.starters.javascript || "");
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attack, setAttack] = useState(false);
  const [attackResult, setAttackResult] = useState(null);
  const [time, setTime] = useState(modeConfig.durationSec);
  const [tab, setTab] = useState("tests");
  const [battleFinished, setBattleFinished] = useState(false);
  const [battleOutcome, setBattleOutcome] = useState(null);

  useEffect(() => {
    let mounted = true;
    setFetchingQuestion(true);
    fetchUniqueOnlineQuestion(modeKey, userSettings.defaultDifficulty || "Medium").then((q) => {
      if (mounted && q) {
        setDynamicQuestion(q);
        setCode(q.starters[userSettings.defaultLanguage] || q.starters.javascript || "");
        setTime(q.durationSec);
        setFetchingQuestion(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [modeKey]);

  const isBattleOver = submitted || time === 0;

  // Real-time opponent states
  const roomId = useMemo(() => searchParams.get("room") || "arena-room-1", [searchParams]);
  const [opponentStatus, setOpponentStatus] = useState("Opponent connected to room...");
  const [opponentTestsPassed, setOpponentTestsPassed] = useState(0);
  const [opponentIsTyping, setOpponentIsTyping] = useState(false);

  const mins = String(Math.floor(time / 60)).padStart(2, "0");
  const secs = String(time % 60).padStart(2, "0");

  const processResult = useCallback((outcome) => {
    if (battleFinished) return;
    setBattleFinished(true);

    const currentUser = getUser();
    if (!currentUser) return;

    const isWin = outcome === "WIN";
    const eloDelta = isWin ? 25 : -15;
    const newElo = Math.max(1000, (currentUser.elo || 1200) + eloDelta);
    const newStreak = isWin ? (currentUser.streak || 0) + 1 : 0;
    const newWins = isWin ? (currentUser.wins || 0) + 1 : (currentUser.wins || 0);
    const newLosses = !isWin ? (currentUser.losses || 0) + 1 : (currentUser.losses || 0);
    const newSolved = isWin ? (currentUser.solved || 0) + 1 : (currentUser.solved || 0);

    const newCodeDuels = isWin && modeKey === "CODE_DUEL" ? (currentUser.codeDuelsWon || 0) + 1 : (currentUser.codeDuelsWon || 0);
    const newBugBattles = isWin && modeKey === "BUG_BATTLE" ? (currentUser.bugBattlesWon || 0) + 1 : (currentUser.bugBattlesWon || 0);
    const newSpeedCoding = isWin && modeKey === "SPEED_CODING" ? (currentUser.speedCodingWon || 0) + 1 : (currentUser.speedCodingWon || 0);

    const oldHistory = Array.isArray(currentUser.eloHistory) && currentUser.eloHistory.length > 0 ? currentUser.eloHistory : [1200];
    const newEloHistory = [...oldHistory, newElo];

    const matchEntry = {
      opponent: "Alex Kumar",
      mode: modeConfig.title,
      result: outcome,
      eloChange: isWin ? "+25 ELO" : "-15 ELO",
      elo: newElo,
      time: `${mins}:${secs}`,
      icon: modeKey === "BUG_BATTLE" ? "🐞" : modeKey === "SPEED_CODING" ? "⚡" : "⚔️"
    };

    const oldMatchHistory = Array.isArray(currentUser.matchHistory) ? currentUser.matchHistory : [];
    const newMatchHistory = [matchEntry, ...oldMatchHistory].slice(0, 10);

    const updatedUser = {
      ...currentUser,
      elo: newElo,
      streak: newStreak,
      wins: newWins,
      losses: newLosses,
      solved: newSolved,
      codeDuelsWon: newCodeDuels,
      bugBattlesWon: newBugBattles,
      speedCodingWon: newSpeedCoding,
      eloHistory: newEloHistory,
      matchHistory: newMatchHistory
    };

    saveUser(updatedUser);
    setBattleOutcome({ status: outcome, eloDelta, newElo, newStreak });
    if (isWin) {
      triggerConfetti();
    }
  }, [battleFinished, modeKey, modeConfig.title, mins, secs]);

  useEffect(() => {
    if (time === 0 && !submitted && !battleFinished) {
      processResult("LOSS");
    }
  }, [time, submitted, battleFinished, processResult]);

  useEffect(() => {
    const defaultLang = userSettings.defaultLanguage || "javascript";
    setLanguage(defaultLang);
    setCode(modeConfig.starters[defaultLang] || modeConfig.starters.javascript || "");
    setTime(modeConfig.durationSec);
    setSubmitted(false);
    setAttack(false);
    setBattleFinished(false);
    setBattleOutcome(null);
  }, [modeKey, modeConfig, userSettings.defaultLanguage]);

  useEffect(() => {
    const t = setInterval(() => setTime(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Socket setup for realtime status
  useEffect(() => {
    socket.connect();
    socket.emit("duel:join", roomId);

    const handleStatus = (data) => {
      if (typeof data === "string") {
        setOpponentStatus(data);
      } else if (data?.message) {
        setOpponentStatus(data.message);
        if (typeof data.testsPassed === "number") setOpponentTestsPassed(data.testsPassed);
      }
      setOpponentIsTyping(true);
      setTimeout(() => setOpponentIsTyping(false), 1500);
    };

    socket.on("duel:opponent-status", handleStatus);
    socket.on("duel:status", handleStatus);

    return () => {
      socket.off("duel:opponent-status", handleStatus);
      socket.off("duel:status", handleStatus);
    };
  }, [roomId]);

  // Dynamic real-time ticker simulation for solo play
  useEffect(() => {
    const timeline = [
      { delay: 2000, status: "Opponent connected to room.", tests: 0 },
      { delay: 5000, status: "Opponent reading problem constraints...", tests: 0 },
      { delay: 10000, status: "Opponent started writing code...", tests: 0 },
      { delay: 18000, status: "Opponent writing solution logic...", tests: 0 },
      { delay: 26000, status: "Opponent executed test cases...", tests: 0 },
      { delay: 34000, status: "Opponent passed 4/10 public tests...", tests: 4 },
      { delay: 46000, status: "Opponent fixing edge cases...", tests: 4 },
      { delay: 60000, status: "Opponent passed 8/10 tests...", tests: 8 },
      { delay: 75000, status: "Opponent submitted solution! (10/10 passed)", tests: 10 }
    ];

    const timers = timeline.map(item =>
      setTimeout(() => {
        setOpponentStatus(item.status);
        setOpponentTestsPassed(item.tests);
        setOpponentIsTyping(true);
        setTimeout(() => setOpponentIsTyping(false), 1200);
      }, item.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [modeKey]);

  const selectLanguage = e => {
    const l = e.target.value;
    setLanguage(l);
    setCode(modeConfig.starters[l] || starter[l] || "");
  };

  const handleCodeChange = (val) => {
    setCode(val);
    socket.emit("duel:typing", { roomId });
  };

  const run = () => {
    setRunning(true);
    socket.emit("duel:status", { roomId, status: "Opponent executed test cases...", testsPassed: 4 });
    setTimeout(() => setRunning(false), 900);
  };

  const submit = () => {
    setSubmitted(true);
    socket.emit("duel:status", { roomId, status: "Opponent submitted solution! (10/10 passed)", testsPassed: 10 });
    processResult("WIN");
  };

  const attackSubmit = () => {
    setAttackResult("bug");
    setOpponentStatus("Opponent defended your attack 🛡️");
  };

  return <div className="arena-page">
    <div className="arena-header">
      <div className="arena-title">
        <Link to="/duel" className="back"><ArrowLeft size={18}/></Link>
        <div>
          <span className="eyebrow">{modeConfig.eyebrow}</span>
          <h2>{modeConfig.title}</h2>
        </div>
      </div>
      <div className="versus"><Player name="Hari" elo="1428" active/><span>VS</span><Player name="Alex" elo="1275"/></div>
      <div className="timer-container" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div className="timer"><Clock3 size={17}/><b>{mins}:{secs}</b></div>
        <button
          className="exit-battle-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#ff6b6b",
            padding: "5px 12px",
            borderRadius: "6px",
            fontWeight: "600",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onClick={() => {
            if (!isBattleOver) {
              if (window.confirm("Are you sure you want to exit this active duel? Exiting will forfeit the match.")) {
                processResult("LOSS");
                nav("/duel");
              }
            } else {
              nav("/duel");
            }
          }}
          title="Exit Match"
        >
          <LogOut size={14} /> Exit
        </button>
        {battleOutcome && (
          <span className={`result ${battleOutcome.status.toLowerCase()}`} style={{ fontSize: "10px", padding: "6px 10px" }}>
            {battleOutcome.status === "WIN"
              ? `🏆 VICTORY (+25 ELO) 🔥 ${battleOutcome.newStreak} streak`
              : `💀 DEFEAT (-15 ELO) — streak reset`}
          </span>
        )}
      </div>
    </div>

    <div className="arena-grid">
      <ProblemPanel modeConfig={modeConfig} opponentStatus={opponentStatus} opponentTestsPassed={opponentTestsPassed} opponentIsTyping={opponentIsTyping} />

      <section className="editor-panel">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <Code2 size={16}/>
            <select value={language} onChange={selectLanguage}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
            {modeKey === "CODE_GOLF" && <span className="golf-char-counter">Chars: {code ? code.length : 0}</span>}
          </div>
          <span className="opponent-live">
            <i className={opponentIsTyping ? "opponent-typing-dot" : ""}/>
            {opponentStatus}
          </span>
        </div>

        {modeConfig.banner && (
          <div className={`mode-banner ${modeConfig.banner.type}`}>
            {modeConfig.banner.text}
          </div>
        )}

        <div className="editor">
          <Editor height="100%" language={language==="cpp"?"cpp":language} theme={userSettings.editorTheme || "vs-dark"} value={code} onChange={handleCodeChange} options={{fontSize:userSettings.fontSize||14,minimap:{enabled:!!userSettings.minimap},automaticLayout:true,scrollBeyondLastLine:false,padding:{top:14},tabSize:userSettings.tabSize||2}}/>
        </div>

        <div className="editor-actions">
          <button className="ghost-btn" onClick={run} disabled={running}><Play size={15}/>{running?"Running...":"Run"}</button>
          <button className="primary-btn" onClick={submit}><Send size={15}/>Submit</button>
          {submitted&&<button className="attack-btn" onClick={()=>setAttack(true)}><Swords size={15}/>Attack Mode</button>}
        </div>

        <div className="results-panel">
          <div className="result-tabs">
            <button className={tab==="tests"?"active":""} onClick={()=>setTab("tests")}>Test Results</button>
            <button className={tab==="console"?"active":""} onClick={()=>setTab("console")}>Console</button>
            <span className="result-summary">{submitted?"10/10 passed":"Run your code to test"}</span>
          </div>
          {tab==="tests"?<div className="test-list">{[1,2,3,4].map(i=><span key={i} className={submitted?"pass":"pending"}>{submitted?<Check size={13}/>:<Clock3 size={13}/>} Test {i}</span>)}{[5,6].map(i=><span className="hidden-test" key={i}>🔒 Hidden {i}</span>)}</div>:<pre className="console">Ready for execution. Mode: {modeConfig.key}\nNo hidden test data is exposed.</pre>}
        </div>
      </section>
    </div>
    {attack&&<AttackModal onClose={()=>setAttack(false)} onSubmit={attackSubmit} result={attackResult}/>}
  </div>;
}

function Player({name,elo,active}) {return <div className={`player ${active?"active":""}`}><div className="avatar">{name[0]}</div><div><b>{name}</b><small>{elo} ELO</small></div></div>}

function ProblemPanel({ modeConfig, opponentStatus, opponentTestsPassed, opponentIsTyping }) {
  return <aside className="problem-panel">
    <div className="problem-scroll">
      <div className="problem-heading">
        <span className={`difficulty ${(modeConfig?.difficulty || "Medium").toLowerCase()}`}>⚡ {modeConfig?.difficulty || "Medium"}</span>
        <span className="problem-tag">{modeConfig?.category || "Arrays"}</span>
      </div>
      <h2>{modeConfig?.title || "Problem"}</h2>
      <p>{modeConfig?.description}</p>
      <h4>Example</h4>
      <pre>{modeConfig?.example}</pre>
      <h4>Constraints</h4>
      <ul>
        {modeConfig?.constraints?.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="problem-info">
        <span><Clock3/>{Math.ceil((modeConfig?.durationSec || 600)/60)} min</span>
        <span><Gauge/>1s</span>
        <span><Activity/>256 MB</span>
      </div>
    </div>

    <div className="opponent-card">
      <div className="panel-title">
        <b>Opponent status (Realtime)</b>
        <Radio size={15}/>
      </div>
      <div className="opponent-status">
        <div className="pulse-dot"/>
        <span>{opponentStatus}</span>
        {opponentIsTyping && <small className="opponent-typing-dot"/>}
      </div>
      <div className="opponent-progress-bar">
        <div style={{ width: `${(opponentTestsPassed / 10) * 100}%` }} />
      </div>
      <small style={{ display: "block", marginTop: "4px" }}>
        Tests Passed: {opponentTestsPassed}/10 · Source code stays private during duel.
      </small>
    </div>
  </aside>;
}

function AttackModal({onClose,onSubmit,result}){return <div className="modal-backdrop"><div className="attack-modal"><button className="modal-close" onClick={onClose}><X/></button><span className="eyebrow">💀 SIGNATURE FEATURE</span><h2>Attack Mode</h2>{!result?<><p>Your opponent solved the problem. Try to break their solution with a valid custom test.</p><label>Custom test case<textarea placeholder="100000 99999"/></label><div className="attack-rules"><span>Max 2 attacks</span><span>Constraint checked</span><span>Time limited</span></div><button className="attack-btn big" onClick={onSubmit}><Swords/>Launch Attack</button></>:<div className="attack-result"><div>🛡️</div><h3>DEFENDED!</h3><p>Alex's solution passed your attack.</p><button className="primary-btn" onClick={onClose}>Back to Duel</button></div>}</div></div>}

function Leaderboard(){
  const [tab,setTab]=useState("global");
  return <div className="page"><section className="section-head"><div><span className="eyebrow">🏆 COMPETITIVE RANKINGS</span><h1>Leaderboard</h1><p>Legitimate completed duels only. Practice matches never affect rating.</p></div></section>
    <div className="tabs">{["global","department"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
    <section className="panel leaderboard-panel"><div className="table-head"><span>RANK / PLAYER</span><span>DEPT</span><span>ELO</span><span>WIN RATE</span></div>{leaderboard.map((r,i)=><div className={`leader-row ${i===0?"me":""}`} key={r[0]}><div><strong>{r[0]}</strong><div className="avatar tiny">{r[1][0]}</div><b>{r[1]}</b>{i===0&&<span className="you">YOU</span>}</div><span>{r[3]}</span><strong>{r[4]}</strong><span>{r[5]}%</span></div>)}</section>
  </div>;
}

function Profile(){
  const nav = useNavigate();
  const currentUser = getUser() || { name: "Duelist", department: "Not set", year: "2028", elo: 1200, streak: 0, solved: 0, wins: 0, codeDuelsWon: 0, bugBattlesWon: 0, speedCodingWon: 0, eloHistory: [1200] };
  const initials = (currentUser.name || "D").slice(0,2).toUpperCase();

  const skillData = [
    ["Accuracy", Math.min(100, Math.max(50, 80 + (currentUser.wins || 0) * 2))],
    ["Speed", Math.min(100, Math.max(50, 75 + (currentUser.speedCodingWon || 0) * 5))],
    ["Debugging", Math.min(100, Math.max(50, 70 + (currentUser.bugBattlesWon || 0) * 6))],
    ["Efficiency", Math.min(100, Math.max(50, 78 + (currentUser.codeDuelsWon || 0) * 3))]
  ];

  // Achievement expectations evaluation (Medium / Hard difficulty targets)
  const achievementList = [
    { id: "1", icon: "🔥", title: "First Blood", expectation: "Finish 30 battles faster than opponent (30 speed wins)", level: "Medium", target: 30, current: currentUser.wins || 0 },
    { id: "2", icon: "⚔️", title: "Code Duelist", expectation: "Win 50 Code Duels", level: "Hard", target: 50, current: currentUser.codeDuelsWon || 0 },
    { id: "3", icon: "🐞", title: "Bug Hunter", expectation: "Win 50 Bug Battles", level: "Medium", target: 50, current: currentUser.bugBattlesWon || 0 },
    { id: "4", icon: "🧠", title: "Code Master", expectation: "Reach 2500 ELO rating", level: "Hard", target: 2500, current: currentUser.elo || 1200 },
    { id: "5", icon: "💀", title: "Unstoppable", expectation: "Reach a 25-match win streak", level: "Hard", target: 25, current: currentUser.streak || 0 },
    { id: "6", icon: "🏆", title: "Arena Champion", expectation: "Win 100 total duels", level: "Hard", target: 100, current: currentUser.wins || 0 },
    { id: "7", icon: "⚡", title: "Speed Demon", expectation: "Win 50 Speed Coding duels", level: "Medium", target: 50, current: currentUser.speedCodingWon || 0 },
  ];

  // Dynamic ELO history graph computation
  const history = Array.isArray(currentUser.eloHistory) && currentUser.eloHistory.length > 0
    ? currentUser.eloHistory
    : [1200];

  const minElo = Math.min(...history) - 20;
  const maxElo = Math.max(...history) + 20;
  const range = maxElo - minElo || 1;

  const points = history.map((val, idx) => {
    const x = history.length === 1 ? 400 : (idx / (history.length - 1)) * 740 + 30;
    const y = 150 - ((val - minElo) / range) * 110;
    return `${x},${y}`;
  }).join(" ");

  const totalChange = (currentUser.elo || 1200) - 1200;

  return <div className="page">
    <section className="profile-hero panel">
      <div className="profile-avatar">{initials}</div>
      <div className="profile-hero-content">
        <span className="eyebrow">COMPETITIVE PROFILE</span>
        <h1>{currentUser.name}</h1>
        <p><GraduationCap size={15}/> {currentUser.department || "CSE"} · Class of {currentUser.year || "2028"}</p>
        <div className="profile-badges">
          <span className={`role-tag ${currentUser.role || "student"}`}>
            {currentUser.role === "admin" ? "👑 Admin" :
             currentUser.role === "faculty" ? "👨‍🏫 Faculty" :
             currentUser.role === "setter" ? "✍️ Problem Setter" :
             currentUser.role === "moderator" ? "🛡️ Referee" : "🎓 Duelist"}
          </span>
          <span>🔥 {currentUser.streak || 0} streak</span>
          <span>🏆 {currentUser.elo || 1200} ELO</span>
          <span>⚔ {currentUser.solved || 0} solved</span>
        </div>
      </div>
      <div className="profile-hero-actions">
        <button className="primary-btn" onClick={() => nav("/settings")}><Settings size={15}/> Edit Profile & Settings</button>
      </div>
    </section>
    <div className="profile-grid">
      <section className="panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">PERFORMANCE</span>
            <h3>Skill profile</h3>
          </div>
          <BarChart3/>
        </div>
        {skillData.map(x => (
          <div className="skill" key={x[0]}>
            <div><span>{x[0]}</span><b>{x[1]}%</b></div>
            <div className="bar"><i style={{width:`${x[1]}%`}}/></div>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">ACHIEVEMENTS & TROPHIES</span>
            <h3>Expectations & Rewards</h3>
          </div>
          <Crown/>
        </div>
        <div className="achievement-grid" style={{ gridTemplateColumns: "1fr" }}>
          {achievementList.map(a => {
            const unlocked = a.current >= a.target;
            const pct = Math.min(100, Math.round((a.current / a.target) * 100));
            return (
              <div className={`achievement ${unlocked ? "unlocked" : ""}`} key={a.id}>
                <span>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <b>{a.title}</b>
                      <span className={`difficulty-tag ${a.level.toLowerCase()}`}>{a.level}</span>
                    </div>
                    {unlocked ? (
                      <button className="celebrate-btn" onClick={triggerConfetti} title="Trigger Celebration!">
                        Celebrate 🎉
                      </button>
                    ) : (
                      <span className="result loss" style={{ fontSize: "8px" }}>
                        LOCKED
                      </span>
                    )}
                  </div>
                  <small style={{ color: "#8b95a5", fontSize: "9px" }}>Expectation: {a.expectation}</small>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <div className="bar" style={{ flex: 1, height: "4px" }}>
                      <i style={{ width: `${pct}%`, background: unlocked ? "linear-gradient(90deg,#4ddd9e,#22d3ee)" : "linear-gradient(90deg,#8b5cf6,#6d49dc)" }} />
                    </div>
                    <small style={{ fontSize: "8px", color: unlocked ? "#4ddd9e" : "#8b95a5", fontWeight: "700" }}>
                      {a.current} / {a.target}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
    <section className="panel">
      <div className="panel-title">
        <div>
          <span className="eyebrow">RATING HISTORY</span>
          <h3>ELO progression</h3>
        </div>
        <span className={totalChange >= 0 ? "positive" : "result loss"} style={{ fontWeight: "700" }}>
          {history.length > 1 ? `${totalChange >= 0 ? "+" : ""}${totalChange} ELO (${history.length - 1} matches)` : "Baseline 1200 ELO (0 duels)"}
        </span>
      </div>
      <div className="chart" style={{ height: "200px", marginTop: "15px" }}>
        <svg viewBox="0 0 800 180" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <line x1="0" y1="150" x2="800" y2="150" stroke="currentColor" opacity=".15"/>
          <line x1="0" y1="40" x2="800" y2="40" stroke="currentColor" opacity=".08"/>
          {history.length > 1 && (
            <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          )}
          {history.map((val, idx) => {
            const x = history.length === 1 ? 400 : (idx / (history.length - 1)) * 740 + 30;
            const y = 150 - ((val - minElo) / range) * 110;
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="5" fill="#8b5cf6" stroke="#0d111a" strokeWidth="2"/>
                <text x={x} y={y - 9} textAnchor="middle" fill="#a79bff" fontSize="10" fontWeight="bold">
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  </div>;
}

function SettingsView() {
  const currentUser = getUser() || { name: "", email: "", college: "", department: "", year: "2028" };
  const initialSettings = getSettings();

  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    college: currentUser.college || "",
    department: currentUser.department || "",
    year: currentUser.year || "2028",
  });
  const [prefForm, setPrefForm] = useState(initialSettings);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(initialSettings.appTheme || "dark-arena");

  // Apply saved theme on mount
  useEffect(() => { applyTheme(initialSettings.appTheme || "dark-arena"); }, []);

  const handleThemeSelect = useCallback((themeId) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  }, []);

  function saveThemeSubmit(e) {
    e.preventDefault();
    const updated = { ...prefForm, appTheme: selectedTheme };
    setPrefForm(updated);
    saveSettings(updated);
    setSavedMessage("Theme saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  const handleProfileChange = e => setProfileForm(v => ({ ...v, [e.target.name]: e.target.value }));
  const handlePrefChange = (key, val) => setPrefForm(v => ({ ...v, [key]: val }));

  async function saveProfileSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = { ...currentUser, ...profileForm };
      saveUser(updatedUser);

      const token = localStorage.getItem("campusDuelToken");
      const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (token) {
        await fetch(`${api}/users/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(profileForm)
        }).catch(() => {});
      }

      setSavedMessage("Profile updated successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch {
      setSavedMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  function savePrefSubmit(e) {
    e.preventDefault();
    saveSettings(prefForm);
    setSavedMessage("Preferences saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  function savePasswordSubmit(e) {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      setSavedMessage("Error: New passwords do not match.");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setSavedMessage("Error: Password must be at least 6 characters.");
      return;
    }
    setSavedMessage("Password updated successfully!");
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setSavedMessage(""), 3000);
  }

  return (
    <div className="page settings-page">
      <section className="section-head">
        <div>
          <span className="eyebrow">ACCOUNT & PREFERENCES</span>
          <h1>Settings</h1>
          <p>Customize your profile details, editor behavior, and arena preferences.</p>
        </div>
        {savedMessage && (
          <div className="toast-notification">
            <CheckCircle2 size={16} /> {savedMessage}
          </div>
        )}
      </section>

      <div className="settings-layout">
        <div className="settings-nav">
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
            <Users size={16}/> Profile Info
          </button>
          <button className={activeTab === "appearance" ? "active" : ""} onClick={() => setActiveTab("appearance")}>
            <Palette size={16}/> Appearance
          </button>
          <button className={activeTab === "editor" ? "active" : ""} onClick={() => setActiveTab("editor")}>
            <Code2 size={16}/> Editor & Code
          </button>
          <button className={activeTab === "arena" ? "active" : ""} onClick={() => setActiveTab("arena")}>
            <Swords size={16}/> Arena & Audio
          </button>
          <button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>
            <Lock size={16}/> Security
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "appearance" && (
            <form onSubmit={saveThemeSubmit} className="panel settings-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">APP THEME</span>
                  <h3>Appearance</h3>
                </div>
                <Palette size={20}/>
              </div>
              <p className="settings-desc">Choose a visual theme for the entire Campus Duel interface. Changes apply instantly.</p>

              <div className="theme-grid">
                {APP_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-card ${selectedTheme === theme.id ? "selected" : ""}`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <div className="theme-preview">
                      {theme.preview.map((color, i) => (
                        <div key={i} className="theme-swatch" style={{ background: color }} />
                      ))}
                    </div>
                    <div className="theme-info">
                      <b>{theme.name}</b>
                      <small>{theme.description}</small>
                    </div>
                    {selectedTheme === theme.id && (
                      <span className="theme-check"><Check size={13}/></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="settings-actions">
                <button type="submit" className="primary-btn">
                  <Save size={15}/> Save Theme
                </button>
              </div>
            </form>
          )}
          {activeTab === "profile" && (
            <form onSubmit={saveProfileSubmit} className="panel settings-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">PERSONAL INFORMATION</span>
                  <h3>Profile Details</h3>
                </div>
                <Users size={20}/>
              </div>
              <p className="settings-desc">Update how your duelist identity appears to opponent players and global leaderboards.</p>

              <div className="settings-grid">
                <label>
                  Full Name
                  <input name="name" value={profileForm.name} onChange={handleProfileChange} placeholder="Your full name" required/>
                </label>
                <label>
                  Email Address
                  <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} placeholder="you@example.com" required/>
                </label>
                <label>
                  College / University
                  <input name="college" value={profileForm.college} onChange={handleProfileChange} placeholder="e.g. PSG College of Technology"/>
                </label>
                <label>
                  Department
                  <input name="department" value={profileForm.department} onChange={handleProfileChange} placeholder="e.g. CSE / IT"/>
                </label>
                <label>
                  Graduation Year
                  <select name="year" value={profileForm.year} onChange={handleProfileChange}>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </label>
              </div>

              <div className="settings-actions">
                <button type="submit" className="primary-btn" disabled={loading}>
                  <Save size={15}/> {loading ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "editor" && (
            <form onSubmit={savePrefSubmit} className="panel settings-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">MONACO ENVIRONMENT</span>
                  <h3>Editor Preferences</h3>
                </div>
                <Code2 size={20}/>
              </div>
              <p className="settings-desc">Configure your coding environment defaults for live duels.</p>

              <div className="settings-grid">
                <label>
                  Default Language
                  <select value={prefForm.defaultLanguage} onChange={e => handlePrefChange("defaultLanguage", e.target.value)}>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </label>
                <label>
                  Editor Theme
                  <select value={prefForm.editorTheme} onChange={e => handlePrefChange("editorTheme", e.target.value)}>
                    <option value="vs-dark">VS Dark (Default)</option>
                    <option value="light">Light Mode</option>
                  </select>
                </label>
                <label>
                  Font Size ({prefForm.fontSize}px)
                  <input type="range" min="12" max="20" value={prefForm.fontSize} onChange={e => handlePrefChange("fontSize", Number(e.target.value))}/>
                </label>
                <label>
                  Tab Size
                  <select value={prefForm.tabSize} onChange={e => handlePrefChange("tabSize", Number(e.target.value))}>
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                  </select>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <b>Minimap</b>
                  <small>Show mini code preview scrollbar</small>
                </div>
                <input type="checkbox" checked={prefForm.minimap} onChange={e => handlePrefChange("minimap", e.target.checked)}/>
              </div>

              <div className="settings-actions">
                <button type="submit" className="primary-btn">
                  <Save size={15}/> Save Editor Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === "arena" && (
            <form onSubmit={savePrefSubmit} className="panel settings-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">MATCHMAKING & AUDIO</span>
                  <h3>Arena Preferences</h3>
                </div>
                <Swords size={20}/>
              </div>
              <p className="settings-desc">Manage match difficulty defaults and sound feedback during live battles.</p>

              <div className="settings-grid">
                <label>
                  Default Duel Difficulty
                  <select value={prefForm.defaultDifficulty} onChange={e => handlePrefChange("defaultDifficulty", e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <b>Sound Effects</b>
                  <small>Play audio cues on test pass, submit & attacks</small>
                </div>
                <input type="checkbox" checked={prefForm.soundEffects} onChange={e => handlePrefChange("soundEffects", e.target.checked)}/>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <b>Duel Notifications</b>
                  <small>Receive popups when challenged by other students</small>
                </div>
                <input type="checkbox" checked={prefForm.notifications} onChange={e => handlePrefChange("notifications", e.target.checked)}/>
              </div>

              <div className="settings-actions">
                <button type="submit" className="primary-btn">
                  <Save size={15}/> Save Arena Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={savePasswordSubmit} className="panel settings-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">ACCOUNT PROTECTION</span>
                  <h3>Password & Security</h3>
                </div>
                <Lock size={20}/>
              </div>
              <p className="settings-desc">Change your password and manage session authorization.</p>

              <div className="settings-grid">
                <label>
                  Current Password
                  <input type="password" value={passwordForm.current} onChange={e => setPasswordForm(v => ({ ...v, current: e.target.value }))} placeholder="••••••••" required/>
                </label>
                <label>
                  New Password
                  <input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm(v => ({ ...v, newPass: e.target.value }))} placeholder="••••••••" required/>
                </label>
                <label>
                  Confirm New Password
                  <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(v => ({ ...v, confirm: e.target.value }))} placeholder="••••••••" required/>
                </label>
              </div>

              <div className="settings-actions">
                <button type="submit" className="primary-btn">
                  <Lock size={15}/> Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}



function FacultyView() {
  const nav = useNavigate();
  const currentUser = getUser() || {};
  const [activeTab, setActiveTab] = useState("rooms"); // 'rooms' | 'create' | 'fixtures'

  // Room Creation Form State
  const [roomName, setRoomName] = useState("CSE-3A Data Structures Battle");
  const [customJoinCode, setCustomJoinCode] = useState(() => "FAC-" + Math.floor(1000 + Math.random() * 9000));
  const [problemSource, setProblemSource] = useState("app"); // 'app' | 'custom'
  const [selectedAppProblem, setSelectedAppProblem] = useState("Two Sum");

  // Custom Question Form State
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState("Arrays & Hashing");
  const [customDifficulty, setCustomDifficulty] = useState("Medium");
  const [customDescription, setCustomDescription] = useState("");
  const [customExample, setCustomExample] = useState("");
  const [customConstraints, setCustomConstraints] = useState("1 <= nums.length <= 10^5");
  const [customJsCode, setCustomJsCode] = useState(`function solution(input) {\n  // Write your custom problem solution\n  return input;\n}`);
  const [customPyCode, setCustomPyCode] = useState(`def solution(input):\n    # Write your custom problem solution\n    return input`);
  const [customTestInput, setCustomTestInput] = useState("[2, 7, 11, 15], 9");
  const [customTestOutput, setCustomTestOutput] = useState("[0, 1]");

  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomSuccessMsg, setRoomSuccessMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  // Rooms List
  const [activeRooms, setActiveRooms] = useState([
    {
      _id: "fac-rm-1",
      code: "FAC-8042",
      joinCode: "FAC-8042",
      roomName: "CSE Data Structures Tournament",
      hostName: currentUser.name || "Prof. Sharma",
      problemSource: "app",
      problemId: "Two Sum",
      connectedCount: 48,
      status: "waiting",
      createdAt: new Date().toISOString()
    }
  ]);

  const [selectedRoom, setSelectedRoom] = useState(activeRooms[0]);
  const [fixtureMethod, setFixtureMethod] = useState("consecutive");
  const [fixtures, setFixtures] = useState([]);
  const [matchFilter, setMatchFilter] = useState("all");

  const generateMembers = (count = 48) => {
    const sampleNames = [
      "Alex Kumar", "Priya Sharma", "Rahul Menon", "Kavitha Raj", "Dinesh K",
      "Ananya Roy", "Sanjay Patel", "Meera Nair", "Vikram Singh", "Sneha Das",
      "Karthik S", "Divya Pillai", "Arjun Varma", "Ritu Sethi", "Harish G",
      "Pooja Rao", "Aakash Raman", "Deepa Mohan", "Manoj V", "Shreya Sen",
      "Naveen Paul", "Swathi Iyer", "Ganesh M", "Bhavya Reddy", "Vijay Anand",
      "Keerthi S", "Siddharth Jain", "Lavanya N", "Pradeep K", "Rashmi Bhat",
      "Varun Hegde", "Nandini R", "Ashwin Roy", "Geetha M", "Suresh Babu",
      "Gayathri V", "Surya Prakash", "Monika C", "Vignesh E", "Roshni M",
      "Balaji R", "Pavithra T", "Mohan Raj", "Aishwarya S", "Deepak N",
      "Sandhya V", "Gautam K", "Malini P", "Karan Das", "Tanvi Joshi"
    ];
    return Array.from({ length: count }, (_, i) => ({
      loginNum: i + 1,
      id: `std-${i + 1}`,
      name: sampleNames[i % sampleNames.length],
      college: currentUser.college || "Campus Engineering College",
      department: currentUser.department || "CSE",
      status: "Ready in Room"
    }));
  };

  const [members, setMembers] = useState(() => generateMembers(48));

  // Fetch rooms on mount
  useEffect(() => {
    const token = localStorage.getItem("campusDuelToken");
    const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${api}/rooms`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.rooms) && data.rooms.length > 0) {
          const loaded = data.rooms.map(r => ({
            _id: r._id,
            code: r.code || r.joinCode,
            joinCode: r.joinCode || r.code,
            roomName: r.roomName || "Faculty Classroom Arena",
            hostName: r.host?.name || currentUser.name || "Faculty",
            problemSource: r.problemSource || "app",
            problemId: r.problemId || "Two Sum",
            customProblem: r.customProblem,
            connectedCount: r.connectedStudents?.length || 48,
            status: r.status || "waiting",
            createdAt: r.createdAt
          }));
          setActiveRooms(loaded);
          setSelectedRoom(loaded[0]);
        }
      })
      .catch(() => {});
  }, [currentUser.name]);

  function copyCodeToClipboard(codeStr) {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  // Handle Room Creation Submit
  async function handleCreateRoom(e) {
    e.preventDefault();
    setCreatingRoom(true);
    setRoomSuccessMsg("");

    const code = customJoinCode.trim().toUpperCase() || ("FAC-" + Math.floor(1000 + Math.random() * 9000));
    
    const roomPayload = {
      roomName: roomName.trim() || "Faculty Classroom Arena",
      joinCode: code,
      problemSource,
      problemId: problemSource === "app" ? selectedAppProblem : (customTitle || "Custom Problem"),
      customProblem: problemSource === "custom" ? {
        title: customTitle || "Faculty Custom Challenge",
        category: customCategory,
        difficulty: customDifficulty,
        description: customDescription || "Custom coding challenge created by instructor.",
        example: customExample || "Sample input & output provided.",
        constraints: customConstraints.split("\n").filter(Boolean),
        starters: {
          javascript: customJsCode,
          python: customPyCode
        },
        testCases: [{ input: customTestInput, output: customTestOutput }]
      } : null
    };

    const token = localStorage.getItem("campusDuelToken");
    const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    try {
      const res = await fetch(`${api}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(roomPayload)
      });
      const data = await res.json().catch(() => ({}));

      const newRoom = {
        _id: data.room?._id || `room-${Date.now()}`,
        code: code,
        joinCode: code,
        roomName: roomPayload.roomName,
        hostName: currentUser.name || "Faculty",
        problemSource,
        problemId: roomPayload.problemId,
        customProblem: roomPayload.customProblem,
        connectedCount: 48,
        status: "waiting",
        createdAt: new Date().toISOString()
      };

      setActiveRooms(prev => [newRoom, ...prev]);
      setSelectedRoom(newRoom);
      setRoomSuccessMsg(`Room "${newRoom.roomName}" published! Join Code: ${code}`);
      setCustomJoinCode("FAC-" + Math.floor(1000 + Math.random() * 9000));
      setTimeout(() => {
        setRoomSuccessMsg("");
        setActiveTab("rooms");
      }, 1800);
    } catch {
      const fallbackRoom = {
        _id: `room-${Date.now()}`,
        code: code,
        joinCode: code,
        roomName: roomPayload.roomName,
        hostName: currentUser.name || "Faculty",
        problemSource,
        problemId: roomPayload.problemId,
        customProblem: roomPayload.customProblem,
        connectedCount: 48,
        status: "waiting",
        createdAt: new Date().toISOString()
      };
      setActiveRooms(prev => [fallbackRoom, ...prev]);
      setSelectedRoom(fallbackRoom);
      setRoomSuccessMsg(`Room "${fallbackRoom.roomName}" created! Join Code: ${code}`);
      setTimeout(() => {
        setRoomSuccessMsg("");
        setActiveTab("rooms");
      }, 1800);
    } finally {
      setCreatingRoom(false);
    }
  }

  function handleSetMemberCount(count) {
    setMembers(generateMembers(count));
    setFixtures([]);
  }

  function generateMatchFixtures() {
    const n = members.length;
    if (n < 2) {
      alert("At least 2 members are needed to generate match fixtures.");
      return;
    }

    const newFixtures = [];
    const baseCode = selectedRoom?.joinCode || "FAC-8042";

    if (fixtureMethod === "consecutive") {
      for (let i = 0; i < n; i += 2) {
        const p1 = members[i];
        const p2 = i + 1 < n ? members[i + 1] : { loginNum: "-", name: "BYE (Auto-Pass)", status: "Pass" };
        newFixtures.push({
          matchId: Math.floor(i / 2) + 1,
          roomCode: `${baseCode}-M${Math.floor(i / 2) + 1}`,
          player1: p1,
          player2: p2,
          p1Tests: Math.floor(Math.random() * 3) + 2,
          p2Tests: Math.floor(Math.random() * 3) + 1,
          totalTests: 5,
          status: p2.name.includes("BYE") ? "Completed" : "Active",
          winner: p2.name.includes("BYE") ? p1.name : null,
          timeElapsed: "04:12"
        });
      }
    } else if (fixtureMethod === "crossHalf") {
      const half = Math.ceil(n / 2);
      for (let i = 0; i < half; i++) {
        const p1 = members[i];
        const p2 = (i + half < n) ? members[i + half] : { loginNum: "-", name: "BYE (Auto-Pass)", status: "Pass" };
        newFixtures.push({
          matchId: i + 1,
          roomCode: `${baseCode}-M${i + 1}`,
          player1: p1,
          player2: p2,
          p1Tests: Math.floor(Math.random() * 3) + 2,
          p2Tests: Math.floor(Math.random() * 3) + 1,
          totalTests: 5,
          status: p2.name.includes("BYE") ? "Completed" : "Active",
          winner: p2.name.includes("BYE") ? p1.name : null,
          timeElapsed: "03:45"
        });
      }
    } else if (fixtureMethod === "fold") {
      const half = Math.ceil(n / 2);
      for (let i = 0; i < half; i++) {
        const p1 = members[i];
        const p2 = (n - 1 - i > i) ? members[n - 1 - i] : { loginNum: "-", name: "BYE (Auto-Pass)", status: "Pass" };
        newFixtures.push({
          matchId: i + 1,
          roomCode: `${baseCode}-M${i + 1}`,
          player1: p1,
          player2: p2,
          p1Tests: Math.floor(Math.random() * 3) + 2,
          p2Tests: Math.floor(Math.random() * 3) + 1,
          totalTests: 5,
          status: p2.name.includes("BYE") ? "Completed" : "Active",
          winner: p2.name.includes("BYE") ? p1.name : null,
          timeElapsed: "02:50"
        });
      }
    }

    setFixtures(newFixtures);
    setActiveTab("fixtures");
  }

  function handleSetWinner(matchId, winnerName) {
    setFixtures(prev => prev.map(f => f.matchId === matchId ? { ...f, winner: winnerName, status: "Completed" } : f));
  }

  const filteredFixtures = matchFilter === "all" ? fixtures : fixtures.filter(f => f.status.toLowerCase() === matchFilter.toLowerCase());

  return (
    <div className="page">
      {/* Faculty Hero Banner */}
      <section className="role-hero faculty">
        <div>
          <span className="eyebrow" style={{ color: "#38bdf8" }}>
            <GraduationCap size={15}/> FACULTY COMMAND CENTER
          </span>
          <h1>Classroom Room & Question Manager</h1>
          <p>Create custom battle rooms with unique Join Codes, select application questions or set custom problems, and supervise cohort duels.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button className="primary-btn" onClick={() => setActiveTab("create")} style={{ padding: "10px 18px", borderRadius: "8px" }}>
            ➕ Create New Room
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className={`primary-btn ${activeTab === "rooms" ? "" : "outline"}`}
            onClick={() => setActiveTab("rooms")}
            style={{ padding: "8px 18px", borderRadius: "8px" }}
          >
            <Users size={16}/> Active Rooms ({activeRooms.length})
          </button>
          <button
            className={`primary-btn ${activeTab === "create" ? "" : "outline"}`}
            onClick={() => setActiveTab("create")}
            style={{ padding: "8px 18px", borderRadius: "8px" }}
          >
            ➕ Create Room & Set Question
          </button>
          <button
            className={`primary-btn ${activeTab === "fixtures" ? "" : "outline"}`}
            onClick={() => {
              if (fixtures.length === 0) generateMatchFixtures();
              else setActiveTab("fixtures");
            }}
            style={{ padding: "8px 18px", borderRadius: "8px" }}
          >
            <Swords size={16}/> Match Fixtures ({fixtures.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE ROOMS & JOIN CODES */}
      {activeTab === "rooms" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px", marginBottom: "24px" }}>
            {activeRooms.map(room => (
              <div
                key={room._id || room.joinCode}
                className="panel"
                style={{
                  border: selectedRoom?.joinCode === room.joinCode ? "2px solid var(--accent)" : "1px solid var(--line)",
                  background: "var(--panel)",
                  padding: "18px",
                  borderRadius: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <span className="eyebrow" style={{ color: "var(--cyan)" }}>FACULTY ROOM</span>
                    <h3 style={{ margin: "2px 0 4px" }}>{room.roomName}</h3>
                    <small style={{ color: "var(--muted)" }}>Host: {room.hostName}</small>
                  </div>
                  <span className={`admin-status-badge ${room.status}`}>
                    {room.status}
                  </span>
                </div>

                {/* JOIN CODE DISPLAY BOX */}
                <div
                  style={{
                    background: "var(--panel2)",
                    border: "1px dashed var(--cyan)",
                    padding: "12px",
                    borderRadius: "10px",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    marginBottom: "14px"
                  }}
                >
                  <div>
                    <small style={{ color: "var(--muted)", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                      STUDENT JOIN CODE
                    </small>
                    <b style={{ color: "var(--yellow)", fontSize: "1.4rem", letterSpacing: "0.08em" }}>
                      {room.joinCode}
                    </b>
                  </div>
                  <button
                    className="ghost-btn small"
                    onClick={() => copyCodeToClipboard(room.joinCode)}
                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  >
                    {copiedCode === room.joinCode ? "Copied! ✓" : "Copy Code"}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "14px" }}>
                  <span>Question: <b style={{ color: "var(--text)" }}>{room.problemId}</b></span>
                  <span>Type: <b style={{ color: "var(--accent)" }}>{room.problemSource === "custom" ? "Custom Question" : "App Bank"}</b></span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="primary-btn small"
                    onClick={() => {
                      setSelectedRoom(room);
                      generateMatchFixtures();
                    }}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px" }}
                  >
                    <Swords size={14} style={{ marginRight: "4px" }}/> Launch Match Fixtures
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Connected Roster */}
          <section className="panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">SELECTED ROOM: {selectedRoom?.joinCode}</span>
                <h3>Connected Students Roster ({members.length})</h3>
              </div>
              <small style={{ color: "var(--green)", fontWeight: "600" }}>● All {members.length} Ready</small>
            </div>
            <div className="lobby-member-grid">
              {members.map(m => (
                <div className="lobby-member-pill" key={m.id}>
                  <span className="login-num-chip">#{m.loginNum}</span>
                  <div style={{ overflow: "hidden" }}>
                    <b style={{ display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{m.name}</b>
                    <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>Login #{m.loginNum}</small>
                  </div>
                  <span style={{ marginLeft: "auto", color: "var(--green)", fontSize: "0.75rem" }}>●</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* TAB 2: CREATE ROOM & SET QUESTION */}
      {activeTab === "create" && (
        <section className="panel" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="panel-title">
            <div>
              <span className="eyebrow">FACULTY ROOM BUILDER</span>
              <h3>Create Room & Set Challenge Question</h3>
            </div>
            <GraduationCap size={22} color="var(--accent)"/>
          </div>

          {roomSuccessMsg && (
            <div className="toast-notification" style={{ marginBottom: "16px", background: "rgba(56, 217, 150, 0.15)", borderColor: "var(--green)" }}>
              <CheckCircle2 size={16} /> {roomSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateRoom}>
            <div className="settings-grid" style={{ marginBottom: "18px" }}>
              <label>
                Room Name / Course Code
                <input
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="e.g. CSE-3A Data Structures Battle"
                  required
                />
              </label>

              <label>
                Custom Room Join Code (Auto-Generated)
                <input
                  value={customJoinCode}
                  onChange={e => setCustomJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FAC-8042"
                  style={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}
                  required
                />
              </label>
            </div>

            {/* QUESTION SOURCE SELECTION TOGGLE */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.85rem", color: "var(--muted)" }}>
                CHALLENGE QUESTION SOURCE
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className={`primary-btn ${problemSource === "app" ? "" : "outline"}`}
                  onClick={() => setProblemSource("app")}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px" }}
                >
                  📚 Use Application Question Bank
                </button>
                <button
                  type="button"
                  className={`primary-btn ${problemSource === "custom" ? "" : "outline"}`}
                  onClick={() => setProblemSource("custom")}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px" }}
                >
                  ✍️ Set Custom Question
                </button>
              </div>
            </div>

            {/* OPTION A: APPLICATION QUESTION BANK */}
            {problemSource === "app" && (
              <div className="panel" style={{ background: "var(--panel2)", marginBottom: "20px", border: "1px solid var(--line)" }}>
                <h4 style={{ margin: "0 0 10px" }}>Select Question from Application Bank</h4>
                <label>
                  Choose Problem
                  <select value={selectedAppProblem} onChange={e => setSelectedAppProblem(e.target.value)} style={{ marginTop: "6px" }}>
                    <option value="Two Sum">Two Sum (Arrays & Hashing · Medium)</option>
                    <option value="Valid Palindrome">Valid Palindrome (Strings · Easy)</option>
                    <option value="Reverse Linked List">Reverse Linked List (Pointers · Medium)</option>
                    <option value="Subarray Sum Equals K">Subarray Sum Equals K (Hash Maps · Hard)</option>
                    <option value="Fix the Palindrome Bug">Fix the Palindrome Bug (Bug Battle · Medium)</option>
                    <option value="Reverse String Sprint">Reverse String Sprint (Speed Coding · Easy)</option>
                    <option value="Sum of Digits">Sum of Digits (Code Golf · Medium)</option>
                  </select>
                </label>
              </div>
            )}

            {/* OPTION B: SET CUSTOM QUESTION */}
            {problemSource === "custom" && (
              <div className="panel" style={{ background: "var(--panel2)", marginBottom: "20px", border: "1px dashed var(--accent)" }}>
                <h4 style={{ margin: "0 0 12px", color: "var(--accent)" }}>✍️ Custom Question Builder</h4>
                
                <div className="settings-grid" style={{ marginBottom: "14px" }}>
                  <label>
                    Problem Title
                    <input
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      placeholder="e.g. Find Saddle Point in Matrix"
                      required={problemSource === "custom"}
                    />
                  </label>

                  <label>
                    Category & Difficulty
                    <div style={{ display: "flex", gap: "8px" }}>
                      <select value={customCategory} onChange={e => setCustomCategory(e.target.value)} style={{ flex: 1 }}>
                        <option value="Arrays & Hashing">Arrays</option>
                        <option value="Strings">Strings</option>
                        <option value="Algorithms">Algorithms</option>
                        <option value="Dynamic Programming">DP</option>
                        <option value="Debugging">Debugging</option>
                      </select>
                      <select value={customDifficulty} onChange={e => setCustomDifficulty(e.target.value)} style={{ width: "110px" }}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </label>
                </div>

                <label style={{ display: "block", marginBottom: "12px" }}>
                  Problem Description / Requirements
                  <textarea
                    value={customDescription}
                    onChange={e => setCustomDescription(e.target.value)}
                    placeholder="Describe problem details, inputs, outputs, and expected behavior..."
                    rows={3}
                    style={{ width: "100%", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--line)", padding: "10px", borderRadius: "8px" }}
                  />
                </label>

                <div className="settings-grid" style={{ marginBottom: "14px" }}>
                  <label>
                    Sample Example (Input & Output)
                    <input
                      value={customExample}
                      onChange={e => setCustomExample(e.target.value)}
                      placeholder="Input: [1,2,3] | Output: 6"
                    />
                  </label>
                  <label>
                    Constraints
                    <input
                      value={customConstraints}
                      onChange={e => setCustomConstraints(e.target.value)}
                      placeholder="1 <= N <= 10^5"
                    />
                  </label>
                </div>

                <label style={{ display: "block", marginBottom: "12px" }}>
                  Starter Code (JavaScript Template)
                  <textarea
                    value={customJsCode}
                    onChange={e => setCustomJsCode(e.target.value)}
                    rows={3}
                    style={{ width: "100%", background: "var(--bg)", color: "var(--cyan)", fontFamily: "monospace", border: "1px solid var(--line)", padding: "10px", borderRadius: "8px" }}
                  />
                </label>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
              <button className="primary-btn big" type="submit" disabled={creatingRoom}>
                <Save size={16}/> {creatingRoom ? "Publishing..." : "Create Room & Publish Join Code"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 3: LIVE MATCH FIXTURES BOARD */}
      {activeTab === "fixtures" && (
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">TOURNAMENT BOARD</span>
              <h3>Classroom Match Fixtures ({fixtures.length} Simultaneous Duels)</h3>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className={`ghost-btn ${matchFilter === "all" ? "active" : ""}`} onClick={() => setMatchFilter("all")}>All ({fixtures.length})</button>
              <button className={`ghost-btn ${matchFilter === "active" ? "active" : ""}`} onClick={() => setMatchFilter("active")}>Active ({fixtures.filter(f => f.status === "Active").length})</button>
              <button className={`ghost-btn ${matchFilter === "completed" ? "active" : ""}`} onClick={() => setMatchFilter("completed")}>Completed ({fixtures.filter(f => f.status === "Completed").length})</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel2)", padding: "10px 14px", borderRadius: "8px", margin: "12px 0 16px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Room: <b style={{ color: "var(--yellow)" }}>{selectedRoom?.joinCode}</b> · Question: <b style={{ color: "var(--text)" }}>{selectedRoom?.problemId}</b>
            </span>
            <button className="ghost-btn small" onClick={() => generateMatchFixtures()}>
              <RotateCw size={14} style={{ marginRight: "4px" }}/> Re-Roll Fixtures
            </button>
          </div>

          <div className="fixtures-grid">
            {filteredFixtures.map(f => (
              <div className="fixture-card" key={f.matchId}>
                <div className="fixture-header">
                  <span style={{ fontWeight: "700", color: "#a78bfa" }}>FIXTURE #{f.matchId}</span>
                  <code style={{ background: "var(--panel2)", padding: "2px 6px", borderRadius: "4px", color: "var(--yellow)", fontSize: "0.75rem" }}>
                    {f.roomCode}
                  </code>
                  <span className={`admin-status-badge ${f.status.toLowerCase()}`}>
                    {f.status}
                  </span>
                </div>

                <div className="fixture-duelists">
                  <div className="fixture-duelist-slot">
                    <span className="login-num-chip">#{f.player1.loginNum}</span>
                    <div>
                      <b style={{ fontSize: "0.9rem", color: f.winner === f.player1.name ? "var(--green)" : "var(--text)" }}>
                        {f.player1.name}
                      </b>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: "0.7rem" }}>
                        Passed {f.p1Tests}/{f.totalTests} tests
                      </small>
                    </div>
                  </div>

                  <span className="fixture-vs">VS</span>

                  <div className="fixture-duelist-slot p2">
                    <span className="login-num-chip">#{f.player2.loginNum}</span>
                    <div>
                      <b style={{ fontSize: "0.9rem", color: f.winner === f.player2.name ? "var(--green)" : "var(--text)" }}>
                        {f.player2.name}
                      </b>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: "0.7rem" }}>
                        Passed {f.p2Tests}/{f.totalTests} tests
                      </small>
                    </div>
                  </div>
                </div>

                <div className="bar" style={{ height: "4px", margin: "4px 0" }}>
                  <i style={{ width: `${(f.p1Tests / f.totalTests) * 100}%`, background: f.status === "Completed" ? "var(--green)" : "var(--cyan)" }} />
                </div>

                <div className="fixture-footer">
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                    {f.winner ? `🏆 Winner: ${f.winner}` : `⏱ Elapsed: ${f.timeElapsed}`}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="primary-btn small"
                      onClick={() => nav(`/arena?room=${f.roomCode}`)}
                      style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                    >
                      <Eye size={12} style={{ marginRight: "3px" }}/> Spectate
                    </button>
                    {!f.winner && (
                      <button
                        className="ghost-btn small"
                        onClick={() => handleSetWinner(f.matchId, f.player1.name)}
                        style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                      >
                        P1 Win
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RoleDashboardDispatcher() {
  const user = getUser();
  if (!user) return <Navigate to="/auth" replace />;

  switch (user.role) {
    case "faculty":
      return <FacultyView />;
    case "setter":
      return <ProblemStudioView />;
    case "moderator":
      return <RefereeView />;
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "student":
    default:
      return <Dashboard />;
  }
}

function ProblemStudioView() {
  const [form, setForm] = useState({
    title: "",
    category: "Arrays",
    difficulty: "Medium",
    timeLimit: "2.0s",
    description: "",
    starterJs: "function solve(nums) {\n  // Write solution\n}",
    sampleInput: "[2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]"
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    if (!form.title) {
      alert("Please provide a problem title.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  }

  return (
    <div className="page">
      <section className="role-hero setter">
        <div>
          <span className="eyebrow" style={{ color: "#a78bfa" }}><Code2 size={15}/> PROBLEM SETTER STUDIO</span>
          <h1>Author & Curate Arena Challenges</h1>
          <p>Create competitive coding challenges, formulate bug scenarios, and configure starter code templates.</p>
        </div>
      </section>

      {saved && (
        <div className="panel" style={{ marginBottom: "20px", borderLeft: "4px solid #a78bfa", background: "rgba(167, 139, 250, 0.1)" }}>
          <b style={{ color: "#a78bfa" }}>✓ Problem Successfully Submitted to Arena Question Bank!</b>
          <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>The problem "{form.title}" is now queued for tournament and duel rotation.</p>
        </div>
      )}

      <form onSubmit={handleSave} className="panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">CHALLENGE METADATA</span>
            <h3>Problem Specification</h3>
          </div>
          <button type="submit" className="primary-btn">
            <Save size={15}/> Save & Publish Problem
          </button>
        </div>

        <div className="role-grid-3" style={{ marginBottom: "16px" }}>
          <div className="role-form-group">
            <label>Problem Title</label>
            <input
              placeholder="e.g. Subarray Sum Equals K"
              value={form.title}
              onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
            />
          </div>
          <div className="role-form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="role-form-group">
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm(v => ({ ...v, difficulty: e.target.value }))}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="role-form-group">
          <label>Problem Description & Constraints</label>
          <textarea
            rows={4}
            placeholder="Describe the problem, input format, constraints, and edge cases..."
            value={form.description}
            onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
          />
        </div>

        <div className="two-col" style={{ marginTop: "14px" }}>
          <div className="role-form-group">
            <label>Sample Input</label>
            <textarea
              rows={3}
              placeholder="e.g. nums = [1,1,1], k = 2"
              value={form.sampleInput}
              onChange={e => setForm(v => ({ ...v, sampleInput: e.target.value }))}
            />
          </div>
          <div className="role-form-group">
            <label>Sample Output</label>
            <textarea
              rows={3}
              placeholder="e.g. 2"
              value={form.sampleOutput}
              onChange={e => setForm(v => ({ ...v, sampleOutput: e.target.value }))}
            />
          </div>
        </div>

        <div className="role-form-group" style={{ marginTop: "14px" }}>
          <label>Starter Code Template (JavaScript)</label>
          <textarea
            rows={4}
            value={form.starterJs}
            onChange={e => setForm(v => ({ ...v, starterJs: e.target.value }))}
            style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
          />
        </div>
      </form>
    </div>
  );
}

function RefereeView() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("campusDuelToken") || localStorage.getItem("campusDuelAdminToken");
    const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${api}/rooms`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setRooms(data.rooms || []);
      })
      .catch(() => {
        setRooms([
          { _id: "1", code: "DUEL99", host: { name: "Alex Kumar", elo: 1397 }, opponent: { name: "Priya S", elo: 1364 }, status: "active", problemId: "Two Sum" },
          { _id: "2", code: "ARENA7", host: { name: "Hari Shankar", elo: 1428 }, opponent: null, status: "waiting", problemId: "Reverse Linked List" },
          { _id: "3", code: "SPEED4", host: { name: "Rahul M", elo: 1321 }, opponent: { name: "Dinesh K", elo: 1245 }, status: "active", problemId: "Valid Parentheses" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? rooms : rooms.filter(r => r.status === filter);

  return (
    <div className="page">
      <section className="role-hero referee">
        <div>
          <span className="eyebrow" style={{ color: "#38d996" }}><Shield size={15}/> MATCH REFEREE & MODERATOR CONSOLE</span>
          <h1>Live Arena Supervision</h1>
          <p>Inspect active 1v1 battle rooms, monitor fair-play compliance, and supervise live duels.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className={`ghost-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`ghost-btn ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>Active</button>
          <button className={`ghost-btn ${filter === "waiting" ? "active" : ""}`} onClick={() => setFilter("waiting")}>Waiting</button>
        </div>
      </section>

      <div className="stat-grid">
        <Stat icon={<Activity/>} label="Active Battles" value={rooms.filter(r => r.status === "active").length} meta="In-flight duels" />
        <Stat icon={<Clock3/>} label="Waiting Matchups" value={rooms.filter(r => r.status === "waiting").length} meta="Seeking opponent" />
        <Stat icon={<Shield/>} label="Referee Status" value="Online" meta="Fair-play sentinel active" />
      </div>

      <section className="panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">LIVE ROOMS</span>
            <h3>Arena Match Monitor</h3>
          </div>
          <Radio size={16} color="var(--green)"/>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>Loading rooms…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>No rooms match the selected filter.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Room Code</th>
                <th>Host Duelist</th>
                <th>Opponent</th>
                <th>Status</th>
                <th>Challenge</th>
                <th>Referee Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id || r.code}>
                  <td>
                    <code style={{ background: "var(--panel2)", padding: "4px 8px", borderRadius: "6px", color: "var(--yellow)", fontWeight: "bold" }}>
                      {r.code}
                    </code>
                  </td>
                  <td>
                    <b>{r.host?.name || "Player 1"}</b>
                    <small className="admin-muted" style={{ display: "block" }}>{r.host?.elo ? `${r.host.elo} ELO` : ""}</small>
                  </td>
                  <td>
                    {r.opponent ? (
                      <>
                        <b>{r.opponent.name}</b>
                        <small className="admin-muted" style={{ display: "block" }}>{r.opponent.elo ? `${r.opponent.elo} ELO` : ""}</small>
                      </>
                    ) : (
                      <span className="admin-muted">Waiting for rival…</span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-status-badge ${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="admin-muted">{r.problemId || "Standard Match"}</td>
                  <td>
                    <button
                      className="primary-btn small"
                      onClick={() => alert(`Spectating Room ${r.code}. Live telemetry connected.`)}
                      style={{ padding: "5px 12px", fontSize: "0.8rem" }}
                    >
                      <Eye size={13} style={{ marginRight: "4px" }}/> Spectate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function App(){
  useEffect(() => {
    applyTheme(getSettings().appTheme || "dark-arena");
  }, []);

  return <Routes>
   {/* Auth redirects to role-specific home */}
   <Route path="/auth" element={getUser() ? <Navigate to={getRoleDashboard(getUser()?.role)} replace /> : <AuthPage/>}/>

   {/* Root "/" dispatches each role to their own dashboard view */}
   <Route path="/" element={<Protected><Shell><RoleDashboardDispatcher/></Shell></Protected>}/>

   {/* Shared pages available to all roles */}
   <Route path="/duel" element={<Protected><Shell><DuelSelection/></Shell></Protected>}/>
   <Route path="/arena" element={<Protected><Shell><Arena/></Shell></Protected>}/>
   <Route path="/leaderboard" element={<Protected><Shell><Leaderboard/></Shell></Protected>}/>
   <Route path="/profile" element={<Protected><Shell><Profile/></Shell></Protected>}/>
   <Route path="/settings" element={<Protected><Shell><SettingsView/></Shell></Protected>}/>

   {/* Role-specific pages (also accessible directly via URL) */}
   <Route path="/faculty" element={<Protected><RoleProtected allowedRoles={["faculty"]}><Shell><FacultyView/></Shell></RoleProtected></Protected>}/>
   <Route path="/studio" element={<Protected><RoleProtected allowedRoles={["setter"]}><Shell><ProblemStudioView/></Shell></RoleProtected></Protected>}/>
   <Route path="/referee" element={<Protected><RoleProtected allowedRoles={["moderator"]}><Shell><RefereeView/></Shell></RoleProtected></Protected>}/>

   {/* Admin */}
   <Route path="/admin" element={<Navigate to="/admin/dashboard" replace/>}/>
   <Route path="/admin/login" element={<Navigate to="/auth" replace/>}/>
   <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard/></AdminProtectedRoute>}/>

   {/* Fallback */}
   <Route path="*" element={<Navigate to={getUser() ? getRoleDashboard(getUser()?.role) : "/auth"} replace/>}/>
 </Routes>;
}
export default App;