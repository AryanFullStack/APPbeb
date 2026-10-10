import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "./components/ui-icon";
import { JobCard } from "./components/job-card";
import { SectionHeading } from "./components/section-heading";
import { fetchJobs, fetchCategories, fetchCareerGuides } from "./lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "AppBeb — Verified UK & European Job Opportunities & Free AI Career Tools",
  description:
    "Discover verified UK and European vacancies from authorized employers. Build professional ATS-ready CVs and prepare for job interviews with free, private AI career tools.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "AppBeb — Verified UK & European Jobs & AI Career Tools",
    description:
      "Find verified employment opportunities across logistics, transport, healthcare, cleaning, and tech. Zero account required.",
    url: siteUrl,
    type: "website",
    siteName: "AppBeb",
  },
};

const tools = [
  {
    href: "/ai-tools/resume-builder",
    icon: "file-text" as const,
    title: "AI Resume Builder",
    copy: "Create a structured, professional CV that reflects the skills and experience you already have.",
  },
  {
    href: "/ai-tools/resume-matcher",
    icon: "sparkles" as const,
    title: "Resume-to-Job Match",
    copy: "Compare your experience against any job description to discover strengths and missing keywords.",
  },
  {
    href: "/ai-tools/cover-letter",
    icon: "message" as const,
    title: "Cover Letter Generator",
    copy: "Turn your actual accomplishments into an authentic, tailored letter for the position you want.",
  },
  {
    href: "/ai-tools/interview-prep",
    icon: "user" as const,
    title: "Interview Prep Guide",
    copy: "Practice relevant questions with concise, confident talking points employers look for.",
  },
];

