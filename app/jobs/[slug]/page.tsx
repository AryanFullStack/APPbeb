import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "../../components/ui-icon";
import { JobCard } from "../../components/job-card";
import { AnalyticsEvent, TrackedOutboundLink } from "../../components/analytics-event";
import { fetchJobBySlug, fetchJobs } from "../../lib/data";
import { formatDate } from "../../lib/utils";

function parseEmploymentType(emp: string): string {
  const lower = emp.toLowerCase();
  if (lower.includes("part-time")) return "PART_TIME";
  if (lower.includes("contract")) return "CONTRACTOR";
  if (lower.includes("temporary") || lower.includes("temp")) return "TEMPORARY";
  if (lower.includes("intern")) return "INTERN";
  return "FULL_TIME";
}

function parseCountryCode(location: string): string {
  const lower = location.toLowerCase();
  if (
    lower.includes("united kingdom") ||
    lower.includes("uk") ||
    lower.includes("surrey") ||
    lower.includes("cheshire") ||
    lower.includes("essex") ||
    lower.includes("york") ||
    lower.includes("wales") ||
    lower.includes("northampton") ||
    lower.includes("england") ||
    lower.includes("london")
  ) {
    return "GB";
  }
  if (lower.includes("germany") || lower.includes("deutschland")) return "DE";
  if (lower.includes("netherlands") || lower.includes("holland")) return "NL";
  if (lower.includes("france")) return "FR";
  if (lower.includes("spain")) return "ES";
  if (lower.includes("ireland")) return "IE";
  if (lower.includes("poland")) return "PL";
  if (lower.includes("italy")) return "IT";
  if (lower.includes("belgium")) return "BE";
  if (lower.includes("canada")) return "CA";
  return "GB";
}

