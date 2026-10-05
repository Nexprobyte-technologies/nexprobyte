import React, { useEffect, useState, useRef } from "react";
import Pagination, { usePagination } from "./Pagination.jsx";
import "./admin-styles.css";

const QUOTE_TYPES = ["Client", "Office"];
const QUOTE_STATUS = ["Draft", "Sent", "Accepted", "Rejected"];

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const EMPTY_FORM = {
  quoteType: "Client",
  date: new Date().toISOString().split("T")[0],
  partyName: "",
  partyCompany: "",
  partyEmail: "",
  partyPhone: "",
  partyAddress: "",
  title: "",
  description: "",
  items: [{ description: "", qty: 1, rate: 0 }],
  taxRate: 0,
  discount: 0,
  terms: [""],
  notes: "",
  status: "Draft",
  imageName: "",
  imageData: "",
};

function quoteTotals(form) {
  const subTotal = (form.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const discount = Math.max(0, Number(form.discount) || 0);
  const taxRate = Math.max(0, Number(form.taxRate) || 0);
  const taxAmount = Math.round(((subTotal - discount) * taxRate) / 100);
  const grandTotal = Math.round(subTotal - discount + taxAmount);
  return { subTotal, discount, taxRate, taxAmount, grandTotal };
}

function quotationPrintHTML(q) {
  const t = quoteTotals(q);
  const items = (q.items || [])
    .filter((it) => it && it.description)
    .map(
      (it) => `
      <tr>
        <td>${esc(it.description)}</td>
        <td style="text-align:center">${Number(it.qty) || 0}</td>
        <td style="text-align:right">${inr(it.rate)}</td>
        <td style="text-align:right"><strong>${inr((Number(it.qty) || 0) * (Number(it.rate) || 0))}</strong></td>
      </tr>`
    )
    .join("");

  const terms = (q.terms || []).filter(Boolean).map((x, i) => `<li>${i + 1}. ${esc(x)}</li>`).join("");

  return `
    <div style="max-width:820px;margin:0 auto;padding:36px 40px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
      <div style="display:flex;justify-content:space-between;border-bottom:3px solid #0ea5e9;padding-bottom:18px">
        <div>
          <div style="font-size:22px;font-weight:800;letter-spacing:0.5px">NEXPROBYTE TECHNOLOGIES</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px">Coimbatore Software Company • Full Project Development • Web • Design • Marketing</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:800;color:#0ea5e9">QUOTATION</div>
          <div style="font-size:12.5px;color:#475569;margin-top:4px"><strong>${esc(q.quoteNo || "")}</strong><br/>${fmtDate(q.date)}</div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin:24px 0">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#0ea5e9;margin-bottom:6px">Prepared For${q.quoteType === "Office" ? " (Internal)" : ""}</div>
          <div style="font-size:15px;font-weight:700">${esc(q.partyName || "—")}</div>
          ${q.partyCompany ? `<div style="font-size:13px;color:#475569">${esc(q.partyCompany)}</div>` : ""}
          ${q.partyEmail ? `<div style="font-size:13px;color:#475569">${esc(q.partyEmail)}</div>` : ""}
          ${q.partyPhone ? `<div style="font-size:13px;color:#475569">${esc(q.partyPhone)}</div>` : ""}
          ${q.partyAddress ? `<div style="font-size:13px;color:#475569">${esc(q.partyAddress)}</div>` : ""}
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#0ea5e9;margin-bottom:6px">Status</div>
          <span style="display:inline-block;padding:5px 14px;border-radius:999px;font-size:12px;font-weight:700;background:${statusBg(q.status)};color:#fff">${esc(q.status || "Draft")}</span>
        </div>
      </div>

      <div style="background:#f1f5f9;border-radius:10px;padding:14px 16px;margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Work / Services</div>
        <div style="font-size:16px;font-weight:800">${esc(q.title || "—")}</div>
        ${q.description ? `<div style="font-size:13px;color:#475569;margin-top:4px">${esc(q.description)}</div>` : ""}
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#0ea5e9;color:#fff">
            <th style="text-align:left;padding:10px 12px">Description</th>
            <th style="padding:10px 8px">Qty</th>
            <th style="padding:10px 8px;text-align:right">Rate</th>
            <th style="padding:10px 12px;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items || `<tr><td colspan="4" style="padding:12px;color:#94a3b8;text-align:center">No line items</td></tr>`}
        </tbody>
      </table>

      <div style="display:flex;justify-content:flex-end;margin-top:18px">
        <div style="width:320px">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569">
            <span>Subtotal</span><span>${inr(t.subTotal)}</span>
          </div>
          ${t.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569"><span>Discount</span><span>− ${inr(t.discount)}</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569">
            <span>Tax (GST ${t.taxRate}%)</span><span>${inr(t.taxAmount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:17px;font-weight:800;border-top:2px solid #0ea5e9;margin-top:4px">
            <span>Grand Total</span><span>${inr(t.grandTotal)}</span>
          </div>
        </div>
      </div>

      ${terms ? `<div style="margin-top:26px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#0ea5e9;margin-bottom:8px">Terms & Conditions</div><ul style="font-size:13px;color:#475569;margin:0;padding-left:0;list-style:none">${terms}</ul></div>` : ""}
      ${q.notes ? `<div style="margin-top:18px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#0ea5e9;margin-bottom:6px">Notes</div><div style="font-size:13px;color:#475569">${esc(q.notes)}</div></div>` : ""}

      <div style="margin-top:34px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8">
        <div>Prepared by ${esc(q.createdBy || "NexAdmin")} • Nexprobyte Technologies — Coimbatore Software Company for Full Project Solutions &amp; Backlink Services</div>
        <div>Quote # ${esc(q.quoteNo || "")}</div>
      </div>
    </div>
  `;
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function statusBg(s) {
  switch (s) {
    case "Accepted": return "#0d9488";
    case "Rejected": return "#ef4444";
    case "Sent": return "#0ea5e9";
    default: return "#64748b";
  }
}

function downloadQuotePDF(q) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <title>${q.quoteNo || "Quotation"}.pdf</title>
        <style>
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body onload="setTimeout(function(){ window.print(); }, 350)">
        ${quotationPrintHTML(q)}
      </body>
    </html>`);
  w.document.close();
}

export function AdminQuotations() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewing, setViewing] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/quotations", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setQuotes(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, items: [{ description: "", qty: 1, rate: 0 }], terms: [""] });
    setError("");
    setShowForm(true);
  };

  const openEdit = (q) => {
    setEditingId(q._id);
    setForm({
      quoteType: q.quoteType || "Client",
      date: q.date || new Date().toISOString().split("T")[0],
      partyName: q.partyName || "",
      partyCompany: q.partyCompany || "",
      partyEmail: q.partyEmail || "",
      partyPhone: q.partyPhone || "",
      partyAddress: q.partyAddress || "",
      title: q.title || "",
      description: q.description || "",
      items: (q.items && q.items.length ? q.items : [{ description: "", qty: 1, rate: 0 }]).map((it) => ({ description: it.description || "", qty: Number(it.qty) || 1, rate: Number(it.rate) || 0 })),
      taxRate: q.taxRate ?? 0,
      discount: q.discount ?? 0,
      terms: q.terms && q.terms.length ? q.terms.map(String) : [""],
      notes: q.notes || "",
      status: q.status || "Draft",
      imageName: q.imageName || "",
      imageData: q.imageData || "",
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setError(""); };

  const updateItem = (i, field, value) => {
    setForm((f) => {
      const items = f.items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it));
      return { ...f, items };
    });
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { description: "", qty: 1, rate: 0 }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, idx) => idx !== i) : f.items }));

  const updateTerm = (i, value) => {
    setForm((f) => {
      const terms = f.terms.map((t, idx) => (idx === i ? value : t));
      return { ...f, terms };
    });
  };
  const addTerm = () => setForm((f) => ({ ...f, terms: [...f.terms, ""] }));
  const removeTerm = (i) => setForm((f) => ({ ...f, terms: f.terms.filter((_, idx) => idx !== i) }));

  const onImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/\.(png|jpe?g|webp)$/i.test(file.name) && !/^image\//.test(file.type)) {
      setError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const scale = MAX / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        setForm((f) => ({ ...f, imageName: file.name, imageData: canvas.toDataURL("image/jpeg", 0.82) }));
        setError("");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (!form.title || !form.title.trim()) return setError("Quotation title / work description is required.");
    if (!form.partyName || !form.partyName.trim()) return setError(form.quoteType === "Office" ? "Raised By / Department is required." : "Client name is required.");
    if (!form.items.some((it) => it.description && it.description.trim())) return setError("Add at least one line item with a description.");
    setSaving(true);
    const token = localStorage.getItem("nex_admin_token");
    const payload = {
      ...form,
      partyName: form.partyName.trim(),
      partyCompany: form.partyCompany.trim(),
      partyEmail: form.partyEmail.trim(),
      partyPhone: form.partyPhone.trim(),
      partyAddress: form.partyAddress.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),
      items: form.items.filter((it) => it.description && it.description.trim()).map((it) => ({ description: it.description.trim(), qty: Number(it.qty) || 0, rate: Number(it.rate) || 0 })),
      terms: form.terms.map((t) => t.trim()).filter(Boolean),
      taxRate: Number(form.taxRate) || 0,
      discount: Number(form.discount) || 0,
    };
    const url = editingId ? `/api/quotations/${editingId}` : "/api/quotations";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg(editingId ? "Quotation updated." : "Quotation created.");
        closeForm();
        fetchQuotes();
        setTimeout(() => setMsg(""), 2500);
      } else {
        let msg = "Failed to save.";
        try {
          const d = await res.json();
          msg = d.message || msg;
        } catch {
          try {
            const txt = await res.text();
            if (txt) msg = txt;
          } catch { /* keep default */ }
        }
        setError(msg);
      }
    } catch (e) {
      console.error(e);
      setError("Network error while saving. Is the backend server running?");
    } finally { setSaving(false); }
  };

  const handleStatus = async (q, status) => {
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/quotations/${q._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...q, status }),
      });
      if (res.ok) { setMsg(`Status → ${status}`); fetchQuotes(); setTimeout(() => setMsg(""), 2000); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quotation permanently?")) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      await fetch(`/api/quotations/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setQuotes((prev) => prev.filter((x) => x._id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = quotes.filter(
    (q) => (filterType === "All" || q.quoteType === filterType) && (filterStatus === "All" || q.status === filterStatus)
  );
  const pag = usePagination(filtered);
  const totalValue = quotes.reduce((s, q) => s + (Number(q.grandTotal) || 0), 0);
  const acceptedValue = quotes.filter((q) => q.status === "Accepted").reduce((s, q) => s + (Number(q.grandTotal) || 0), 0);
  const clientCount = quotes.filter((q) => q.quoteType === "Client").length;
  const officeCount = quotes.filter((q) => q.quoteType === "Office").length;
  const t = quoteTotals(form);

  const ViewModal = viewing && (
    <div className="paces-modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewing(null)}>
      <div className="paces-modal" style={{ maxWidth: 900, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <div className="paces-modal-header">
          <div className="paces-modal-title">📄 {viewing.quoteNo} — Quotation Preview</div>
          <button className="paces-modal-close" onClick={() => setViewing(null)}>✕</button>
        </div>
        <div style={{ overflow: "auto", padding: 8 }}>
          <div className="paces-quote-sheet" dangerouslySetInnerHTML={{ __html: quotationPrintHTML(viewing) }} />
        </div>
        <div className="paces-modal-footer" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", width: "100%" }}>
            <button onClick={() => setViewing(null)} className="paces-btn paces-btn-outline">Close</button>
            <button onClick={() => downloadQuotePDF(viewing)} className="paces-btn paces-btn-coral">⬇ Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Quotation Portal</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Accounts Portal <span>›</span> Client &amp; office quotations
          </div>
        </div>
        <button onClick={showForm ? closeForm : openAdd} className="paces-btn paces-btn-coral">
          {showForm ? "✕ Close" : "＋ New Quotation"}
        </button>
      </div>

      {msg && <div className="paces-alert paces-alert-success">{msg}</div>}

      <div className="paces-stats-grid">
        <div className="paces-stat-card">
          <div className="paces-stat-label">Total Quotations</div>
          <div className="paces-stat-value">{quotes.length}</div>
          <div className="paces-stat-footer">{inr(totalValue)} total quoted value</div>
        </div>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Client Quotes</div>
          <div className="paces-stat-value" style={{ color: "var(--p-coral)" }}>{clientCount}</div>
          <div className="paces-stat-footer">External client quotations</div>
        </div>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Office Quotes</div>
          <div className="paces-stat-value" style={{ color: "var(--p-teal)" }}>{officeCount}</div>
          <div className="paces-stat-footer">Internal office quotations</div>
        </div>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Accepted Value</div>
          <div className="paces-stat-value" style={{ color: "var(--p-blue)" }}>{inr(acceptedValue)}</div>
          <div className="paces-stat-footer">Accepted quotations only</div>
        </div>
      </div>

      {/* Filters */}
      <div className="paces-card" style={{ marginBottom: 16 }}>
        <div className="paces-filter-bar">
          <label className="paces-label" style={{ marginBottom: 0 }}>Type</label>
          <select className="paces-select" style={{ width: 160 }} value={filterType} onChange={(e) => { setFilterType(e.target.value); pag.reset(); }}>
            <option value="All">All Types</option>
            {QUOTE_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <label className="paces-label" style={{ marginBottom: 0, marginLeft: 8 }}>Status</label>
          <select className="paces-select" style={{ width: 160 }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); pag.reset(); }}>
            <option value="All">All Status</option>
            {QUOTE_STATUS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--p-text-muted)", fontWeight: 700 }}>
            Showing {filtered.length} · Value {inr(filtered.reduce((s, q) => s + (Number(q.grandTotal) || 0), 0))}
          </div>
        </div>
      </div>

      {/* Inline Add / Edit Form */}
      {showForm && (
        <div className="paces-card" style={{ marginBottom: 16, borderLeft: "3px solid var(--p-coral)" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--p-text-dark)", marginBottom: 14 }}>
            {editingId ? "✏️ Edit Quotation" : "📄 Create New Quotation"}
          </div>
          {error && <div className="paces-alert paces-alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 160px 1fr 1fr", gap: 12 }}>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Type *</label>
                <select className="paces-select" value={form.quoteType} onChange={(e) => setForm((f) => ({ ...f, quoteType: e.target.value }))}>
                  {QUOTE_TYPES.map((x) => <option key={x} value={x}>{x} Quote</option>)}
                </select>
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Date *</label>
                <input type="date" className="paces-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">{form.quoteType === "Office" ? "Raised By / Dept *" : "Client Name *"}</label>
                <input type="text" className="paces-input" placeholder={form.quoteType === "Office" ? "e.g. IT Department" : "e.g. Rajesh Kumar"} value={form.partyName} onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">{form.quoteType === "Office" ? "Department / Section" : "Company / Organization"}</label>
                <input type="text" className="paces-input" placeholder={form.quoteType === "Office" ? "e.g. Marketing" : "e.g. TechCorp India"} value={form.partyCompany} onChange={(e) => setForm((f) => ({ ...f, partyCompany: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Email</label>
                <input type="email" className="paces-input" placeholder="email@example.com" value={form.partyEmail} onChange={(e) => setForm((f) => ({ ...f, partyEmail: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Phone</label>
                <input type="text" className="paces-input" placeholder="+91 98765 43210" value={form.partyPhone} onChange={(e) => setForm((f) => ({ ...f, partyPhone: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
                <label className="paces-label">Address</label>
                <input type="text" className="paces-input" placeholder="Address" value={form.partyAddress} onChange={(e) => setForm((f) => ({ ...f, partyAddress: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
                <label className="paces-label">Work / Services Title *</label>
                <input type="text" className="paces-input" placeholder="e.g. Website Redesign Package" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
                <label className="paces-label">Description</label>
                <textarea className="paces-input" rows={2} placeholder="Short description of the work / services (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Tax Rate (GST %)</label>
                <input type="number" min="0" step="any" className="paces-input" placeholder="e.g. 18" value={form.taxRate} onChange={(e) => setForm((f) => ({ ...f, taxRate: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Discount (₹)</label>
                <input type="number" min="0" step="any" className="paces-input" placeholder="e.g. 5000" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Status</label>
                <select className="paces-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {QUOTE_STATUS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Attach Image</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button type="button" onClick={() => fileRef.current && fileRef.current.click()} className="paces-btn paces-btn-outline paces-btn-sm">
                    🖼 {form.imageName ? "Change Image" : "Upload Image"}
                  </button>
                  {form.imageName && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, imageName: "", imageData: "" }))} className="paces-btn paces-btn-danger paces-btn-sm">
                      ✕ Remove
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: "none" }} onChange={onImage} />
                </div>
              </div>
            </div>

            {form.imageData && (
              <div style={{ marginTop: 12 }}>
                <img src={form.imageData} alt="preview" style={{ maxHeight: 140, borderRadius: 8, border: "1px solid var(--p-card-border)" }} />
                <span style={{ marginLeft: 10, fontSize: 12, color: "var(--p-text-muted)" }}>{form.imageName}</span>
              </div>
            )}

            {/* Line Items */}
            <div style={{ marginTop: 20, borderTop: "1px solid var(--p-card-border)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--p-text-dark)" }}>📋 Line Items</div>
                <button type="button" onClick={addItem} className="paces-btn paces-btn-outline paces-btn-sm">＋ Add Item</button>
              </div>
              <div className="paces-table-wrap">
                <table className="paces-table">
                  <thead>
                    <tr>
                      <th style={{ width: "46%" }}>Description</th>
                      <th style={{ width: "16%" }}>Qty</th>
                      <th style={{ width: "18%" }}>Rate (₹)</th>
                      <th style={{ width: "16%" }}>Amount</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((it, i) => (
                      <tr key={i}>
                        <td>
                          <input type="text" className="paces-input" placeholder="e.g. UI/UX Design" value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                        </td>
                        <td>
                          <input type="number" min="0" step="any" className="paces-input" value={it.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} />
                        </td>
                        <td>
                          <input type="number" min="0" step="any" className="paces-input" placeholder="0" value={it.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} />
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "var(--p-text-dark)" }}>{inr((Number(it.qty) || 0) * (Number(it.rate) || 0))}</td>
                        <td style={{ textAlign: "center" }}>
                          <button type="button" onClick={() => removeItem(i)} className="paces-btn paces-btn-danger paces-btn-sm" disabled={form.items.length <= 1}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <div style={{ width: 320, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--p-text-muted)" }}>
                  <span>Subtotal</span><span>{inr(t.subTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--p-text-muted)" }}>
                  <span>Discount</span><span>− {inr(t.discount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--p-text-muted)" }}>
                  <span>Tax ({Number(form.taxRate) || 0}%)</span><span>{inr(t.taxAmount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontWeight: 800, fontSize: 15, color: "var(--p-text-dark)", borderTop: "2px solid var(--p-coral)" }}>
                  <span>Grand Total</span><span>{inr(t.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div style={{ marginTop: 20, borderTop: "1px solid var(--p-card-border)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--p-text-dark)" }}>📌 Terms &amp; Conditions</div>
                <button type="button" onClick={addTerm} className="paces-btn paces-btn-outline paces-btn-sm">＋ Add Term</button>
              </div>
              {form.terms.map((term, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="text" className="paces-input" placeholder={`Term ${i + 1} — e.g. 50% advance payment`} value={term} onChange={(e) => updateTerm(i, e.target.value)} />
                  <button type="button" onClick={() => removeTerm(i)} className="paces-btn paces-btn-danger paces-btn-sm">✕</button>
                </div>
              ))}
            </div>

            <div className="paces-form-group" style={{ marginTop: 14, marginBottom: 0 }}>
              <label className="paces-label">Notes</label>
              <input type="text" className="paces-input" placeholder="Optional internal note" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--p-card-border)" }}>
              <button type="button" onClick={closeForm} className="paces-btn paces-btn-outline">Cancel</button>
              <button type="submit" disabled={saving} className="paces-btn paces-btn-coral">
                {saving ? "Saving…" : editingId ? "💾 Save Changes" : "＋ Create Quotation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="paces-empty" style={{ padding: "48px 24px" }}>
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading quotations…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="paces-empty" style={{ padding: "48px 24px" }}>
            <div className="paces-empty-icon">📄</div>
            <div className="paces-empty-text">No quotations found</div>
            <div className="paces-empty-sub">Click "＋ New Quotation" to create client or office quotations</div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Quote No</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Party</th>
                  <th>Work / Services</th>
                  <th style={{ textAlign: "center" }}>Items</th>
                  <th style={{ textAlign: "right" }}>Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", paddingRight: 24 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pag.paged.map((q) => (
                  <tr key={q._id}>
                    <td style={{ fontWeight: 800, color: "var(--p-text-dark)", whiteSpace: "nowrap" }}>{q.quoteNo}</td>
                    <td>{fmtDate(q.date)}</td>
                    <td>
                      <span className={`paces-badge ${q.quoteType === "Client" ? "badge-blue" : "badge-purple"}`}>{q.quoteType}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--p-text-dark)" }}>{q.partyName || "—"}</div>
                      {q.partyCompany && <div style={{ fontSize: 11.5, color: "var(--p-text-muted)" }}>{q.partyCompany}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{q.title || "—"}</div>
                      {q.description && <div style={{ fontSize: 11.5, color: "var(--p-text-muted)", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.description}</div>}
                    </td>
                    <td style={{ textAlign: "center" }}>{Array.isArray(q.items) && q.items.length ? q.items.length : "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "var(--p-text-dark)" }}>{inr(q.grandTotal)}</td>
                    <td>
                      <select
                        className="paces-select"
                        style={{ width: 120, padding: "5px 8px", fontSize: 12 }}
                        value={q.status || "Draft"}
                        onChange={(e) => handleStatus(q, e.target.value)}
                      >
                        {QUOTE_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: "right", paddingRight: 20, whiteSpace: "nowrap" }}>
                      <button onClick={() => setViewing(q)} className="paces-btn paces-btn-outline paces-btn-sm">👁 View</button>
                      <button onClick={() => downloadQuotePDF(q)} className="paces-btn paces-btn-outline paces-btn-sm" style={{ marginLeft: 6 }}>⬇ PDF</button>
                      <button onClick={() => openEdit(q)} className="paces-btn paces-btn-outline paces-btn-sm" style={{ marginLeft: 6 }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(q._id)} className="paces-btn paces-btn-danger paces-btn-sm" style={{ marginLeft: 6 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={pag.page} pageCount={pag.totalPages} total={pag.total} onPage={pag.go} />
      {ViewModal}
    </div>
  );
}

export default AdminQuotations;