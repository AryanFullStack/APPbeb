import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Disclaimer & Job Information Notice",
  description:
    "Notice of independent operation, job information platform scope, and verification disclosures for AppBeb.com.",
  alternates: {
    canonical: `${siteUrl}/disclaimer`,
  },
  openGraph: {
    title: "Disclaimer — AppBeb",
    description: "Important information about AppBeb's job platform scope and third-party employer links.",
    url: `${siteUrl}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Disclaimer</span>
          </div>
          <div className="eyebrow">
            <Icon name="lock" size={12} /> Transparency & Safety
          </div>
          <h1>Platform Disclaimer</h1>
          <p>
            Understanding AppBeb’s scope as an independent job discovery platform and our commitment to applicant safety.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 840 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              1. Independent Job Information Platform
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb (appbeb.com) is an independent job search index and career tools service. AppBeb is not an employment agency, headhunter, employer, or government labour department. We index vacancies and direct career links from official employer websites, recruitment portals, and public feeds to help job seekers discover opportunities across the UK and European countries.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              2. Independent Verification & Employer Responsibility
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              While we make diligent efforts to audit source links and categorize listings honestly (distinguishing between confirmed single vacancies and broader employer career portal leads), AppBeb does not employ the candidates or control the hiring practices, interview criteria, compensation decisions, or workplace conditions of any listed employer. All job descriptions, requirements, and salaries are subject to change by the respective employers.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              3. No Affiliation Notice
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb is not affiliated with, endorsed by, or partnered with Google, the UK Department for Work and Pensions (DWP), European Commission / EURES, or any employer named on this website unless explicitly stated. Company names, trademarks, and brand marks referenced on AppBeb are the property of their respective owners and are used purely for identification and informational purposes.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              4. Anti-Fraud & Applicant Financial Safety Warning
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              <strong>Never send money or sensitive financial information for any job application.</strong> Legitimate employers in the UK and Europe will never ask candidates for upfront payments, recruitment fees, visa deposits, training fees, or equipment purchases through personal payment apps, wire transfers, or cryptocurrency. If you encounter any suspicious listing, please notify us immediately via our Report a Job page.
            </p>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 24, display: "flex", gap: 12 }}>
              <Link href="/editorial-policy" className="button button-teal">
                Read Editorial Policy <Icon name="arrow-up-right" size={14} />
              </Link>
              <Link href="/report-job" className="button button-outline">
                Report a Suspicious Listing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
