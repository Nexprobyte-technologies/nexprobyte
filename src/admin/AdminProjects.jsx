import React, { useState, useEffect } from "react";
import "./admin-styles.css";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile App",
  "AI / ML",
  "Cloud & DevOps",
  "UI/UX Design",
  "Custom Software",
  "Consulting",
];

const STATUSES = ["All", "Planning", "In Progress", "Under Review", "Completed", "On Hold"];
const PRIORITIES = ["All", "Critical", "High", "Medium", "Low"];

const AVATAR_COLORS = [
  "#ff4d6d", "#10b981", "#3b82f6", "#8b5cf6", "#f97316", "#06b6d4", "#ec4899",
];

function getAvatarColor(name = "") {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

  // Expanded row for inline view details
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    clientEmail: "",
    category: "Web Development",
    description: "",
    assignedEmployees: [], // [{ empId, name, role }]
    startDate: new Date().toISOString().split("T")[0],
    deadline: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
    budget: "",
    priority: "Medium",
    status: "In Progress",
    progress: 25,
    techStack: "",
    deliverablesUrl: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const [projRes, empRes] = await Promise.all([
        fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (projRes.ok) {
        setProjects(await projRes.json());
      }
      if (empRes.ok) {
        setEmployees(await empRes.json());
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
      showToastMsg("⚠️ Error loading projects from server.");
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedProject(null);
    setFormData({
      title: "",
      clientName: "",
      clientEmail: "",
      category: "Web Development",
      description: "",
      assignedEmployees: [],
      startDate: new Date().toISOString().split("T")[0],
      deadline: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      budget: "",
      priority: "Medium",
      status: "In Progress",
      progress: 10,
      techStack: "React, Node.js, Vite",
      deliverablesUrl: "",
      notes: "",
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (proj) => {
    setModalMode("edit");
    setSelectedProject(proj);
    setFormData({
      title: proj.title || "",
      clientName: proj.clientName || "",
      clientEmail: proj.clientEmail || "",
      category: proj.category || "Web Development",
      description: proj.description || "",
      assignedEmployees: proj.assignedEmployees || [],
      startDate: proj.startDate || new Date().toISOString().split("T")[0],
      deadline: proj.deadline || new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      budget: proj.budget || "",
      priority: proj.priority || "Medium",
      status: proj.status || "In Progress",
      progress: typeof proj.progress === "number" ? proj.progress : 0,
      techStack: Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack || "",
      deliverablesUrl: proj.deliverablesUrl || "",
      notes: proj.notes || "",
    });
    setShowModal(true);
  };

  // Submit Create or Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientName.trim()) {
      alert("Please fill in both Project Title and Client Name.");
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("nex_admin_token");

    const payload = {
      ...formData,
      techStack: formData.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        if (res.ok) {
          setProjects([created, ...projects]);
          setShowModal(false);
          showToastMsg(`🚀 Project "${created.title}" created successfully!`);
        } else {
          alert(created.message || "Failed to create project");
        }
      } else {
        const res = await fetch(`/api/projects/${selectedProject._id || selectedProject.projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        if (res.ok) {
          setProjects(
            projects.map((p) =>
              p._id === updated._id || p.projectId === updated.projectId ? updated : p
            )
          );
          setShowModal(false);
          showToastMsg(`✓ Project "${updated.title}" updated successfully!`);
        } else {
          alert(updated.message || "Failed to update project");
        }
      }
    } catch (err) {
      console.error("Save project error:", err);
      alert("Error saving project to backend.");
    } finally {
      setSaving(false);
    }
  };

  // Quick Status Change from table
  const handleQuickStatusChange = async (proj, newStatus) => {
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/projects/${proj._id || proj.projectId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          progress: newStatus === "Completed" ? 100 : proj.progress,
        }),
      });
      const updated = await res.json();
      if (res.ok) {
        setProjects(
          projects.map((p) =>
            p._id === updated._id || p.projectId === updated.projectId ? updated : p
          )
        );
        showToastMsg(`Updated ${proj.projectId} status to "${newStatus}"`);
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Delete Project
  const handleDelete = async (proj) => {
    if (!window.confirm(`Are you sure you want to delete "${proj.title}" (${proj.projectId})?`)) {
      return;
    }

    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/projects/${proj._id || proj.projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== proj._id && p.projectId !== proj.projectId));
        if (expandedProjectId === (proj._id || proj.projectId)) {
          setExpandedProjectId(null);
        }
        showToastMsg(`🗑️ Project ${proj.projectId} deleted.`);
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      alert("Error deleting project");
    }
  };

  // Toggle Employee Assignment in Modal
  const toggleEmployeeAssignment = (emp) => {
    const isAssigned = formData.assignedEmployees.some((a) => a.empId === emp.empId);
    if (isAssigned) {
      setFormData({
        ...formData,
        assignedEmployees: formData.assignedEmployees.filter((a) => a.empId !== emp.empId),
      });
    } else {
      setFormData({
        ...formData,
        assignedEmployees: [
          ...formData.assignedEmployees,
          { empId: emp.empId, name: emp.name, role: emp.designation || "Engineer" },
        ],
      });
    }
  };

  // Filtered list
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(p.techStack) ? p.techStack.join(" ") : p.techStack || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || p.status === selectedStatus;

    const matchesPriority =
      selectedPriority === "All" || p.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // KPI calculations
  const totalCount = projects.length;
  const inProgressCount = projects.filter((p) => p.status === "In Progress").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;
  const planningCount = projects.filter(
    (p) => p.status === "Planning" || p.status === "Under Review"
  ).length;

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" };
      case "High":
        return { background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa" };
      case "Medium":
        return { background: "#fef9c3", color: "#a16207", border: "1px solid #fde047" };
      case "Low":
      default:
        return { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" };
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return { background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" };
      case "In Progress":
        return { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
      case "Under Review":
        return { background: "#f3e8ff", color: "#7e22ce", border: "1px solid #e9d5ff" };
      case "Planning":
        return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
      case "On Hold":
      default:
        return { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: "#0f172a",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "14px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
            fontSize: "14px",
            fontWeight: "600",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #334155",
            animation: "slideInUp 0.3s ease",
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Project Details &amp; Deliverables</div>
          <div className="paces-breadcrumb">
            Nexprobyte <span>›</span> Super Admin <span>›</span> Projects Database
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="paces-btn paces-btn-outline" onClick={fetchInitialData}>
            ↻ &nbsp;Refresh
          </button>
          <button className="paces-btn paces-btn-coral" onClick={handleOpenCreate}>
            + &nbsp;Add New Project
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="paces-stat-card">
          <div className="paces-stat-label">🚀 Total Projects</div>
          <div className="paces-stat-value">{totalCount}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Active Contracts</span>
            <span className="paces-stat-neutral">in Database</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">⚡ In Progress</div>
          <div className="paces-stat-value" style={{ color: "#2563eb" }}>
            {inProgressCount}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Under Development</span>
            <span className="paces-stat-neutral">by Engineering Team</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">✅ Completed &amp; Delivered</div>
          <div className="paces-stat-value" style={{ color: "#16a34a" }}>
            {completedCount}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Handed Over</span>
            <span className="paces-stat-neutral">100% Progress</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">📋 Planning &amp; Review</div>
          <div className="paces-stat-value" style={{ color: "#d97706" }}>
            {planningCount}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Architecture &amp; Scoping</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div
        className="paces-card"
        style={{
          marginBottom: "20px",
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        {/* Search */}
        <div style={{ flex: "1 1 260px", position: "relative" }}>
          <input
            type="text"
            className="paces-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project name, client, tech stack, ID..."
            style={{ width: "100%", paddingLeft: "36px" }}
          />
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            🔍
          </span>
        </div>

        {/* Dropdowns */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          {/* Category Filter */}
          <select
            className="paces-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: "auto", fontSize: "13px" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="paces-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: "auto", fontSize: "13px" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="paces-input"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{ width: "auto", fontSize: "13px" }}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>

          {(searchTerm ||
            selectedCategory !== "All" ||
            selectedStatus !== "All" ||
            selectedPriority !== "All") && (
            <button
              className="paces-btn paces-btn-ghost paces-btn-sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedStatus("All");
                setSelectedPriority("All");
              }}
              style={{ fontSize: "12px" }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="paces-card">
        <div className="paces-card-header">
          <div>
            <div className="paces-card-title">All Project Records</div>
            <div className="paces-card-subtitle">
              Showing {filteredProjects.length} of {projects.length} recorded projects
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            Click &ldquo;View Details&rdquo; to expand project deliverables &amp; assignments
          </div>
        </div>

        {loading ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading projects database…</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">📁</div>
            <div className="paces-empty-text">No matching projects found</div>
            <div className="paces-empty-sub">
              Try adjusting your search query or click &ldquo;+ Add New Project&rdquo; above.
            </div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Project Code &amp; Title</th>
                  <th>Client</th>
                  <th>Assigned Team</th>
                  <th>Timeline &amp; Due Date</th>
                  <th>Progress</th>
                  <th>Priority</th>
                  <th>Project Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj) => {
                  const isExpanded =
                    expandedProjectId === (proj._id || proj.projectId);
                  const deadlinePassed =
                    new Date(proj.deadline).getTime() < Date.now() &&
                    proj.status !== "Completed";

                  return (
                    <React.Fragment key={proj._id || proj.projectId}>
                      <tr
                        style={{
                          background: isExpanded ? "#f8fafc" : "inherit",
                          transition: "background 0.2s ease",
                        }}
                      >
                        {/* Project Code & Title */}
                        <td>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                background: getAvatarColor(proj.title),
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "800",
                                fontSize: "14px",
                                flexShrink: 0,
                              }}
                            >
                              {proj.category === "Mobile App"
                                ? "📱"
                                : proj.category === "AI / ML"
                                ? "🤖"
                                : proj.category === "Cloud & DevOps"
                                ? "☁️"
                                : "💻"}
                            </div>
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "3px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    padding: "2px 6px",
                                    borderRadius: "6px",
                                    background: "#e2e8f0",
                                    color: "#334155",
                                  }}
                                >
                                  {proj.projectId}
                                </span>
                                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
                                  {proj.title}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: 500,
                                  background: "#f1f5f9",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {proj.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Client */}
                        <td>
                          <div style={{ fontWeight: 600, color: "#334155" }}>{proj.clientName}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {proj.clientEmail || "—"}
                          </div>
                        </td>

                        {/* Assigned Team */}
                        <td>
                          {proj.assignedEmployees && proj.assignedEmployees.length > 0 ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {proj.assignedEmployees.slice(0, 3).map((emp, i) => (
                                <div
                                  key={i}
                                  title={`${emp.name} (${emp.empId || ""}) - ${emp.role || ""}`}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: getAvatarColor(emp.name),
                                    color: "#fff",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid #fff",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  {(emp.name || "?")[0].toUpperCase()}
                                </div>
                              ))}
                              {proj.assignedEmployees.length > 3 && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#64748b",
                                    background: "#f1f5f9",
                                    padding: "2px 6px",
                                    borderRadius: "10px",
                                  }}
                                >
                                  +{proj.assignedEmployees.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Timeline */}
                        <td>
                          <div style={{ fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                            Due: {proj.deadline}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Started: {proj.startDate}
                          </div>
                          {deadlinePassed && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#b91c1c",
                                background: "#fee2e2",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                marginTop: "2px",
                                display: "inline-block",
                              }}
                            >
                              ⚠️ Overdue
                            </span>
                          )}
                        </td>

                        {/* Progress Bar */}
                        <td style={{ minWidth: "120px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#334155",
                              marginBottom: "4px",
                            }}
                          >
                            <span>{proj.progress || 0}%</span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "6px",
                              background: "#e2e8f0",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${proj.progress || 0}%`,
                                height: "100%",
                                background:
                                  proj.progress >= 100
                                    ? "#10b981"
                                    : proj.progress >= 60
                                    ? "#3b82f6"
                                    : "#f97316",
                                borderRadius: "4px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              ...getPriorityBadgeStyle(proj.priority),
                            }}
                          >
                            {proj.priority || "Medium"}
                          </span>
                        </td>

                        {/* Project Status Dropdown */}
                        <td>
                          <select
                            value={proj.status || "In Progress"}
                            onChange={(e) => handleQuickStatusChange(proj, e.target.value)}
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              borderRadius: "10px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              outline: "none",
                              ...getStatusBadgeStyle(proj.status),
                            }}
                          >
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "right" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedProjectId(
                                  isExpanded ? null : proj._id || proj.projectId
                                )
                              }
                              className="paces-btn paces-btn-sm"
                              style={{
                                fontSize: "12px",
                                padding: "4px 10px",
                                background: isExpanded ? "#0f172a" : "#f1f5f9",
                                color: isExpanded ? "#fff" : "#334155",
                                border: "1px solid #cbd5e1",
                              }}
                            >
                              {isExpanded ? "▲ Hide" : "▼ Details"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(proj)}
                              className="paces-btn paces-btn-outline paces-btn-sm"
                              style={{ fontSize: "12px", padding: "4px 8px" }}
                              title="Edit Project"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(proj)}
                              className="paces-btn paces-btn-ghost paces-btn-sm"
                              style={{ fontSize: "12px", padding: "4px 8px", color: "#dc2626" }}
                              title="Delete Project"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Accordion Details Row */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan="8"
                            style={{
                              background: "#f8fafc",
                              padding: "20px 24px",
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "2px solid #cbd5e1",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "20px",
                              }}
                            >
                              {/* Left Column: Scope & Description */}
                              <div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  📝 Project Scope &amp; Description
                                </div>
                                <p
                                  style={{
                                    fontSize: "13px",
                                    color: "#334155",
                                    lineHeight: "1.6",
                                    margin: "0 0 14px",
                                    background: "#fff",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  {proj.description || "No detailed description provided."}
                                </p>

                                {/* Tech Stack Badges */}
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  💻 Technology Stack
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                  {Array.isArray(proj.techStack) && proj.techStack.length > 0 ? (
                                    proj.techStack.map((tech, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          background: "#eff6ff",
                                          color: "#1e40af",
                                          border: "1px solid #bfdbfe",
                                          padding: "3px 8px",
                                          borderRadius: "6px",
                                          fontSize: "12px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {tech}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                      No tech stack specified
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Middle Column: Team Assignments */}
                              <div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  👥 Assigned Personnel ({proj.assignedEmployees?.length || 0})
                                </div>
                                {proj.assignedEmployees && proj.assignedEmployees.length > 0 ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                      background: "#fff",
                                      padding: "10px 14px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    {proj.assignedEmployees.map((emp, i) => (
                                      <div
                                        key={i}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                          padding: "4px 0",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "8px",
                                            background: getAvatarColor(emp.name),
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {(emp.name || "?")[0].toUpperCase()}
                                        </div>
                                        <div>
                                          <div
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: 700,
                                              color: "#0f172a",
                                            }}
                                          >
                                            {emp.name}
                                          </div>
                                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                                            {emp.empId} • {emp.role || "Team Member"}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      padding: "14px",
                                      background: "#fff",
                                      borderRadius: "10px",
                                      border: "1px dashed #cbd5e1",
                                      color: "#94a3b8",
                                      fontSize: "12px",
                                    }}
                                  >
                                    No staff currently assigned to this project. Edit project to assign.
                                  </div>
                                )}
                              </div>

                              {/* Right Column: Commercials & Deliverables */}
                              <div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  💼 Deliverables &amp; Commercials
                                </div>
                                <div
                                  style={{
                                    background: "#fff",
                                    padding: "14px",
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                  }}
                                >
                                  <div>
                                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                                      Budget / Contract Value:
                                    </div>
                                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                                      {proj.budget || "Confidential / TBD"}
                                    </div>
                                  </div>

                                  {proj.deliverablesUrl && (
                                    <div>
                                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                                        Repository / Preview URL:
                                      </div>
                                      <a
                                        href={proj.deliverablesUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          fontSize: "12px",
                                          color: "#2563eb",
                                          fontWeight: 600,
                                          wordBreak: "break-all",
                                          textDecoration: "underline",
                                        }}
                                      >
                                        🔗 {proj.deliverablesUrl}
                                      </a>
                                    </div>
                                  )}

                                  {proj.notes && (
                                    <div>
                                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                                        Super Admin Internal Notes:
                                      </div>
                                      <div style={{ fontSize: "12px", color: "#475569", fontStyle: "italic" }}>
                                        {proj.notes}
                                      </div>
                                    </div>
                                  )}
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

      {/* ── Add / Edit Project Modal ── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              border: "1px solid #e2e8f0",
              animation: "scaleIn 0.25s ease",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
                borderRadius: "20px 20px 0 0",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                  {modalMode === "create" ? "🚀 Create New Project" : `✏️ Edit Project: ${selectedProject?.projectId}`}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Record project scope, client details, team assignments &amp; target deadlines
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="paces-label">Project Title *</label>
                  <input
                    type="text"
                    className="paces-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Nexprobyte Mobile App"
                    required
                  />
                </div>

                <div>
                  <label className="paces-label">Category *</label>
                  <select
                    className="paces-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="paces-label">Client Name / Company *</label>
                  <input
                    type="text"
                    className="paces-input"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Apex Global Corp"
                    required
                  />
                </div>

                <div>
                  <label className="paces-label">Client Email Address</label>
                  <input
                    type="email"
                    className="paces-input"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@company.com"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label className="paces-label">Priority</label>
                  <select
                    className="paces-input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="paces-label">Status</label>
                  <select
                    className="paces-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="paces-label">Progress ({formData.progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value, 10) })}
                    style={{ width: "100%", marginTop: "8px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label className="paces-label">Start Date</label>
                  <input
                    type="date"
                    className="paces-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="paces-label">Target Deadline</label>
                  <input
                    type="date"
                    className="paces-input"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="paces-label">Budget / Value</label>
                  <input
                    type="text"
                    className="paces-input"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. ₹5,00,000 or $6,000"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="paces-label">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  className="paces-input"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="e.g. React, Node.js, Express, MongoDB, Tailwind CSS"
                />
              </div>

              {/* Assign Personnel from Employee Directory */}
              <div style={{ marginBottom: "16px" }}>
                <label className="paces-label">
                  Assign Staff Members ({formData.assignedEmployees.length} selected)
                </label>
                <div
                  style={{
                    maxHeight: "140px",
                    overflowY: "auto",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    background: "#f8fafc",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {employees.map((emp) => {
                    const checked = formData.assignedEmployees.some((a) => a.empId === emp.empId);
                    return (
                      <label
                        key={emp._id || emp.empId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#334155",
                          cursor: "pointer",
                          padding: "4px 6px",
                          borderRadius: "6px",
                          background: checked ? "#ecfdf5" : "transparent",
                          border: checked ? "1px solid #a7f3d0" : "1px solid transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEmployeeAssignment(emp)}
                        />
                        <span>
                          {emp.name} ({emp.empId})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="paces-label">Deliverables URL / Repository</label>
                <input
                  type="url"
                  className="paces-input"
                  value={formData.deliverablesUrl}
                  onChange={(e) => setFormData({ ...formData, deliverablesUrl: e.target.value })}
                  placeholder="https://github.com/... or https://staging..."
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="paces-label">Project Description</label>
                <textarea
                  className="paces-input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the scope of work, key modules, client specifications..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="paces-label">Admin Internal Notes</label>
                <input
                  type="text"
                  className="paces-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal milestone comments, billing notes..."
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "18px",
                }}
              >
                <button
                  type="button"
                  className="paces-btn paces-btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="paces-btn paces-btn-coral"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "create"
                    ? "🚀 Create Project Record"
                    : "✓ Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
