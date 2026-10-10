import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Cookie Preferences & Storage Policy",
  description:
    "Learn how AppBeb uses essential browser storage, privacy-safe analytics, and advertising cookies.",
  alternates: {
    canonical: `${siteUrl}/cookies`,
  },
  openGraph: {
    title: "Cookie Preferences — AppBeb",
    description: "Our cookie and storage policy.",
    url: `${siteUrl}/cookies`,
  },
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
            We believe the web should be clean, fast, transparent, and respectful of your personal boundaries.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 840 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              1. Essential Storage (IndexedDB & LocalStorage)
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              AppBeb uses client-side IndexedDB and localStorage solely to keep your CV drafts and bookmarked jobs intact between visits. This data lives strictly on your personal device and is never uploaded to our central servers without your explicit initiation.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              2. Analytics & Performance Measurement
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              Basic usage metrics (such as searches executed, career guide views, and outbound job application clicks) use privacy-safe, anonymous aggregated counters that never track individual personal identities across other websites.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: "var(--navy)" }}>
              3. Advertising Cookies (Google AdSense)
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              When advertising is served by Google AdSense and third-party advertising partners, cookies are used to measure ad delivery, prevent fraudulent clicks, and (where consented) display relevant advertisements based on visits to this and other websites. You may manage your ad preferences via{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--teal)", textDecoration: "underline" }}
              >
                Google Ad Settings
              </a>{" "}
              or opt out through{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--teal)", textDecoration: "underline" }}
              >
                AboutAds Choices
              </a>
              .
            </p>

            <div className="local-note">
              <Icon name="check-circle" size={15} />
              You can clear all stored site data at any time via your browser’s “Clear Site Data” or “Clear Cookies” settings.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
