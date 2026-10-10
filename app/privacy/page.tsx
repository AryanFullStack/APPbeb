import Link from "next/link";
import { Icon } from "../components/ui-icon";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how AppBeb protects your privacy with local-first drafts and minimal telemetry.",
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
            We designed AppBeb from day one to respect your privacy. Here is how your data is handled.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              1. Local CV Drafts (IndexedDB)
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              When you use our Resume Builder, your personal information, work history, and contact details are stored strictly inside your browser’s local IndexedDB storage. AppBeb does not copy, back up, or store this draft on our servers. You can clear this draft at any time with a single click.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              2. AI Feature Interactions
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              When you use our AI features (Resume Matcher, Cover Letter Generator, or Interview Prep), the text you explicitly submit is sent over an encrypted server route to produce the result. We do not store or persist your inputs or generated text in persistent databases or marketing logs.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              3. Outbound Job Applications
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              AppBeb redirects you to verified third-party employer sites to submit applications. We never collect application documents, identity proofs, or financial information on AppBeb.
            </p>

            <div className="local-note">
              <Icon name="lock" size={14} />
              If you have any questions or data concerns, contact us at hello@appbeb.com.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
