import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "About AppBeb",
  description:
    "Learn why AppBeb was created: to make job search across the UK and Europe human, honest, accessible, and privacy-first.",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About AppBeb — Find Work That Fits Your Life",
    description: "Our mission to provide verified job discovery and free, private AI career tools.",
    url: `${siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>About</span>
          </div>
          <div className="eyebrow">
            <Icon name="heart" size={12} /> Built For Real People
          </div>
          <h1>Work search should feel human.</h1>
          <p>
            AppBeb was created around a simple conviction: finding a livelihood and presenting your skills should be straightforward, honest, and private.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 840 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px", color: "var(--navy)" }}>
              Our Purpose & How AppBeb Operates
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb indexes employment vacancies and official career portal links across the United Kingdom and Europe. We focus on essential, high-demand sectors—including logistics, commercial driving, cleaning and sanitation, healthcare assistance, and digital technology. We do not charge job applicants any fees, nor do we require an account to browse jobs or prepare CVs.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 14px", color: "var(--navy)" }}>
              Our Guiding Principles
            </h2>
            <div style={{ display: "grid", gap: 20, margin: "24px 0" }}>
              <div style={{ display: "flex", gap: 14 }}>
                <span className="category-icon" style={{ flexShrink: 0 }}>
                  <Icon name="lock" size={18} />
                </span>
                <div>
                  <strong style={{ fontSize: 16, display: "block", marginBottom: 4, color: "var(--navy)" }}>
                    Privacy First, Always
                  </strong>
                  <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.55 }}>
                    We do not harvest your CV drafts, phone numbers, or email addresses. Your documents are saved locally in your own browser using IndexedDB.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <span className="category-icon" style={{ flexShrink: 0 }}>
                  <Icon name="check" size={18} />
                </span>
                <div>
                  <strong style={{ fontSize: 16, display: "block", marginBottom: 4, color: "var(--navy)" }}>
                    Verified & Genuine Vacancies
                  </strong>
                  <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.55 }}>
                    We aim to link only to authorized, verified sources and official employer portals. We reject misleading duplicate job postings, upfront fee schemes, and fake recruitment leads.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <span className="category-icon" style={{ flexShrink: 0 }}>
                  <Icon name="sparkles" size={18} />
                </span>
                <div>
                  <strong style={{ fontSize: 16, display: "block", marginBottom: 4, color: "var(--navy)" }}>
                    Practical, Human-Assisted AI
                  </strong>
                  <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.55 }}>
                    AI is a thinking partner, not a black box. Our tools give you clear, editable drafts that respect your voice and real experience.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24, marginTop: 24, display: "flex", gap: 12 }}>
              <Link href="/jobs" className="button button-teal">
                Explore Opportunities <Icon name="arrow-up-right" size={14} />
              </Link>
              <Link href="/editorial-policy" className="button button-outline">
                Editorial & Verification Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
