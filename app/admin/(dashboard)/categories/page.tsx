"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../../components/ui-icon";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  jobs?: { count: number }[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", sort_order: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {
      notify("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleOpenCreate() {
    setEditingCat(null);
    setFormData({ name: "", slug: "", sort_order: categories.length + 1 });
    setModalOpen(true);
  }

  function handleOpenEdit(cat: CategoryItem) {
    setEditingCat(cat);
    setFormData({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order });
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category? Jobs linked to it will become uncategorized.")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        notify("Category deleted");
      }
    } catch {
      notify("Failed to delete category");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCat) {
        const res = await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCat.id, ...formData }),
        });
        const data = await res.json();
        if (data.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCat.id ? { ...c, ...data.category } : c))
          );
          notify("Category updated");
        }
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.category) {
          setCategories((prev) => [...prev, data.category]);
          notify("Category created");
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
            <span>Job Categories</span>
          </div>
          <h1 style={{ margin: "2px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>
            Employment Categories
          </h1>
          <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 13 }}>
            Curate UK labor categories, navigation taxonomy, and sort priorities.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="button button-teal"
          style={{ fontWeight: 700 }}
        >
          <Icon name="plus" size={15} /> Add Category
        </button>
      </div>

      {notification && (
        <div style={{ padding: "10px 14px", background: "var(--teal-soft)", border: "1px solid var(--teal)", color: "var(--teal-dark)", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {notification}
        </div>
      )}

      {/* Categories Grid/Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              <th style={{ padding: "12px 16px" }}>Category Name</th>
              <th style={{ padding: "12px 16px" }}>URL Slug</th>
              <th style={{ padding: "12px 16px" }}>Sort Order</th>
              <th style={{ padding: "12px 16px" }}>Linked Vacancies</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  <Icon name="loader" size={20} className="spin" /> Loading categories…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--bg-page)", border: "1px solid var(--line)", display: "grid", placeItems: "center" }}>
                        <Icon name="box" size={13} style={{ color: "var(--teal)" }} />
                      </span>
                      {cat.name}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--navy-muted)" }}>
                    /jobs?category={cat.slug}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--navy-muted)", fontWeight: 600 }}>
                    #{cat.sort_order}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "2px 8px", background: "var(--bg-page)", borderRadius: 100, fontSize: 11, fontWeight: 700, color: "var(--navy)" }}>
                      {cat.jobs?.[0]?.count ?? "—"} active
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="button button-small"
                        style={{ padding: "5px 10px", fontSize: 11 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-surface)", width: "min(460px, 100%)", borderRadius: 14, padding: 26, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
                {editingCat ? "Edit Category" : "Add New Category"}
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
                <label className="field-label">Category Name *</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setFormData({ ...formData, name, slug: editingCat ? formData.slug : autoSlug });
                  }}
                  placeholder="e.g. Healthcare & Medical"
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
                  placeholder="e.g. healthcare-medical"
                />
              </div>

              <div>
                <label className="field-label">Sort Priority</label>
                <input
                  type="number"
                  className="input-control"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Lower numbers appear earlier in search dropdowns</span>
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
                  {submitting ? "Saving…" : editingCat ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
