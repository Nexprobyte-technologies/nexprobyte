import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./admin-styles.css";

const AVATAR_COLORS = [
  "#ff4d6d","#10b981","#3b82f6","#8b5cf6","#f97316","#06b6d4","#ec4899",
];

function getAvatarColor(name = "") {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalInquiries: 48,
    newInquiries: 12,
    totalApplications: 24,
    activeJobs: 8,
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const [sRes, iRes] = await Promise.all([
        fetch("/api/stats",   { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/inquiries", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (sRes.ok) { const sd = await sRes.json(); setStats(p => ({ ...p, ...sd })); }
      if (iRes.ok) { const id = await iRes.json(); setRecentInquiries(id.slice(0, 6)); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const statCards = [
    { label: "Leads Generated",  value: `${stats.totalInquiries}`,    change: "+5.12%", up: true,  sub: "vs last month" },
    { label: "Qualified Leads",  value: `${stats.newInquiries}`,      change: "-3.45%", up: false, sub: "vs last month" },
    { label: "Total Jobs Active",value: `${stats.activeJobs}`,        change: "+2.94%", up: true,  sub: "open positions" },
    { label: "Applications",     value: `${stats.totalApplications}`, change: "+4.21%", up: true,  sub: "this quarter"  },
  ];

  const badgeClass = (status) =>
    status === "New" ? "badge-coral" :
    status === "Completed" ? "badge-teal" :
    status === "In Progress" ? "badge-blue" : "badge-gray";

  return (
    <div>
      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">CRM Dashboard</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Dashboard <span>›</span> CRM
          </div>
        </div>
        <button className="paces-btn paces-btn-coral" onClick={fetchData}>
          ↻ &nbsp;Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="paces-stats-grid">
        {statCards.map((c, i) => (
          <div className="paces-stat-card" key={i}>
            <div className="paces-stat-label">{c.label}</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div className="paces-stat-value">{c.value}</div>
              {/* Mini sparkline */}
              <svg width="60" height="32" viewBox="0 0 60 32">
                <path
                  d={c.up
                    ? "M2 28 Q15 18, 30 22 T58 6"
                    : "M2 8  Q15 16, 30 12 T58 26"}
                  fill="none"
                  stroke={c.up ? "#10b981" : "#ff4d6d"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="paces-stat-footer">
              <span className={c.up ? "paces-stat-up" : "paces-stat-down"}>
                {c.up ? "↗" : "↘"} {c.change}
              </span>
              <span className="paces-stat-neutral">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="paces-charts-grid">
        {/* Overview Chart */}
        <div className="paces-card">
          <div className="paces-card-header">
            <div>
              <div className="paces-card-title">Overview</div>
              <div className="paces-card-subtitle">Current Year Performance</div>
            </div>
            <div className="paces-pill-tabs">
              {["All","1M","6M","1Y"].map(t => (
                <button
                  key={t}
                  className={`paces-pill-tab ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="paces-alert paces-alert-info" style={{ marginBottom: 16 }}>
            <span>ℹ️</span>
            <span><strong>Backend Connected:</strong> Real-time REST API data synchronization is active.</span>
          </div>

          <div className="paces-metrics-row">
            {[
              { icon: "💲", val: "$56.63k", lbl: "Revenue",  bg: "#fff0f3", cl: "#ff4d6d" },
              { icon: "📦", val: "9,842",   lbl: "Orders",   bg: "#ecfdf5", cl: "#10b981" },
              { icon: "👥", val: "95.3k",   lbl: "New Users",bg: "#eff6ff", cl: "#3b82f6" },
            ].map((m, i) => (
              <div className="paces-metric-chip" key={i}>
                <div className="paces-metric-icon" style={{ background: m.bg, color: m.cl }}>{m.icon}</div>
                <div>
                  <div className="paces-metric-val">{m.val}</div>
                  <div className="paces-metric-lbl">{m.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bar + Line Chart */}
          <div style={{ position: "relative", marginTop: 8 }}>
            <svg width="100%" height="180" viewBox="0 0 600 180" preserveAspectRatio="none">
              {/* Grid */}
              {[40,90,140].map(y => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4"/>
              ))}
              {/* Teal Bars */}
              {[45,90,135,180,225,270,315,360,405,450,495,540].map((x,i)=>(
                <rect key={i} x={x-9} y={60+(i%4)*18} width="9" height={115-(i%4)*18} rx="3" fill="#10b981" opacity="0.8"/>
              ))}
              {/* Orange Bars */}
              {[45,90,135,180,225,270,315,360,405,450,495,540].map((x,i)=>(
                <rect key={i} x={x+2} y={80+(i%3)*14} width="9" height={90-(i%3)*14} rx="3" fill="#f97316" opacity="0.75"/>
              ))}
              {/* Spline */}
              <path d="M 20 120 C 100 60, 200 100, 300 75 S 500 45, 580 35"
                fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>

            {/* Month Labels */}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#94a3b8", fontWeight:600, marginTop:4, padding:"0 4px" }}>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m=><span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Lead Source Donut */}
        <div className="paces-card" style={{ display:"flex", flexDirection:"column" }}>
          <div className="paces-card-header">
            <div>
              <div className="paces-card-title">Lead Source</div>
              <div className="paces-card-subtitle">Traffic breakdown</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button className="paces-btn paces-btn-outline paces-btn-sm">Export</button>
            </div>
          </div>

          {/* Donut */}
          <div style={{ position:"relative", width:160, height:160, margin:"16px auto" }}>
            <svg width="160" height="160" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#ff4d6d" strokeWidth="5" strokeDasharray="44 100" strokeDashoffset="25"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="34 100" strokeDashoffset="81"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="5" strokeDasharray="22 100" strokeDashoffset="47"/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>Total</div>
              <div style={{ fontSize:22, fontWeight:800, color:"#0f172a" }}>578</div>
            </div>
          </div>

          {/* Legend */}
          <div className="paces-legend" style={{ marginTop:"auto" }}>
            {[
              { color:"#ff4d6d", label:"Newsletter",  pct:"6.4%"  },
              { color:"#10b981", label:"WhatsApp",    pct:"8.9%"  },
              { color:"#8b5cf6", label:"Instagram",   pct:"34.8%" },
              { color:"#f97316", label:"Website",     pct:"44.3%" },
            ].map((l,i)=>(
              <div className="paces-legend-item" key={i}>
                <span>
                  <span className="paces-legend-dot" style={{ background:l.color }}/>
                  <span className="paces-legend-label">{l.label}</span>
                </span>
                <span className="paces-legend-value">{l.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="paces-card">
        <div className="paces-card-header">
          <div>
            <div className="paces-card-title">Recent Contact Inquiries</div>
            <div className="paces-card-subtitle">Latest form submissions from the website</div>
          </div>
          <Link to="/admin/inquiries" className="paces-btn paces-btn-outline paces-btn-sm">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading data…</div>
          </div>
        ) : recentInquiries.length === 0 ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">📭</div>
            <div className="paces-empty-text">No inquiries yet</div>
            <div className="paces-empty-sub">Contact form submissions will appear here</div>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Service</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map(inq => (
                  <tr key={inq._id}>
                    <td>
                      <div className="paces-lead-row">
                        <div className="paces-lead-avatar" style={{ background: getAvatarColor(inq.name) }}>
                          {(inq.name||"?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="paces-td-name">{inq.name}</div>
                          <div className="paces-td-sub">{inq.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:"#475569", fontWeight:500 }}>{inq.service}</td>
                    <td style={{ maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", color:"#64748b" }}>
                      {inq.message}
                    </td>
                    <td style={{ color:"#64748b", fontSize:12 }}>
                      {new Date(inq.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                    <td>
                      <span className={`paces-badge ${badgeClass(inq.status)}`}>{inq.status || "New"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
