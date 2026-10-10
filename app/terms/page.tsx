import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for browsing jobs and using AI career tools on AppBeb.com.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: "Terms of Service — AppBeb",
    description: "Terms and conditions for using AppBeb.",
    url: `${siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Terms of Service</span>
          </div>
          <div className="eyebrow">
            <Icon name="check" size={12} /> Fair & Transparent
          </div>
          <h1>Terms of Service</h1>
          <p>
            Please review our service terms and honest operational standards for using AppBeb.com.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 840 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              By accessing AppBeb.com, you agree to comply with these terms of service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              2. Nature of Service: Job Information Platform
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb is an independent job search discovery and career preparation tool platform. AppBeb does not act as an employer, recruitment agency, or employment business. We index and link to official third-party employer career portals and authorized partner listings. We do not participate in employment negotiations, hiring decisions, or job offers.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              3. No Fees for Applicants
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb will never ask you to pay money to apply for a job or to access job listings. Legitimate employers never charge candidates application fees, background check fees, or equipment deposit fees prior to hiring. If an employer or contact asks for payment, stop communication immediately and notify us via our Report Job page.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              4. External Career Links & Verification
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              While AppBeb audits listings to connect candidates with authorized employer portals, employers may alter vacancy specifications, salaries, deadlines, or close roles at any time without notice. Always verify exact job requirements and deadlines directly on the employer’s official website.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              5. AI Career Tools & Content Accuracy
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              Our AI career tools (Resume Builder, Resume Matcher, Cover Letter Generator, and Interview Prep) produce draft suggestions and preparatory aids based on user input. You retain complete responsibility for reviewing, fact-checking, and ensuring the accuracy and truthfulness of any CV, cover letter, or statements you present to employers.
            </p>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 24, display: "flex", gap: 12 }}>
              <Link href="/jobs" className="button button-teal">
                Back to Job Search <Icon name="arrow-up-right" size={14} />
              </Link>
              <Link href="/disclaimer" className="button button-outline">
                Read Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
