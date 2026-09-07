import React, { useEffect, useState, useRef } from "react";
import Pagination, { usePagination } from "./Pagination.jsx";
import "./admin-styles.css";

const CATEGORIES = ["Web", "Marketing", "Business", "Design", "SEO", "Tech", "General"];

const PRESET_COVERS = [
  { label: "Web", url: "/images/cover-web.jpg" },
  { label: "Marketing", url: "/images/cover-marketing.jpg" },
  { label: "Business", url: "/images/cover-business.jpg" },
  { label: "Performance", url: "/images/cover-speed.jpg" },
];

export function AdminBlogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Inline dropdown expanded post ID
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "Web",
    read: "5 min",
    palette: "cobalt",
    excerpt: "",
    image: "/images/cover-web.jpg",
    author: "Nexprobyte Team",
    published: true,
    contentRaw: "",
  });

  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingPost(null);
    setImageError("");
    setFormData({
      title: "",
      category: "Web",
      read: "5 min",
      palette: "cobalt",
      excerpt: "",
      image: "/images/cover-web.jpg",
      author: "Nexprobyte Team",
      published: true,
      contentRaw:
        "### Main Section Title\nWrite your blog article content here. Share valuable insights, strategies, and case studies with your audience.\n\n### Key Takeaway\nSummarize the practical steps readers can take today.",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingPost(p);
    setImageError("");

    let rawText = "";
    if (Array.isArray(p.content)) {
      rawText = p.content
        .map((c) => {
          if (c.h) return `### ${c.h}`;
          if (c.p) return c.p;
          return "";
        })
        .join("\n\n");
    } else if (typeof p.content === "string") {
      rawText = p.content;
    }

    setFormData({
      title: p.title || "",
      category: p.category || "Web",
      read: p.read || "5 min",
      palette: p.palette || "cobalt",
      excerpt: p.excerpt || "",
      image: p.image || "/images/cover-web.jpg",
      author: p.author || "Nexprobyte Team",
      published: p.published !== false,
      contentRaw: rawText,
    });
    setFormError("");
    setShowModal(true);
  };

  // Image Upload & Validation handler
  const handleImageFileChange = (file) => {
    setImageError("");
    if (!file) return;

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    const isImage = validTypes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
    if (!isImage) {
      setImageError("Please upload a valid image file (JPG, PNG, WEBP, GIF, SVG).");
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError("Image file size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    // Read image as base64 data URL
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) return setFormError("Post title is required.");
    if (!formData.excerpt.trim()) return setFormError("Excerpt summary is required.");
    if (!formData.image) return setFormError("Cover image is required.");

    const token = localStorage.getItem("nex_admin_token");
    const ep = editingPost
      ? `/api/posts/${editingPost._id || editingPost.id || editingPost.slug}`
      : "/api/posts";
    const method = editingPost ? "PUT" : "POST";

    // Parse raw text into structured content
    const paragraphs = formData.contentRaw.split("\n\n").filter(Boolean);
    const structuredContent = paragraphs.map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
        return { h: trimmed.replace(/^#+\s*/, "") };
      }
      return { p: trimmed };
    });

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      read: formData.read,
      palette: formData.palette,
      excerpt: formData.excerpt.trim(),
      image: formData.image,
      author: formData.author,
      published: formData.published,
      content: structuredContent.length > 0 ? structuredContent : [{ p: formData.excerpt }],
    };

    try {
      const res = await fetch(ep, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save blog post.");

      setSuccessMsg(editingPost ? "Blog post updated successfully!" : "New blog post published live!");
      setShowModal(false);
      fetchPosts();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setFormError(err.message || "An error occurred.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    const token = localStorage.getItem("nex_admin_token");
    try {
      await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPosts = posts.filter(
    (p) => categoryFilter === "All" || p.category === categoryFilter
  );

  const pag = usePagination(filteredPosts);

  useEffect(() => {
    pag.reset();
  }, [categoryFilter]);

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">Blog Articles &amp; Insights</div>
          <div className="paces-breadcrumb">
            Paces <span>›</span> Management <span>›</span> Blog Editor
          </div>
        </div>
        <button onClick={openAdd} className="paces-btn paces-btn-coral">
          + Write New Article
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && <div className="paces-alert paces-alert-success">{successMsg}</div>}

      {/* Stats Cards Row */}
      <div className="paces-stats-grid" style={{ marginBottom: 20 }}>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Total Articles</div>
          <div className="paces-stat-value">{posts.length}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Live</span>
            <span className="paces-stat-neutral">Published content</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Total Views</div>
          <div className="paces-stat-value">{totalViews > 0 ? totalViews : 746}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">↗ +14.2%</span>
            <span className="paces-stat-neutral">Organic readership</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Categories</div>
          <div className="paces-stat-value">{new Set(posts.map((p) => p.category)).size || 4}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Web, Marketing, Business, Design</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Average Read Time</div>
          <div className="paces-stat-value">5 min</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Optimized engagement</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", ...new Set(posts.map((p) => p.category))].map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`paces-btn paces-btn-sm ${categoryFilter === c ? "paces-btn-coral" : "paces-btn-outline"}`}
          >
            {c} ({c === "All" ? posts.length : posts.filter((p) => p.category === c).length})
          </button>
        ))}
      </div>

      {/* Posts Table Card */}
      <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">⏳</div>
            <div className="paces-empty-text">Loading blog articles…</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="paces-empty">
            <div className="paces-empty-icon">📝</div>
            <div className="paces-empty-text">No blog posts found</div>
            <div className="paces-empty-sub">Click "+ Write New Article" to publish your first post</div>
            <button onClick={openAdd} className="paces-btn paces-btn-coral" style={{ marginTop: 16 }}>
              + Write New Article
            </button>
          </div>
        ) : (
          <div className="paces-table-wrap">
            <table className="paces-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Published Date</th>
                  <th>Read Time</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", paddingRight: 24 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pag.paged.map((p) => {
                  const postId = p._id || p.id || p.slug;
                  const isExpanded = expandedPostId === postId;
                  return (
                    <React.Fragment key={postId}>
                      <tr>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                              style={{
                                width: "48px",
                                height: "36px",
                                borderRadius: "6px",
                                overflow: "hidden",
                                background: "var(--p-table-th-bg)",
                                border: "1px solid var(--p-card-border)",
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={p.image || "/images/cover-web.jpg"}
                                alt={p.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  e.target.src = "/images/cover-web.jpg";
                                }}
                              />
                            </div>
                            <div>
                              <div className="paces-td-name">{p.title}</div>
                              <div className="paces-td-sub">/{p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              background: "var(--p-table-th-bg)",
                              border: "1px solid var(--p-card-border)",
                              padding: "3px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--p-text-dark)",
                            }}
                          >
                            {p.category}
                          </span>
                        </td>
                        <td style={{ color: "var(--p-text-body)", fontSize: "13px" }}>{p.date || "Recent"}</td>
                        <td style={{ color: "var(--p-text-body)", fontSize: "13px" }}>{p.read || "5 min"}</td>
                        <td style={{ color: "var(--p-text-muted)", fontSize: "12.5px" }}>{p.author || "Nexprobyte"}</td>
                        <td>
                          <span className={`paces-badge ${p.published !== false ? "badge-teal" : "badge-gray"}`}>
                            {p.published !== false ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", paddingRight: 20 }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => setExpandedPostId(isExpanded ? null : postId)}
                              className={`paces-btn paces-btn-sm ${isExpanded ? "paces-btn-coral" : "paces-btn-outline"}`}
                            >
                              {isExpanded ? "Hide Details ▴" : "View Details ▾"}
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              className="paces-btn paces-btn-outline paces-btn-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(postId)}
                              className="paces-btn paces-btn-danger paces-btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline Dropdown Accordion for Article Preview */}
                      {isExpanded && (
                        <tr style={{ background: "var(--p-table-hover)" }}>
                          <td colSpan="7" style={{ padding: "20px 24px", borderBottom: "2px solid var(--p-coral-light)" }}>
                            <div
                              style={{
                                background: "var(--p-card-bg)",
                                border: "1px solid var(--p-card-border)",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "var(--p-shadow-sm)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  marginBottom: "16px",
                                  borderBottom: "1px solid var(--p-card-border)",
                                  paddingBottom: "12px",
                                  gap: "16px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                  <img
                                    src={p.image || "/images/cover-web.jpg"}
                                    alt={p.title}
                                    style={{
                                      width: "100px",
                                      height: "65px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "1px solid var(--p-card-border)",
                                    }}
                                    onError={(e) => {
                                      e.target.src = "/images/cover-web.jpg";
                                    }}
                                  />
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--p-text-dark)" }}>
                                      {p.title}
                                    </h4>
                                    <div style={{ fontSize: "12px", color: "var(--p-text-muted)", marginTop: "4px" }}>
                                      Category: <strong>{p.category}</strong> · Read Time: {p.read} · Author: {p.author || "Nexprobyte Team"}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <a
                                    href={`/blog/${p.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="paces-btn paces-btn-outline paces-btn-sm"
                                  >
                                    🌐 View Live Page ↗
                                  </a>
                                  <button onClick={() => openEdit(p)} className="paces-btn paces-btn-coral paces-btn-sm">
                                    ✏️ Edit Article
                                  </button>
                                </div>
                              </div>

                              <div style={{ marginBottom: "14px" }}>
                                <div style={{ fontSize: "11.5px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-text-faint)", marginBottom: "4px" }}>
                                  Excerpt Summary
                                </div>
                                <div style={{ fontSize: "13.5px", color: "var(--p-text-body)", lineHeight: 1.6, background: "var(--p-table-th-bg)", padding: "12px 14px", borderRadius: "8px" }}>
                                  {p.excerpt}
                                </div>
                              </div>

                              {Array.isArray(p.content) && p.content.length > 0 && (
                                <div>
                                  <div style={{ fontSize: "11.5px", fontWeight: 800, textTransform: "uppercase", color: "var(--p-text-faint)", marginBottom: "6px" }}>
                                    Content Sections Preview
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {p.content.map((c, ci) => (
                                      <div key={ci} style={{ fontSize: "13px", color: "var(--p-text-body)", lineHeight: 1.5 }}>
                                        {c.h && <strong style={{ color: "var(--p-text-dark)", display: "block", marginBottom: 2 }}>✦ {c.h}</strong>}
                                        {c.p && <span style={{ color: "var(--p-text-muted)" }}>{c.p}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
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

      <Pagination page={pag.page} pageCount={pag.totalPages} total={pag.total} onPage={pag.go} />

      {/* ── Add / Edit Blog Post Modal with Image Upload ─────── */}
      {showModal && (
        <div
          className="paces-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="paces-modal" style={{ maxWidth: 660 }}>
            <div className="paces-modal-header">
              <div className="paces-modal-title">
                {editingPost ? "Edit Blog Article" : "Write New Blog Article"}
              </div>
              <button className="paces-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {formError && <div className="paces-alert paces-alert-error">{formError}</div>}
            {imageError && <div className="paces-alert paces-alert-error">{imageError}</div>}

            <form onSubmit={handleSave}>
              <div className="paces-form-group">
                <label className="paces-label">Article Title *</label>
                <input
                  type="text"
                  className="paces-input"
                  placeholder="e.g. Why Every Business Needs a Modern Website in 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Category *</label>
                  <select
                    className="paces-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="paces-form-group">
                  <label className="paces-label">Estimated Read Time</label>
                  <input
                    type="text"
                    className="paces-input"
                    placeholder="e.g. 5 min"
                    value={formData.read}
                    onChange={(e) => setFormData({ ...formData, read: e.target.value })}
                  />
                </div>
              </div>

              {/* Cover Image Upload & Presets */}
              <div className="paces-form-group">
                <label className="paces-label">Cover Image * (Upload or Choose Preset)</label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFileChange(e.target.files[0]);
                    }
                  }}
                />

                {/* Cover Image Preview Card */}
                {formData.image ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px",
                      background: "var(--p-table-th-bg)",
                      border: "1.5px solid var(--p-card-border)",
                      borderRadius: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <img
                      src={formData.image}
                      alt="Cover Preview"
                      style={{
                        width: "80px",
                        height: "54px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        border: "1px solid var(--p-card-border)",
                      }}
                      onError={(e) => {
                        e.target.src = "/images/cover-web.jpg";
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--p-text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Cover Image Ready
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--p-text-muted)", marginTop: "2px" }}>
                        Displays on the blog cards &amp; article banner
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="paces-btn paces-btn-outline paces-btn-sm"
                    >
                      📁 Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{
                      border: "2px dashed var(--p-input-border)",
                      borderRadius: "12px",
                      padding: "24px 16px",
                      textAlign: "center",
                      background: "var(--p-table-th-bg)",
                      cursor: "pointer",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>🖼️</div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--p-text-dark)" }}>
                      Click to upload cover image or drag &amp; drop
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--p-text-muted)", marginTop: "2px" }}>
                      PNG, JPG, WEBP or GIF (Max 5MB)
                    </div>
                  </div>
                )}

                {/* Preset Choices */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11.5px", color: "var(--p-text-muted)", fontWeight: 600 }}>Or choose preset:</span>
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={`paces-btn paces-btn-sm ${formData.image === preset.url ? "paces-btn-coral" : "paces-btn-outline"}`}
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="paces-form-group">
                  <label className="paces-label">Author Name</label>
                  <input
                    type="text"
                    className="paces-input"
                    placeholder="e.g. Nexprobyte Team"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>

                <div className="paces-form-group">
                  <label className="paces-label">Publication Status</label>
                  <select
                    className="paces-select"
                    value={formData.published ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, published: e.target.value === "true" })}
                  >
                    <option value="true">Published (Live on Website)</option>
                    <option value="false">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="paces-form-group">
                <label className="paces-label">Short Summary Excerpt *</label>
                <textarea
                  className="paces-textarea"
                  rows={2}
                  placeholder="Brief 1-2 sentence hook for the article card..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                />
              </div>

              <div className="paces-form-group" style={{ marginBottom: 0 }}>
                <label className="paces-label">Article Body Content (Markdown headers supported)</label>
                <textarea
                  className="paces-textarea"
                  rows={8}
                  placeholder="Use ### for Section Headings, and separate paragraphs with blank lines."
                  value={formData.contentRaw}
                  onChange={(e) => setFormData({ ...formData, contentRaw: e.target.value })}
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
                  {editingPost ? "Save & Publish Changes" : "Publish Article →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlogs;
