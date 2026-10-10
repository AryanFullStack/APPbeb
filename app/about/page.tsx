import Link from "next/link";
import { Icon } from "../components/ui-icon";

export const metadata = {
  title: "About AppBeb",
  description: "Learn why AppBeb was created to make job search and career preparation human and accessible.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>About</span>
          </div>
          <div className="eyebrow">
            <Icon name="heart" size={12} /> Built For Real People
          </div>
          <h1>Work search should feel human.</h1>
          <p>
            AppBeb was created around a simple conviction: finding a livelihood and presenting your skills should be straightforward, honest, and private.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <div className="form-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px", color: "var(--navy)" }}>
              Our Guiding Principles
            </h2>
            <div style={{ display: "grid", gap: 20, margin: "24px 0" }}>
              <div style={{ display: "flex", gap: 14 }}>
                <span className="category-icon" style={{ flexShrink: 0 }}>
                  <Icon name="lock" size={18} />
                </span>
                <div>
                  <strong style={{ fontSize: 16, display: "block", marginBottom: 4, color: "var(--navy)" }}>
                    Privacy First, Always
                  </strong>
                  <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 14 }}>
                    We do not harvest your CV drafts or personal contact information. Your documents are saved locally in your own browser using IndexedDB.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <span className="category-icon" style={{ flexShrink: 0 }}>
                  <Icon name="check" size={18} />
                </span>
                <div>
                  <strong style={{ fontSize: 16, display: "block", marginBottom: 4, color: "var(--navy)" }}>
                    Verified & Genuine Vacancies
                  </strong>
                  <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 14 }}>
                    We aim to link only to authorized, verified sources. We reject misleading duplicate job postings and predatory employment schemes.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <span className="category-icon" style={{ flexShrink: 0 }}>
                  <Icon name="sparkles" size={18} />
                </span>
                <div>
                  <strong style={{ fontSize: 16, display: "block", marginBottom: 4, color: "var(--navy)" }}>
                    Practical, Human-Assisted AI
                  </strong>
                  <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 14 }}>
                    AI is a thinking partner, not a black box. Our tools give you clear, editable drafts that respect your voice and real experience.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24, marginTop: 24 }}>
              <Link href="/jobs" className="button button-teal">
                Explore Opportunities <Icon name="arrow-up-right" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
