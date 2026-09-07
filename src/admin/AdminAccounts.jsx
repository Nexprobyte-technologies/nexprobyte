import React, { useEffect, useState } from "react";
import Pagination, { usePagination } from "./Pagination.jsx";
import "./admin-styles.css";

const CATEGORIES = ["Office Supplies", "Travel", "Food / Refreshments", "Internet / Phone", "Software / Tools", "Equipment", "Salary", "Rent", "Miscellaneous"];

const EMPTY_FORM = {
  date: new Date().toISOString().split("T")[0],
  category: "Office Supplies",
  to: "",
  reason: "",
  amount: "",
  type: "Office",
  note: "",
};

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminAccounts() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterType, setFilterType] = useState("All");

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/expenses", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setEntries(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadList = async () => {
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/expenses", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setEntries(await res.json());
    } catch (e) { console.error(e); }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  };
  const openEdit = (e) => {
    setEditingId(e._id);
    setForm({
      date: e.date,
      category: e.category || "General",
      to: e.to || "",
      reason: e.reason || "",
      amount: String(e.amount ?? ""),
      type: e.type || "Office",
      note: e.note || "",
    });
    setError("");
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setError(""); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (!form.date) return setError("Date is required.");
    if (!form.reason || !form.reason.trim()) return setError("Reason / purpose is required.");
    if (!form.amount || Number(form.amount) <= 0) return setError("Enter a valid amount.");
    setSaving(true);
    const token = localStorage.getItem("nex_admin_token");
    const payload = { ...form, to: form.to.trim(), reason: form.reason.trim(), note: form.note.trim() };
    const url = editingId ? `/api/expenses/${editingId}` : "/api/expenses";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg(editingId ? "Expense updated." : "Expense recorded.");
        closeForm();
        loadList();
        setTimeout(() => setMsg(""), 2500);
      } else {
        const d = await res.json();
        setError(d.message || "Failed to save.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error while saving.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense record?")) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setEntries((prev) => prev.filter((x) => x._id !== id));
    } catch (e) { console.error(e); }
  };

  const monthly = entries.filter((e) => e.date && e.date.startsWith(month));
  const filtered = monthly.filter((e) => filterType === "All" || e.type === filterType);
  const pag = usePagination(filtered);
  const totalMonthly = monthly.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalFiltered = filtered.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const officeTotal = monthly.filter((e) => e.type !== "Salary").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const salaryTotal = monthly.filter((e) => e.type === "Salary").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const allTime = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div>
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Accounts &amp; Expenses</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Management <span>›</span> Office expense ledger
          </div>
        </div>
        <button onClick={showForm ? closeForm : openAdd} className="paces-btn paces-btn-coral">
          {showForm ? "✕ Close" : "＋ Add Expense"}
        </button>
      </div>

      {msg && <div className="paces-alert paces-alert-success">{msg}</div>}

      {/* Summary */}
      <div className="paces-stats-grid">
        <div className="paces-stat-card">
          <div className="paces-stat-label">All-Time Total</div>
          <div className="paces-stat-value">{inr(allTime)}</div>
          <div className="paces-stat-footer">Every expense recorded</div>
        </div>
        <div className="paces-stat-card">
          <div className="paces-stat-label">This Month ({month})</div>
          <div className="paces-stat-value">{inr(totalMonthly)}</div>
          <div className="paces-stat-footer">Office + Salary</div>
        </div>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Office Spend</div>
          <div className="paces-stat-value" style={{ color: "var(--p-coral)" }}>{inr(officeTotal)}</div>
          <div className="paces-stat-footer">Excludes salary</div>
        </div>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Salary Payout</div>
          <div className="paces-stat-value" style={{ color: "var(--p-teal)" }}>{inr(salaryTotal)}</div>
          <div className="paces-stat-footer">For current month</div>
        </div>
      </div>

      {/* Filters */}
      <div className="paces-card" style={{ marginBottom: 16 }}>
        <div className="paces-filter-bar">
          <label className="paces-label" style={{ marginBottom: 0 }}>Month</label>
          <input
            type="month"
            className="paces-input"
            style={{ width: 200 }}
            value={month}
            onChange={(e) => { setMonth(e.target.value); pag.reset(); }}
          />
          <label className="paces-label" style={{ marginBottom: 0, marginLeft: 8 }}>Type</label>
          <select
            className="paces-select"
            style={{ width: 180 }}
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); pag.reset(); }}
          >
            <option value="All">All</option>
            <option value="Office">Office</option>
            <option value="Salary">Salary</option>
          </select>
          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--p-text-muted)", fontWeight: 700 }}>
            Showing {filtered.length} · Total {inr(totalFiltered)}
          </div>
        </div>
      </div>

      {/* Inline Add / Edit Form */}
      {showForm && (
        <div className="paces-card" style={{ marginBottom: 16, borderLeft: "3px solid var(--p-coral)" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--p-text-dark)", marginBottom: 14 }}>
            {editingId ? "✏️ Edit Expense" : "🗂️ Record New Expense"}
          </div>
          {error && <div className="paces-alert paces-alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Date *</label>
                <input type="date" className="paces-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Amount (₹) *</label>
                <input type="number" min="0" className="paces-input" placeholder="e.g. 1500" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Category</label>
                <select className="paces-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">To / Spent For</label>
                <input type="text" className="paces-input" placeholder="e.g. Priya Josh / Office rent" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Reason / Purpose *</label>
                <input type="text" className="paces-input" placeholder="For what this money was spent" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
              </div>
              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Type</label>
                <select className="paces-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="Office">Office Expense</option>
                  <option value="Salary">Salary</option>
                </select>
              </div>
            </div>
            <div className="paces-form-group" style={{ marginTop: 14, marginBottom: 0 }}>
              <label className="paces-label">Note</label>
              <input type="text" className="paces-input" placeholder="Optional extra note" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--p-card-border)" }}>
              <button type="button" onClick={closeForm} className="paces-btn paces-btn-outline">Cancel</button>
              <button type="submit" disabled={saving} className="paces-btn paces-btn-coral">
                {saving ? "Saving…" : editingId ? "💾 Save Changes" : "＋ Add Expense"}
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
            <div className="paces-empty-text">Loading expenses…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="paces-empty" style={{ padding: "48px 24px" }}>
            <div className="paces-empty-icon">💰</div>
            <div className="paces-empty-text">No expenses for this month</div>
            <div className="paces-empty-sub">Click "＋ Add Expense" to record a daily office spend</div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>To / For</th>
                  <th>Reason / Purpose</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Type</th>
                  <th>Note</th>
                  <th style={{ textAlign: "right", paddingRight: 24 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pag.paged.map((e) => (
                  <tr key={e._id}>
                    <td>{fmtDate(e.date)}</td>
                    <td>
                      <span className={`paces-badge ${e.type === "Salary" ? "badge-teal" : "badge-blue"}`}>{e.category}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--p-text-dark)" }}>{e.to || "—"}</td>
                    <td>{e.reason}</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "var(--p-text-dark)" }}>{inr(e.amount)}</td>
                    <td>
                      <span className={`paces-badge ${e.type === "Salary" ? "badge-purple" : "badge-gray"}`}>{e.type}</span>
                    </td>
                    <td style={{ color: "#64748b", fontSize: 12.5 }}>{e.note || "—"}</td>
                    <td style={{ textAlign: "right", paddingRight: 20, whiteSpace: "nowrap" }}>
                      <button onClick={() => openEdit(e)} className="paces-btn paces-btn-outline paces-btn-sm">✏️ Edit</button>
                      <button onClick={() => handleDelete(e._id)} className="paces-btn paces-btn-danger paces-btn-sm" style={{ marginLeft: 6 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={pag.page} pageCount={pag.totalPages} total={pag.total} onPage={pag.go} />
    </div>
  );
}

export default AdminAccounts;