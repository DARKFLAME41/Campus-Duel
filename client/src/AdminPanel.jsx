import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Edit2,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAdminToken() {
  const token = localStorage.getItem("campusDuelAdminToken");
  if (token) return token;
  try {
    const u = JSON.parse(localStorage.getItem("campusDuelUser") || "null");
    if (u?.role === "admin") return localStorage.getItem("campusDuelToken");
  } catch {}
  return null;
}
function saveAdminToken(token) {
  localStorage.setItem("campusDuelAdminToken", token);
}
function clearAdminToken() {
  localStorage.removeItem("campusDuelAdminToken");
}
function getAdminUser() {
  try {
    const au = JSON.parse(localStorage.getItem("campusDuelAdminUser") || "null");
    if (au) return au;
    const u = JSON.parse(localStorage.getItem("campusDuelUser") || "null");
    if (u?.role === "admin") return u;
  } catch {
    return null;
  }
}
function saveAdminUser(user) {
  localStorage.setItem("campusDuelAdminUser", JSON.stringify(user));
}

async function adminFetch(path, opts = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API}/admin${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "var(--accent)" }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ color }}>
        {icon}
      </div>
      <div>
        <div className="admin-stat-value" style={{ color }}>
          {value}
        </div>
        <div className="admin-stat-label">{label}</div>
        {sub && <div className="admin-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "var(--green)",
    error: "var(--red)",
    info: "var(--accent)",
  };

  return (
    <div
      className="admin-toast"
      style={{ borderLeftColor: colors[type] || colors.info }}
    >
      {type === "success" ? (
        <CheckCircle2 size={16} color={colors.success} />
      ) : type === "error" ? (
        <AlertTriangle size={16} color={colors.error} />
      ) : (
        <Activity size={16} color={colors.info} />
      )}
      <span>{msg}</span>
      <button onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}

