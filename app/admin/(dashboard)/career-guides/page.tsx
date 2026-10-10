"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../../components/ui-icon";

interface GuideItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: Record<string, unknown>;
  status: "draft" | "published";
  published_at?: string;
  created_at: string;
}

export default function AdminCareerGuidesPage() {
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<GuideItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "published" as "draft" | "published",
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }

  async function loadGuides() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/career-guides");
      const data = await res.json();
      if (data.guides) setGuides(data.guides);
    } catch {
      notify("Failed to load career guides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuides();
  }, []);

  function handleOpenCreate() {
    setEditingGuide(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "published",
    });
    setModalOpen(true);
  }

  function handleOpenEdit(guide: GuideItem) {
    setEditingGuide(guide);
    const content =
      typeof guide.body?.content === "string"
        ? guide.body.content
        : JSON.stringify(guide.body || "", null, 2);
    setFormData({
      title: guide.title,
      slug: guide.slug,
      excerpt: guide.excerpt,
      content,
      status: guide.status,
    });
    setModalOpen(true);
  }

  async function handleToggleStatus(guide: GuideItem) {
    const nextStatus = guide.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/career-guides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guide.id, status: nextStatus }),
      });
      if (res.ok) {
        setGuides((prev) =>
          prev.map((g) => (g.id === guide.id ? { ...g, status: nextStatus } : g))
        );
        notify(`Guide marked as ${nextStatus === "published" ? "Published" : "Draft"}`);
      }
    } catch {
      notify("Failed to toggle status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this career guide?")) return;
    try {
      const res = await fetch(`/api/admin/career-guides?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGuides((prev) => prev.filter((g) => g.id !== id));
        notify("Guide deleted");
      }
    } catch {
      notify("Failed to delete guide");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      body: { content: formData.content },
      status: formData.status,
    };

    try {
      if (editingGuide) {
        const res = await fetch("/api/admin/career-guides", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingGuide.id, ...payload }),
        });
        const data = await res.json();
        if (data.guide) {
          setGuides((prev) =>
            prev.map((g) => (g.id === editingGuide.id ? { ...g, ...data.guide } : g))
          );
          notify("Guide updated");
        }
      } else {
        const res = await fetch("/api/admin/career-guides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.guide) {
          setGuides((prev) => [data.guide, ...prev]);
          notify("Guide created");
        }
      }
      setModalOpen(false);
    } catch {
      notify("Operation failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="breadcrumb" style={{ marginBottom: 6 }}>
            <Link href="/admin">Admin</Link>
            <Icon name="chevron-right" size={12} />
            <span>Career Guides</span>
          </div>
          <h1 style={{ margin: "2px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>
            Career Guides Publisher
          </h1>
          <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 13 }}>
            Structured, actionable advice for entry-level and career-transitioning applicants.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="button button-teal"
          style={{ fontWeight: 700 }}
        >
          <Icon name="plus" size={15} /> New Career Guide
        </button>
      </div>

      {notification && (
        <div style={{ padding: "10px 14px", background: "var(--teal-soft)", border: "1px solid var(--teal)", color: "var(--teal-dark)", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {notification}
        </div>
      )}

      {/* Guides Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              <th style={{ padding: "12px 16px" }}>Guide Title & Excerpt</th>
              <th style={{ padding: "12px 16px" }}>Public Path</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px" }}>Updated</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  <Icon name="loader" size={20} className="spin" /> Loading career guides…
                </td>
              </tr>
            ) : guides.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  No career guides created yet.
                </td>
              </tr>
            ) : (
              guides.map((guide) => (
                <tr key={guide.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 16px", maxWidth: 360 }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)" }}>{guide.title}</div>
                    <div style={{ fontSize: 12, color: "var(--navy-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {guide.excerpt}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12 }}>
                    <Link
                      href={`/career-guides/${guide.slug}`}
                      target="_blank"
                      style={{ color: "var(--teal)", textDecoration: "underline" }}
                    >
                      /career-guides/{guide.slug}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(guide)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 100,
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: guide.status === "published" ? "var(--teal-soft)" : "var(--amber-soft)",
                        color: guide.status === "published" ? "var(--teal-dark)" : "var(--amber-dark)",
                      }}
                    >
                      {guide.status === "published" ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--navy-muted)", fontSize: 12 }}>
                    {guide.published_at ? new Date(guide.published_at).toLocaleDateString() : "Draft"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        onClick={() => handleOpenEdit(guide)}
                        className="button button-small"
                        style={{ padding: "5px 10px", fontSize: 11 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(guide.id)}
                        className="button button-small"
                        style={{ padding: "5px 10px", fontSize: 11, color: "var(--red-dark)", borderColor: "var(--red-border)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-surface)", width: "min(640px, 100%)", maxHeight: "90vh", overflowY: "auto", borderRadius: 14, padding: 26, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
                {editingGuide ? "Edit Career Guide" : "Create Career Guide"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label">Article Title *</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setFormData({ ...formData, title, slug: editingGuide ? formData.slug : autoSlug });
                  }}
                  placeholder="e.g. How to Transition from Hospitality to Logistics"
                />
              </div>

              <div>
                <label className="field-label">URL Slug *</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. how-to-transition-hospitality-logistics"
                />
              </div>

              <div>
                <label className="field-label">Summary / Excerpt *</label>
                <textarea
                  required
                  rows={2}
                  className="input-control"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A clear 1-2 sentence overview for search previews…"
                />
              </div>

              <div>
                <label className="field-label">Article Content</label>
                <textarea
                  rows={6}
                  className="input-control"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Step-by-step guidance, actionable checklists, interview tips…"
                />
              </div>

              <div>
                <label className="field-label">Publication Status</label>
                <select
                  className="input-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                >
                  <option value="published">Published (Visible to site visitors)</option>
                  <option value="draft">Draft (Restricted to admin)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="button button-small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-teal button-small"
                  style={{ fontWeight: 700 }}
                >
                  {submitting ? "Saving…" : editingGuide ? "Update Guide" : "Publish Guide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
