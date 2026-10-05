import React, { useState, useEffect } from "react";
import "../admin-styles.css";

export function EmployeeWorkStatus() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    projectTitle: "",
    hoursSpent: 8,
    status: "Completed",
    taskDetails: "",
    blockers: "",
    link: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const resetFormData = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      projectTitle: "",
      hoursSpent: 8,
      status: "Completed",
      taskDetails: "",
      blockers: "",
      link: "",
    });
    setEditingId(null);
  };

  const showToastMsg = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/work-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectTitle || !formData.taskDetails) return;

    setSubmitting(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const url = editingId ? `/api/work-reports/${editingId}` : "/api/work-reports";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingId) {
          setReports(reports.map((r) => (r._id === editingId ? { ...r, ...saved } : r)));
        } else {
          setReports([saved, ...reports]);
        }
        setShowUploadForm(false);
        resetFormData();
        showToastMsg(editingId ? "💾 Work report saved successfully!" : "✅ Daily work status report uploaded successfully!");
      } else {
        let message = res.status === 404 ? "Save endpoint not found (server may need a restart)." : `Failed to save report (${res.status})`;
        try {
          const data = await res.json();
          if (data && data.message) message = data.message;
        } catch (_) {
          /* response body was not JSON */
        }
        alert(message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving work report. Please check that the server is running and reload the page.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (report) => {
    setFormData({
      date: report.date || new Date().toISOString().split("T")[0],
      projectTitle: report.projectTitle || "",
      hoursSpent: report.hoursSpent || 8,
      status: report.status || "Completed",
      taskDetails: report.taskDetails || "",
      blockers: report.blockers && report.blockers !== "None" ? report.blockers : "",
      link: report.link || "",
    });
    setEditingId(report._id);
    setShowUploadForm(true);
    document.querySelector(".daily-report-form-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeForm = () => {
    setShowUploadForm(false);
    resetFormData();
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Delete the work report "${report.projectTitle}"?`)) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/work-reports/${report._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReports(reports.filter((r) => r._id !== report._id));
        showToastMsg("🗑️ Work report deleted successfully!");
      } else {
        let message = res.status === 404 ? "Delete endpoint not found (server may need a restart)." : `Failed to delete report (${res.status})`;
        try {
          const data = await res.json();
          if (data && data.message) message = data.message;
        } catch (_) {
          /* response body was not JSON */
        }
        alert(message);
      }
    } catch (err) {
      alert("Error deleting work report. Please check that the server is running.");
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.projectTitle?.toLowerCase().includes(search.toLowerCase()) ||
      r.taskDetails?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalHours = reports.reduce((acc, curr) => acc + (Number(curr.hoursSpent) || 0), 0);

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
          <div className="paces-page-title">📝 Daily Work Status Uploads</div>
          <div className="paces-breadcrumb">
            Employee Portal <span>›</span> Daily Reports <span>›</span> Work Submissions
          </div>
        </div>
<button
          className="paces-btn paces-btn-coral"
          onClick={() => {
            if (showUploadForm) resetFormData();
            setShowUploadForm(!showUploadForm);
          }}
        >
          {showUploadForm ? "✕ Close Form" : "+ Upload Today's Work Report"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="paces-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Total Submissions</div>
          <div className="paces-stat-value">{reports.length}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Daily verified</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Total Logged Hours</div>
          <div className="paces-stat-value" style={{ color: "#3b82f6" }}>
            {totalHours} hrs
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Across all tasks</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Completed Deliverables</div>
          <div className="paces-stat-value" style={{ color: "#10b981" }}>
            {reports.filter((r) => r.status === "Completed").length}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">High productivity</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">In Progress / Review</div>
          <div className="paces-stat-value" style={{ color: "#f59e0b" }}>
            {reports.filter((r) => r.status !== "Completed").length}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Active sprints</span>
          </div>
        </div>
      </div>

      {/* Upload Form Card (Collapsible or visible) */}
      {showUploadForm && (
<div
          className="paces-card daily-report-form-anchor"
          style={{
            marginBottom: "24px",
            border: "2px solid #ff4d6d",
            background: "linear-gradient(to bottom, #fff, #fffbfb)",
          }}
        >
          <div className="paces-card-header">
            <div>
              <div className="paces-card-title">
                {editingId ? "✏️ Edit Daily Work Status" : "📤 Upload New Daily Work Status"}
              </div>
              <div className="paces-card-subtitle">
                {editingId
                  ? "Update the details below and save your changes for team &amp; Super Admin review"
                  : "Submit today's task details, time spent and reference links for team &amp; Super Admin review"}
              </div>
            </div>
            {editingId && (
              <button
                type="button"
                className="paces-btn paces-btn-outline"
                onClick={closeForm}
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div className="paces-form-group">
                <label className="paces-label">Date *</label>
                <input
                  type="date"
                  className="paces-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Project / Client Title *</label>
                <input
                  type="text"
                  className="paces-input"
                  placeholder="e.g. Nexprobyte Marketing Redesign"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  required
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Hours Spent</label>
                <input
                  type="number"
                  step="0.5"
                  className="paces-input"
                  value={formData.hoursSpent}
                  onChange={(e) => setFormData({ ...formData, hoursSpent: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="paces-form-group">
                <label className="paces-label">Task Status</label>
                <select
                  className="paces-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Deliverable URL / PR Link (Optional)</label>
                <input
                  type="url"
                  className="paces-input"
                  placeholder="https://github.com/... or https://figma.com/..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
            </div>

            <div className="paces-form-group">
              <label className="paces-label">Key Deliverables &amp; Accomplishments *</label>
              <textarea
                className="paces-input"
                rows={4}
                placeholder="Bullet points or summary of what was accomplished today..."
                value={formData.taskDetails}
                onChange={(e) => setFormData({ ...formData, taskDetails: e.target.value })}
                required
              />
            </div>

            <div className="paces-form-group">
              <label className="paces-label">Blockers / Challenges Encountered (Optional)</label>
              <input
                type="text"
                className="paces-input"
                placeholder="None or describe blocker..."
                value={formData.blockers}
                onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              />
            </div>

<div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={closeForm}
                className="paces-btn paces-btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="paces-btn paces-btn-coral" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "💾 Save Changes"
                  : "✓ Submit Daily Work Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="paces-card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
          <input
            type="text"
            className="paces-input"
            placeholder="Search by project or task detail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
            🔍
          </span>
        </div>

        <select
          className="paces-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: "auto", minWidth: "160px" }}
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
        </select>
      </div>

      {/* Submissions List */}
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
          Past Daily Work Status Submissions ({filteredReports.length})
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--p-text-muted)" }}>
            Loading work reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--p-text-muted)" }}>
            No work reports found matching your criteria.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
{filteredReports.map((report, idx) => (
              <div
                key={report._id || idx}
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid var(--p-card-border)",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        background: "#f1f5f9",
                        color: "#475569",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        marginRight: "8px",
                      }}
                    >
                      📅 {report.date}
                    </span>
                    <strong style={{ fontSize: "15px", color: "var(--p-text-dark)" }}>
                      {report.projectTitle}
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--p-text-muted)", marginLeft: "8px" }}>
                      ({report.hoursSpent} Hours Logged)
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "12px",
                      background:
                        report.status === "Completed"
                          ? "#ecfdf5"
                          : report.status === "In Progress"
                          ? "#eff6ff"
                          : "#fff7ed",
                      color:
                        report.status === "Completed"
                          ? "#059669"
                          : report.status === "In Progress"
                          ? "#2563eb"
                          : "#ea580c",
                    }}
                  >
                    ● {report.status}
                  </span>
                </div>

                <p style={{ margin: "6px 0", fontSize: "13.5px", color: "var(--p-text-dark)", lineHeight: 1.5 }}>
                  {report.taskDetails}
                </p>

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginTop: "8px", gap: "10px" }}>
                  {report.blockers && report.blockers !== "None" ? (
                    <div style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                      ⚠️ Blocker: {report.blockers}
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "#10b981" }}>✓ No blockers reported</div>
                  )}

                  {report.link && (
                    <a
                      href={report.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#3b82f6",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      🔗 View Work Deliverable →
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px", borderTop: "1px dashed var(--p-card-border)", paddingTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => startEdit(report)}
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#2563eb",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(report)}
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#dc2626",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeWorkStatus;