function parseSalaryStructure(salaryStr?: string) {
  if (!salaryStr) return undefined;
  const match = salaryStr.match(/[£$€]?([0-9,]+)/);
  if (!match) return undefined;
  const num = parseInt(match[1].replace(/,/g, ""), 10);
  if (isNaN(num) || num <= 0) return undefined;

  let currency = "GBP";
  if (salaryStr.includes("$")) currency = "USD";
  if (salaryStr.includes("€")) currency = "EUR";

  let unitText = "YEAR";
  if (salaryStr.toLowerCase().includes("hour") || salaryStr.toLowerCase().includes("hr")) unitText = "HOUR";
  if (salaryStr.toLowerCase().includes("month")) unitText = "MONTH";

  return {
    "@type": "MonetaryAmount",
    currency,
    value: {
      "@type": "QuantitativeValue",
      value: num,
      unitText,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

  if (!job) {
    return {
      title: "Job Not Found",
      robots: { index: false, follow: false },
    };
  }

  const isExpired = job.listingType === "expired_or_closed";
  const canonicalUrl = `${base}/jobs/${job.slug}`;

  return {
    title: `${job.title} at ${job.company} (${job.location})`,
    description: `${job.title} vacancy in ${job.location}. View verified role responsibilities, required skills, and apply directly.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${job.title} at ${job.company} — AppBeb`,
      description: `${job.title} vacancy in ${job.location} with ${job.company}. Review requirements and official application instructions.`,
      url: canonicalUrl,
      type: "article",
      siteName: "AppBeb",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} at ${job.company}`,
      description: `${job.title} in ${job.location}.`,
    },
    robots: isExpired ? { index: false, follow: true } : { index: true, follow: true },
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
  const isGenuineVacancy = job.listingType === "verified_vacancy" && job.isVerified;
  const isExpired = job.listingType === "expired_or_closed";
  const isRemote = job.workMode.toLowerCase().includes("remote");
  const countryCode = parseCountryCode(job.location);
  const salaryStructure = parseSalaryStructure(job.salary);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Find Jobs", item: `${base}/jobs` },
      { "@type": "ListItem", position: 3, name: job.title, item: `${base}/jobs/${job.slug}` },
    ],
  };

  // ONLY generate JobPosting for genuine verified vacancies (Strict Google Search Policy)
  const jobJsonLd =
    isGenuineVacancy && !isExpired
      ? {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          identifier: {
            "@type": "PropertyValue",
            name: job.company,
            value: job.slug,
          },
          datePosted: job.publishedAt,
          ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
          employmentType: parseEmploymentType(job.employmentType),
          hiringOrganization: {
            "@type": "Organization",
            name: job.company,
          },
          jobLocation: isRemote
            ? undefined
            : {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location,
                  addressCountry: countryCode,
                },
              },
          ...(isRemote
            ? {
                jobLocationType: "TELECOMMUTE",
                applicantLocationRequirements: {
                  "@type": "Country",
                  name: countryCode === "GB" ? "United Kingdom" : "European Union",
                },
              }
            : {}),
          ...(salaryStructure ? { baseSalary: salaryStructure } : {}),
          url: `${base}/jobs/${job.slug}`,
          directApply: true,
        }
      : null;

  // Fetch related jobs in the same category or employer
  const allJobs = await fetchJobs();
  const relatedJobs = allJobs
    .filter((j) => j.id !== job.id && (j.category === job.category || j.company === job.company))
    .slice(0, 3);

  return (
    <section className="detail-section">
      <div className="shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {jobJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
          />
        )}
        <AnalyticsEvent event="job_detail_view" />

        <div className="breadcrumb">
          <Link href="/jobs">Find Jobs</Link>
          <Icon name="chevron-right" size={13} />
          <span>{job.title}</span>
        </div>

        {isExpired && (
          <div
            style={{
              padding: "16px 20px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "var(--radius-md)",
              marginBottom: 24,
              color: "#9f1239",
            }}
          >
            <strong>This vacancy has expired or is no longer accepting applications.</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13.5 }}>
              Please explore the active related opportunities below or search current listings on AppBeb.
            </p>
          </div>
        )}

        <div className="detail-layout">
          <article>
            <header className="detail-header">
              <div className="company-avatar" aria-hidden="true">
                {job.company.charAt(0).toUpperCase()}
              </div>
              <h1>{job.title}</h1>
              <div className="detail-company">
                {job.company} · {job.location}
                {job.isVerified ? (
                  <span className="verified" style={{ marginLeft: 8 }}>
                    <Icon name="check" size={11} /> Verified Vacancy
                  </span>
                ) : job.listingType === "career_portal_resource" ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--navy-muted)",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--line)",
                      padding: "2px 8px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon name="briefcase" size={11} /> Career Portal Directory Lead
                  </span>
                ) : null}
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
              {job.listingType === "career_portal_resource" && (
                <div
                  style={{
                    padding: "16px 20px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Icon name="briefcase" size={16} />
                    <strong style={{ fontSize: 14.5, color: "var(--navy)" }}>
                      Employer Career Portal & Recruitment Directory Lead
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--navy-muted)", lineHeight: 1.55 }}>
                    This listing directs candidates to {job.company}’s official career portal to browse their live openings. It is provided as an informational directory resource. Verify specific openings, working locations, and application requirements directly on the employer’s site.
                  </p>
                </div>
              )}

              <h2>About This Role</h2>
              <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{job.description}</p>

              {job.skills.length > 0 && (
                <>
                  <h2>Valued Skills & Capabilities</h2>
                  <ul className="skill-list">
                    {job.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Free AI Career Toolkit */}
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
            <h2>{job.listingType === "career_portal_resource" ? "Visit Career Portal" : "Apply For Position"}</h2>
            <p>
              Applications are submitted directly through the employer source ({job.source}). AppBeb does not charge any fees or store your application files.
            </p>

            <TrackedOutboundLink href={job.applicationUrl} jobId={job.id}>
              <span className="button button-teal" style={{ width: "100%", justifyContent: "center" }}>
                {job.listingType === "career_portal_resource" ? "Visit Official Careers Site" : "Apply on Official Site"} <Icon name="arrow-up-right" size={15} />
              </span>
            </TrackedOutboundLink>

            <div className="privacy-note">
              <Icon name="lock" size={14} />
              Never send money for any job application. Legitimate employers never charge application fees.
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", textAlign: "center" }}>
              <Link
                href={`/report-job?job=${job.slug}&title=${encodeURIComponent(job.title)}`}
                style={{ fontSize: 12.5, color: "var(--navy-muted)", textDecoration: "underline" }}
              >
                Report this job / Request removal
              </Link>
            </div>
          </aside>
        </div>

        {/* Related Opportunities */}
        {relatedJobs.length > 0 && (
          <div style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid var(--line)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 20 }}>
              Related Opportunities
            </h2>
            <div className="job-list-stream">
              {relatedJobs.map((rJob) => (
                <JobCard key={rJob.id} job={rJob} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
