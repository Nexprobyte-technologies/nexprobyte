import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./admin-styles.css";
import Pagination, { usePagination } from "./Pagination.jsx";

const AVATAR_COLORS = [
  "#ff4d6d","#10b981","#3b82f6","#8b5cf6","#f97316","#06b6d4","#ec4899",
];

function getAvatarColor(name = "") {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    totalApplications: 0,
    activeJobs: 0,
    totalEmployees: 0,
    confirmedEmployees: 0,
    pendingEmployees: 0,
    todayPunches: 0,
    pendingLeaves: 0,
    totalWorkReports: 0,
  });

  const [recentInquiries, setRecentInquiries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const [sRes, iRes, empRes, attRes, lvRes] = await Promise.all([
        fetch("/api/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/inquiries", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/attendance", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/leaves", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (sRes.ok) {
        const sd = await sRes.json();
        setStats((p) => ({ ...p, ...sd }));
      }
      if (iRes.ok) {
        const id = await iRes.json();
        setRecentInquiries(id);
      }
      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps);
      }
      if (attRes.ok) {
        const atts = await attRes.json();
        setAttendance(atts);
      }
      if (lvRes.ok) {
        const lvs = await lvRes.json();
        setLeaves(lvs);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // Derive today's punch for each employee
  const employeeAttendanceMap = {};
  attendance
    .filter((a) => a.date === todayStr)
    .forEach((a) => {
      employeeAttendanceMap[a.employeeId] = a;
    });

  // Calculate dynamic service distribution from inquiries
  const serviceCountMap = {};
  recentInquiries.forEach((inq) => {
    const s = inq.service || "General Inquiry";
    serviceCountMap[s] = (serviceCountMap[s] || 0) + 1;
  });

  const totalInquiriesCount = recentInquiries.length || 1;
  const serviceDistribution = Object.entries(serviceCountMap).map(([label, count], i) => {
    const colors = ["#ff4d6d", "#10b981", "#8b5cf6", "#f97316", "#06b6d4"];
    return {
      label,
      count,
      pct: `${Math.round((count / totalInquiriesCount) * 100)}%`,
      color: colors[i % colors.length],
    };
  });

  const badgeClass = (status) =>
    status === "New"
      ? "badge-coral"
      : status === "Completed"
      ? "badge-teal"
      : status === "In Progress"
      ? "badge-blue"
      : "badge-gray";

  const pagEmp = usePagination(employees);

  return (
    <div>
      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Super Admin Master Dashboard</div>
          <div className="paces-breadcrumb">
            Nexprobyte <span>›</span> Admin Portal <span>›</span> Overview &amp; Workforce
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/admin/employees" className="paces-btn paces-btn-outline">
            👥 All Employees ({stats.totalEmployees})
          </Link>
          <button className="paces-btn paces-btn-coral" onClick={fetchData}>
            ↻ &nbsp;Live Refresh
          </button>
        </div>
      </div>

      {/* Backend Connected Notification Bar */}
      <div
        className="paces-alert paces-alert-info"
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          background: "linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)",
          borderColor: "#a7f3d0",
          color: "#065f46",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>🟢</span>
          <div>
            <strong>Live Centralized Backend Connected:</strong> All CRM leads, job postings, employee attendance, daily deliverables &amp; leave requests are in real-time sync.
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", fontSize: "12px", fontWeight: 700 }}>
          <span style={{ background: "#d1fae5", padding: "4px 10px", borderRadius: "8px" }}>
            👥 {stats.totalEmployees} Staff Total
          </span>
          <span style={{ background: "#dcfce7", padding: "4px 10px", borderRadius: "8px" }}>
            ⏱️ {stats.todayPunches} Punched Today
          </span>
          <span style={{ background: "#fee2e2", padding: "4px 10px", borderRadius: "8px", color: "#991b1b" }}>
            🌴 {stats.pendingLeaves} Pending Leaves
          </span>
        </div>
      </div>

      {/* Stat Cards Grid - Fully Connected to Database */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Card 1: All Employees */}
        <Link to="/admin/employees" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="paces-stat-card" style={{ transition: "transform 0.2s ease", cursor: "pointer" }}>
            <div className="paces-stat-label">👥 Total Workforce</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="paces-stat-value">{stats.totalEmployees}</div>
              <span style={{ fontSize: "24px" }}>🏢</span>
            </div>
            <div className="paces-stat-footer">
              <span className="paces-stat-up">
                {stats.confirmedEmployees} Confirmed
              </span>
              <span className="paces-stat-neutral">• {stats.pendingEmployees} Pending</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Today's Attendance */}
        <Link to="/admin/employees" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="paces-stat-card" style={{ transition: "transform 0.2s ease", cursor: "pointer" }}>
            <div className="paces-stat-label">⏱️ Today's Attendance</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="paces-stat-value">{stats.todayPunches}</div>
              <span style={{ fontSize: "24px" }}>🟢</span>
            </div>
            <div className="paces-stat-footer">
              <span className="paces-stat-up">Punched In Today</span>
              <span className="paces-stat-neutral">
                {stats.totalEmployees - stats.todayPunches > 0
                  ? `• ${stats.totalEmployees - stats.todayPunches} Not Punched`
                  : "• All Present"}
              </span>
            </div>
          </div>
        </Link>

        {/* Card 3: Pending Leaves */}
        <Link to="/admin/employees" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="paces-stat-card" style={{ transition: "transform 0.2s ease", cursor: "pointer" }}>
            <div className="paces-stat-label">🌴 Leave Applications</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="paces-stat-value" style={{ color: stats.pendingLeaves > 0 ? "#dc2626" : "#0f172a" }}>
                {stats.pendingLeaves}
              </div>
              <span style={{ fontSize: "24px" }}>📋</span>
            </div>
            <div className="paces-stat-footer">
              <span className={stats.pendingLeaves > 0 ? "paces-stat-down" : "paces-stat-up"}>
                {stats.pendingLeaves > 0 ? "⚠️ Needs Review" : "✓ Up to date"}
              </span>
              <span className="paces-stat-neutral">Pending Approvals</span>
            </div>
          </div>
        </Link>

        {/* Card 4: Daily Work Reports */}
        <Link to="/admin/employees" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="paces-stat-card" style={{ transition: "transform 0.2s ease", cursor: "pointer" }}>
            <div className="paces-stat-label">📝 Daily Work Deliverables</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="paces-stat-value">{stats.totalWorkReports}</div>
              <span style={{ fontSize: "24px" }}>📁</span>
            </div>
            <div className="paces-stat-footer">
              <span className="paces-stat-up">Uploaded Deliverables</span>
              <span className="paces-stat-neutral">via Employee Portal</span>
            </div>
          </div>
        </Link>

        {/* Card 5: Leads & Inquiries */}
        <Link to="/admin/inquiries" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="paces-stat-card" style={{ transition: "transform 0.2s ease", cursor: "pointer" }}>
            <div className="paces-stat-label">💬 Leads &amp; Inquiries</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="paces-stat-value">{stats.totalInquiries}</div>
              <span style={{ fontSize: "24px" }}>✉️</span>
            </div>
            <div className="paces-stat-footer">
              <span className="paces-stat-up">↗ {stats.newInquiries} New</span>
              <span className="paces-stat-neutral">Customer Inquiries</span>
            </div>
          </div>
        </Link>

        {/* Card 6: Careers & Openings */}
        <Link to="/admin/careers" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="paces-stat-card" style={{ transition: "transform 0.2s ease", cursor: "pointer" }}>
            <div className="paces-stat-label">💼 Recruitment &amp; Jobs</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="paces-stat-value">{stats.activeJobs}</div>
              <span style={{ fontSize: "24px" }}>🎯</span>
            </div>
            <div className="paces-stat-footer">
              <span className="paces-stat-up">Active Positions</span>
              <span className="paces-stat-neutral">• {stats.totalApplications} Applicants</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Access Control Row */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "18px 24px",
          border: "1px solid #e2e8f0",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", marginBottom: "12px" }}>
          ⚡ Fast Admin Shortcuts:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Link
            to="/admin/employees"
            className="paces-btn"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
          >
            👥 All Employee Details &amp; Credential Setup →
          </Link>
          <Link
            to="/admin/projects"
            className="paces-btn"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
          >
            🚀 Projects &amp; Deliverables →
          </Link>
          <Link
            to="/admin/inquiries"
            className="paces-btn"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
          >
            💬 Contact Inquiries &amp; Leads →
          </Link>
          <Link
            to="/admin/careers"
            className="paces-btn"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
          >
            💼 Post / Edit Job Openings →
          </Link>
          <Link
            to="/admin/blogs"
            className="paces-btn"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
          >
            📰 Manage Blog Articles →
          </Link>
          <Link
            to="/admin/about"
            className="paces-btn"
            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
          >
            ✏️ Company Profile &amp; Stats Editor →
          </Link>
        </div>
      </div>

      {/* Charts & Analytics Row */}
      <div className="paces-charts-grid" style={{ marginBottom: "24px" }}>
        {/* Overview Chart */}
        <div className="paces-card">
          <div className="paces-card-header">
            <div>
              <div className="paces-card-title">Nexprobyte Operations Growth</div>
              <div className="paces-card-subtitle">Annual Lead Intake &amp; Workforce Scale</div>
            </div>
            <div className="paces-pill-tabs">
              {["All", "1M", "6M", "1Y"].map((t) => (
                <button
                  key={t}
                  className={`paces-pill-tab ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="paces-metrics-row">
            {[
              { icon: "👥", val: `${stats.totalEmployees}`, lbl: "Total Employees", bg: "#eff6ff", cl: "#3b82f6" },
              { icon: "⏱️", val: `${stats.todayPunches}`, lbl: "Today's Punches", bg: "#ecfdf5", cl: "#10b981" },
              { icon: "💬", val: `${stats.totalInquiries}`, lbl: "Total Leads", bg: "#fff0f3", cl: "#ff4d6d" },
              { icon: "📁", val: `${stats.totalWorkReports}`, lbl: "Work Uploads", bg: "#fff7ed", cl: "#f97316" },
            ].map((m, i) => (
              <div className="paces-metric-chip" key={i}>
                <div className="paces-metric-icon" style={{ background: m.bg, color: m.cl }}>
                  {m.icon}
                </div>
                <div>
                  <div className="paces-metric-val">{m.val}</div>
                  <div className="paces-metric-lbl">{m.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bar + Line Chart */}
          <div style={{ position: "relative", marginTop: 8 }}>
            <svg width="100%" height="180" viewBox="0 0 600 180" preserveAspectRatio="none">
              {/* Grid lines */}
              {[40, 90, 140].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
              {/* Teal Bars */}
              {[45, 90, 135, 180, 225, 270, 315, 360, 405, 450, 495, 540].map((x, i) => (
                <rect
                  key={i}
                  x={x - 9}
                  y={60 + (i % 4) * 18}
                  width="9"
                  height={115 - (i % 4) * 18}
                  rx="3"
                  fill="#10b981"
                  opacity="0.8"
                />
              ))}
              {/* Orange Bars */}
              {[45, 90, 135, 180, 225, 270, 315, 360, 405, 450, 495, 540].map((x, i) => (
                <rect
                  key={i}
                  x={x + 2}
                  y={80 + (i % 3) * 14}
                  width="9"
                  height={90 - (i % 3) * 14}
                  rx="3"
                  fill="#f97316"
                  opacity="0.75"
                />
              ))}
              {/* Spline */}
              <path
                d="M 20 120 C 100 60, 200 100, 300 75 S 500 45, 580 35"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Month Labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 600,
                marginTop: 4,
                padding: "0 4px",
              }}
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (m) => (
                  <span key={m}>{m}</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Service & Inquiry Breakdown Donut */}
        <div className="paces-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="paces-card-header">
            <div>
              <div className="paces-card-title">Inquiry Services</div>
              <div className="paces-card-subtitle">Client demand distribution</div>
            </div>
            <Link to="/admin/inquiries" className="paces-btn paces-btn-outline paces-btn-sm">
              Manage →
            </Link>
          </div>

          {/* Donut Chart */}
          <div style={{ position: "relative", width: 160, height: 160, margin: "16px auto" }}>
            <svg width="160" height="160" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#ff4d6d"
                strokeWidth="5"
                strokeDasharray="44 100"
                strokeDashoffset="25"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#10b981"
                strokeWidth="5"
                strokeDasharray="34 100"
                strokeDashoffset="81"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="5"
                strokeDasharray="22 100"
                strokeDashoffset="47"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Total Leads</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                {stats.totalInquiries}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="paces-legend" style={{ marginTop: "auto" }}>
            {serviceDistribution.length > 0 ? (
              serviceDistribution.map((l, i) => (
                <div className="paces-legend-item" key={i}>
                  <span>
                    <span className="paces-legend-dot" style={{ background: l.color }} />
                    <span className="paces-legend-label">{l.label}</span>
                  </span>
                  <span className="paces-legend-value">
                    {l.count} ({l.pct})
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", padding: "10px" }}>
                No inquiry services recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workforce Live Presence & Punch Summary */}
      <div className="paces-card" style={{ marginBottom: "24px" }}>
        <div className="paces-card-header">
          <div>
            <div className="paces-card-title">Staff Attendance &amp; Workforce Status</div>
            <div className="paces-card-subtitle">
              Live punch-in timestamps, confirmation status &amp; employee IDs
            </div>
          </div>
          <Link to="/admin/employees" className="paces-btn paces-btn-outline paces-btn-sm">
            All Employee Details &amp; Filters →
          </Link>
        </div>

        {loading ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading workforce data…</div>
          </div>
        ) : employees.length === 0 ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">👥</div>
            <div className="paces-empty-text">No employees registered yet</div>
            <div className="paces-empty-sub">
              Navigate to All Employee Details to add team members
            </div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>System Status</th>
                  <th>Today's Attendance</th>
                  <th>Leave Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagEmp.paged.map((emp) => {
                  const todayRec = employeeAttendanceMap[emp.empId] || employeeAttendanceMap[emp._id];
                  const hasPunched = !!todayRec;
                  const isConfirmed = emp.status === "Confirmed";

                  return (
                    <tr key={emp._id || emp.empId}>
                      <td>
                        <div className="paces-lead-row">
                          <div
                            className="paces-lead-avatar"
                            style={{ background: getAvatarColor(emp.name) }}
                          >
                            {(emp.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="paces-td-name">
                              {emp.name}{" "}
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "2px 6px",
                                  borderRadius: "6px",
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  marginLeft: "4px",
                                }}
                              >
                                {emp.empId}
                              </span>
                            </div>
                            <div className="paces-td-sub">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#334155" }}>{emp.department}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{emp.designation}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: isConfirmed ? "#ecfdf5" : "#fffbeb",
                            color: isConfirmed ? "#059669" : "#d97706",
                            border: `1px solid ${isConfirmed ? "#a7f3d0" : "#fde68a"}`,
                          }}
                        >
                          {isConfirmed ? "✅ Confirmed" : "⏳ Pending"}
                        </span>
                      </td>
                      <td>
                        {hasPunched ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#059669",
                              }}
                            >
                              🟢 In: {todayRec.clockIn}
                            </span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              {todayRec.clockOut
                                ? `Out: ${todayRec.clockOut} (${todayRec.totalHours})`
                                : "Currently Working"}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
                            ⚪ Not punched in today
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>
                          🌴 {emp.leaveBalance?.casual || 12} Casual • {emp.leaveBalance?.sick || 8} Sick
                        </span>
                      </td>
                      <td>
                        <Link
                          to="/admin/employees"
                          className="paces-btn paces-btn-outline paces-btn-sm"
                          style={{ fontSize: "12px", padding: "4px 10px" }}
                        >
                          View in Table →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={pagEmp.page}
        pageCount={pagEmp.totalPages}
        total={pagEmp.total}
        onPage={pagEmp.go}
      />

      {/* Recent Contact Inquiries */}
      <div className="paces-card">
        <div className="paces-card-header">
          <div>
            <div className="paces-card-title">Recent Contact Inquiries</div>
            <div className="paces-card-subtitle">Latest form submissions from website visitors</div>
          </div>
          <Link to="/admin/inquiries" className="paces-btn paces-btn-outline paces-btn-sm">
            View All Inquiries ({stats.totalInquiries}) →
          </Link>
        </div>

        {loading ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading inquiries…</div>
          </div>
        ) : recentInquiries.length === 0 ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">📭</div>
            <div className="paces-empty-text">No inquiries yet</div>
            <div className="paces-empty-sub">Contact form submissions will appear here</div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Service</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.slice(0, 5).map((inq) => (
                  <tr key={inq._id}>
                    <td>
                      <div className="paces-lead-row">
                        <div
                          className="paces-lead-avatar"
                          style={{ background: getAvatarColor(inq.name) }}
                        >
                          {(inq.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="paces-td-name">{inq.name}</div>
                          <div className="paces-td-sub">{inq.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#475569", fontWeight: 500 }}>{inq.service}</td>
                    <td style={{ width: 220, maxWidth: 220 }}>
                      <div
                        style={{
                          width: 220,
                          maxWidth: 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "#64748b",
                        }}
                        title={inq.message}
                      >
                        {inq.message}
                      </div>
                    </td>
                    <td style={{ color: "#64748b", fontSize: 12 }}>
                      {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span className={`paces-badge ${badgeClass(inq.status)}`}>
                        {inq.status || "New"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
