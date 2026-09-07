import React, { useEffect, useRef, useState } from "react";
import "./admin-styles.css";

const AVATAR_COLORS = ["#ff4d6d","#10b981","#3b82f6","#8b5cf6","#f97316","#06b6d4","#ec4899"];
function getAvatarColor(name = "") {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

const EMPTY_FORM = {
  name: "",
  dob: "",
  email: "",
  address: "",
  experienceType: "Fresher",
  experienceYears: "",
  resumeFileName: "",
  resumeData: "",
  resumeSize: "",
};

const EMPTY_ONBOARD = {
  contactPhone: "",
  address: "",
  bloodGroup: "",
  college: "",
  bankName: "",
  bankAccountNumber: "",
  bankIFSC: "",
  profileImageName: "",
  profileImageData: "",
  aadharFileName: "",
  aadharFileData: "",
  aadharFileSize: "",
  panFileName: "",
  panFileData: "",
  panFileSize: "",
  experienceCertFileName: "",
  experienceCertFileData: "",
  experienceCertFileSize: "",
  otherCertFileName: "",
  otherCertFileData: "",
  otherCertFileSize: "",
};

const STATUS_OPTIONS = ["New", "Reviewed", "Shortlisted", "Joined", "Rejected"];

function isSuperAdminUser() {
  try {
    const user = JSON.parse(localStorage.getItem("nex_admin_user") || "{}");
    return user.role !== "employee" || !!user.isSuperAdmin;
  } catch {
    return false;
  }
}

function readFileAsData(file, onSuccess, onError, { maxMB = 5, allowed = /\.pdf$/i, typeHint = "PDF" } = {}) {
  if (!/\.pdf$/i.test(file.name) && !/\.(png|jpe?g|webp)$/i.test(file.name)) {
    onError(`Invalid file type. Please upload ${typeHint}.`);
    return;
  }
  if (file.size > maxMB * 1024 * 1024) {
    onError(`File must be under ${maxMB} MB.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = () =>
    onSuccess({
      name: file.name,
      data: reader.result,
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
    });
  reader.onerror = () => onError("Could not read the file.");
  reader.readAsDataURL(file);
}

export function AdminDatasCollect() {
  const [entries, setEntries]           = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState("");
  const [uploading, setUploading]       = useState(false);
  const fileInputRef                    = useRef(null);
  const formRef                         = useRef(null);
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE                       = 10;

  const [onboardEntry, setOnboardEntry] = useState(null);
  const [onboardData, setOnboardData]   = useState(EMPTY_ONBOARD);
  const [onboardError, setOnboardError] = useState("");
  const [onboardSaving, setOnboardSaving] = useState(false);
  const superAdmin = isSuperAdminUser();

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/interview-data", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setEntries(await res.json());
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const update = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) {
      setFormError("Only PDF resume uploads are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Resume must be under 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFormError("");
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      update("resumeFileName", file.name);
      update("resumeData", reader.result);
      update("resumeSize", (file.size / (1024 * 1024)).toFixed(1) + " MB");
      setUploading(false);
    };
    reader.onerror = () => { setUploading(false); setFormError("Could not read the file."); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.name.trim()) return setFormError("Name is required.");
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return setFormError("Valid Email is required.");
    if (formData.experienceType === "Experienced" && !formData.experienceYears)
      return setFormError("Please enter the years of experience.");
    if (formData.experienceType === "Fresher")
      update("experienceYears", "0 Years");

    setSaving(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/interview-data", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, experienceYears: formData.experienceType === "Fresher" ? "0 Years" : formData.experienceYears }),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData(EMPTY_FORM);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchEntries();
      } else {
        const data = await res.json();
        setFormError(data.message || "Failed to save data.");
      }
    } catch(err) { setFormError("Network error while saving."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/interview-data/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchEntries();
        if (selectedEntry?._id === id) setSelectedEntry((p) => ({ ...p, status: newStatus }));
      }
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      await fetch(`/api/interview-data/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEntry(null);
      fetchEntries();
    } catch(e) { console.error(e); }
  };

  const downloadResume = (entry) => {
    if (!entry.resumeData) {
      window.alert("No resume uploaded for this entry.");
      return;
    }
    const a = document.createElement("a");
    a.href = entry.resumeData;
    a.download = entry.resumeFileName || "Resume.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openOnboard = (entry) => {
    setOnboardError("");
    setOnboardEntry(entry);
    setOnboardData({ ...EMPTY_ONBOARD, ...(entry.onboarding || {}) });
  };

  const onOnboardChange = (key, value) => setOnboardData((p) => ({ ...p, [key]: value }));

  const onOnboardFile = (key, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    readFileAsData(file, ({ name, data, size }) => {
      setOnboardError("");
      onOnboardChange(key + "FileName", name);
      onOnboardChange(key + "FileData", data);
      onOnboardChange(key + "FileSize", size);
    }, setOnboardError);
    e.target.value = "";
  };

  const saveOnboard = async (e) => {
    e.preventDefault();
    setOnboardError("");
    if (!onboardEntry) return;

    if (!superAdmin) {
      setOnboardError("Only Super Admin can upload onboarding details.");
      return;
    }
    if (!onboardData.contactPhone || !onboardData.contactPhone.trim()) {
      return setOnboardError("Contact phone is required.");
    }
    if (!onboardData.bankAccountNumber || !onboardData.bankAccountNumber.trim()) {
      return setOnboardError("Bank account number is required.");
    }

    setOnboardSaving(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/interview-data/${onboardEntry._id}/onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(onboardData),
      });
      if (res.ok) {
        setOnboardEntry(null);
        setOnboardData(EMPTY_ONBOARD);
        fetchEntries();
      } else {
        const data = await res.json();
        setOnboardError(data.message || "Failed to save onboarding details.");
      }
    } catch (err) {
      setOnboardError("Network error while saving onboarding details.");
      console.error(err);
    } finally {
      setOnboardSaving(false);
    }
  };

  const downloadDoc = (name, data) => {
    if (!data) {
      window.alert("No document uploaded yet.");
      return;
    }
    const a = document.createElement("a");
    a.href = data;
    a.download = name || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = entries.filter((x) => filterStatus === "All" || x.status === filterStatus);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageCount  = Math.min(page, totalPages);
  const pagedEntries = filtered.slice((pageCount - 1) * PAGE_SIZE, pageCount * PAGE_SIZE);

  const selectFilter = (s) => {
    setFilterStatus(s);
    setPage(1);
  };

  const openAddForm = () => {
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
    setTimeout(() => formRef.current && formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const closeAddForm = () => {
    setShowForm(false);
    setFormError("");
  };

  const badgeClass = (s) =>
    s === "New"        ? "badge-coral" :
    s === "Reviewed"   ? "badge-blue"  :
    s === "Shortlisted"? "badge-teal"  :
    s === "Joined"     ? "badge-purple" : "badge-gray";

  const counts = { All: entries.length };
  STATUS_OPTIONS.forEach((s) => {
    counts[s] = entries.filter((x) => x.status === s).length;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Datas Collect</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Management <span>›</span> Interview Candidate Data
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="paces-filter-bar">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => selectFilter(s)}
                className={`paces-btn paces-btn-sm ${filterStatus === s ? "paces-btn-coral" : "paces-btn-outline"}`}
              >
                {s} <span style={{ opacity:0.7, marginLeft:2 }}>({counts[s] ?? 0})</span>
              </button>
            ))}
          </div>
          <button onClick={showForm ? closeAddForm : openAddForm} className="paces-btn paces-btn-coral">
            {showForm ? "✕ Close Form" : "＋ Add Data"}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="paces-card" style={{ padding:0, overflow:"hidden" }}>
        {loading ? (
          <div className="paces-empty" style={{ padding:"48px 24px" }}>
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading interview data…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="paces-empty" style={{ padding:"48px 24px" }}>
            <div className="paces-empty-icon">📂</div>
            <div className="paces-empty-text">No interview data found</div>
            <div className="paces-empty-sub">Click "Add Data" or change the filter above</div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Experience</th>
                  <th>DOB</th>
                  <th>Address</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th style={{ textAlign:"right", paddingRight:24 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedEntries.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <div className="paces-lead-row">
                        <div className="paces-lead-avatar" style={{ background: getAvatarColor(entry.name) }}>
                          {(entry.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="paces-td-name">{entry.name}</div>
                          <div className="paces-td-sub">{entry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: entry.experienceType === "Experienced" ? "#fef3c7" : "#dcfce7",
                        color: entry.experienceType === "Experienced" ? "#92400e" : "#166534",
                        padding:"3px 9px", borderRadius:6, fontSize:12, fontWeight:600,
                      }}>{entry.experienceType}</span>
                      {entry.experienceYears && (
                        <div style={{ fontSize:11.5, color:"#64748b", marginTop:4 }}>
                          {entry.experienceYears} Experience
                        </div>
                      )}
                    </td>
                    <td style={{ color:"#64748b", fontSize:12.5, whiteSpace:"nowrap" }}>
                      {entry.dob ? new Date(entry.dob).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                    </td>
                    <td style={{ color:"#64748b", fontSize:12.5, maxWidth:200 }}>
                      <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }} title={entry.address}>
                        {entry.address || "—"}
                      </div>
                    </td>
                    <td>
                      {entry.resumeFileName ? (
                        <button
                          className="paces-btn paces-btn-outline paces-btn-sm"
                          style={{ display:"inline-flex", alignItems:"center", gap:5 }}
                          onClick={() => downloadResume(entry)}
                          title={`Download ${entry.resumeFileName}`}
                        >
                          <span>📄</span> {entry.resumeSize || ""}
                        </button>
                      ) : (
                        <span style={{ color:"#94a3b8", fontSize:12.5 }}>—</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="paces-select"
                        style={{ width:"auto", minWidth:120, fontSize:12, padding:"5px 28px 5px 10px" }}
                        value={entry.status}
                        onChange={(e) => handleUpdateStatus(entry._id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Joined">Joined</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={{ textAlign:"right", paddingRight:20 }}>
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end", flexWrap:"wrap" }}>
                        {entry.status === "Joined" && superAdmin && (
                          <button
                            onClick={() => openOnboard(entry)}
                            className="paces-btn paces-btn-purple paces-btn-sm"
                            title="Save employee onboarding details (Super Admin only)"
                          >
                            💾 Save Employee
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="paces-btn paces-btn-outline paces-btn-sm"
                        >Details</button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="paces-btn paces-btn-danger paces-btn-sm"
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {filtered.length > PAGE_SIZE && (
        <div className="paces-card" style={{ marginTop: 14, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 12.5, color: "var(--p-text-muted)" }}>
            Showing {(pageCount - 1) * PAGE_SIZE + 1}–{Math.min(pageCount * PAGE_SIZE, filtered.length)} of {filtered.length}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              className="paces-btn paces-btn-outline paces-btn-sm"
              disabled={pageCount <= 1}
              onClick={() => setPage((p) => p - 1)}
            >‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`paces-btn paces-btn-sm ${pageCount === n ? "paces-btn-coral" : "paces-btn-outline"}`}
                onClick={() => setPage(n)}
              >{n}</button>
            ))}
            <button
              className="paces-btn paces-btn-outline paces-btn-sm"
              disabled={pageCount >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >Next ›</button>
          </div>
        </div>
      )}

      {/* Inline Add Data Form (dropdown style below table) */}
      {showForm && (
        <div className="paces-card" ref={formRef} style={{ marginTop: 14, padding: 0, overflow: "hidden", borderLeft: "3px solid var(--p-coral)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--p-card-border)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--p-text-dark)" }}>🗂️ Collect Interview Data</div>
            <button className="paces-modal-close" onClick={closeAddForm}>✕</button>
          </div>

          <div style={{ padding: "18px" }}>
            {formError && <div className="paces-alert paces-alert-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="paces-form-group">
                <label className="paces-label">Name *</label>
                <input
                  type="text" className="paces-input" placeholder="Candidate full name"
                  value={formData.name} onChange={(e) => update("name", e.target.value)} required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Date of Birth</label>
                  <input
                    type="date" className="paces-input"
                    value={formData.dob} onChange={(e) => update("dob", e.target.value)}
                  />
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">Email *</label>
                  <input
                    type="email" className="paces-input" placeholder="candidate@email.com"
                    value={formData.email} onChange={(e) => update("email", e.target.value)} required
                  />
                </div>
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Address</label>
                <textarea
                  className="paces-textarea" rows={2} placeholder="Full postal address"
                  value={formData.address} onChange={(e) => update("address", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Experience Type *</label>
                  <div style={{ display:"flex", gap:8 }}>
                    <button
                      type="button"
                      onClick={() => update("experienceType", "Fresher")}
                      className={`paces-btn ${formData.experienceType === "Fresher" ? "paces-btn-coral" : "paces-btn-outline"}`}
                      style={{ flex:1 }}
                    >🎓 Fresher</button>
                    <button
                      type="button"
                      onClick={() => update("experienceType", "Experienced")}
                      className={`paces-btn ${formData.experienceType === "Experienced" ? "paces-btn-coral" : "paces-btn-outline"}`}
                      style={{ flex:1 }}
                    >💼 Experienced</button>
                  </div>
                </div>
                {formData.experienceType === "Experienced" && (
                  <div className="paces-form-group">
                    <label className="paces-label">Years of Experience *</label>
                    <input
                      type="text" className="paces-input" placeholder="e.g. 4 Years"
                      value={formData.experienceYears} onChange={(e) => update("experienceYears", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Resume (PDF) *</label>
                <input
                  ref={fileInputRef}
                  type="file" accept="application/pdf,.pdf"
                  className="paces-input"
                  onChange={handleFileChange}
                />
                {formData.resumeFileName && !uploading && (
                  <div style={{ fontSize:12, color:"#10b981", marginTop:6 }}>📄 {formData.resumeFileName} ({formData.resumeSize}) ready to save</div>
                )}
                {uploading && <div style={{ fontSize:12, color:"#64748b", marginTop:6 }}>Reading file…</div>}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--p-card-border)" }}>
                <button type="button" onClick={closeAddForm} className="paces-btn paces-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="paces-btn paces-btn-coral">
                  {saving ? "Saving…" : "Save Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard (Save Employee) Modal - Super Admin Only */}
      {onboardEntry && (
        <div className="paces-modal-overlay" onClick={(e) => e.target === e.currentTarget && setOnboardEntry(null)}>
          <div className="paces-modal" style={{ maxWidth: 720 }}>
            <div className="paces-modal-header">
              <div className="paces-modal-title">Save Employee Details — {onboardEntry.name}</div>
              <button className="paces-modal-close" onClick={() => setOnboardEntry(null)}>✕</button>
            </div>

            <div className="paces-alert" style={{ background: "var(--p-purple-light, #f3e8ff)", color: "#6d28d9" }}>
              🔒 Super Admin only. Fill the onboarding details and upload documents for this joined employee.
            </div>

            {onboardError && <div className="paces-alert paces-alert-error">{onboardError}</div>}

            <form onSubmit={saveOnboard}>
              {/* Contact & Image */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Contact Number *</label>
                  <input
                    type="tel" className="paces-input" placeholder="+91 98765 43210"
                    value={onboardData.contactPhone}
                    onChange={(e) => onOnboardChange("contactPhone", e.target.value)}
                    required
                  />
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">Blood Group</label>
                  <select
                    className="paces-select" value={onboardData.bloodGroup}
                    onChange={(e) => onOnboardChange("bloodGroup", e.target.value)}
                  >
                    <option value="">— Select —</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Address</label>
                <textarea
                  className="paces-textarea" rows={2} placeholder="Permanent address"
                  value={onboardData.address}
                  onChange={(e) => onOnboardChange("address", e.target.value)}
                />
              </div>

              <div className="paces-form-group">
                <label className="paces-label">College / Institution</label>
                <input
                  type="text" className="paces-input" placeholder="e.g. PSG College of Technology"
                  value={onboardData.college}
                  onChange={(e) => onOnboardChange("college", e.target.value)}
                />
              </div>

              {/* Bank Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Bank Name</label>
                  <input
                    type="text" className="paces-input" placeholder="SBI / HDFC…"
                    value={onboardData.bankName}
                    onChange={(e) => onOnboardChange("bankName", e.target.value)}
                  />
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">Account Number *</label>
                  <input
                    type="text" className="paces-input" placeholder="Account / bank number"
                    value={onboardData.bankAccountNumber}
                    onChange={(e) => onOnboardChange("bankAccountNumber", e.target.value)}
                    required
                  />
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">IFSC Code</label>
                  <input
                    type="text" className="paces-input" placeholder="SBIN0001234"
                    value={onboardData.bankIFSC}
                    onChange={(e) => onOnboardChange("bankIFSC", e.target.value)}
                  />
                </div>
              </div>

              <div style={{ margin: "4px 0 12px", fontSize: "12px", fontWeight: 700, color: "var(--p-text-muted)" }}>
                DOCUMENT UPLOADS
              </div>

              {/* Photo Upload */}
              <div className="paces-form-group">
                <label className="paces-label">Photo (Image)</label>
                <input
                  type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                  className="paces-input" onChange={(e) => onOnboardFile("profileImage", e)}
                />
                {onboardData.profileImageName && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: "#7c3aed" }}>🖼️ {onboardData.profileImageName}</span>
                    {onboardData.profileImageData && (
                      <img
                        src={onboardData.profileImageData}
                        alt="preview"
                        style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, border: "1px solid var(--p-input-border)" }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Aadhar Card (PDF)</label>
                  <input type="file" accept="application/pdf,.pdf" className="paces-input" onChange={(e) => onOnboardFile("aadhar", e)} />
                  {onboardData.aadharFileName && (
                    <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6 }}>
                      📄 {onboardData.aadharFileName} ({onboardData.aadharFileSize || ""})
                    </div>
                  )}
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">PAN Card (PDF)</label>
                  <input type="file" accept="application/pdf,.pdf" className="paces-input" onChange={(e) => onOnboardFile("pan", e)} />
                  {onboardData.panFileName && (
                    <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6 }}>
                      📄 {onboardData.panFileName} ({onboardData.panFileSize || ""})
                    </div>
                  )}
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">Experience Certificate (PDF, Optional)</label>
                  <input type="file" accept="application/pdf,.pdf" className="paces-input" onChange={(e) => onOnboardFile("experienceCert", e)} />
                  {onboardData.experienceCertFileName && (
                    <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6 }}>
                      📄 {onboardData.experienceCertFileName} ({onboardData.experienceCertFileSize || ""})
                    </div>
                  )}
                </div>
                <div className="paces-form-group">
                  <label className="paces-label">Any Other Certificate (PDF, Optional)</label>
                  <input type="file" accept="application/pdf,.pdf" className="paces-input" onChange={(e) => onOnboardFile("otherCert", e)} />
                  {onboardData.otherCertFileName && (
                    <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6 }}>
                      📄 {onboardData.otherCertFileName} ({onboardData.otherCertFileSize || ""})
                    </div>
                  )}
                </div>
              </div>

              <div className="paces-modal-footer">
                <button type="button" onClick={() => setOnboardEntry(null)} className="paces-btn paces-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={onboardSaving} className="paces-btn paces-btn-purple">
                  {onboardSaving ? "Saving…" : "💾 Save Employee Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="paces-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedEntry(null)}>
          <div className="paces-modal">
            <div className="paces-modal-header">
              <div className="paces-modal-title">Interview Data Details</div>
              <button className="paces-modal-close" onClick={() => setSelectedEntry(null)}>✕</button>
            </div>

            <div style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"14px 16px", background:"#f8fafc",
              borderRadius:12, marginBottom:16,
            }}>
              <div className="paces-lead-avatar" style={{ width:44, height:44, fontSize:16, background: getAvatarColor(selectedEntry.name) }}>
                {(selectedEntry.name || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#0f172a" }}>{selectedEntry.name}</div>
                <div style={{ fontSize:13, color:"#64748b" }}>{selectedEntry.email}</div>
              </div>
              <span className={`paces-badge ${badgeClass(selectedEntry.status)}`}>{selectedEntry.status}</span>
            </div>

            <div className="paces-detail-row">
              <div className="paces-detail-key">Date of Birth</div>
              <div className="paces-detail-value">{selectedEntry.dob ? new Date(selectedEntry.dob).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "—"}</div>
            </div>
            <div className="paces-detail-row">
              <div className="paces-detail-key">Experience</div>
              <div className="paces-detail-value">{selectedEntry.experienceType}{selectedEntry.experienceYears ? ` — ${selectedEntry.experienceYears}` : ""}</div>
            </div>
            <div className="paces-detail-row">
              <div className="paces-detail-key">Address</div>
              <div className="paces-detail-value">{selectedEntry.address || "—"}</div>
            </div>
            <div className="paces-detail-row">
              <div className="paces-detail-key">Resume</div>
              <div className="paces-detail-value">
                {selectedEntry.resumeFileName ? (
                  <>
                    📄 {selectedEntry.resumeFileName} ({selectedEntry.resumeSize || "—"})
                    <div style={{ marginTop:10 }}>
                      <button onClick={() => downloadResume(selectedEntry)} className="paces-btn paces-btn-outline paces-btn-sm">
                        Download Resume
                      </button>
                    </div>
                  </>
                ) : "No resume uploaded."}
              </div>
            </div>
            <div className="paces-detail-row">
              <div className="paces-detail-key">Entry Date</div>
              <div className="paces-detail-value">{new Date(selectedEntry.createdAt).toLocaleString("en-IN")}</div>
            </div>

            {selectedEntry.status === "Joined" && (
              <>
                <div style={{ margin: "16px 0 8px", fontSize: "12px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Employee Onboarding
                </div>
                <div className="paces-detail-row">
                  <div className="paces-detail-key">Contact</div>
                  <div className="paces-detail-value">{selectedEntry.onboarding?.contactPhone || "—"}</div>
                </div>
                <div className="paces-detail-row">
                  <div className="paces-detail-key">Blood Group</div>
                  <div className="paces-detail-value">{selectedEntry.onboarding?.bloodGroup || "—"}</div>
                </div>
                <div className="paces-detail-row">
                  <div className="paces-detail-key">College</div>
                  <div className="paces-detail-value">{selectedEntry.onboarding?.college || "—"}</div>
                </div>
                <div className="paces-detail-row">
                  <div className="paces-detail-key">Bank</div>
                  <div className="paces-detail-value">
                    {selectedEntry.onboarding?.bankName ? `${selectedEntry.onboarding.bankName} · ` : ""}
                    {selectedEntry.onboarding?.bankAccountNumber || "—"}
                    {selectedEntry.onboarding?.bankIFSC ? ` · ${selectedEntry.onboarding.bankIFSC}` : ""}
                  </div>
                </div>
                <div className="paces-detail-row">
                  <div className="paces-detail-key">Photo</div>
                  <div className="paces-detail-value">
                    {selectedEntry.onboarding?.profileImageData ? (
                      <img
                        src={selectedEntry.onboarding.profileImageData}
                        alt={selectedEntry.name}
                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12 }}
                      />
                    ) : selectedEntry.onboarding?.profileImageName || "—"}
                  </div>
                </div>
                {[
                  ["Aadhar", "aadhar"],
                  ["PAN", "pan"],
                  ["Experience Certificate", "experienceCert"],
                  ["Other Certificate", "otherCert"],
                ].map(([label, keyName]) => (
                  <div className="paces-detail-row" key={keyName}>
                    <div className="paces-detail-key">{label}</div>
                    <div className="paces-detail-value">
                      {selectedEntry.onboarding?.[keyName + "FileName"] ? (
                        <button
                          onClick={() => downloadDoc(
                            selectedEntry.onboarding[keyName + "FileName"],
                            selectedEntry.onboarding[keyName + "FileData"]
                          )}
                          className="paces-btn paces-btn-outline paces-btn-sm"
                        >
                          📄 Download ({selectedEntry.onboarding[keyName + "FileSize"] || ""})
                        </button>
                      ) : "Not uploaded (optional)"}
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="paces-modal-footer">
              <button onClick={() => handleDelete(selectedEntry._id)} className="paces-btn paces-btn-danger">Delete</button>
              <button onClick={() => setSelectedEntry(null)} className="paces-btn paces-btn-coral">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDatasCollect;