// ── Edit User Modal ────────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || "",
    college: user.college || "",
    department: user.department || "",
    year: user.year || "",
    elo: user.elo || 1200,
    role: user.role || "student",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await adminFetch(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      onSave(data.user);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>
            <Edit2 size={18} /> Edit User
          </h3>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSave} className="admin-modal-body">
          <div className="admin-form-row">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
              />
            </label>
            <label>
              College
              <input
                value={form.college}
                onChange={(e) => setForm((v) => ({ ...v, college: e.target.value }))}
              />
            </label>
          </div>
          <div className="admin-form-row">
            <label>
              Department
              <input
                value={form.department}
                onChange={(e) =>
                  setForm((v) => ({ ...v, department: e.target.value }))
                }
              />
            </label>
            <label>
              Year
              <input
                value={form.year}
                onChange={(e) => setForm((v) => ({ ...v, year: e.target.value }))}
              />
            </label>
          </div>
          <div className="admin-form-row">
            <label>
              ELO Rating
              <input
                type="number"
                value={form.elo}
                onChange={(e) =>
                  setForm((v) => ({ ...v, elo: parseInt(e.target.value) || 1200 }))
                }
              />
            </label>
            <label>
              Role
              <select
                value={form.role}
                onChange={(e) => setForm((v) => ({ ...v, role: e.target.value }))}
              >
                <option value="student">Student (Duelist)</option>
                <option value="faculty">Faculty / Instructor</option>
                <option value="setter">Problem Setter</option>
                <option value="moderator">Campus Lead / Referee</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function AdminLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in?
  useEffect(() => {
    if (getAdminToken() && getAdminUser()?.role === "admin") {
      nav("/admin/dashboard", { replace: true });
    }
  }, [nav]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json());

      if (!data.token) throw new Error(data.message || "Login failed.");
      saveAdminToken(data.token);
      saveAdminUser(data.user);
      nav("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="admin-login-orb admin-orb-1" />
        <div className="admin-login-orb admin-orb-2" />
      </div>

      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-icon">
            <Shield size={28} />
          </div>
          <div>
            <h1>Campus Duel</h1>
            <span>ADMIN CONTROL PANEL</span>
          </div>
        </div>

        <p className="admin-login-sub">
          Restricted access — admin credentials required.
        </p>

        <form onSubmit={handleLogin} className="admin-login-form">
          <label>
            Admin Email
            <input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              id="admin-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="admin-login-error">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <button
            id="admin-login-submit"
            className="admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-spinner" /> Authenticating…
              </>
            ) : (
              <>
                Enter Dashboard <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        <a href="/" className="admin-back-link">
          ← Back to Campus Duel
        </a>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [toast, setToast] = useState(null);
  const adminUser = getAdminUser();

  function showToast(msg, type = "success") {
    setToast({ msg, type });
  }

  function logout() {
    clearAdminToken();
    localStorage.removeItem("campusDuelAdminUser");
    localStorage.removeItem("campusDuelUser");
    localStorage.removeItem("campusDuelToken");
    nav("/auth", { replace: true });
  }

  // Guard
  useEffect(() => {
    if (!getAdminToken() || !adminUser) {
      nav("/auth", { replace: true });
    }
  }, [nav, adminUser]);

  // Load stats
  useEffect(() => {
    setLoadingStats(true);
    adminFetch("/stats")
      .then((d) => setStats(d))
      .catch(() => showToast("Failed to load stats.", "error"))
      .finally(() => setLoadingStats(false));
  }, []);

  // Load users when tab is users
  useEffect(() => {
    if (tab !== "users") return;
    setLoadingUsers(true);
    adminFetch(`/users?page=${page}&limit=15&search=${encodeURIComponent(search)}&role=${roleFilter}`)
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
      })
      .catch(() => showToast("Failed to load users.", "error"))
      .finally(() => setLoadingUsers(false));
  }, [tab, page, search, roleFilter]);

  // Load rooms when tab is rooms
  useEffect(() => {
    if (tab !== "rooms") return;
    setLoadingRooms(true);
    adminFetch("/rooms")
      .then((d) => setRooms(d.rooms || []))
      .catch(() => showToast("Failed to load rooms.", "error"))
      .finally(() => setLoadingRooms(false));
  }, [tab]);

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`/users/${id}`, { method: "DELETE" });
      setUsers((v) => v.filter((u) => u.id !== id));
      setTotal((v) => v - 1);
      showToast(`User "${name}" deleted.`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function deleteRoom(id) {
    if (!confirm("Delete this room?")) return;
    try {
      await adminFetch(`/rooms/${id}`, { method: "DELETE" });
      setRooms((v) => v.filter((r) => r._id !== id));
      showToast("Room deleted.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function promoteUser(id, name) {
    if (!confirm(`Promote "${name}" to admin?`)) return;
    try {
      const data = await adminFetch(`/users/${id}/promote`, { method: "POST" });
      setUsers((v) => v.map((u) => (u.id === id ? data.user : u)));
      showToast(`"${name}" is now an admin.`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  const s = stats?.stats || {};
  const pages = Math.ceil(total / 15);

  return (
    <div className="admin-dashboard">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Shield size={22} />
          <div>
            <b>Admin Panel</b>
            <small>Campus Duel</small>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {[
            { id: "overview", icon: <BarChart3 size={18} />, label: "Overview" },
            { id: "users", icon: <Users size={18} />, label: "Users" },
            { id: "rooms", icon: <Activity size={18} />, label: "Rooms" },
          ].map((item) => (
            <button
              key={item.id}
              className={`admin-nav-btn ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-logged-as">
            <div className="admin-avatar">
              {adminUser?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <b>{adminUser?.name || "Admin"}</b>
              <small>{adminUser?.email}</small>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Toast */}
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <span className="admin-eyebrow">🛡 ADMIN OVERVIEW</span>
                <h2>Dashboard</h2>
                <p>Platform health, key metrics, and recent activity.</p>
              </div>
              <button
                className="admin-btn-ghost"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {loadingStats ? (
              <div className="admin-loading">
                <span className="admin-spinner" /> Loading stats…
              </div>
            ) : (
              <>
                <div className="admin-stats-grid">
                  <StatCard
                    icon={<Users size={22} />}
                    label="Total Users"
                    value={s.totalUsers ?? "—"}
                    sub="All registered accounts"
                  />
                  <StatCard
                    icon={<Activity size={22} />}
                    label="Active Rooms"
                    value={s.activeRooms ?? "—"}
                    sub="Live duels right now"
                    color="var(--green)"
                  />
                  <StatCard
                    icon={<Clock size={22} />}
                    label="Waiting Rooms"
                    value={s.waitingRooms ?? "—"}
                    sub="Looking for opponents"
                    color="var(--yellow)"
                  />
                  <StatCard
                    icon={<Zap size={22} />}
                    label="Total Duels"
                    value={s.totalRooms ?? "—"}
                    sub="All-time room count"
                    color="var(--cyan)"
                  />
                  <StatCard
                    icon={<TrendingUp size={22} />}
                    label="Total Wins"
                    value={s.totalWins ?? "—"}
                    sub={`${s.totalLosses ?? 0} losses`}
                    color="var(--green)"
                  />
                  <StatCard
                    icon={<Crown size={22} />}
                    label="Top ELO"
                    value={s.topElo ? `${s.topElo.elo}` : "—"}
                    sub={s.topElo?.name || "No players yet"}
                    color="var(--yellow)"
                  />
                </div>

                {/* Recent Users */}
                {stats?.recentUsers?.length > 0 && (
                  <div className="admin-panel">
                    <div className="admin-panel-header">
                      <span className="admin-eyebrow">LATEST REGISTRATIONS</span>
                      <h3>Recent Users</h3>
                    </div>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>College</th>
                          <th>ELO</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentUsers.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div className="admin-user-cell">
                                <div className="admin-mini-avatar">
                                  {u.name?.[0]?.toUpperCase()}
                                </div>
                                {u.name}
                              </div>
                            </td>
                            <td className="admin-muted">{u.email}</td>
                            <td className="admin-muted">{u.college}</td>
                            <td>
                              <span className="admin-elo-badge">{u.elo}</span>
                            </td>
                            <td>
                              <span
                                className={`admin-role-badge ${u.role || "student"}`}
                              >
                                {u.role || "student"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* College Distribution */}
                {stats?.collegeDistribution?.length > 0 && (
                  <div className="admin-panel">
                    <div className="admin-panel-header">
                      <span className="admin-eyebrow">TOP COLLEGES</span>
                      <h3>College Distribution</h3>
                    </div>
                    <div className="admin-college-list">
                      {stats.collegeDistribution.map((c, i) => (
                        <div key={c._id} className="admin-college-row">
                          <span className="admin-college-rank">#{i + 1}</span>
                          <span className="admin-college-name">
                            {c._id || "Not set"}
                          </span>
                          <span className="admin-college-count">
                            {c.count} users
                          </span>
                          <div className="admin-college-bar">
                            <div
                              style={{
                                width: `${Math.round(
                                  (c.count /
                                    (stats.collegeDistribution[0]?.count || 1)) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <span className="admin-eyebrow">USER MANAGEMENT</span>
                <h2>All Users</h2>
                <p>{total} total registered accounts</p>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <div className="admin-search-bar" style={{ flex: 1, minWidth: "220px" }}>
                    <Search size={15} />
                    <input
                      placeholder="Search by name or email…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <select
                    className="admin-role-filter"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      background: "var(--panel2)",
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "9px 14px",
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="setter">Problem Setters</option>
                    <option value="moderator">Moderators</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>
              </div>

              {loadingUsers ? (
                <div className="admin-loading">
                  <span className="admin-spinner" /> Loading users…
                </div>
              ) : (
                <>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>College</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-mini-avatar">
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <b>{u.name}</b>
                                <small className="admin-muted">{u.email}</small>
                              </div>
                            </div>
                          </td>
                          <td className="admin-muted">{u.college}</td>
                          <td>
                            <span
                              className={`admin-role-badge ${u.role || "student"}`}
                            >
                              {u.role || "student"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-action-btns">
                              <button
                                className="admin-icon-btn edit"
                                title="Edit"
                                onClick={() => setEditUser(u)}
                              >
                                <Edit2 size={14} />
                              </button>
                              {u.role !== "admin" && (
                                <button
                                  className="admin-icon-btn promote"
                                  title="Promote to Admin"
                                  onClick={() => promoteUser(u.id, u.name)}
                                >
                                  <Crown size={14} />
                                </button>
                              )}
                              {u.role !== "admin" && (
                                <button
                                  className="admin-icon-btn delete"
                                  title="Delete"
                                  onClick={() => deleteUser(u.id, u.name)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {pages > 1 && (
                    <div className="admin-pagination">
                      <button
                        className="admin-btn-ghost"
                        disabled={page <= 1}
                        onClick={() => setPage((v) => v - 1)}
                      >
                        ← Prev
                      </button>
                      <span>
                        Page {page} of {pages}
                      </span>
                      <button
                        className="admin-btn-ghost"
                        disabled={page >= pages}
                        onClick={() => setPage((v) => v + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── ROOMS TAB ── */}
        {tab === "rooms" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <span className="admin-eyebrow">ROOM MANAGEMENT</span>
                <h2>All Rooms</h2>
                <p>Monitor and manage active/waiting/completed duels.</p>
              </div>
              <button
                className="admin-btn-ghost"
                onClick={() => {
                  setLoadingRooms(true);
                  adminFetch("/rooms")
                    .then((d) => setRooms(d.rooms || []))
                    .catch(() => showToast("Failed to reload rooms.", "error"))
                    .finally(() => setLoadingRooms(false));
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div className="admin-panel">
              {loadingRooms ? (
                <div className="admin-loading">
                  <span className="admin-spinner" /> Loading rooms…
                </div>
              ) : rooms.length === 0 ? (
                <div className="admin-empty">
                  <Activity size={40} />
                  <p>No rooms found.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Host</th>
                      <th>Opponent</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <span className="admin-room-code">{r.code}</span>
                        </td>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-mini-avatar">
                              {r.host?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <b>{r.host?.name || "Unknown"}</b>
                              <small className="admin-muted">{r.host?.elo} ELO</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {r.opponent ? (
                            <div className="admin-user-cell">
                              <div className="admin-mini-avatar">
                                {r.opponent?.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <b>{r.opponent.name}</b>
                                <small className="admin-muted">
                                  {r.opponent.elo} ELO
                                </small>
                              </div>
                            </div>
                          ) : (
                            <span className="admin-muted">Waiting…</span>
                          )}
                        </td>
                        <td>
                          <span className={`admin-status-badge ${r.status}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="admin-muted">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <button
                            className="admin-icon-btn delete"
                            title="Delete Room"
                            onClick={() => deleteRoom(r._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(updated) => {
            setUsers((v) => v.map((u) => (u.id === updated.id ? updated : u)));
            setEditUser(null);
            showToast("User updated.", "success");
          }}
        />
      )}
    </div>
  );
}

// ── Route guards ───────────────────────────────────────────────────────────────
export function AdminProtectedRoute({ children }) {
  const nav = useNavigate();
  const token = getAdminToken();
  const adminUser = getAdminUser();

  useEffect(() => {
    if (!token || !adminUser || adminUser.role !== "admin") {
      nav("/auth", { replace: true });
    }
  }, [token, adminUser, nav]);

  if (!token || !adminUser) return null;
  return children;
}
