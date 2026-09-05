import React, { useEffect, useState } from "react";
import "./admin-styles.css";

export function AdminAbout() {
  const [formData, setFormData] = useState({
    eyebrow: "WHO WE ARE",
    title: "We Build Digital Products That Scale",
    subtitle: "Nexprobyte Technologies is a digital agency based in Coimbatore, India. We combine technical rigor, thoughtful UI design, and data-driven marketing to help businesses grow.",
    story: "Founded with a vision to deliver enterprise-grade digital experiences for ambitious companies, Nexprobyte brings together engineering excellence and design precision.",
    mission: "To empower businesses with technology solutions that generate measurable revenue, elevate brand presence, and scale seamlessly.",
    vision: "To be the premier digital transformation partner for startups, SMEs, and global enterprises.",
    stats: [
      { label: "Projects Completed", value: "120+" },
      { label: "Client Satisfaction", value: "99%"  },
      { label: "Team Specialists",   value: "25+"   },
      { label: "Years Experience",   value: "6+"    },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const [err, setErr]         = useState("");

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about");
      if (res.ok) { const data = await res.json(); setFormData(p => ({ ...p, ...data })); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!formData.title.trim() || !formData.subtitle.trim())
      return setErr("Title and Subtitle are required.");

    setSaving(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save changes.");
      setMsg("About page content updated and published successfully!");
      setTimeout(() => setMsg(""), 5000);
    } catch(e) { setErr(e.message || "Could not save content."); }
    finally { setSaving(false); }
  };

  const updateStat = (i, field, val) => {
    const ns = [...formData.stats];
    ns[i] = { ...ns[i], [field]: val };
    setFormData(p => ({ ...p, stats: ns }));
  };
  const update = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div>
      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">About Page Editor</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Management <span>›</span> About Content
          </div>
        </div>
        <button
          type="submit"
          form="about-form"
          className="paces-btn paces-btn-coral"
          disabled={saving || loading}
        >
          {saving ? "Saving…" : "Publish Changes →"}
        </button>
      </div>

      {msg && <div className="paces-alert paces-alert-success">✅ {msg}</div>}
      {err && <div className="paces-alert paces-alert-error">⚠️ {err}</div>}

      {loading ? (
        <div className="paces-card">
          <div className="paces-empty"><div className="paces-empty-icon">⏳</div><div className="paces-empty-text">Loading content…</div></div>
        </div>
      ) : (
        <form id="about-form" onSubmit={handleSave}>
          {/* Section 1: Header */}
          <div className="paces-card">
            <div className="paces-card-header">
              <div>
                <div className="paces-card-title">Header &amp; Intro</div>
                <div className="paces-card-subtitle">The top section of the About page</div>
              </div>
            </div>

            <div className="paces-form-group">
              <label className="paces-label">Eyebrow Tag</label>
              <input type="text" className="paces-input" value={formData.eyebrow}
                onChange={e => update("eyebrow", e.target.value)}
                placeholder="e.g. WHO WE ARE" />
            </div>

            <div className="paces-form-group">
              <label className="paces-label">Main Headline *</label>
              <input type="text" className="paces-input" value={formData.title}
                onChange={e => update("title", e.target.value)} required
                placeholder="Primary heading shown on the page" />
            </div>

            <div className="paces-form-group" style={{ marginBottom:0 }}>
              <label className="paces-label">Subtitle / Description *</label>
              <textarea className="paces-textarea" rows={3} value={formData.subtitle}
                onChange={e => update("subtitle", e.target.value)} required
                placeholder="A paragraph describing your company" />
            </div>
          </div>

          {/* Section 2: Story & Values */}
          <div className="paces-card">
            <div className="paces-card-header">
              <div>
                <div className="paces-card-title">Story, Mission &amp; Vision</div>
                <div className="paces-card-subtitle">Company narrative and core values</div>
              </div>
            </div>

            <div className="paces-form-group">
              <label className="paces-label">Our Story</label>
              <textarea className="paces-textarea" rows={4} value={formData.story}
                onChange={e => update("story", e.target.value)}
                placeholder="Founding story and background…" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div className="paces-form-group" style={{ marginBottom:0 }}>
                <label className="paces-label">Our Mission</label>
                <textarea className="paces-textarea" rows={4} value={formData.mission}
                  onChange={e => update("mission", e.target.value)}
                  placeholder="What drives us every day…" />
              </div>
              <div className="paces-form-group" style={{ marginBottom:0 }}>
                <label className="paces-label">Our Vision</label>
                <textarea className="paces-textarea" rows={4} value={formData.vision}
                  onChange={e => update("vision", e.target.value)}
                  placeholder="Where we're headed…" />
              </div>
            </div>
          </div>

          {/* Section 3: Stats */}
          <div className="paces-card">
            <div className="paces-card-header">
              <div>
                <div className="paces-card-title">Key Metrics</div>
                <div className="paces-card-subtitle">Statistics displayed on the About page</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12 }}>
              {formData.stats.map((st, i) => (
                <div key={i} style={{
                  background:"#f8fafc", border:"1px solid #eef0f7",
                  borderRadius:12, padding:16,
                }}>
                  <div style={{
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    width:28, height:28, borderRadius:"50%",
                    background:"var(--p-coral-light)", color:"var(--p-coral)",
                    fontWeight:800, fontSize:12, marginBottom:10,
                  }}>{i + 1}</div>
                  <div className="paces-form-group">
                    <label className="paces-label">Label</label>
                    <input type="text" className="paces-input" value={st.label}
                      onChange={e => updateStat(i, "label", e.target.value)} />
                  </div>
                  <div className="paces-form-group" style={{ marginBottom:0 }}>
                    <label className="paces-label">Value</label>
                    <input type="text" className="paces-input" value={st.value}
                      onChange={e => updateStat(i, "value", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #eef0f7", display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button type="button" onClick={fetchContent} className="paces-btn paces-btn-outline" disabled={loading}>
                ↺ Reset to Saved
              </button>
              <button type="submit" className="paces-btn paces-btn-coral" disabled={saving}>
                {saving ? "Saving…" : "Save &amp; Publish →"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminAbout;
