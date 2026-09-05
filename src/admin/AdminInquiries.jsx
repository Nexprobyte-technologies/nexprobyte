import React, { useEffect, useState } from "react";
import "./admin-styles.css";

const AVATAR_COLORS = ["#ff4d6d","#10b981","#3b82f6","#8b5cf6","#f97316","#06b6d4","#ec4899"];
function getAvatarColor(name = "") {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function AdminInquiries() {
  const [inquiries, setInquiries]           = useState([]);
  const [filterStatus, setFilterStatus]     = useState("All");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [loading, setLoading]               = useState(true);

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/inquiries", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setInquiries(await res.json());
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchInquiries();
        if (selectedInquiry?._id === id)
          setSelectedInquiry(p => ({ ...p, status: newStatus }));
      }
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedInquiry(null);
      fetchInquiries();
    } catch(e) { console.error(e); }
  };

  const filtered = inquiries.filter(i => filterStatus === "All" || i.status === filterStatus);

  const badgeClass = s =>
    s === "New"         ? "badge-coral" :
    s === "In Progress" ? "badge-blue"  :
    s === "Completed"   ? "badge-teal"  : "badge-gray";

  const counts = { All: inquiries.length };
  ["New","In Progress","Completed"].forEach(s => {
    counts[s] = inquiries.filter(i => i.status === s).length;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Inquiries &amp; Leads</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> CRM <span>›</span> Contact Submissions
          </div>
        </div>
        <div className="paces-filter-bar">
          {["All","New","In Progress","Completed"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`paces-btn paces-btn-sm ${filterStatus === s ? "paces-btn-coral" : "paces-btn-outline"}`}
            >
              {s} <span style={{ opacity:0.7, marginLeft:2 }}>({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="paces-card" style={{ padding:0, overflow:"hidden" }}>
        {loading ? (
          <div className="paces-empty" style={{ padding:"48px 24px" }}>
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading inquiries…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="paces-empty" style={{ padding:"48px 24px" }}>
            <div className="paces-empty-icon">📭</div>
            <div className="paces-empty-text">No inquiries found</div>
            <div className="paces-empty-sub">Try changing the filter above</div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Service</th>
                  <th style={{ width: 180, maxWidth: 180 }}>Message</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th style={{ textAlign:"right", paddingRight:24 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inq => (
                  <tr key={inq._id}>
                    <td>
                      <div className="paces-lead-row">
                        <div className="paces-lead-avatar" style={{ background: getAvatarColor(inq.name) }}>
                          {(inq.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="paces-td-name">{inq.name}</div>
                          <div className="paces-td-sub">{inq.email}</div>
                          {inq.phone && <div className="paces-td-sub">{inq.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background:"#f1f5f9", color:"#334155",
                        padding:"3px 9px", borderRadius:6,
                        fontSize:12, fontWeight:600,
                      }}>{inq.service}</span>
                    </td>
                    <td style={{ width: 180, maxWidth: 180 }}>
                      <div
                        style={{
                          width: 180,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "var(--p-text-muted)",
                          fontSize: 13,
                        }}
                        title={inq.message}
                      >
                        {inq.message}
                      </div>
                    </td>
                    <td style={{ color:"#64748b", fontSize:12.5, whiteSpace:"nowrap" }}>
                      {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                        day:"numeric", month:"short", year:"numeric"
                      })}<br />
                      <span style={{ fontSize:11 }}>{new Date(inq.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}</span>
                    </td>
                    <td>
                      <select
                        className="paces-select"
                        style={{ width:"auto", minWidth:120, fontSize:12, padding:"5px 28px 5px 10px" }}
                        value={inq.status}
                        onChange={e => handleUpdateStatus(inq._id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ textAlign:"right", paddingRight:20 }}>
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="paces-btn paces-btn-outline paces-btn-sm"
                        >Details</button>
                        <button
                          onClick={() => handleDelete(inq._id)}
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

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="paces-modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedInquiry(null)}>
          <div className="paces-modal">
            <div className="paces-modal-header">
              <div className="paces-modal-title">Inquiry Details</div>
              <button className="paces-modal-close" onClick={() => setSelectedInquiry(null)}>✕</button>
            </div>

            {/* Lead Header */}
            <div style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"14px 16px", background:"#f8fafc",
              borderRadius:12, marginBottom:16,
            }}>
              <div className="paces-lead-avatar" style={{ width:44, height:44, fontSize:16, background: getAvatarColor(selectedInquiry.name) }}>
                {(selectedInquiry.name || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#0f172a" }}>{selectedInquiry.name}</div>
                <div style={{ fontSize:13, color:"#64748b" }}>{selectedInquiry.email}</div>
                {selectedInquiry.phone && <div style={{ fontSize:12, color:"#94a3b8" }}>{selectedInquiry.phone}</div>}
              </div>
              <span className={`paces-badge ${badgeClass(selectedInquiry.status)}`}>
                {selectedInquiry.status}
              </span>
            </div>

            {/* Fields */}
            <div>
              <div className="paces-detail-row">
                <div className="paces-detail-key">Requested Service</div>
                <div className="paces-detail-value">{selectedInquiry.service}</div>
              </div>
              <div className="paces-detail-row">
                <div className="paces-detail-key">Received</div>
                <div className="paces-detail-value">
                  {new Date(selectedInquiry.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="paces-detail-row">
                <div className="paces-detail-key">Message</div>
                <div className="paces-detail-value" style={{ whiteSpace:"pre-wrap", background:"#f8fafc", padding:"12px 14px", borderRadius:8, marginTop:4, fontSize:13, lineHeight:1.7 }}>
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="paces-modal-footer">
              <button onClick={() => handleDelete(selectedInquiry._id)} className="paces-btn paces-btn-danger">
                Delete Lead
              </button>
              <button onClick={() => setSelectedInquiry(null)} className="paces-btn paces-btn-coral">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInquiries;
