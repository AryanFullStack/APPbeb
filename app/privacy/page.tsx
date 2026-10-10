import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how AppBeb protects your privacy with local-first CV storage, minimal telemetry, and transparent Google AdSense disclosures.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy — AppBeb",
    description: "Our privacy policy and data protection disclosures.",
    url: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Privacy Policy</span>
          </div>
          <div className="eyebrow">
            <Icon name="lock" size={12} /> Privacy by Default
          </div>
          <h1>Private where it matters most.</h1>
          <p>
            We designed AppBeb from day one to respect your privacy. Here is a clear, complete explanation of how your data is handled.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 840 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              1. Local CV Drafts (IndexedDB)
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              When you use our Resume Builder, your personal contact information, work history, and qualifications are stored strictly inside your browser’s local IndexedDB and localStorage. AppBeb does not copy, back up, or store this draft on our central servers. You can clear this draft at any time directly through your browser or with a single click.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              2. AI Feature Interactions
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              When you use our AI features (Resume Matcher, Cover Letter Generator, or Interview Prep), the text you submit is transmitted over an encrypted TLS connection strictly to generate your response. We do not sell, retain in persistent databases, or use your submitted personal details for training public models.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              3. Outbound Job Applications
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb redirects you to verified employer career portals and authorized partner links to submit applications directly. We never collect identity proofs, passports, bank details, or application fees on AppBeb.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              4. Advertising Disclosures & Google AdSense
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 14px" }}>
              AppBeb may display digital advertising delivered by third-party advertising vendors, including Google AdSense. In compliance with Google AdSense program policies:
            </p>
            <ul style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px", paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>
                Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to AppBeb.com or other websites.
              </li>
              <li style={{ marginBottom: 8 }}>
                Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visit to AppBeb and/or other sites on the Internet.
              </li>
              <li style={{ marginBottom: 8 }}>
                Users may opt out of personalized advertising by visiting{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--teal)", textDecoration: "underline" }}
                >
                  Google Ads Settings
                </a>
                .
              </li>
              <li>
                Alternatively, users can opt out of third-party vendor use of cookies for personalized advertising by visiting{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--teal)", textDecoration: "underline" }}
                >
                  aboutads.info
                </a>{" "}
                or the European Interactive Digital Advertising Alliance at{" "}
                <a
                  href="https://www.youronlinechoices.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--teal)", textDecoration: "underline" }}
                >
                  youronlinechoices.com
                </a>
                .
              </li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              5. Essential Cookies & Privacy-Safe Analytics
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb uses essential storage solely to keep your application preferences and saved vacancies intact. We collect anonymous aggregated metrics (such as searches executed and outbound career link clicks) without identifying individual persons.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              6. UK & European Data Subject Rights (GDPR)
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
              Under the UK GDPR and EU General Data Protection Regulation, you have the right to request access, rectification, or deletion of personal data processed by AppBeb. Because your CV drafts reside entirely within your local browser storage, you have instant, sovereign control to delete or reset them at any time.
            </p>

            <div className="local-note">
              <Icon name="lock" size={14} />
              For privacy inquiries, data requests, or policy questions, please contact our data team at{" "}
              <strong>hello@appbeb.com</strong>.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
