import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "../../components/ui-icon";
import { AnalyticsEvent, TrackedOutboundLink } from "../../components/analytics-event";
import { fetchJobBySlug } from "../../lib/data";
import { formatDate } from "../../lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.company} — ${job.location}`,
    description: `${job.title} vacancy in ${job.location}. View verified role responsibilities, required skills, and apply directly.`,
    robots: { index: true, follow: true },
  };
}

export default async function JobDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Find Jobs", item: `${base}/jobs` },
      { "@type": "ListItem", position: 3, name: job.title, item: `${base}/jobs/${job.slug}` },
    ],
  };

  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt,
    employmentType: job.employmentType.includes("Part-time") ? "PART_TIME" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location },
    },
    url: job.applicationUrl,
  };

  return (
    <section className="detail-section">
      <div className="shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
        />
        <AnalyticsEvent event="job_detail_view" />

        <div className="breadcrumb">
          <Link href="/jobs">Find Jobs</Link>
          <Icon name="chevron-right" size={13} />
          <span>{job.title}</span>
        </div>

        <div className="detail-layout">
          <article>
            <header className="detail-header">
              <div className="company-avatar" aria-hidden="true">
                {job.company.charAt(0).toUpperCase()}
              </div>
              <h1>{job.title}</h1>
              <div className="detail-company">
                {job.company} · {job.location}
                {job.isVerified && (
                  <span className="verified" style={{ marginLeft: 8 }}>
                    <Icon name="check" size={11} /> Verified Employer
                  </span>
                )}
              </div>

              <div className="detail-meta">
                <span>
                  <Icon name="pin" size={15} />
                  {job.location}
                </span>
                <span>
                  <Icon name="briefcase" size={15} />
                  {job.employmentType} ({job.workMode})
                </span>
                {job.salary && (
                  <span style={{ color: "var(--teal)", fontWeight: 700 }}>
                    <Icon name="sparkles" size={15} />
                    {job.salary}
                  </span>
                )}
                <span>
                  <Icon name="clock" size={15} />
                  Posted {formatDate(job.publishedAt)}
                </span>
              </div>
            </header>

            <div className="detail-copy">
              <h2>About This Role</h2>
              <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{job.description}</p>

              <h2>Valued Skills & Capabilities</h2>
              <ul className="skill-list">
                {job.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>

              {/* AI Career Assistant Integration */}
              <div
                style={{
                  marginTop: 36,
                  padding: "24px 28px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div className="eyebrow" style={{ margin: "0 0 6px" }}>
                  <Icon name="sparkles" size={13} /> Free AI Application Toolkit
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>
                  Prepare your application for {job.company}
                </h3>
                <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--navy-muted)", lineHeight: 1.5 }}>
                  Boost your chances before submitting. Match your background against this job description, draft a tailored cover letter, or practice likely interview questions.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link
                    href={`/ai-tools/resume-matcher?job=${encodeURIComponent(`${job.title} at ${job.company}\n\n${job.description}`)}`}
                    className="button button-teal button-small"
                  >
                    <Icon name="sparkles" size={14} /> Match My Resume
                  </Link>
                  <Link
                    href={`/ai-tools/cover-letter?job=${encodeURIComponent(`${job.title} at ${job.company}\n\n${job.description}`)}`}
                    className="button button-outline button-small"
                  >
                    <Icon name="file-text" size={14} /> Draft Cover Letter
                  </Link>
                  <Link
                    href={`/ai-tools/interview-prep?role=${encodeURIComponent(job.title)}`}
                    className="button button-outline button-small"
                  >
                    <Icon name="user" size={14} /> Practice Interview
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <aside className="apply-card">
            <h2>Apply For Position</h2>
            <p>
              Applications are submitted directly through the verified employer source ({job.source}). AppBeb does not charge any fees or store your application files.
            </p>

            <TrackedOutboundLink href={job.applicationUrl} jobId={job.id}>
              <span className="button button-teal" style={{ width: "100%", justifyContent: "center" }}>
                Apply on Official Site <Icon name="arrow-up-right" size={15} />
              </span>
            </TrackedOutboundLink>

            <div className="privacy-note">
              <Icon name="lock" size={14} />
              Verified legitimate posting. Never send money for any job application.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
