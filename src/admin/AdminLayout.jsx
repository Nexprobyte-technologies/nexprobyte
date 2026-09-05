import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "./admin-styles.css";

const STATIC_PAGES = [
  { title: "CRM Dashboard", category: "Pages", icon: "📊", path: "/admin", sub: "Overview & key metrics" },
  { title: "All Employee Details", category: "Management", icon: "👥", path: "/admin/employees", sub: "Manage employees, statuses & login credentials" },
  { title: "Projects & Deliverables", category: "Management", icon: "🚀", path: "/admin/projects", sub: "Create & track client project records, tech stack & assignments" },
  { title: "My Attendance", category: "Employee", icon: "⏱️", path: "/admin/attendance", sub: "Punch in/out & attendance tracking" },
  { title: "Daily Work Status", category: "Employee", icon: "📝", path: "/admin/work-status", sub: "Upload daily project deliverables" },
  { title: "Leave Tracker", category: "Employee", icon: "🌴", path: "/admin/leaves", sub: "Leave balances & applications" },
  { title: "Inquiries & Leads", category: "Pages", icon: "💬", path: "/admin/inquiries", sub: "Manage customer leads & contact messages" },
  { title: "Careers & Recruitment", category: "Pages", icon: "💼", path: "/admin/careers", sub: "Post jobs & review applications" },
  { title: "Blog Articles & Insights", category: "Pages", icon: "📰", path: "/admin/blogs", sub: "Manage and publish blog posts" },
  { title: "About Content Editor", category: "Pages", icon: "✏️", path: "/admin/about", sub: "Edit company story, mission & statistics" },
  { title: "Live Website", category: "Pages", icon: "🌐", path: "/", sub: "View public facing website", external: true },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: "💬", bg: "#fff0f3", title: "New Inquiry from Rajesh Kumar", desc: "Requested Website Development quote", time: "5 mins ago", unread: true, path: "/admin/inquiries" },
  { id: 2, icon: "📄", bg: "#eff6ff", title: "New Job Application received", desc: "Priya applied for Senior React Engineer", time: "25 mins ago", unread: true, path: "/admin/careers" },
  { id: 3, icon: "💬", bg: "#fff0f3", title: "New Inquiry from Ananya Sharma", desc: "Mobile App Development project inquiry", time: "1 hour ago", unread: true, path: "/admin/inquiries" },
  { id: 4, icon: "🟢", bg: "#ecfdf5", title: "REST API & MongoDB Synced", desc: "Backend database connection is healthy", time: "3 hours ago", unread: false, path: "/admin" },
  { id: 5, icon: "💼", bg: "#fff7ed", title: "Job Opening Live", desc: "UI/UX Designer position is accepting applications", time: "1 day ago", unread: false, path: "/admin/careers" },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("nex_admin_theme") === "dark";
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchData, setSearchData] = useState({ inquiries: [], jobs: [] });

  // Dropdown states
  const [showNotif, setShowNotif] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Toast state
  const [toastMsg, setToastMsg] = useState("");

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: "NexAdmin",
    email: "admin@nexprobyte.com",
    newPassword: "",
    confirmPassword: "",
  });
  const [settingsStatus, setSettingsStatus] = useState({ error: "", success: "" });

  const searchRef = useRef(null);
  const headerRightRef = useRef(null);

  // Ensure cursor is ALWAYS standard OS pointer on admin pages
  useEffect(() => {
    document.body.classList.add("admin-route");
    return () => {
      document.body.classList.remove("admin-route");
    };
  }, []);

  // Auth check & load user
  useEffect(() => {
    const token = localStorage.getItem("nex_admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    try {
      const u = JSON.parse(localStorage.getItem("nex_admin_user") || "{}");
      setAdminUser(u);
      setSettingsForm((p) => ({ ...p, name: u.username || "NexAdmin", email: u.email || "admin@nexprobyte.com" }));
    } catch {
      setAdminUser({ username: "NexAdmin" });
    }
  }, [navigate]);

  // Fetch search index data (inquiries & jobs)
  useEffect(() => {
    const token = localStorage.getItem("nex_admin_token");
    if (!token) return;

    const loadSearchIndex = async () => {
      try {
        const [inqRes, jobsRes] = await Promise.all([
          fetch("/api/inquiries", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/jobs"),
        ]);
        const inquiries = inqRes.ok ? await inqRes.json() : [];
        const jobs = jobsRes.ok ? await jobsRes.json() : [];
        setSearchData({ inquiries, jobs });
      } catch (e) {
        console.error("Search index load error:", e);
      }
    };
    loadSearchIndex();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (headerRightRef.current && !headerRightRef.current.contains(e.target)) {
        setShowNotif(false);
        setShowApps(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("nex_admin_theme", next ? "dark" : "light");
    showToast(next ? "🌙 Dark Mode activated" : "☀️ Light Mode activated");
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("nex_admin_token");
    localStorage.removeItem("nex_admin_user");
    navigate("/admin/login");
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("All notifications marked as read");
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Compute Search Results
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = [];

  if (trimmedQuery) {
    // 1. Pages
    STATIC_PAGES.forEach((p) => {
      if (p.title.toLowerCase().includes(trimmedQuery) || p.sub.toLowerCase().includes(trimmedQuery)) {
        searchResults.push({ ...p, type: "page" });
      }
    });

    // 2. Inquiries
    (searchData.inquiries || []).forEach((inq) => {
      if (
        inq.name?.toLowerCase().includes(trimmedQuery) ||
        inq.email?.toLowerCase().includes(trimmedQuery) ||
        inq.service?.toLowerCase().includes(trimmedQuery) ||
        inq.message?.toLowerCase().includes(trimmedQuery)
      ) {
        searchResults.push({
          title: inq.name,
          category: "Leads",
          icon: "💬",
          path: "/admin/inquiries",
          sub: `${inq.service} • ${inq.email}`,
          type: "lead",
        });
      }
    });

    // 3. Jobs
    (searchData.jobs || []).forEach((j) => {
      if (
        j.title?.toLowerCase().includes(trimmedQuery) ||
        j.dept?.toLowerCase().includes(trimmedQuery) ||
        j.location?.toLowerCase().includes(trimmedQuery)
      ) {
        searchResults.push({
          title: j.title,
          category: "Jobs",
          icon: "💼",
          path: "/admin/careers",
          sub: `${j.dept} • ${j.location} • ${j.salary || ""}`,
          type: "job",
        });
      }
    });
  }

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsStatus({ error: "", success: "" });

    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
      setSettingsStatus({ error: "Passwords do not match!", success: "" });
      return;
    }

    const updatedUser = {
      ...adminUser,
      username: settingsForm.name,
      email: settingsForm.email,
    };
    localStorage.setItem("nex_admin_user", JSON.stringify(updatedUser));
    setAdminUser(updatedUser);
    setSettingsStatus({ error: "", success: "Settings updated successfully!" });
    showToast("✅ Settings saved");
    setTimeout(() => {
      setShowSettings(false);
      setSettingsStatus({ error: "", success: "" });
    }, 1500);
  };

  const handleClearCache = () => {
    showToast("🧹 System cache & API state reloaded");
    setTimeout(() => window.location.reload(), 800);
  };

  const isEmployee = adminUser?.role === "employee";
  const displayName = isEmployee
    ? adminUser?.name || "Employee"
    : adminUser?.name || adminUser?.username || "NexAdmin";
  const displayRole = isEmployee
    ? `${adminUser?.empId || "ID"} • ${adminUser?.designation || "Employee"}`
    : "Super Admin (Status 1)";
  const initials = (displayName || "N")[0].toUpperCase();

  return (
    <div className={`paces-admin-root ${isDark ? "dark-theme" : ""}`}>
      {/* ── Toast Notification ─────────────────────────────── */}
      {toastMsg && <div className="paces-toast">{toastMsg}</div>}

      {/* ── Body: Sidebar + Right Column (Header + Main) ──── */}
      <div className="paces-body">
        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="paces-sidebar">
          <div className="paces-sidebar-profile">
            <div className="paces-sidebar-profile-inner">
              <div className="paces-sidebar-avatar">{initials}</div>
              <div>
                <div className="paces-sidebar-name">{displayName}</div>
                <div className="paces-sidebar-role">{displayRole}</div>
              </div>
            </div>
          </div>

          {isEmployee ? (
            /* ── Employee Portal Navigation ── */
            <div className="paces-nav-section">
              <div className="paces-nav-section-label">Employee Portal</div>
              <NavLink to="/admin" end className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                <span className="paces-nav-icon">📊</span>
                My Dashboard
              </NavLink>
              <NavLink to="/admin/attendance" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                <span className="paces-nav-icon">⏱️</span>
                My Attendance
              </NavLink>
              <NavLink to="/admin/work-status" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                <span className="paces-nav-icon">📝</span>
                Daily Work Status
              </NavLink>
              <NavLink to="/admin/leaves" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                <span className="paces-nav-icon">🌴</span>
                Leave Tracker
              </NavLink>
            </div>
          ) : (
            /* ── Super Admin Navigation ── */
            <>
              <div className="paces-nav-section">
                <div className="paces-nav-section-label">Main</div>
                <NavLink to="/admin" end className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                  <span className="paces-nav-icon">📊</span>
                  CRM Dashboard
                </NavLink>
                <NavLink to="/admin/employees" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                  <span className="paces-nav-icon">👥</span>
                  All Employees
                </NavLink>
                <NavLink to="/admin/projects" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                  <span className="paces-nav-icon">🚀</span>
                  Projects &amp; Deliverables
                </NavLink>
              </div>

              <div className="paces-nav-section">
                <div className="paces-nav-section-label">Management</div>
                <NavLink to="/admin/inquiries" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                  <span className="paces-nav-icon">💬</span>
                  Inquiries &amp; Leads
                </NavLink>
                <NavLink to="/admin/careers" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                  <span className="paces-nav-icon">💼</span>
                  Careers &amp; Jobs
                </NavLink>
                <NavLink to="/admin/blogs" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                  <span className="paces-nav-icon">📰</span>
                  Blog Articles
                </NavLink>
                <NavLink to="/admin/about" className={({ isActive }) => `paces-nav-link ${isActive ? "active" : ""}`}>
                  <span className="paces-nav-icon">✏️</span>
                  About Editor
                </NavLink>
              </div>
            </>
          )}

          <div className="paces-sidebar-footer">
            <div className="paces-nav-section-label" style={{ paddingTop: 12 }}>System</div>
            <a href="/" target="_blank" rel="noreferrer" className="paces-nav-link">
              <span className="paces-nav-icon">🌐</span>
              Live Website
            </a>
            <button
              onClick={() => { setShowSettings(true); }}
              className="paces-nav-link"
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <span className="paces-nav-icon">⚙️</span>
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="paces-nav-link"
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <span className="paces-nav-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Right Column (Header + Main) ──────────────────── */}
        <div className="paces-right-col">
          {/* Header Bar */}
          <header className="paces-header">
            {/* Left: Quick Search */}
            <div className="paces-header-left" ref={searchRef}>
              <div className="paces-search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="paces-search-input"
                  placeholder="Quick Search pages, leads, jobs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                {searchQuery && (
                  <button
                    className="paces-search-clear"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Search Results Popover */}
              {isSearchOpen && (
                <div className="paces-search-popover">
                  {!trimmedQuery ? (
                    <div>
                      <div className="paces-search-group-title">QUICK NAVIGATION</div>
                      {STATIC_PAGES.map((p, i) => (
                        <Link
                          key={i}
                          to={p.path}
                          target={p.external ? "_blank" : "_self"}
                          className="paces-search-item"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <div className="paces-search-item-icon">{p.icon}</div>
                          <div className="paces-search-item-info">
                            <div className="paces-search-item-title">{p.title}</div>
                            <div className="paces-search-item-sub">{p.sub}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--p-text-muted)" }}>
                      <div>🔍 No results found for "{searchQuery}"</div>
                      <div style={{ fontSize: "11.5px", marginTop: "4px" }}>
                        Try searching for "Dashboard", "Inquiries", "React", or candidate names
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="paces-search-group-title">
                        SEARCH RESULTS ({searchResults.length})
                      </div>
                      {searchResults.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          className="paces-search-item"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="paces-search-item-icon">{item.icon}</div>
                          <div className="paces-search-item-info">
                            <div className="paces-search-item-title">{item.title}</div>
                            <div className="paces-search-item-sub">{item.sub}</div>
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: "var(--p-card-border)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: "var(--p-text-muted)",
                            }}
                          >
                            {item.category}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Tools (Night/Day Toggle, Grid Apps, Notifications, Settings, User Pill) */}
            <div className="paces-header-right" ref={headerRightRef}>
              {/* 1. Theme Toggle (Night / Day) */}
              <button
                className={`paces-icon-btn ${isDark ? "active" : ""}`}
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              {/* 2. Apps Grid Button */}
              <button
                className={`paces-icon-btn ${showApps ? "active" : ""}`}
                onClick={() => {
                  setShowApps(!showApps);
                  setShowNotif(false);
                  setShowUserMenu(false);
                }}
                title="Apps & Shortcuts"
              >
                ⊞
              </button>

              {/* Apps Grid Dropdown */}
              {showApps && (
                <div className="paces-dropdown-panel paces-apps-panel">
                  <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--p-text-dark)", marginBottom: "12px" }}>
                    Quick Apps &amp; Navigation
                  </div>
                  <div className="paces-apps-grid">
                    <Link to="/admin" className="paces-app-tile" onClick={() => setShowApps(false)}>
                      <div className="paces-app-tile-icon">📊</div>
                      <div className="paces-app-tile-title">Dashboard</div>
                    </Link>
                    {isEmployee ? (
                      <>
                        <Link to="/admin/attendance" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">⏱️</div>
                          <div className="paces-app-tile-title">Attendance</div>
                        </Link>
                        <Link to="/admin/work-status" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">📝</div>
                          <div className="paces-app-tile-title">Work Status</div>
                        </Link>
                        <Link to="/admin/leaves" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">🌴</div>
                          <div className="paces-app-tile-title">Leaves</div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/admin/employees" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">👥</div>
                          <div className="paces-app-tile-title">Employees</div>
                        </Link>
                        <Link to="/admin/projects" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">🚀</div>
                          <div className="paces-app-tile-title">Projects</div>
                        </Link>
                        <Link to="/admin/inquiries" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">💬</div>
                          <div className="paces-app-tile-title">Inquiries</div>
                        </Link>
                        <Link to="/admin/careers" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">💼</div>
                          <div className="paces-app-tile-title">Careers</div>
                        </Link>
                        <Link to="/admin/blogs" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">📰</div>
                          <div className="paces-app-tile-title">Blogs</div>
                        </Link>
                        <Link to="/admin/about" className="paces-app-tile" onClick={() => setShowApps(false)}>
                          <div className="paces-app-tile-icon">✏️</div>
                          <div className="paces-app-tile-title">About</div>
                        </Link>
                      </>
                    )}
                    <a href="/" target="_blank" rel="noreferrer" className="paces-app-tile" onClick={() => setShowApps(false)}>
                      <div className="paces-app-tile-icon">🌐</div>
                      <div className="paces-app-tile-title">Website</div>
                    </a>
                    <button
                      onClick={() => {
                        setShowApps(false);
                        setShowSettings(true);
                      }}
                      className="paces-app-tile"
                      style={{ background: "none", border: "1px solid var(--p-card-border)" }}
                    >
                      <div className="paces-app-tile-icon">⚙️</div>
                      <div className="paces-app-tile-title">Settings</div>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Notifications Bell */}
              <button
                className={`paces-icon-btn ${showNotif ? "active" : ""}`}
                onClick={() => {
                  setShowNotif(!showNotif);
                  setShowApps(false);
                  setShowUserMenu(false);
                }}
                title="Notifications"
                style={{ position: "relative" }}
              >
                🔔
                {unreadCount > 0 && <span className="paces-notif-dot">{unreadCount}</span>}
              </button>

              {/* Notifications Dropdown */}
              {showNotif && (
                <div className="paces-dropdown-panel paces-notif-panel">
                  <div className="paces-notif-header">
                    <div className="paces-notif-title">
                      Notifications {unreadCount > 0 && <span className="paces-badge badge-coral" style={{ marginLeft: 6 }}>{unreadCount} New</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="paces-btn paces-btn-ghost paces-btn-sm"
                        style={{ fontSize: "11px" }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="paces-notif-list">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.path}
                        className={`paces-notif-item ${n.unread ? "unread" : ""}`}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                          );
                          setShowNotif(false);
                        }}
                      >
                        <div className="paces-notif-icon" style={{ background: n.bg }}>
                          {n.icon}
                        </div>
                        <div className="paces-notif-content">
                          <div className="paces-notif-heading">{n.title}</div>
                          <div className="paces-notif-desc">{n.desc}</div>
                          <div className="paces-notif-time">{n.time}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="paces-notif-footer">
                    <Link
                      to="/admin/inquiries"
                      className="paces-btn paces-btn-coral paces-btn-sm"
                      style={{ width: "100%" }}
                      onClick={() => setShowNotif(false)}
                    >
                      View All Leads &amp; Messages →
                    </Link>
                  </div>
                </div>
              )}

              {/* 4. Settings Button */}
              <button
                className={`paces-icon-btn ${showSettings ? "active" : ""}`}
                onClick={() => {
                  setShowSettings(true);
                  setShowNotif(false);
                  setShowApps(false);
                  setShowUserMenu(false);
                }}
                title="System Settings"
              >
                ⚙️
              </button>

              <div className="paces-header-divider" />

              {/* 5. User Profile Chip */}
              <div
                className="paces-user-chip"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotif(false);
                  setShowApps(false);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="paces-user-avatar">{initials}</div>
                <div className="paces-user-info">
                  <div className="paces-user-name">{displayName}</div>
                  <div className="paces-user-role">
                    {isEmployee ? (adminUser?.empId || "Employee") : "Super Admin"}
                  </div>
                </div>
              </div>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="paces-dropdown-panel paces-user-panel">
                  <div className="paces-user-panel-head">
                    <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--p-text-dark)" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--p-text-muted)" }}>
                      {adminUser?.email || settingsForm.email}
                    </div>
                  </div>
                  <button
                    className="paces-user-menu-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowSettings(true);
                    }}
                  >
                    <span>⚙️</span> Account Settings
                  </button>
                  {!isEmployee && (
                    <Link to="/admin/about" className="paces-user-menu-item" onClick={() => setShowUserMenu(false)}>
                      <span>✏️</span> About Page Editor
                    </Link>
                  )}
                  <a href="/" target="_blank" rel="noreferrer" className="paces-user-menu-item" onClick={() => setShowUserMenu(false)}>
                    <span>🌐</span> View Live Website
                  </a>
                  <div style={{ borderTop: "1px solid var(--p-card-border)", margin: "6px 0" }} />
                  <button className="paces-user-menu-item" onClick={handleLogout} style={{ color: "#ef4444" }}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Main Content Render */}
          <main className="paces-main">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Settings Modal ─────────────────────────────────── */}
      {showSettings && (
        <div
          className="paces-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
        >
          <div className="paces-modal" style={{ maxWidth: 520 }}>
            <div className="paces-modal-header">
              <div className="paces-modal-title">⚙️ Admin Portal Settings</div>
              <button className="paces-modal-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>

            {settingsStatus.error && <div className="paces-alert paces-alert-error">{settingsStatus.error}</div>}
            {settingsStatus.success && <div className="paces-alert paces-alert-success">{settingsStatus.success}</div>}

            <form onSubmit={handleSaveSettings}>
              {/* Profile Details */}
              <div className="paces-form-group">
                <label className="paces-label">Admin Username</label>
                <input
                  type="text"
                  className="paces-input"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Notification Email</label>
                <input
                  type="email"
                  className="paces-input"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ borderTop: "1px solid var(--p-card-border)", margin: "16px 0", paddingTop: 16 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--p-text-dark)", marginBottom: 12 }}>
                  Appearance &amp; System Preferences
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--p-text-dark)", fontSize: "13px" }}>Theme Mode</div>
                    <div style={{ fontSize: "11.5px", color: "var(--p-text-muted)" }}>Toggle dark / light mode interface</div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="paces-btn paces-btn-outline paces-btn-sm"
                  >
                    {isDark ? "🌙 Dark Active" : "☀️ Light Active"}
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--p-text-dark)", fontSize: "13px" }}>API &amp; System Cache</div>
                    <div style={{ fontSize: "11.5px", color: "var(--p-text-muted)" }}>Reload latest database states</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="paces-btn paces-btn-outline paces-btn-sm"
                  >
                    🧹 Reload Cache
                  </button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--p-card-border)", margin: "16px 0", paddingTop: 16 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--p-text-dark)", marginBottom: 12 }}>
                  Change Password (Optional)
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">New Password</label>
                  <input
                    type="password"
                    className="paces-input"
                    placeholder="Leave blank to keep current password"
                    value={settingsForm.newPassword}
                    onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="paces-form-group" style={{ marginBottom: 0 }}>
                  <label className="paces-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="paces-input"
                    placeholder="Confirm new password"
                    value={settingsForm.confirmPassword}
                    onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="paces-modal-footer">
                <button type="button" onClick={() => setShowSettings(false)} className="paces-btn paces-btn-outline">
                  Cancel
                </button>
                <button type="submit" className="paces-btn paces-btn-coral">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
