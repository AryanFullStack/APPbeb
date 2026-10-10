import Link from "next/link";
import { Icon } from "../components/ui-icon";

export const metadata = {
  title: "Cookie Preferences",
  description: "Learn how AppBeb uses minimal, essential cookies and storage.",
};

export default function CookiesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Cookie Preferences</span>
          </div>
          <div className="eyebrow">
            <Icon name="lock" size={12} /> Privacy First
          </div>
          <h1>Lightweight by default.</h1>
          <p>
            We believe the web should be clean, fast, and free of unnecessary tracking tags.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              Essential Storage
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
              AppBeb uses essential browser IndexedDB and localStorage solely to keep your CV drafts and bookmarked jobs intact between visits. No advertising cookies or persistent cross-site tracking pixels are deployed.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              Analytics & Performance
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              Basic usage metrics (like total job searches performed) use an anonymous, privacy-safe event endpoint that never collects document content, CV text, or sensitive personal identities.
            </p>

            <div className="local-note">
              <Icon name="check-circle" size={15} />
              Third-party advertising cookies remain disabled across all active product routes.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
