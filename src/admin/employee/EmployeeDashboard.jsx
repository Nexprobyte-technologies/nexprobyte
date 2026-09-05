import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../admin-styles.css";

export function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [workReports, setWorkReports] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  // Quick Daily Work Upload state
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [quickReport, setQuickReport] = useState({
    projectTitle: "",
    hoursSpent: 8,
    taskDetails: "",
    blockers: "",
    status: "Completed",
    link: "",
  });

  const [toast, setToast] = useState("");
  const showToastMsg = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    const rawUser = localStorage.getItem("nex_admin_user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {}
    }
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const [attRes, wrRes, lvRes] = await Promise.all([
        fetch("/api/attendance", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/work-reports", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/leaves", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendanceRecords(attData);
        const todayStr = new Date().toISOString().split("T")[0];
        const todayRec = attData.find((a) => a.date === todayStr);
        setTodayAttendance(todayRec || null);
      }
      if (wrRes.ok) {
        setWorkReports(await wrRes.json());
      }
      if (lvRes.ok) {
        setLeaves(await lvRes.json());
      }
    } catch (err) {
      console.error("Fetch employee dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clock In
  const handleClockIn = async () => {
    setClockLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/attendance/clockin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTodayAttendance(data);
        setAttendanceRecords([data, ...attendanceRecords.filter((a) => a.date !== data.date)]);
        showToastMsg(`🟢 Clocked in at ${data.clockIn}! Status: ${data.status}`);
      } else {
        alert(data.message || "Failed to clock in");
      }
    } catch (err) {
      alert("Error during clock-in");
    } finally {
      setClockLoading(false);
    }
  };

  // Clock Out
  const handleClockOut = async () => {
    setClockLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/attendance/clockout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTodayAttendance(data);
        setAttendanceRecords(
          attendanceRecords.map((a) => (a.date === data.date ? data : a))
        );
        showToastMsg(`🛑 Clocked out at ${data.clockOut}. Total: ${data.totalHours}`);
      } else {
        alert(data.message || "Failed to clock out");
      }
    } catch (err) {
      alert("Error during clock-out");
    } finally {
      setClockLoading(false);
    }
  };

  // Submit Quick Work Report
  const handleSubmitQuickReport = async (e) => {
    e.preventDefault();
    if (!quickReport.projectTitle || !quickReport.taskDetails) return;

    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/work-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quickReport),
      });

      if (res.ok) {
        const created = await res.json();
        setWorkReports([created, ...workReports]);
        setShowQuickReport(false);
        setQuickReport({
          projectTitle: "",
          hoursSpent: 8,
          taskDetails: "",
          blockers: "",
          status: "Completed",
          link: "",
        });
        showToastMsg("✅ Daily work status report uploaded successfully!");
      }
    } catch (err) {
      alert("Error uploading daily work report");
    }
  };

  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const empId = user?.empId || "NEX-101";
  const empName = user?.name || "Employee";
  const empDesignation = user?.designation || "Software Specialist";
  const empDept = user?.department || "Engineering";
  const leaveBalance = user?.leaveBalance || { casual: 12, sick: 8, paid: 10 };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            zIndex: 9999,
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}

      {/* ── Employee Hero Banner with Employee ID ── */}
      <div
        className="paces-card"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#fff",
          padding: "28px 32px",
          borderRadius: "20px",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  background: "#ff4d6d",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                ID: {empId}
              </span>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  color: "#e2e8f0",
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "6px",
                }}
              >
                {empDept}
              </span>
              <span
                style={{
                  background: "#10b981",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "10px",
                }}
              >
                Status 2: Employee Portal
              </span>
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 4px", color: "#fff" }}>
              Welcome back, {empName}! 👋
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
              {empDesignation} • {todayDateFormatted}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowQuickReport(true)}
              className="paces-btn paces-btn-coral"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              📝 Upload Today's Work
            </button>
            <Link
              to="/admin/leaves"
              className="paces-btn paces-btn-outline"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
            >
              🌴 Apply Leave
            </Link>
          </div>
        </div>
      </div>

      {/* ── Attendance & Status Top Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Attendance Punch Card */}
        <div className="paces-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div className="paces-card-title">⏱️ Today's Attendance</div>
                <div className="paces-card-subtitle">Punch in / punch out to log working hours</div>
              </div>
              <div>
                {todayAttendance ? (
                  <span
                    style={{
                      background: todayAttendance.status === "Present" ? "#ecfdf5" : "#fffbeb",
                      color: todayAttendance.status === "Present" ? "#059669" : "#d97706",
                      fontWeight: 800,
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      border: `1px solid ${todayAttendance.status === "Present" ? "#a7f3d0" : "#fde68a"}`,
                    }}
                  >
                    ● {todayAttendance.status}
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#fef2f2",
                      color: "#dc2626",
                      fontWeight: 700,
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    Not Clocked In Yet
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                background: "var(--p-card-border)",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", color: "var(--p-text-muted)", fontWeight: 600 }}>CLOCK IN TIME</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--p-text-dark)", marginTop: "4px" }}>
                  {todayAttendance?.clockIn || "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--p-text-muted)", fontWeight: 600 }}>CLOCK OUT TIME</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--p-text-dark)", marginTop: "4px" }}>
                  {todayAttendance?.clockOut || (todayAttendance ? "Active" : "—")}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {(!todayAttendance || !todayAttendance.clockIn) ? (
              /* State 1: Punch In */
              <button
                onClick={handleClockIn}
                disabled={clockLoading}
                className="paces-btn paces-btn-coral"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  background: "#10b981",
                  borderColor: "#10b981",
                }}
              >
                {clockLoading ? "Clocking In..." : "🟢 Punch In (Start Shift)"}
              </button>
            ) : !todayAttendance.clockOut ? (
              /* State 2: NEXT ONLY Punch Out is shown! */
              <button
                onClick={handleClockOut}
                disabled={clockLoading}
                className="paces-btn paces-btn-coral"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  background: "#ef4444",
                  borderColor: "#ef4444",
                  color: "#fff",
                }}
              >
                {clockLoading ? "Clocking Out..." : "🛑 Punch Out (End Shift)"}
              </button>
            ) : (
              /* State 3: Shift Finished */
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "#059669",
                    fontWeight: 700,
                    background: "#ecfdf5",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    flex: 1,
                    textAlign: "center",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  ✓ Shift Done (In: {todayAttendance.clockIn} | Out: {todayAttendance.clockOut})
                </div>
                <button
                  onClick={handleClockIn}
                  disabled={clockLoading}
                  className="paces-btn paces-btn-outline paces-btn-sm"
                  style={{ padding: "8px 12px", whiteSpace: "nowrap" }}
                  title="Punch in again if needed"
                >
                  ↻ Punch In Again
                </button>
              </div>
            )}
            <Link to="/admin/attendance" className="paces-btn paces-btn-outline" style={{ padding: "12px", whiteSpace: "nowrap" }}>
              Full Log →
            </Link>
          </div>
        </div>

        {/* Leave Balances Card */}
        <div className="paces-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div className="paces-card-title">🌴 Leave Balances</div>
                <div className="paces-card-subtitle">Yearly allocated paid leaves</div>
              </div>
              <Link to="/admin/leaves" className="paces-btn paces-btn-outline paces-btn-sm">
                Apply Leave
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "14px 10px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#059669" }}>{leaveBalance.casual}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", marginTop: "2px" }}>Casual</div>
              </div>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px 10px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#2563eb" }}>{leaveBalance.sick}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", marginTop: "2px" }}>Sick</div>
              </div>
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", padding: "14px 10px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#ea580c" }}>{leaveBalance.paid}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", marginTop: "2px" }}>Paid Privileged</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--p-text-muted)" }}>
            Need time off? Click <strong>Apply Leave</strong> to submit a request for Super Admin review.
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="paces-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Present Days this Month</div>
          <div className="paces-stat-value">{attendanceRecords.length}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">↗ On track</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Daily Work Reports Uploaded</div>
          <div className="paces-stat-value">{workReports.length}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">100% daily compliance</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Pending Leave Requests</div>
          <div className="paces-stat-value">
            {leaves.filter((l) => l.status === "Pending").length}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Under review</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Official Employee Code</div>
          <div className="paces-stat-value" style={{ color: "#ff4d6d" }}>{empId}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Nexprobyte Tech</span>
          </div>
        </div>
      </div>

      {/* ── Two Column Bottom: Recent Daily Work Uploads & Recent Attendance Log ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
        {/* Recent Work Status Uploads */}
        <div className="paces-card">
          <div className="paces-card-header">
            <div>
              <div className="paces-card-title">Recent Daily Work Status Uploads</div>
              <div className="paces-card-subtitle">Your latest project logs and accomplishments</div>
            </div>
            <Link to="/admin/work-status" className="paces-btn paces-btn-outline paces-btn-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--p-text-muted)" }}>
              Loading reports...
            </div>
          ) : workReports.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--p-text-muted)" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>📝</div>
              <div>No daily work reports uploaded yet.</div>
              <button
                onClick={() => setShowQuickReport(true)}
                className="paces-btn paces-btn-coral paces-btn-sm"
                style={{ marginTop: "10px" }}
              >
                + Upload Today's Status
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {workReports.slice(0, 3).map((wr, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--p-card-border)",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <strong style={{ color: "var(--p-text-dark)" }}>{wr.projectTitle}</strong>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "8px",
                        background: wr.status === "Completed" ? "#ecfdf5" : "#eff6ff",
                        color: wr.status === "Completed" ? "#059669" : "#2563eb",
                      }}
                    >
                      {wr.status}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0", color: "var(--p-text-dark)", fontSize: "12.5px" }}>
                    {wr.taskDetails}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--p-text-muted)", marginTop: "6px" }}>
                    <span>Date: {wr.date} • {wr.hoursSpent} Hours</span>
                    {wr.link && (
                      <a href={wr.link} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>
                        🔗 Deliverable Link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance History */}
        <div className="paces-card">
          <div className="paces-card-header">
            <div>
              <div className="paces-card-title">Recent Attendance</div>
              <div className="paces-card-subtitle">Punch history for this week</div>
            </div>
            <Link to="/admin/attendance" className="paces-btn paces-btn-outline paces-btn-sm">
              All Logs →
            </Link>
          </div>

          {attendanceRecords.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--p-text-muted)" }}>
              No attendance records found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {attendanceRecords.slice(0, 4).map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    borderBottom: "1px solid var(--p-card-border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--p-text-dark)" }}>
                      {a.date}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--p-text-muted)" }}>
                      In: {a.clockIn || "—"} | Out: {a.clockOut || "—"}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: a.status === "Present" ? "#ecfdf5" : "#fffbeb",
                      color: a.status === "Present" ? "#059669" : "#d97706",
                    }}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK REPORT MODAL ── */}
      {showQuickReport && (
        <div
          className="paces-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowQuickReport(false)}
        >
          <div className="paces-modal" style={{ maxWidth: 520 }}>
            <div className="paces-modal-header">
              <div className="paces-modal-title">📝 Upload Today's Work Status</div>
              <button className="paces-modal-close" onClick={() => setShowQuickReport(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuickReport}>
              <div className="paces-form-group">
                <label className="paces-label">Project / Client Name *</label>
                <input
                  type="text"
                  className="paces-input"
                  placeholder="e.g. Nexprobyte CRM Portal"
                  value={quickReport.projectTitle}
                  onChange={(e) => setQuickReport({ ...quickReport, projectTitle: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="paces-form-group">
                  <label className="paces-label">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    className="paces-input"
                    value={quickReport.hoursSpent}
                    onChange={(e) => setQuickReport({ ...quickReport, hoursSpent: e.target.value })}
                    required
                  />
                </div>

                <div className="paces-form-group">
                  <label className="paces-label">Work Status</label>
                  <select
                    className="paces-input"
                    value={quickReport.status}
                    onChange={(e) => setQuickReport({ ...quickReport, status: e.target.value })}
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Accomplishments / Deliverables Completed *</label>
                <textarea
                  className="paces-input"
                  rows={3}
                  placeholder="Summarize tasks completed today..."
                  value={quickReport.taskDetails}
                  onChange={(e) => setQuickReport({ ...quickReport, taskDetails: e.target.value })}
                  required
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Blockers or Remarks (Optional)</label>
                <input
                  type="text"
                  className="paces-input"
                  placeholder="None"
                  value={quickReport.blockers}
                  onChange={(e) => setQuickReport({ ...quickReport, blockers: e.target.value })}
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Project Link / Git PR / Figma URL (Optional)</label>
                <input
                  type="url"
                  className="paces-input"
                  placeholder="https://..."
                  value={quickReport.link}
                  onChange={(e) => setQuickReport({ ...quickReport, link: e.target.value })}
                />
              </div>

              <div className="paces-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowQuickReport(false)}
                  className="paces-btn paces-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="paces-btn paces-btn-coral">
                  Submit Work Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
