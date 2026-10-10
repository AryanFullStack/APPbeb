"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../../components/ui-icon";

export default function AdminSeoPage() {
  const [formData, setFormData] = useState({
    siteTitle: "AppBeb — Find your next opportunity",
    siteDescription: "Simple job search and practical AI career tools for every kind of worker.",
    canonicalUrl: "http://localhost:3000",
    googleVerification: "",
    allowIndexing: true,
    sitemapEnabled: true,
    ogImage: "/og-image.png",
    twitterHandle: "@appbeb",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setFormData((prev) => ({ ...prev, ...data.settings }));
      })
      .catch(() => notify("Failed to load SEO settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        notify("SEO and indexing settings updated successfully");
      } else {
        notify("Failed to save settings");
      }
    } catch {
      notify("Network error saving settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="breadcrumb" style={{ marginBottom: 6 }}>
            <Link href="/admin">Admin</Link>
            <Icon name="chevron-right" size={12} />
            <span>SEO Settings</span>
          </div>
          <h1 style={{ margin: "2px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>
            SEO & Search Engine Indexing
          </h1>
          <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 13 }}>
            Configure metadata, canonical routing, search console verification, and automated sitemaps.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="/sitemap.xml"
            target="_blank"
            className="button button-small"
            style={{ fontWeight: 600 }}
          >
            <Icon name="file-text" size={13} /> View sitemap.xml ↗
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            className="button button-small"
            style={{ fontWeight: 600 }}
          >
            <Icon name="info" size={13} /> View robots.txt ↗
          </a>
        </div>
      </div>

      {notification && (
        <div style={{ padding: "10px 14px", background: "var(--teal-soft)", border: "1px solid var(--teal)", color: "var(--teal-dark)", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {notification}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          <Icon name="loader" size={20} className="spin" /> Loading SEO configurations…
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ display: "grid", gap: 20, maxWidth: 840 }}>
          {/* Metadata Card */}
          <div className="status-card" style={{ margin: 0 }}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Global Meta Tags</h2>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label">Default Page Title & Template</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Applied across search result snippets and browser tabs</span>
              </div>

              <div>
                <label className="field-label">Global Meta Description</label>
                <textarea
                  rows={2}
                  required
                  className="input-control"
                  value={formData.siteDescription}
                  onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Optimal length: between 140 and 160 characters</span>
              </div>

              <div>
                <label className="field-label">Canonical Base URL</label>
                <input
                  type="url"
                  required
                  className="input-control"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Prevents duplicate indexing penalties across domain variations</span>
              </div>
            </div>
          </div>

          {/* Search Console & Indexing */}
          <div className="status-card" style={{ margin: 0 }}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Search Engine Verification & Indexing</h2>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label">Google Search Console Verification Token</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="google-site-verification=abc123xyz…"
                  value={formData.googleVerification}
                  onChange={(e) => setFormData({ ...formData, googleVerification: e.target.value })}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Paste HTML tag verification code from Google Search Console</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                <input
                  type="checkbox"
                  id="allow-indexing"
                  checked={formData.allowIndexing}
                  onChange={(e) => setFormData({ ...formData, allowIndexing: e.target.checked })}
                />
                <label htmlFor="allow-indexing" style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", cursor: "pointer" }}>
                  Enable Search Engine Crawlers (`robots: index, follow`)
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  id="sitemap-toggle"
                  checked={formData.sitemapEnabled}
                  onChange={(e) => setFormData({ ...formData, sitemapEnabled: e.target.checked })}
                />
                <label htmlFor="sitemap-toggle" style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", cursor: "pointer" }}>
                  Automated Dynamic XML Sitemap Generation Active
                </label>
              </div>
            </div>
          </div>

          {/* Social Sharing Card */}
          <div className="status-card" style={{ margin: 0 }}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>OpenGraph & Social Sharing</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="field-label">Default OG Image URL</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.ogImage}
                  onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label">Twitter / X Handle</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="submit"
              disabled={saving}
              className="button button-teal"
              style={{ fontWeight: 700, padding: "10px 24px" }}
            >
              {saving ? (
                <>
                  <Icon name="loader" size={14} className="spin" /> Saving Settings…
                </>
              ) : (
                <>
                  Save SEO Configuration <Icon name="sparkles" size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
