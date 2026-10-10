import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Pricing & Transparency",
  description:
    "AppBeb keeps essential job search and private in-browser CV tools 100% free with zero fees for job applicants.",
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: "Pricing & Transparency — AppBeb",
    description: "Always free for job applicants.",
    url: `${siteUrl}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Pricing</span>
          </div>
          <div className="eyebrow">
            <Icon name="sparkles" size={12} /> Transparent & Honest
          </div>
          <h1>Essential career tools, zero surprises.</h1>
          <p>
            Job searching and private in-browser CV creation will always remain free. Any future AI quota expansions will always be clearly announced with no dark patterns.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 860 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <div className="eyebrow">
              <Icon name="check" size={13} /> Free Tier Overview
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px", color: "var(--navy)" }}>
              What is included today:
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 15, margin: "0 0 24px" }}>
              AppBeb believes looking for work should not cost job seekers money.
            </p>

            <div className="status-card" style={{ margin: "16px 0 28px" }}>
              <div className="status-row">
                <span>Browse and filter verified job openings</span>
                <span className="status-badge-ready">Always Free</span>
              </div>
              <div className="status-row">
                <span>In-browser CV Builder with local IndexedDB autosave</span>
                <span className="status-badge-ready">Always Free</span>
              </div>
              <div className="status-row">
                <span>High-resolution PDF CV print and export</span>
                <span className="status-badge-ready">Always Free</span>
              </div>
              <div className="status-row">
                <span>Full access to Career Guides & checklists</span>
                <span className="status-badge-ready">Always Free</span>
              </div>
              <div className="status-row">
                <span>AI Career Assistants (Resume matcher, cover letters, prep)</span>
                <span className="status-badge-ready">Included Free Tier</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/ai-tools/resume-builder" className="button button-teal">
                Build My CV Now <Icon name="arrow-up-right" size={14} />
              </Link>
              <Link href="/jobs" className="button button-outline">
                Browse Vacancies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
