import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Contact AppBeb",
  description:
    "Get in touch with the AppBeb team for user support, employer takedowns, feed integrations, or feedback.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact AppBeb",
    description: "Get in touch with the AppBeb team for support or inquiries.",
    url: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Contact</span>
          </div>
          <div className="eyebrow">
            <Icon name="message" size={12} /> We’re Listening
          </div>
          <h1>Get in touch with AppBeb.</h1>
          <p>
            Have feedback on our CV builder? Want to report a closed vacancy or connect an employer careers feed? Reach out directly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 840 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: "var(--navy)" }}>
              Contact Details & Channels
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, margin: "0 0 24px", lineHeight: 1.6 }}>
              We respond to inquiries within 24 to 48 business hours. Choose the appropriate channel below for fastest handling:
            </p>

            <div style={{ display: "grid", gap: 16, marginBottom: 28 }}>
              <div
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--line)",
                  padding: "18px 20px",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong style={{ fontSize: 15, display: "block", color: "var(--navy)" }}>
                    General Support & Feedback
                  </strong>
                  <span style={{ fontSize: 13.5, color: "var(--navy-muted)" }}>
                    Questions about CV tools, site navigation, or general questions
                  </span>
                </div>
                <a
                  href="mailto:hello@appbeb.com"
                  className="button button-teal button-small"
                >
                  hello@appbeb.com
                </a>
              </div>

              <div
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--line)",
                  padding: "18px 20px",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong style={{ fontSize: 15, display: "block", color: "var(--navy)" }}>
                    Employer Takedowns & Corrections
                  </strong>
                  <span style={{ fontSize: 13.5, color: "var(--navy-muted)" }}>
                    Request removal or update of an active vacancy listing
                  </span>
                </div>
                <Link
                  href="/report-job"
                  className="button button-outline button-small"
                >
                  Report Form
                </Link>
              </div>
            </div>

            <div className="local-note">
              <Icon name="lock" size={14} />
              Applicant Safety Notice: AppBeb does not process job applications or request identity documents by email. Always apply directly via the verified employer portals.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
