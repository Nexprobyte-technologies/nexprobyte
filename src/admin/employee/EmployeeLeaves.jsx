import React, { useState, useEffect } from "react";
import "../admin-styles.css";

export function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    leaveType: "Casual Leave",
    fromDate: "",
    toDate: "",
    days: 1,
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
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
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLeaves(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) return;

    setSubmitting(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const created = await res.json();
        setLeaves([created, ...leaves]);
        setShowApplyModal(false);
        setForm({
          leaveType: "Casual Leave",
          fromDate: "",
          toDate: "",
          days: 1,
          reason: "",
        });
        showToastMsg("🌴 Leave request submitted for Super Admin review!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to apply for leave");
      }
    } catch (err) {
      alert("Error submitting leave request");
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">🌴 Leave Tracker &amp; Requests</div>
          <div className="paces-breadcrumb">
            Employee Portal <span>›</span> Time Off <span>›</span> Leave Applications
          </div>
        </div>
        <button className="paces-btn paces-btn-coral" onClick={() => setShowApplyModal(true)}>
          + &nbsp;Apply For Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="paces-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Casual Leaves Available</div>
          <div className="paces-stat-value" style={{ color: "#059669" }}>
            {leaveBalance.casual} Days
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Remaining for 2026</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Sick Leaves Available</div>
          <div className="paces-stat-value" style={{ color: "#2563eb" }}>
            {leaveBalance.sick} Days
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Medical allowance</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Paid / Privilege Leaves</div>
          <div className="paces-stat-value" style={{ color: "#ea580c" }}>
            {leaveBalance.paid} Days
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Earned annual leaves</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Pending Requests</div>
          <div className="paces-stat-value" style={{ color: "#f59e0b" }}>
            {leaves.filter((l) => l.status === "Pending").length}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Awaiting Super Admin approval</span>
          </div>
        </div>
      </div>

      {/* Leave Applications History */}
      <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--p-card-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--p-text-dark)" }}>
            Leave Applications History ({leaves.length})
          </div>
          <button className="paces-btn paces-btn-outline paces-btn-sm" onClick={fetchLeaves}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--p-text-muted)" }}>
            Loading leave requests...
          </div>
        ) : leaves.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--p-text-muted)" }}>
            No leave applications submitted yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="paces-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--p-card-border)", textAlign: "left" }}>
                  <th style={{ padding: "12px 20px" }}>Leave Type</th>
                  <th style={{ padding: "12px 20px" }}>Duration</th>
                  <th style={{ padding: "12px 20px" }}>Days</th>
                  <th style={{ padding: "12px 20px" }}>Reason</th>
                  <th style={{ padding: "12px 20px" }}>Status</th>
                  <th style={{ padding: "12px 20px" }}>Admin Feedback</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((lv, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--p-card-border)" }}>
                    <td style={{ padding: "12px 20px", fontWeight: 700, color: "var(--p-text-dark)" }}>
                      {lv.leaveType}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "var(--p-text-dark)" }}>
                      {lv.fromDate} ➔ {lv.toDate}
                    </td>
                    <td style={{ padding: "12px 20px", fontWeight: 600 }}>{lv.days} day(s)</td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "var(--p-text-dark)", maxWidth: "250px" }}>
                      {lv.reason}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "10px",
                          background:
                            lv.status === "Approved"
                              ? "#ecfdf5"
                              : lv.status === "Rejected"
                              ? "#fef2f2"
                              : "#fffbeb",
                          color:
                            lv.status === "Approved"
                              ? "#059669"
                              : lv.status === "Rejected"
                              ? "#dc2626"
                              : "#d97706",
                          border:
                            lv.status === "Approved"
                              ? "1px solid #a7f3d0"
                              : lv.status === "Rejected"
                              ? "1px solid #fca5a5"
                              : "1px solid #fde68a",
                        }}
                      >
                        {lv.status === "Pending" ? "⏳ Pending" : lv.status === "Approved" ? "✅ Approved" : "❌ Rejected"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "12px", color: "var(--p-text-muted)" }}>
                      {lv.adminRemark || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── APPLY LEAVE MODAL ── */}
      {showApplyModal && (
        <div
          className="paces-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowApplyModal(false)}
        >
          <div className="paces-modal" style={{ maxWidth: 500 }}>
            <div className="paces-modal-header">
              <div className="paces-modal-title">🌴 Apply for Leave</div>
              <button className="paces-modal-close" onClick={() => setShowApplyModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleApply}>
              <div className="paces-form-group">
                <label className="paces-label">Leave Category</label>
                <select
                  className="paces-input"
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                >
                  <option value="Casual Leave">Casual Leave (Balance: {leaveBalance.casual})</option>
                  <option value="Sick Leave">Sick Leave (Balance: {leaveBalance.sick})</option>
                  <option value="Paid Leave">Paid Leave (Balance: {leaveBalance.paid})</option>
                  <option value="Unpaid Leave">Unpaid / Emergency Leave</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="paces-form-group">
                  <label className="paces-label">From Date *</label>
                  <input
                    type="date"
                    className="paces-input"
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    required
                  />
                </div>

                <div className="paces-form-group">
                  <label className="paces-label">To Date *</label>
                  <input
                    type="date"
                    className="paces-input"
                    value={form.toDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Number of Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="paces-input"
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                  required
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Reason for Absence *</label>
                <textarea
                  className="paces-input"
                  rows={3}
                  placeholder="Explain reason for leave..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                />
              </div>

              <div className="paces-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="paces-btn paces-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="paces-btn paces-btn-coral" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Leave Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
