import React, { useEffect, useState } from "react";
import "./admin-styles.css";

const DEPT_COLORS = {
  Engineering: "#eff6ff",
  Design: "#fdf4ff",
  Marketing: "#fff7ed",
  Sales: "#ecfdf5",
};

export function AdminCareers() {
  const [activeTab, setActiveTab] = useState("jobs"); // 'jobs' or 'applications'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded Row IDs (for inline dropdown accordion in tables)
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);

  // Job Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    dept: "Engineering",
    location: "Coimbatore",
    type: "Full-time",
    salary: "₹3L – ₹6L / year",
    excerpt: "",
    responsibilities: "",
    requirements: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const [jRes, aRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/applications", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (jRes.ok) setJobs(await jRes.json());
      if (aRes.ok) setApplications(await aRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      dept: "Engineering",
      location: "Coimbatore",
      type: "Full-time",
      salary: "₹3L – ₹6L / year",
      excerpt: "",
      responsibilities: "",
      requirements: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (j) => {
    setEditingJob(j);
    setFormData({
      title: j.title || "",
      dept: j.dept || "Engineering",
      location: j.location || "Coimbatore",
      type: j.type || "Full-time",
      salary: j.salary || "",
      excerpt: j.excerpt || "",
      responsibilities: Array.isArray(j.responsibilities)
        ? j.responsibilities.join("\n")
        : j.responsibilities || "",
      requirements: Array.isArray(j.requirements)
        ? j.requirements.join("\n")
        : j.requirements || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.title.trim()) return setFormError("Job title is required.");
    if (!formData.salary.trim()) return setFormError("Salary range is required.");
    if (!formData.excerpt.trim()) return setFormError("Short summary excerpt is required.");

    const token = localStorage.getItem("nex_admin_token");
    const ep = editingJob ? `/api/jobs/${editingJob._id || editingJob.id}` : "/api/jobs";
    const method = editingJob ? "PUT" : "POST";

    try {
      const res = await fetch(ep, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          responsibilities: formData.responsibilities.split("\n").filter((s) => s.trim()),
          requirements: formData.requirements.split("\n").filter((s) => s.trim()),
        }),
      });
      if (!res.ok) throw new Error("Failed to save job.");
      setSuccessMsg(editingJob ? "Job updated successfully!" : "New job posted successfully!");
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setFormError(err.message || "An error occurred.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Application handlers
  const handleUpdateAppStatus = async (id, newStatus) => {
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApp = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate application?")) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // PDF Viewer / Downloader
  const downloadResumePdf = (app) => {
    if (!app.resumeData) {
      alert("No uploaded resume PDF data found for this applicant.");
      return;
    }
    const link = document.createElement("a");
    link.href = app.resumeData;
    link.download = app.resumeFileName || `${app.name.replace(/\s+/g, "_")}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openResumePdfInNewTab = (app) => {
    if (!app.resumeData) {
      alert("No uploaded resume PDF data found for this applicant.");
      return;
    }
    const pdfWindow = window.open("");
    if (pdfWindow) {
      pdfWindow.document.write(
        `<iframe width='100%' height='100%' src='${app.resumeData}' style='border:none; position:fixed; top:0; left:0; width:100vw; height:100vh;'></iframe>`
      );
      pdfWindow.document.title = `${app.name} - Resume.pdf`;
    } else {
      downloadResumePdf(app);
    }
  };

  const update = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const appBadgeClass = (status) =>
    status === "New"
      ? "badge-coral"
      : status === "Shortlisted"
      ? "badge-teal"
      : status === "Reviewed"
      ? "badge-blue"
      : "badge-gray";

  return (
    <div>
      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Careers &amp; Recruitment</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Management <span>›</span> Careers &amp; Applications
          </div>
        </div>
        {activeTab === "jobs" && (
          <button onClick={openAdd} className="paces-btn paces-btn-coral">
            + Post New Job
          </button>
        )}
      </div>

      {/* Success Alert */}
      {successMsg && <div className="paces-alert paces-alert-success">{successMsg}</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { key: "jobs", label: "Job Listings", count: jobs.length },
          { key: "applications", label: "Candidate Applications", count: applications.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`paces-btn ${activeTab === t.key ? "paces-btn-coral" : "paces-btn-outline"}`}
          >
            {t.label}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: activeTab === t.key ? "rgba(255,255,255,0.25)" : "var(--p-card-border)",
                color: activeTab === t.key ? "#fff" : "var(--p-text-body)",
                borderRadius: "999px",
                minWidth: 20,
                height: 20,
                fontSize: 11,
                fontWeight: 700,
                padding: "0 6px",
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── 1. Jobs Table Tab ─────────────────────────────── */}
      {activeTab === "jobs" && (
        <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="paces-empty">
              <div className="paces-empty-icon">⏳</div>
              <div className="paces-empty-text">Loading open roles…</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="paces-empty">
              <div className="paces-empty-icon">📋</div>
              <div className="paces-empty-text">No jobs posted yet</div>
              <div className="paces-empty-sub">Click "Post New Job" to create your first listing</div>
              <button onClick={openAdd} className="paces-btn paces-btn-coral" style={{ marginTop: 16 }}>
                + Post New Job
              </button>
            </div>
          ) : (
            <div className="paces-table-wrap">
              <table className="paces-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Salary Range</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right", paddingRight: 24 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => {
                    const jobId = j._id || j.id || j.slug;
                    const isExpanded = expandedJobId === jobId;
                    return (
                      <React.Fragment key={jobId}>
                        <tr>
                          <td>
                            <div className="paces-td-name">{j.title}</div>
                            <div className="paces-td-sub">{j.type}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background: DEPT_COLORS[j.dept] || "var(--p-table-th-bg)",
                                padding: "3px 10px",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--p-text-dark)",
                              }}
                            >
                              {j.dept}
                            </span>
                          </td>
                          <td style={{ color: "var(--p-text-body)" }}>📍 {j.location}</td>
                          <td style={{ fontWeight: 700, color: "var(--p-text-dark)", fontSize: 13 }}>
                            {j.salary}
                          </td>
                          <td>
                            <span className={`paces-badge ${j.active !== false ? "badge-teal" : "badge-orange"}`}>
                              {j.active !== false ? "Active" : "Paused"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", paddingRight: 20 }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setExpandedJobId(isExpanded ? null : jobId)}
                                className={`paces-btn paces-btn-sm ${isExpanded ? "paces-btn-coral" : "paces-btn-outline"}`}
                                title="Toggle details dropdown"
                              >
                                {isExpanded ? "Hide Details ▴" : "View Details ▾"}
                              </button>
                              <button
                                onClick={() => openEdit(j)}
                                className="paces-btn paces-btn-outline paces-btn-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(jobId)}
                                className="paces-btn paces-btn-danger paces-btn-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Dropdown Accordion for Job Details */}
                        {isExpanded && (
                          <tr style={{ background: "var(--p-table-hover)" }}>
                            <td colSpan="6" style={{ padding: "20px 24px", borderBottom: "2px solid var(--p-coral-light)" }}>
                              <div style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-card-border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--p-shadow-sm)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid var(--p-card-border)", paddingBottom: "12px" }}>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--p-text-dark)" }}>
                                      {j.title} <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--p-text-muted)" }}>({j.dept} · {j.location} · {j.type})</span>
                                    </h4>
                                    <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "var(--p-text-muted)", lineHeight: 1.5 }}>
                                      {j.excerpt}
                                    </p>
                                  </div>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button onClick={() => openEdit(j)} className="paces-btn paces-btn-coral paces-btn-sm">
                                      ✏️ Edit Posting
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                  <div>
                                    <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-coral)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                                      Key Responsibilities
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--p-text-body)", lineHeight: 1.7 }}>
                                      {(Array.isArray(j.responsibilities) ? j.responsibilities : [j.responsibilities]).filter(Boolean).map((r, ri) => (
                                        <li key={ri}>{r}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-teal)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                                      Requirements &amp; Skills
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--p-text-body)", lineHeight: 1.7 }}>
                                      {(Array.isArray(j.requirements) ? j.requirements : [j.requirements]).filter(Boolean).map((req, reqi) => (
                                        <li key={reqi}>{req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Candidate Applications Table Tab ───────────── */}
      {activeTab === "applications" && (
        <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
          {applications.length === 0 ? (
            <div className="paces-empty">
              <div className="paces-empty-icon">📄</div>
              <div className="paces-empty-text">No applications received yet</div>
              <div className="paces-empty-sub">
                Candidate submissions from <code>/careers/apply</code> or <code>/careers/:slug/apply</code> will appear here in real-time.
              </div>
            </div>
          ) : (
            <div className="paces-table-wrap">
              <table className="paces-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Applying For</th>
                    <th>Contact Info</th>
                    <th>Experience</th>
                    <th>Resume (PDF)</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right", paddingRight: 24 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const isExpanded = expandedAppId === app._id;
                    return (
                      <React.Fragment key={app._id}>
                        <tr>
                          <td>
                            <div className="paces-td-name">{app.name}</div>
                            <div className="paces-td-sub">
                              Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                background: "var(--p-coral-light)",
                                color: "var(--p-coral)",
                                padding: "3px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              {app.jobTitle}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: 13, color: "var(--p-text-dark)", fontWeight: 600 }}>{app.email}</div>
                            <div className="paces-td-sub">{app.phone}</div>
                          </td>
                          <td style={{ color: "var(--p-text-body)", fontSize: "13px" }}>{app.experience || "N/A"}</td>
                          <td>
                            {app.resumeData || app.resumeFileName ? (
                              <div style={{ display: "flex", gap: 4 }}>
                                <button
                                  onClick={() => downloadResumePdf(app)}
                                  className="paces-btn paces-btn-outline paces-btn-sm"
                                  title="Click to Download PDF"
                                  style={{ gap: 4 }}
                                >
                                  <span>⬇️</span> Download PDF
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--p-text-faint)" }}>No PDF</span>
                            )}
                          </td>
                          <td>
                            <select
                              className="paces-select"
                              style={{ width: "auto", minWidth: 120, fontSize: 12, padding: "5px 28px 5px 10px" }}
                              value={app.status || "New"}
                              onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                            >
                              <option value="New">New</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td style={{ textAlign: "right", paddingRight: 20 }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                                className={`paces-btn paces-btn-sm ${isExpanded ? "paces-btn-coral" : "paces-btn-outline"}`}
                                title="Toggle details and resume preview dropdown"
                              >
                                {isExpanded ? "Hide Details ▴" : "View Details ▾"}
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app._id)}
                                className="paces-btn paces-btn-danger paces-btn-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Dropdown Accordion for Candidate Details & PDF Preview */}
                        {isExpanded && (
                          <tr style={{ background: "var(--p-table-hover)" }}>
                            <td colSpan="7" style={{ padding: "20px 24px", borderBottom: "2px solid var(--p-coral-light)" }}>
                              <div
                                style={{
                                  background: "var(--p-card-bg)",
                                  border: "1px solid var(--p-card-border)",
                                  borderRadius: "14px",
                                  padding: "24px",
                                  boxShadow: "var(--p-shadow-md)",
                                }}
                              >
                                {/* Header Summary */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingBottom: "16px",
                                    marginBottom: "18px",
                                    borderBottom: "1px solid var(--p-card-border)",
                                    flexWrap: "wrap",
                                    gap: "12px",
                                  }}
                                >
                                  <div>
                                    <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--p-text-dark)" }}>
                                      {app.name}{" "}
                                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-coral)" }}>
                                        · Applied for {app.jobTitle}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: "12.5px", color: "var(--p-text-muted)", marginTop: "4px" }}>
                                      📧 {app.email} &nbsp;·&nbsp; 📞 {app.phone} &nbsp;·&nbsp; 📅 Received: {new Date(app.createdAt).toLocaleString("en-IN")}
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span className={`paces-badge ${appBadgeClass(app.status || "New")}`}>
                                      {app.status || "New"}
                                    </span>
                                    <select
                                      className="paces-select"
                                      style={{ width: "auto", fontSize: 12, padding: "6px 28px 6px 10px" }}
                                      value={app.status || "New"}
                                      onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                                    >
                                      <option value="New">Set: New</option>
                                      <option value="Reviewed">Set: Reviewed</option>
                                      <option value="Shortlisted">Set: Shortlisted</option>
                                      <option value="Rejected">Set: Rejected</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Details Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                                  <div style={{ background: "var(--p-table-th-bg)", padding: "14px", borderRadius: "10px", border: "1px solid var(--p-card-border)" }}>
                                    <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-text-faint)", marginBottom: "4px" }}>
                                      Experience Level
                                    </div>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--p-text-dark)" }}>
                                      {app.experience || "Not specified"}
                                    </div>
                                  </div>

                                  {app.portfolioUrl && (
                                    <div style={{ background: "var(--p-table-th-bg)", padding: "14px", borderRadius: "10px", border: "1px solid var(--p-card-border)" }}>
                                      <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-text-faint)", marginBottom: "4px" }}>
                                        Portfolio / GitHub URL
                                      </div>
                                      <a
                                        href={app.portfolioUrl.startsWith("http") ? app.portfolioUrl : `https://${app.portfolioUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--p-blue)", textDecoration: "underline", wordBreak: "break-all" }}
                                      >
                                        {app.portfolioUrl} ↗
                                      </a>
                                    </div>
                                  )}

                                  {app.linkedinUrl && (
                                    <div style={{ background: "var(--p-table-th-bg)", padding: "14px", borderRadius: "10px", border: "1px solid var(--p-card-border)" }}>
                                      <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-text-faint)", marginBottom: "4px" }}>
                                        LinkedIn Profile
                                      </div>
                                      <a
                                        href={app.linkedinUrl.startsWith("http") ? app.linkedinUrl : `https://${app.linkedinUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--p-blue)", textDecoration: "underline", wordBreak: "break-all" }}
                                      >
                                        {app.linkedinUrl} ↗
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {/* Candidate Cover Note */}
                                {app.coverLetter && (
                                  <div style={{ marginBottom: "20px" }}>
                                    <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-text-faint)", marginBottom: "6px" }}>
                                      Candidate Cover Note / Pitch
                                    </div>
                                    <div
                                      style={{
                                        background: "var(--p-table-th-bg)",
                                        border: "1px solid var(--p-card-border)",
                                        padding: "14px 18px",
                                        borderRadius: "10px",
                                        fontSize: "13.5px",
                                        lineHeight: "1.7",
                                        whiteSpace: "pre-wrap",
                                        color: "var(--p-text-dark)",
                                      }}
                                    >
                                      {app.coverLetter}
                                    </div>
                                  </div>
                                )}

                                {/* PDF Resume Section */}
                                <div style={{ borderTop: "1px solid var(--p-card-border)", paddingTop: "18px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                                    <div>
                                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--p-text-dark)" }}>
                                        📄 Attached Resume ({app.resumeFileName || "Resume.pdf"})
                                      </div>
                                      <div style={{ fontSize: "11.5px", color: "var(--p-text-muted)" }}>
                                        File size: {app.resumeSize || "PDF Document"}
                                      </div>
                                    </div>

                                    {app.resumeData && (
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                          onClick={() => downloadResumePdf(app)}
                                          className="paces-btn paces-btn-coral paces-btn-sm"
                                        >
                                          ⬇️ Download PDF
                                        </button>
                                        <button
                                          onClick={() => openResumePdfInNewTab(app)}
                                          className="paces-btn paces-btn-outline paces-btn-sm"
                                        >
                                          ↗ Open Full View
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Embedded PDF iframe preview inside the table dropdown */}
                                  {app.resumeData ? (
                                    <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--p-card-border)", background: "#ffffff", height: "360px" }}>
                                      <iframe
                                        src={app.resumeData}
                                        title={`${app.name} Resume`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: "none" }}
                                      />
                                    </div>
                                  ) : (
                                    <div style={{ padding: "16px", background: "var(--p-table-th-bg)", borderRadius: "10px", textAlign: "center", color: "var(--p-text-faint)", fontSize: "13px" }}>
                                      No embedded PDF preview available.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Job Modal */}
      {showModal && (
        <div
          className="paces-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="paces-modal" style={{ maxWidth: 580 }}>
            <div className="paces-modal-header">
              <div className="paces-modal-title">
                {editingJob ? "Edit Job Posting" : "Post New Job Opening"}
              </div>
              <button className="paces-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {formError && <div className="paces-alert paces-alert-error">{formError}</div>}

            <form onSubmit={handleSave}>
              <div className="paces-form-group">
                <label className="paces-label">Job Title *</label>
                <input
                  type="text"
                  className="paces-input"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Department *</label>
                  <select
                    className="paces-select"
                    value={formData.dept}
                    onChange={(e) => update("dept", e.target.value)}
                  >
                    {["Engineering", "Design", "Marketing", "Sales"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">Location *</label>
                  <input
                    type="text"
                    className="paces-input"
                    placeholder="Coimbatore / Remote"
                    value={formData.location}
                    onChange={(e) => update("location", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Job Type</label>
                  <select
                    className="paces-select"
                    value={formData.type}
                    onChange={(e) => update("type", e.target.value)}
                  >
                    {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">Salary Range *</label>
                  <input
                    type="text"
                    className="paces-input"
                    placeholder="₹4L – ₹8L / year"
                    value={formData.salary}
                    onChange={(e) => update("salary", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Short Summary *</label>
                <textarea
                  className="paces-textarea"
                  rows={3}
                  placeholder="Brief overview of the role…"
                  value={formData.excerpt}
                  onChange={(e) => update("excerpt", e.target.value)}
                  required
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Responsibilities (one per line)</label>
                <textarea
                  className="paces-textarea"
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => update("responsibilities", e.target.value)}
                />
              </div>

              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Requirements (one per line)</label>
                <textarea
                  className="paces-textarea"
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => update("requirements", e.target.value)}
                />
              </div>

              <div className="paces-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="paces-btn paces-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="paces-btn paces-btn-coral">
                  {editingJob ? "Save Changes" : "Post Job Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
