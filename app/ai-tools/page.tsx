import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "Free AI Career Tools — CV Builder & Interview Prep",
  description:
    "Free, private in-browser AI career tools. Build ATS-ready CVs, match your experience against job descriptions, draft tailored cover letters, and practice interview questions.",
  alternates: {
    canonical: `${siteUrl}/ai-tools`,
  },
  openGraph: {
    title: "Free AI Career Tools — AppBeb",
    description: "Private in-browser CV builder, resume matcher, and interview prep.",
    url: `${siteUrl}/ai-tools`,
  },
};

const tools = [
  {
    href: "/ai-tools/resume-builder",
    icon: "file-text" as const,
    title: "AI Resume Builder",
    copy: "Build a structured, professional CV with clean sections. Works completely offline with local browser autosave.",
    tags: ["Local Drafts", "PDF-Ready", "Zero Storage"],
  },
  {
    href: "/ai-tools/resume-matcher",
    icon: "sparkles" as const,
    title: "Resume-to-Job Matcher",
    copy: "Analyze your background against any target vacancy to identify matching strengths, keywords, and improvement opportunities.",
    tags: ["Skill Gaps", "Keyword Matching", "Fast Insights"],
  },
  {
    href: "/ai-tools/cover-letter",
    icon: "message" as const,
    title: "Cover Letter Generator",
    copy: "Generate a focused, authentic first draft that connects your real-world achievements directly to what the employer is seeking.",
    tags: ["Editable Draft", "Role-Tailored", "Copy & Export"],
  },
  {
    href: "/ai-tools/interview-prep",
    icon: "user" as const,
    title: "Interview Preparation",
    copy: "Anticipate likely interview questions and formulate concise talking points so you can walk in ready and articulate.",
    tags: ["Custom Questions", "Structured Answers", "Confidence"],
  },
];

export default function AiToolsPage() {
  return (
    <>
      <section className="tools-intro">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>AI Career Tools</span>
          </div>
          <div className="eyebrow">
            <Icon name="sparkles" size={13} /> Practical AI Career Assistants
          </div>
          <h1>Useful tools, without the noise.</h1>
          <p>
            Start with a few words about your background. Get actionable drafts and structured analysis you can freely edit, copy, and own.
          </p>
        </div>
      </section>

      <section className="shell tools-page-grid">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="large-tool-card">
            <span className="tool-icon">
              <Icon name={tool.icon} size={22} />
            </span>
            <div>
              <h2>{tool.title}</h2>
              <p>{tool.copy}</p>
              <div className="tool-tags">
                {tool.tags.map((tag) => (
                  <span className="tool-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="section section-cream">
        <div className="shell">
          <div className="split-feature">
            <div className="feature-copy">
              <div className="eyebrow">
                <Icon name="lock" size={12} /> Strict Privacy By Design
              </div>
              <h2>Your data remains strictly yours.</h2>
              <p>
                Resume drafts are stored only within your local browser storage via IndexedDB. When you request AI analysis, only the specific text needed to complete the request is processed through an encrypted server route. We never persist or sell your documents or inputs.
              </p>
              <Link href="/privacy" className="text-link">
                Read our privacy commitment <Icon name="arrow-up-right" size={14} />
              </Link>
            </div>
            <div
              className="feature-visual"
              style={{
                minHeight: 280,
                display: "grid",
                placeItems: "center",
              }}
            >
              <div style={{ textAlign: "center", maxWidth: 280 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    background: "rgba(13, 148, 136, 0.2)",
                    display: "grid",
                    placeItems: "center",
                    color: "#5eead4",
                  }}
                >
                  <Icon name="lock" size={26} />
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, color: "#fff", fontWeight: 700 }}>
                  Local First
                </h3>
                <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  Browser-only drafts. No account needed. Transparent AI generation on demand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
