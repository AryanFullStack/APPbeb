import Link from "next/link";
import { Icon } from "../components/ui-icon";

export const metadata = {
  title: "Contact AppBeb",
  description: "Get in touch with the AppBeb team for support, partnerships, or feedback.",
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
            Have feedback on our CV builder? Want to connect an authorized job feed? Reach out directly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 760 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: "var(--navy)" }}>
              Email & Partnership Inquiries
            </h2>
            <p style={{ color: "var(--navy-muted)", fontSize: 15, margin: "0 0 24px" }}>
              For general inquiries, bugs, or authorized feed integrations, contact us at:
            </p>

            <div
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--line)",
                padding: "16px 20px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
                hello@appbeb.com
              </span>
              <a
                href="mailto:hello@appbeb.com"
                className="button button-teal button-small"
              >
                Send Email
              </a>
            </div>

            <div className="local-note">
              <Icon name="lock" size={14} />
              Please do not transmit sensitive identity documents, bank account credentials, or passwords via email.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
