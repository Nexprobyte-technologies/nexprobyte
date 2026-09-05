import React, { useState, useEffect } from "react";
import "../admin-styles.css";

export function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [user, setUser] = useState(null);
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
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAttendance(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRec = attendance.find((a) => a.date === todayStr);

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
        setAttendance([data, ...attendance.filter((a) => a.date !== data.date)]);
        showToastMsg(`🟢 Clocked in at ${data.clockIn}! Status: ${data.status}`);
      } else {
        alert(data.message || "Failed to clock in");
      }
    } catch (err) {
      alert("Error clocking in");
    } finally {
      setClockLoading(false);
    }
  };

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
        setAttendance(attendance.map((a) => (a.date === data.date ? data : a)));
        showToastMsg(`🛑 Clocked out at ${data.clockOut}. Total: ${data.totalHours}`);
      } else {
        alert(data.message || "Failed to clock out");
      }
    } catch (err) {
      alert("Error clocking out");
    } finally {
      setClockLoading(false);
    }
  };

  const totalPresent = attendance.filter((a) => a.status === "Present").length;
  const totalLate = attendance.filter((a) => a.status === "Late").length;

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

      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">⏱️ My Attendance &amp; Time Log</div>
          <div className="paces-breadcrumb">
            Employee Portal <span>›</span> Time Tracking <span>›</span> Attendance Logs
          </div>
        </div>
        <button className="paces-btn paces-btn-outline" onClick={fetchAttendance}>
          ↻ &nbsp;Refresh Logs
        </button>
      </div>

      {/* Punch Action Card */}
      <div
        className="paces-card"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
          padding: "24px",
          marginBottom: "24px",
          border: "1px solid #cbd5e1",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
              TODAY'S DATE: {todayStr}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {user?.name || "Employee"} (ID: {user?.empId || "NEX-101"})
            </div>
            <div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>
              Standard Shift: <strong>09:00 AM – 06:00 PM</strong> (Grace period until 09:30 AM)
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {(!todayRec || !todayRec.clockIn) ? (
              /* State 1: Punch In */
              <button
                onClick={handleClockIn}
                disabled={clockLoading}
                className="paces-btn paces-btn-coral"
                style={{
                  padding: "12px 26px",
                  fontSize: "14px",
                  fontWeight: 700,
                  background: "#10b981",
                  borderColor: "#10b981",
                }}
              >
                {clockLoading ? "Clocking In..." : "🟢 Punch In (Start Day)"}
              </button>
            ) : !todayRec.clockOut ? (
              /* State 2: NEXT ONLY Punch Out is shown! */
              <button
                onClick={handleClockOut}
                disabled={clockLoading}
                className="paces-btn paces-btn-coral"
                style={{
                  padding: "12px 26px",
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  ✓ Shift Finished (In: {todayRec.clockIn} | Out: {todayRec.clockOut} • {todayRec.totalHours})
                </div>
                <button
                  onClick={handleClockIn}
                  disabled={clockLoading}
                  className="paces-btn paces-btn-outline paces-btn-sm"
                  style={{ padding: "8px 14px", fontWeight: 600 }}
                  title="Punch in again if needed"
                >
                  ↻ Punch In Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="paces-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Total Days Logged</div>
          <div className="paces-stat-value">{attendance.length}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Lifetime records</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">On-Time / Present</div>
          <div className="paces-stat-value" style={{ color: "#10b981" }}>
            {totalPresent}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Good standing</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Late Check-ins</div>
          <div className="paces-stat-value" style={{ color: "#f59e0b" }}>
            {totalLate}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">After 09:30 AM</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Today's Status</div>
          <div
            className="paces-stat-value"
            style={{
              fontSize: "20px",
              color: todayRec ? (todayRec.status === "Present" ? "#10b981" : "#f59e0b") : "#dc2626",
            }}
          >
            {todayRec ? todayRec.status : "Not Clocked"}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">{todayRec?.clockIn || "Waiting"}</span>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--p-card-border)",
            fontWeight: 800,
            fontSize: "15px",
            color: "var(--p-text-dark)",
          }}
        >
          Attendance Records History ({attendance.length})
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--p-text-muted)" }}>
            Loading attendance records...
          </div>
        ) : attendance.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--p-text-muted)" }}>
            No attendance entries yet. Clock in to start your log!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="paces-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--p-card-border)", textAlign: "left" }}>
                  <th style={{ padding: "12px 20px" }}>Date</th>
                  <th style={{ padding: "12px 20px" }}>Clock In</th>
                  <th style={{ padding: "12px 20px" }}>Clock Out</th>
                  <th style={{ padding: "12px 20px" }}>Total Duration</th>
                  <th style={{ padding: "12px 20px" }}>Status</th>
                  <th style={{ padding: "12px 20px" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--p-card-border)" }}>
                    <td style={{ padding: "12px 20px", fontWeight: 700, color: "var(--p-text-dark)" }}>
                      {rec.date}
                    </td>
                    <td style={{ padding: "12px 20px", color: "var(--p-text-dark)" }}>
                      {rec.clockIn || "—"}
                    </td>
                    <td style={{ padding: "12px 20px", color: "var(--p-text-dark)" }}>
                      {rec.clockOut || (rec.date === todayStr ? "Working..." : "—")}
                    </td>
                    <td style={{ padding: "12px 20px", fontWeight: 600 }}>{rec.totalHours}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: rec.status === "Present" ? "#ecfdf5" : "#fffbeb",
                          color: rec.status === "Present" ? "#059669" : "#d97706",
                          border: `1px solid ${rec.status === "Present" ? "#a7f3d0" : "#fde68a"}`,
                        }}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "12px", color: "var(--p-text-muted)" }}>
                      {rec.notes || "Standard office entry"}
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

export default EmployeeAttendance;
