import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Job Posting & Editorial Verification Policy",
  description:
    "Learn about AppBeb’s job verification standards, vacancy classification, expiration workflows, and employer correction/takedown processes.",
  alternates: {
    canonical: `${siteUrl}/editorial-policy`,
  },
  openGraph: {
    title: "Job Posting & Editorial Policy — AppBeb",
    description: "Our editorial guidelines, verification standards, and listing lifecycle management.",
    url: `${siteUrl}/editorial-policy`,
  },
};

export default function EditorialPolicyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Editorial Policy</span>
          </div>
          <div className="eyebrow">
            <Icon name="check" size={12} /> Quality & Transparency
          </div>
          <h1>Job Posting & Editorial Policy</h1>
          <p>
            How AppBeb verifies opportunities, handles expired listings, and maintains an honest, applicant-focused directory.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 840 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              1. Our Verification & Classification Standards
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 16px" }}>
              AppBeb strictly opposes misleading job aggregation. Every listing in our system is audited and classified into defined transparent statuses:
            </p>
            <ul style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px", paddingLeft: 20 }}>
              <li style={{ marginBottom: 10 }}>
                <strong>Verified Vacancy:</strong> Genuine, specific openings with confirmed job descriptions, defined locations, identified employers, and direct, working application paths on the employer’s site. Only these records receive Google for Jobs (Schema.org `JobPosting`) structured data.
              </li>
              <li style={{ marginBottom: 10 }}>
                <strong>Career Portal Directory Lead:</strong> Informational listings connecting job seekers to verified employer careers portals or mobility platforms (e.g., EURES, regional employer hubs) to explore active roles. These are labeled transparently and are excluded from single-vacancy structured data.
              </li>
              <li style={{ marginBottom: 10 }}>
                <strong>Awaiting Verification:</strong> Listings undergoing manual staff review before being displayed as confirmed openings.
              </li>
              <li>
                <strong>Expired or Closed:</strong> Vacancies that have passed their deadline or been filled.
              </li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              2. Job Expiration & Structured Data Lifecycle
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              In accordance with Google Search Central guidelines, when a vacancy reaches its stated deadline or is reported as closed by the employer, AppBeb immediately updates the listing status to expired. Expired listings have their Schema.org `JobPosting` structured data removed immediately, are excluded from XML sitemaps, and display a prominent expiration notice to prevent applicant frustration.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              3. Zero Tolerance for Misleading or Paid-to-Apply Schemes
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              We immediately reject and permanently blacklist any submission or feed source that charges candidates money, requires upfront training fees, promotes multi-level marketing (MLM), or engages in credential harvesting.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              4. Employer Corrections & Removal Requests
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              Are you an authorized employer or recruiter whose vacancy is listed on AppBeb? You may request updates, corrections, or immediate removal at any time without charge. Simply email <strong>hello@appbeb.com</strong> with your official company email address and the URL of the listing. Requests are processed within 24 to 48 business hours.
            </p>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 24, display: "flex", gap: 12 }}>
              <Link href="/report-job" className="button button-teal">
                Report an Issue <Icon name="arrow-up-right" size={14} />
              </Link>
              <Link href="/contact" className="button button-outline">
                Contact Editorial Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