export default async function Home() {
  const [jobs, categories, guides] = await Promise.all([
    fetchJobs(),
    fetchCategories(),
    fetchCareerGuides(),
  ]);

  return (
    <>
      {/* Homepage Hero */}
      <section className="hero">
        <div className="shell hero-inner">
          <div className="eyebrow">
            <Icon name="sparkles" size={13} /> Verified UK Opportunities & Career Tools
          </div>
          <h1>
            Find work that fits <em>your life.</em>
          </h1>
          <p className="hero-copy">
            Search verified UK opportunities, craft an impressive CV for free, and step into your next interview with calm confidence.
          </p>

          {/* Job Search Panel */}
          <form className="search-panel" action="/jobs">
            <label className="search-field">
              <Icon name="search" size={18} />
              <input
                name="query"
                aria-label="Job title or keyword"
                placeholder="Job title, skill, or keyword (e.g. Driver, Warehouse)"
              />
            </label>
            <label className="search-field">
              <Icon name="pin" size={18} />
              <input
                name="location"
                aria-label="City or location"
                placeholder="UK town or region (e.g. London, York, Epsom)"
              />
            </label>
            <div className="search-panel-actions">
              <button type="submit" className="button button-teal">
                Find Jobs <Icon name="arrow-up-right" size={15} />
              </button>
            </div>
          </form>

          {/* Secondary Action & Trust Metrics */}
          <div className="hero-cta-group">
            <Link href="/ai-tools/resume-builder" className="button button-outline">
              <Icon name="file-text" size={15} /> Build My Resume Free
            </Link>
          </div>

          <div className="trusted-row">
            <div className="trust-stars" aria-label="5 out of 5 stars">
              ★ ★ ★ ★ ★
            </div>
            <span>Verified Employer Vacancies</span>
            <span className="trust-divider">·</span>
            <span>Zero account required</span>
            <span className="trust-divider">·</span>
            <span>Private browser storage</span>
          </div>

          <p className="preview-notice">
            Direct applications to official employer career portals with zero middleman fees.
          </p>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow="Explore By Category"
            title="A job search tailored for real life"
            copy="From entry-level positions to experienced roles, explore fields that fit your unique background and goals."
          />
          <div className="category-grid">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.name}
                href={`/jobs/category/${category.slug}`}
                className="category-card"
              >
                <span className="category-icon">
                  <Icon name={category.icon || "briefcase"} size={18} />
                </span>
                <strong>{category.name}</strong>
                <span className="category-count">{category.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Genuine Job Listings Preview */}
      <section className="section section-cream">
        <div className="shell">
          <SectionHeading
            eyebrow="Live Opportunities"
            title="Recent verified openings"
            copy="Genuine positions from authorized UK employers. Apply directly through the official employer links."
            action={
              <Link href="/jobs" className="text-link">
                Browse all jobs ({jobs.length}) <Icon name="arrow-up-right" size={14} />
              </Link>
            }
          />
          <div className="data-banner">
            <Icon name="check" size={18} />
            <div>
              <strong>Live Verified Vacancies</strong> All listings are verified from employer feeds including GXO Logistics and Medequip UK.
            </div>
          </div>
          <div className="job-grid">
            {jobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link
              href="/jobs"
              className="button button-teal"
              style={{ padding: "12px 28px", fontSize: 14 }}
            >
              Browse All {jobs.length} Verified Positions <Icon name="arrow-up-right" size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Essential AI Career Tools */}
      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow="Practical AI Tools"
            title="Tools designed to help you succeed"
            copy="No complicated onboarding or hidden fees. Just four purposeful tools for the moments that matter."
            action={
              <Link href="/ai-tools" className="text-link">
                All AI tools <Icon name="arrow-up-right" size={14} />
              </Link>
            }
          />
          <div className="tool-grid">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="tool-card">
                <span className="tool-card-icon">
                  <Icon name={tool.icon} size={20} />
                </span>
                <h3>{tool.title}</h3>
                <p>{tool.copy}</p>
                <span className="text-link">
                  Try tool <Icon name="arrow-up-right" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Local-First Resume Builder Feature */}
      <section className="section section-cream">
        <div className="shell">
          <div className="split-feature">
            <div className="feature-copy">
              <div className="eyebrow">
                <Icon name="lock" size={13} /> Strict Browser Privacy
              </div>
              <h2>Build your CV without giving away your personal data.</h2>
              <p>
                Your drafts autosave securely right inside your browser using IndexedDB. Edit, preview, and print a polished PDF CV whenever you need it.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="check">
                    <Icon name="check" size={16} />
                  </span>
                  Showcases both practical skills and formal experience
                </li>
                <li>
                  <span className="check">
                    <Icon name="check" size={16} />
                  </span>
                  Private local drafts with instant one-click deletion
                </li>
                <li>
                  <span className="check">
                    <Icon name="check" size={16} />
                  </span>
                  Print-ready layout formatted for standard A4 and Letter paper
                </li>
              </ul>
              <div style={{ marginTop: 28 }}>
                <Link href="/ai-tools/resume-builder" className="button button-dark">
                  <Icon name="file-text" size={15} /> Build Your CV Now
                </Link>
              </div>
            </div>
            <div className="feature-visual">
              <div className="visual-sheet">
                <div className="sheet-header">
                  <strong>Alex Santos</strong>
                  <small>Logistics & Operations Specialist · United Kingdom</small>
                </div>
                <div className="sheet-row">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="sheet-row">
                  <span />
                  <span />
                </div>
                <div className="sheet-row" style={{ marginTop: 12 }}>
                  <span style={{ width: "40%" }} />
                  <span style={{ width: "85%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Guides Section */}
      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow="Practical Guides"
            title="Straightforward advice, when it counts"
            copy="Quick, actionable guides written to help you navigate applications, interviews, and UK CV writing."
            action={
              <Link href="/career-guides" className="text-link">
                Read all guides ({guides.length}) <Icon name="arrow-up-right" size={14} />
              </Link>
            }
          />
          <div className="article-grid">
            {guides.slice(0, 3).map((guide) => (
              <article className="article-card" key={guide.slug}>
                <div className="eyebrow">{guide.category}</div>
                <h3>{guide.title}</h3>
                <p>{guide.excerpt}</p>
                <div className="article-meta">
                  <Icon name="clock" size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  {guide.readTime}
                </div>
                <Link className="text-link" href={`/career-guides/${guide.slug}`} style={{ marginTop: 16 }}>
                  Read guide <Icon name="arrow-up-right" size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Global Call to Action Banner */}
      <section className="cta-banner">
        <div className="shell cta-inner">
          <h2>Ready to take your next step?</h2>
          <p>
            Start exploring verified UK job listings or build a clean, professional CV in minutes.
          </p>
          <div className="cta-actions">
            <Link href="/jobs" className="button button-teal">
              Find a Job <Icon name="arrow-up-right" size={15} />
            </Link>
            <Link
              href="/ai-tools/resume-builder"
              className="button button-outline"
              style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
            >
              Build My Resume
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
