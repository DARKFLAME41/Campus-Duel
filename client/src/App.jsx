import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Activity, ArrowLeft, BarChart3, Bell, Bot, Bug, Check, CheckCircle2, ChevronRight,
  Clock3, Code2, Crown, Flame, Gauge, GitCompare, GraduationCap, Home,
  Info, LayoutDashboard, Lock, LogOut, Menu, Palette, Play, Radio, Save, Search, Send, Settings, Shield,
  Swords, Trophy, User, Users, Volume2, X, Zap
} from "lucide-react";
import { achievements, categories, leaderboard, modes, problems } from "./data";
import { socket } from "./socket";

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
    };
  }
}
function saveSettings(settings) {
  localStorage.setItem("campusDuelSettings", JSON.stringify(settings));
}

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", college: "", department: "", year: "2028" });
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
      const user = data.user || data.data?.user || {
        name: form.name || form.email.split("@")[0],
        email: form.email,
        college: form.college || "Not set",
        department: form.department || "Not set",
        year: form.year || "2028",
        elo: 1200,
        rank: null,
        streak: 0,
        solved: 0
      };
      if (data.token) localStorage.setItem("campusDuelToken", data.token);
      if (data.accessToken) localStorage.setItem("campusDuelToken", data.accessToken);
      saveUser(user);
      nav("/");
    } catch (err) {
      if (import.meta.env.VITE_DEMO_AUTH === "true") {
        const user = {
          name: form.name || form.email.split("@")[0],
          email: form.email,
          college: form.college || "Not set",
          department: form.department || "Not set",
          year: form.year || "2028",
          elo: 1200, rank: null, streak: 0, solved: 0
        };
        saveUser(user);
        nav("/");
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
        <p className="auth-muted">{mode==="login"?"Sign in to continue your competitive journey.":"Create a fresh account. Your new profile starts at 1200 ELO."}</p>
        <form onSubmit={submit}>
          {mode==="register" && <><label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name"/></label><div className="auth-two"><label>College<input name="college" value={form.college} onChange={update} placeholder="College"/></label><label>Department<input name="department" value={form.department} onChange={update} placeholder="CSE"/></label></div></>}
          <label>Email<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email"/></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="••••••••" autoComplete={mode==="login"?"current-password":"new-password"}/></label>
          {mode==="register" && <label>Graduation year<select name="year" value={form.year} onChange={update}><option>2027</option><option>2028</option><option>2029</option><option>2030</option></select></label>}
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

function Shell({ children }) {
  const location = useLocation();
  const nav = useNavigate();
  const currentUser = getUser() || { name: "Duelist", elo: 1200 };
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const initials = (currentUser?.name || "DU").slice(0, 2).toUpperCase();

  const links = [
    ["/", "Dashboard", LayoutDashboard],
    ["/duel", "Play Duel", Swords],
    ["/leaderboard", "Leaderboard", Trophy],
    ["/profile", "Profile", Users],
    ...(currentUser?.role === "admin" ? [["/admin", "Admin", Shield]] : []),
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark">⚔</div><div><b>Campus Duel</b><span>CODING ARENA</span></div></div>
      <nav>{links.map(([to, label, Icon]) => <Link key={to} className={location.pathname === to ? "active" : ""} to={to} onClick={() => setOpen(false)}><Icon size={18}/>{label}</Link>)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-player" title="Duelist Profile">
          <div className="avatar">{initials}</div>
          <div><b>{currentUser.name}</b><small>{currentUser.elo || 1200} ELO</small></div>
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
  const modeConfig = modeConfigs[modeKey] || modeConfigs.CODE_DUEL;
  const userSettings = getSettings();

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
      <div className="timer-container">
        <div className="timer"><Clock3 size={17}/><b>{mins}:{secs}</b></div>
        {battleOutcome && (
          <span className={`result ${battleOutcome.status.toLowerCase()}`} style={{ fontSize: "10px", padding: "6px 10px" }}>
            {battleOutcome.status === "WIN"
              ? `🏆 VICTORY (+25 ELO) 🔥 ${battleOutcome.newStreak} streak`
              : `💀 DEFEAT (-15 ELO) — streak reset`}
          </span>
        )}
        {isBattleOver && (
          <button className="exit-battle-btn" onClick={() => nav("/duel")} title="Exit Battle">
            <LogOut size={14} /> Exit
          </button>
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

function Admin(){
 const [published,setPublished]=useState(true);
 return <div className="page"><section className="section-head"><div><span className="eyebrow">🛡 ADMIN CONTROL</span><h1>Problem Studio</h1><p>Create and manage competitive programming content without exposing hidden tests.</p></div><button className="primary-btn"><span>+</span> New Problem</button></section>
 <div className="admin-stats"><Stat icon={<Code2/>} label="Published problems" value="148" meta="+12 this month"/><Stat icon={<Bug/>} label="Bug challenges" value="36" meta="4 drafts"/><Stat icon={<Users/>} label="Active duelists" value="842" meta="Live now"/></div>
 <section className="panel admin-list"><div className="panel-title"><div><span className="eyebrow">PROBLEM BANK</span><h3>Manage challenges</h3></div><div className="search"><Search size={15}/><input placeholder="Search problems"/></div></div>{problems.map((p,i)=><div className="admin-row" key={p.id}><div className="admin-icon">{i===1?"🐞":"💻"}</div><div><b>{p.title}</b><small>{p.category} · {p.tags.join(" · ")}</small></div><span className={`difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span><span className={`status ${published?"published":"draft"}`}>{published?"Published":"Draft"}</span><button className="icon-btn" onClick={()=>setPublished(v=>!v)}><span>•••</span></button></div>)}</section>
 </div>;
}

function App(){
 return <Routes>
   <Route path="/auth" element={getUser() ? <Navigate to="/" replace /> : <AuthPage/>}/>
   <Route path="/" element={<Protected><Shell><Dashboard/></Shell></Protected>}/>
   <Route path="/duel" element={<Protected><Shell><DuelSelection/></Shell></Protected>}/>
   <Route path="/arena" element={<Protected><Shell><Arena/></Shell></Protected>}/>
   <Route path="/leaderboard" element={<Protected><Shell><Leaderboard/></Shell></Protected>}/>
   <Route path="/profile" element={<Protected><Shell><Profile/></Shell></Protected>}/>
   <Route path="/settings" element={<Protected><Shell><SettingsView/></Shell></Protected>}/>
   <Route path="/admin" element={<Protected><AdminProtected><Shell><Admin/></Shell></AdminProtected></Protected>}/>
   <Route path="*" element={<Navigate to={getUser() ? "/" : "/auth"} replace/>}/>
 </Routes>;
}
export default App;