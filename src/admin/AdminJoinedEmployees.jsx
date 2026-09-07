import React, { useEffect, useRef, useState } from "react";
import "./admin-styles.css";
import Pagination, { usePagination } from "./Pagination.jsx";

const AVATAR_COLORS = ["#ff4d6d","#10b981","#3b82f6","#8b5cf6","#f97316","#06b6d4","#ec4899"];
function getAvatarColor(name = "") {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function downloadDoc(name, data) {
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
}

const EDIT_FIELDS = [
  ["contactPhone", "Contact Phone", "text", "Employee phone number"],
  ["address", "Address", "text", "Full postal address"],
  ["bloodGroup", "Blood Group", "text", "e.g. B+"],
  ["college", "College", "text", "College / University name"],
  ["bankName", "Bank Name", "text", "e.g. SBI"],
  ["bankAccountNumber", "Bank Account Number", "text", "Account number"],
  ["bankIFSC", "Bank IFSC", "text", "IFSC code"],
];

const DOC_LABELS = [
  ["profileImage", "Photo (Image)", "image"],
  ["aadhar", "Aadhar (PDF/Image)", ".pdf, image"],
  ["pan", "PAN Card (PDF/Image)", ".pdf, image"],
  ["experienceCert", "Experience Certificate (PDF/Image)", ".pdf, image"],
  ["otherCert", "Other Certificate (PDF/Image)", ".pdf, image"],
];

function readFileAsData(file, onSuccess, onError, { maxMB = 5, typeHint = "PDF or Image" } = {}) {
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

export function AdminJoinedEmployees() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFiles, setEditFiles] = useState({});
  const [editUploading, setEditUploading] = useState({});
  const fileInputRefs = useRef({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [msg, setMsg] = useState("");

  const pag = usePagination(entries);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/interview-data", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data) ? data.filter((x) => x.status === "Joined") : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleDetails = (entry) => {
    setExpandedId((prev) => (prev === entry._id ? null : entry._id));
    setEditId(null);
  };

  const openEdit = (entry) => {
    const ob = entry.onboarding || {};
    const form = {};
    for (const [key] of EDIT_FIELDS) form[key] = ob[key] || "";
    setEditForm(form);
    setEditFiles({});
    setEditUploading({});
    setEditError("");
    setEditId(entry._id);
  };

  const handleFileChange = (key) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditUploading((u) => ({ ...u, [key]: true }));
    readFileAsData(
      file,
      (res) => {
        setEditFiles((f) => ({ ...f, [key]: { fileName: res.name, fileData: res.data, fileSize: res.size } }));
        setEditUploading((u) => ({ ...u, [key]: false }));
      },
      (err) => {
        setEditUploading((u) => ({ ...u, [key]: false }));
        setEditError(err);
        if (fileInputRefs.current[key]) fileInputRefs.current[key].value = "";
      }
    );
  };

  const saveEdit = async (entry) => {
    setEditError("");
    if (!editForm.contactPhone || !editForm.contactPhone.trim())
      return setEditError("Contact phone is required.");
    setEditSaving(true);
    const token = localStorage.getItem("nex_admin_token");
    const ob = entry.onboarding || {};
    const payload = { ...editForm, contactPhone: editForm.contactPhone.trim() };

    for (const [key] of DOC_LABELS) {
      const f = editFiles[key];
      if (!f) continue;
      if (key === "profileImage") {
        payload.profileName = f.fileName;
        payload.profileImageName = f.fileName;
        payload.profileImageData = f.fileData;
      } else {
        payload[key + "FileName"] = f.fileName;
        payload[key + "FileData"] = f.fileData;
        payload[key + "FileSize"] = f.fileSize;
      }
    }
    if (!payload.profileName && ob.profileImageName) payload.profileName = ob.profileImageName;

    try {
      const res = await fetch(`/api/interview-data/${entry._id}/onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg(`Saved changes for ${entry.name}.`);
        setEditId(null);
        fetchEntries();
        setTimeout(() => setMsg(""), 2500);
      } else {
        const data = await res.json();
        setEditError(data.message || "Failed to save changes.");
      }
    } catch (e) {
      console.error(e);
      setEditError("Network error while saving.");
    } finally { setEditSaving(false); }
  };

  const renderExpanded = (entry) => {
    const ob = entry.onboarding || {};
    if (editId === entry._id) {
      return (
        <div style={{ padding: "18px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>✏️ Edit — {entry.name}</div>
            <button className="paces-modal-close" onClick={() => setEditId(null)}>✕</button>
          </div>
          {editError && <div className="paces-alert paces-alert-error">{editError}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {EDIT_FIELDS.map(([key, label, type, placeholder]) => (
              <div className="paces-form-group" key={key} style={{ marginBottom: 0 }}>
                <label className="paces-label">{label}</label>
                <input
                  type={type}
                  className="paces-input"
                  placeholder={placeholder}
                  value={editForm[key] || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div style={{ margin: "16px 0 10px", fontSize: "12px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📎 Photo & Documents
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {DOC_LABELS.map(([key, label, hint]) => {
              const cur = editFiles[key];
              const existing = key === "profileImage"
                ? (ob.profileImageName || "Not uploaded")
                : (ob[key + "FileName"] || "Not uploaded");
              return (
                <div className="paces-form-group" key={key} style={{ marginBottom: 0 }}>
                  <label className="paces-label">{label}</label>
                  <input
                    ref={(el) => { fileInputRefs.current[key] = el; }}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="paces-input"
                    onChange={handleFileChange(key)}
                  />
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 5 }}>
                    {editUploading[key] ? "Reading file…" : (
                      cur
                        ? <span style={{ color: "#10b981" }}>✓ New: {cur.fileName} ({cur.fileSize})</span>
                        : <span>Current: {existing}{hint ? ` · ${hint}` : ""}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16, paddingTop: 14, borderTop: "1px solid #e8ecf2" }}>
            <button onClick={() => setEditId(null)} className="paces-btn paces-btn-outline">Cancel</button>
            <button onClick={() => saveEdit(entry)} disabled={editSaving} className="paces-btn paces-btn-coral">
              {editSaving ? "Saving…" : "💾 Save Changes"}
            </button>
          </div>
        </div>
      );
    }

    const docs = [
      ["Aadhar", "aadhar"],
      ["PAN", "pan"],
      ["Exp. Cert", "experienceCert"],
      ["Other Cert", "otherCert"],
    ].filter(([label, keyName]) => ob[keyName + "FileName"]);

    const rows = [
      ["Date of Birth", entry.dob ? new Date(entry.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"],
      ["Experience", `${entry.experienceType}${entry.experienceYears ? ` — ${entry.experienceYears}` : ""}`],
      ["Contact", ob.contactPhone || "—"],
      ["Address", ob.address || entry.address || "—"],
      ["Blood Group", ob.bloodGroup || "—"],
      ["College", ob.college || "—"],
      ["Bank", `${ob.bankName || ""}${ob.bankAccountNumber ? ` Account: ${ob.bankAccountNumber}` : ""}${ob.bankIFSC ? ` · IFSC: ${ob.bankIFSC}` : ""}`.trim() || "—"],
    ];

    return (
      <div style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {ob.profileImageData ? (
              <img src={ob.profileImageData} alt={entry.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }} />
            ) : (
              <div className="paces-lead-avatar" style={{ width: 40, height: 40, fontSize: 14, background: getAvatarColor(entry.name) }}>
                {(entry.name || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{entry.name}</div>
              <div style={{ fontSize: 12.5, color: "#64748b" }}>{entry.email}</div>
            </div>
            <span className="paces-badge badge-purple" style={{ marginLeft: 6 }}>Joined</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(entry)} className="paces-btn paces-btn-outline paces-btn-sm">✏️ Edit</button>
            <button onClick={() => toggleDetails(entry)} className="paces-btn paces-btn-outline paces-btn-sm">▲ Close</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }} className="paces-detail-grid">
          {rows.map(([key, val]) => (
            <div className="paces-detail-row" key={key}>
              <div className="paces-detail-key">{key}</div>
              <div className="paces-detail-value">{val}</div>
            </div>
          ))}
        </div>

        <div className="paces-detail-row">
          <div className="paces-detail-key">Resume</div>
          <div className="paces-detail-value">
            {entry.resumeFileName ? (
              <button className="paces-btn paces-btn-outline paces-btn-sm" onClick={() => downloadDoc(entry.resumeFileName, entry.resumeData)}>
                📄 {entry.resumeFileName}
              </button>
            ) : "—"}
          </div>
        </div>

        <div style={{ margin: "14px 0 8px", fontSize: "12px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Uploaded Documents
        </div>
        {docs.length === 0 && (
          <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 4 }}>No documents added yet — click ✏️ Edit to upload.</div>
        )}
        {[
          ["Aadhar", "aadhar"],
          ["PAN", "pan"],
          ["Experience Certificate", "experienceCert"],
          ["Other Certificate", "otherCert"],
        ].map(([label, keyName]) => (
          <div className="paces-detail-row" key={keyName}>
            <div className="paces-detail-key">{label}</div>
            <div className="paces-detail-value">
              {ob[keyName + "FileName"] ? (
                <button
                  onClick={() => downloadDoc(ob[keyName + "FileName"], ob[keyName + "FileData"])}
                  className="paces-btn paces-btn-outline paces-btn-sm"
                >
                  📄 Download ({ob[keyName + "FileSize"] || ""})
                </button>
              ) : "Not uploaded (optional)"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Joined Employees</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Management <span>›</span> Onboarded Employees
          </div>
        </div>
        <button onClick={fetchEntries} className="paces-btn paces-btn-outline paces-btn-sm">
          ↻ Refresh
        </button>
      </div>

      {msg && <div className="paces-alert paces-alert-success" style={{ marginBottom: 14 }}>{msg}</div>}

      <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="paces-empty" style={{ padding: "48px 24px" }}>
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading joined employees…</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="paces-empty" style={{ padding: "48px 24px" }}>
            <div className="paces-empty-icon">🤝</div>
            <div className="paces-empty-text">No joined employees yet</div>
            <div className="paces-empty-sub">Mark a candidate as "Joined" in Datas Collect and save their details here</div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contact</th>
                  <th>Blood Group</th>
                  <th>College</th>
                  <th>Bank Number</th>
                  <th>Documents</th>
                  <th style={{ textAlign: "right", paddingRight: 24 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pag.paged.map((entry) => {
                  const ob = entry.onboarding || {};
                  const docs = [
                    ["Aadhar", "aadhar"],
                    ["PAN", "pan"],
                    ["Exp. Cert", "experienceCert"],
                    ["Other Cert", "otherCert"],
                  ].filter(([label, keyName]) => ob[keyName + "FileName"]);
                  const isOpen = expandedId === entry._id;
                  return (
                    <React.Fragment key={entry._id}>
                      <tr>
                        <td>
                          <div className="paces-lead-row">
                            {ob.profileImageData ? (
                              <img
                                src={ob.profileImageData}
                                alt={entry.name}
                                style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                              />
                            ) : (
                              <div className="paces-lead-avatar" style={{ background: getAvatarColor(entry.name) }}>
                                {(entry.name || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="paces-td-name">{entry.name}</div>
                              <div className="paces-td-sub">{entry.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "#64748b", fontSize: 12.5 }}>
                          {ob.contactPhone || "—"}
                        </td>
                        <td>
                          {ob.bloodGroup ? (
                            <span style={{
                              background: "#f3e8ff", color: "#7c3aed",
                              padding: "3px 9px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                            }}>{ob.bloodGroup}</span>
                          ) : "—"}
                        </td>
                        <td style={{ color: "#64748b", fontSize: 12.5 }}>{ob.college || "—"}</td>
                        <td style={{ color: "#64748b", fontSize: 12.5 }}>
                          {ob.bankName ? `${ob.bankName} · ` : ""}{ob.bankAccountNumber || "—"}
                          {ob.bankIFSC ? <div style={{ fontSize: 11 }}>IFSC: {ob.bankIFSC}</div> : null}
                        </td>
                        <td>
                          {docs.length > 0 ? (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {docs.map(([label, keyName]) => (
                                <button
                                  key={keyName}
                                  className="paces-btn paces-btn-outline paces-btn-sm"
                                  onClick={() => downloadDoc(ob[keyName + "FileName"], ob[keyName + "FileData"])}
                                >
                                  📄 {label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: 12.5 }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: 20, whiteSpace: "nowrap" }}>
                          <button
                            onClick={() => toggleDetails(entry)}
                            className="paces-btn paces-btn-outline paces-btn-sm"
                          >
                            {isOpen ? "▲ Close" : "▼ Details"}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ background: "#fafbfd" }}>
                          <td colSpan={7} style={{ padding: 0, borderBottom: "1px solid #e8ecf2" }}>
                            {renderExpanded(entry)}
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
      <Pagination page={pag.page} pageCount={pag.totalPages} total={pag.total} onPage={pag.go} />
    </div>
  );
}

export default AdminJoinedEmployees;