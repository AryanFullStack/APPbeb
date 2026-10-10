import Link from "next/link";
import { Icon } from "../components/ui-icon";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using AppBeb.com.",
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
          <h1>Use AppBeb responsibly.</h1>
          <p>
            Review our simple guidelines to ensure a safe, honest experience for everyone.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              Acceptance of Terms
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              By accessing AppBeb.com, you agree to browse opportunities in good faith and use our CV preparation tools in compliance with these guidelines.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              Job Listings & Source Accuracy
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb indexes positions from authorized employers and verified aggregators. Always confirm role specifics, deadlines, and requirements on the employer’s official site. Never send money or sensitive banking numbers to any prospective employer.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              AI Tool Outputs
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              AI career tools provide preliminary drafting assistance and recommendations. You remain responsible for reviewing and certifying the truthfulness of any CV, cover letter, or interview submission you make.
            </p>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginTop: 20 }}>
              <Link href="/jobs" className="button button-teal">
                Back to Job Search <Icon name="arrow-up-right" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
