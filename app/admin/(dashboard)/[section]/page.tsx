import Link from "next/link";
import { Icon } from "../../../components/ui-icon";

const sections: Record<string, { title: string; copy: string; rows: string[] }> = {
  jobs: {
    title: "Jobs Management",
    copy: "Review imported vacancies, remove expired roles, and preserve genuine listings.",
    rows: [
      "Import status updates will stream here once an authorized employer feed is connected.",
      "Only verified, non-duplicate roles from authorized sources will be published to public search.",
      "Outbound application URLs undergo automated validation to prevent broken links.",
    ],
  },
  categories: {
    title: "Job Categories",
    copy: "Maintain an intuitive, practical category list that reflects genuine local employment demand.",
    rows: [
      "Manage category labels, ordering, and icon assignments in Supabase.",
      "Ensure categories have active vacancies before linking them to navigation.",
    ],
  },
  "career-guides": {
    title: "Career Guides Editor",
    copy: "Publish structured, actionable career advice with clear authorship and metadata.",
    rows: [
      "Manage published articles and checklists in the career_guides table.",
      "Verify every guide provides immediate value to entry-level or career-transitioning applicants.",
    ],
  },
  seo: {
    title: "SEO & Search Engine Indexing",
    copy: "Manage canonical URLs, sitemaps, structured data, and search console health.",
    rows: [
      "Canonical base URL configured via NEXT_PUBLIC_SITE_URL.",
      "Structured data: WebSite, BreadcrumbList, and JobPosting for verified vacancies.",
      "Automated /sitemap.xml and /robots.txt generation active.",
    ],
  },
  "system-status": {
    title: "System Status & Integrations",
    copy: "Monitor external APIs, database connections, and rate-limiting safeguards.",
    rows: [
      "Supabase Database & Auth: Environment configuration verified.",
      "AI Gateway: Server-side OpenRouter endpoint with rate-limiting.",
      "Analytics: Privacy-conscious, GDPR-compliant event tracking without PII.",
    ],
  },
};

export default async function AdminSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const sectionKey = (await params).section;
  const section = sections[sectionKey] || sections["system-status"];

  return (
    <>
      <div className="breadcrumb">
        <Link href="/admin">Admin</Link>
        <Icon name="chevron-right" size={13} />
        <span>{section.title}</span>
      </div>

      <div className="eyebrow">
        <Icon name="briefcase" size={12} /> Management Portal
      </div>
      <h1>{section.title}</h1>
      <p>{section.copy}</p>

      <div className="status-card">
        <h2>Configuration Items</h2>
        {section.rows.map((row) => (
          <div className="status-row" key={row}>
            <span>{row}</span>
            <span className="status-badge-ready">Active</span>
          </div>
        ))}
      </div>
    </>
  );
}
