"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "../../../components/ui-icon";

interface JobCategory {
  id: string;
  name: string;
  slug: string;
}

interface AdminJob {
  id: string;
  external_id?: string;
  title: string;
  company: string;
  location: string;
  category_id?: string;
  categories?: { name: string; slug: string };
  employment_type: string;
  work_mode: string;
  description: string;
  skills: string[];
  application_url: string;
  published_at: string;
  is_active: boolean;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "United Kingdom",
    category_id: "",
    employment_type: "Full-time",
    work_mode: "On-site",
    application_url: "",
    description: "",
    skillsStr: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }

  // Load jobs and categories
  async function loadData() {
    setLoading(true);
    try {
      const [jobsRes, catsRes] = await Promise.all([
        fetch("/api/admin/jobs"),
        fetch("/api/admin/categories"),
      ]);
      const jobsData = await jobsRes.json();
      const catsData = await catsRes.json();

      if (jobsData.jobs) setJobs(jobsData.jobs);
      if (catsData.categories) setCategories(catsData.categories);
    } catch {
      notify("Failed to load vacancy data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchText = `${job.title} ${job.company} ${job.location} ${job.skills?.join(" ")}`.toLowerCase();
      const matchesSearch = !search || matchText.includes(search.toLowerCase());
      const matchesCat =
        selectedCategory === "all" ||
        job.category_id === selectedCategory ||
        job.categories?.slug === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && job.is_active) ||
        (selectedStatus === "inactive" && !job.is_active);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [jobs, search, selectedCategory, selectedStatus]);

  function handleOpenCreate() {
    setEditingJob(null);
    setFormData({
      title: "",
      company: "",
      location: "United Kingdom",
      category_id: categories[0]?.id || "",
      employment_type: "Full-time",
      work_mode: "On-site",
      application_url: "https://",
      description: "",
      skillsStr: "",
      is_active: true,
    });
    setModalOpen(true);
  }

  function handleOpenEdit(job: AdminJob) {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      category_id: job.category_id || "",
      employment_type: job.employment_type || "Full-time",
      work_mode: job.work_mode || "On-site",
      application_url: job.application_url || "",
      description: job.description || "",
      skillsStr: (job.skills || []).join(", "),
      is_active: job.is_active,
    });
    setModalOpen(true);
  }

  async function handleToggleStatus(job: AdminJob) {
    const newStatus = !job.is_active;
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, is_active: newStatus }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, is_active: newStatus } : j))
        );
        notify(`Vacancy marked as ${newStatus ? "Active" : "Inactive"}`);
      }
    } catch {
      notify("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently remove this vacancy?")) return;
    try {
      const res = await fetch(`/api/admin/jobs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        notify("Vacancy deleted successfully");
      }
    } catch {
      notify("Failed to delete vacancy");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const skills = formData.skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      company: formData.company,
      location: formData.location,
      category_id: formData.category_id || null,
      employment_type: formData.employment_type,
      work_mode: formData.work_mode,
      application_url: formData.application_url,
      description: formData.description,
      skills,
      is_active: formData.is_active,
    };

    try {
      if (editingJob) {
        const res = await fetch("/api/admin/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingJob.id, ...payload }),
        });
        const data = await res.json();
        if (data.job) {
          setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...data.job } : j)));
          notify("Vacancy updated successfully");
        }
      } else {
        const res = await fetch("/api/admin/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.job) {
          setJobs((prev) => [data.job, ...prev]);
          notify("New vacancy published successfully");
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
            <span>Jobs Management</span>
          </div>
          <h1 style={{ margin: "2px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>
            Jobs & Vacancies Directory
          </h1>
          <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 13 }}>
            Manage genuine listings, verified sources, and instant activation toggles.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="button button-teal"
          style={{ fontWeight: 700 }}
        >
          <Icon name="plus" size={15} /> Post New Vacancy
        </button>
      </div>

      {notification && (
        <div style={{ padding: "10px 14px", background: "var(--teal-soft)", border: "1px solid var(--teal)", color: "var(--teal-dark)", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {notification}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <input
            type="text"
            className="input-control"
            placeholder="Search by title, company, skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
          <Icon name="search" size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>

        <select
          className="input-control"
          style={{ width: "auto", minWidth: 160 }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="input-control"
          style={{ width: "auto", minWidth: 140 }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--navy-muted)" }}>
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Jobs Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              <th style={{ padding: "12px 16px" }}>Title & Employer</th>
              <th style={{ padding: "12px 16px" }}>Location & Mode</th>
              <th style={{ padding: "12px 16px" }}>Category</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px" }}>Published</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  <Icon name="loader" size={20} className="spin" /> Loading vacancies directory…
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  No vacancies matching your criteria.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: "1px solid var(--line)", transition: "background 0.15s ease" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)" }}>{job.title}</div>
                    <div style={{ fontSize: 12, color: "var(--navy-muted)" }}>{job.company}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div>{job.location}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{job.work_mode} • {job.employment_type}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 8px", background: "var(--bg-page)", border: "1px solid var(--line)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {job.categories?.name || "General"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job)}
                      title="Click to toggle status"
                      style={{
                        padding: "4px 10px",
                        borderRadius: 100,
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: job.is_active ? "var(--teal-soft)" : "var(--line)",
                        color: job.is_active ? "var(--teal-dark)" : "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: job.is_active ? "var(--teal)" : "var(--muted)" }} />
                      {job.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--navy-muted)", fontSize: 12 }}>
                    {job.published_at ? new Date(job.published_at).toLocaleDateString() : "Recent"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        onClick={() => handleOpenEdit(job)}
                        className="button button-small"
                        style={{ padding: "5px 10px", fontSize: 11 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
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

      {/* Add / Edit Job Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-surface)", width: "min(640px, 100%)", maxHeight: "90vh", overflowY: "auto", borderRadius: 14, padding: 28, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>
                {editingJob ? "Edit Vacancy" : "Create New Vacancy"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label">Job Title *</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Warehouse Operative"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="field-label">Company / Employer *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. LogiFlow Logistics"
                  />
                </div>
                <div>
                  <label className="field-label">Location</label>
                  <input
                    type="text"
                    className="input-control"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Manchester, UK"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="field-label">Category</label>
                  <select
                    className="input-control"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Work Mode</label>
                  <select
                    className="input-control"
                    value={formData.work_mode}
                    onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="field-label">Employment Type</label>
                  <select
                    className="input-control"
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Application URL</label>
                  <input
                    type="url"
                    className="input-control"
                    value={formData.application_url}
                    onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Required Skills (comma separated)</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.skillsStr}
                  onChange={(e) => setFormData({ ...formData, skillsStr: e.target.value })}
                  placeholder="Forklift certified, Inventory management, Team leadership"
                />
              </div>

              <div>
                <label className="field-label">Full Job Description</label>
                <textarea
                  className="input-control"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of responsibilities and qualifications…"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="active-toggle" style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", cursor: "pointer" }}>
                  Publish as Active Vacancy (visible on public search)
                </label>
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
                  {submitting ? "Saving…" : editingJob ? "Update Vacancy" : "Publish Vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
