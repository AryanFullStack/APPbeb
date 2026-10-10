import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "../../../components/ui-icon";
import { JobCard } from "../../../components/job-card";
import { fetchCategoryBySlug, fetchJobsByCategory, fetchCategories } from "../../../lib/data";

// Rich category-specific editorial insights
const categoryDescriptions: Record<
  string,
  { summary: string; responsibilities: string[]; requirements: string[] }
> = {
  "warehouse-logistics": {
    summary:
      "Explore verified warehouse operative, storekeeper, and logistics roles across the UK and Europe. Opportunities include order picking, goods intake, stock inventory auditing, and automated fulfilment centres with established logistics providers.",
    responsibilities: [
      "Picking and packing orders accurately using RF scanners and inventory management systems",
      "Receiving supplier deliveries, unloading pallets, and recording stock receipts",
      "Operating material handling equipment such as pump trucks, pallet jacks, and counterbalances",
      "Adhering to strict depot health and safety protocols and manual handling guidelines",
    ],
    requirements: [
      "Safe manual handling awareness and physical stamina for shift operations",
      "Attention to detail and numerical accuracy in inventory checking",
      "Flexibility with rotating shift schedules (early, late, or weekend shifts)",
    ],
  },
  "driving-delivery": {
    summary:
      "Discover legitimate commercial driving vacancies across the UK and Europe, including Class 1 (C+E), Class 2 (Category C), 7.5 tonne, and multi-drop delivery driver positions offering competitive compensation and route stability.",
    responsibilities: [
      "Conducting daily vehicle walkaround safety inspections and tachograph compliance",
      "Delivering commercial freight, retail goods, and parcel drops on designated routes",
      "Securing loads correctly and obtaining electronic proof of delivery (POD)",
      "Maintaining professional customer service during drop-offs and collections",
    ],
    requirements: [
      "Valid UK or EU driving licence with appropriate vehicle category entitlements",
      "Valid Driver Certificate of Professional Competence (CPC) and digital tachograph card",
      "Clean driving history or minimal points, plus safe driving assessment compliance",
    ],
  },
  "cleaning-facilities": {
    summary:
      "Find reliable commercial cleaning, depot sanitation, and facilities maintenance opportunities. Positions span corporate offices, healthcare clinics, transport hubs, and industrial warehouses with flexible morning or evening hours.",
    responsibilities: [
      "Performing routine and deep sanitation of workstations, washrooms, and communal corridors",
      "Operating industrial floor buffers, vacuum systems, and safe chemical dispensing equipment",
      "Restocking essential hygiene supplies and reporting facility maintenance issues",
      "Maintaining COSHH (Control of Substances Hazardous to Health) standards at all times",
    ],
    requirements: [
      "Punctuality, trustworthiness, and high attention to hygiene standards",
      "Basic understanding of COSHH regulations and safe chemical handling",
      "Previous commercial or residential cleaning experience is advantageous but often trained",
    ],
  },
  "care-support": {
    summary:
      "Browse genuine healthcare support, home care, and assisted living roles. Provide meaningful assistance to individuals requiring daily living support across UK care homes, community trusts, and supported housing environments.",
    responsibilities: [
      "Assisting individuals with personal care, nutrition, medication prompts, and mobility",
      "Supporting social engagement, community visits, and emotional well-being",
      "Maintaining accurate daily care logs and liaising with clinical nursing teams",
      "Promoting client dignity, independence, and personal preferences",
    ],
    requirements: [
      "Empathy, patience, and strong communication skills",
      "Willingness to complete standard Enhanced DBS certification and care certificate training",
      "Experience or recognized NVQ/SVQ in Health and Social Care is valued",
    ],
  },
  "retail-customer-service": {
    summary:
      "Connect with verified customer service advisor, retail store assistant, and point-of-sale vacancies. Roles cover high street retail, supermarket operations, and customer contact desks.",
    responsibilities: [
      "Assisting customers with product inquiries, recommendations, and checkout transactions",
      "Merchandising store displays, replenishing stock, and conducting price audits",
      "Handling customer returns and inquiries with polite and solution-oriented service",
    ],
    requirements: [
      "Strong verbal communication and interpersonal skills",
      "Reliability, teamwork, and customer-centric attitude",
      "Basic numeracy and comfort operating digital till systems",
    ],
  },
  "professional-office": {
    summary:
      "Browse verified administration, payroll governance, operations analysis, and human resources opportunities in corporate and logistics headquarters throughout the UK and Europe.",
    responsibilities: [
      "Managing payroll data reconciliations, invoicing, and reporting audits",
      "Coordinating cross-functional communications and regulatory compliance documentation",
      "Maintaining digital database systems and resolving operational workflow queries",
    ],
    requirements: [
      "Proficiency with spreadsheet analysis (Excel/Google Sheets) and office software",
      "Analytical mindset, data accuracy, and organized task management",
      "Relevant professional experience or recognized business administration qualifications",
    ],
  },
  "it-engineering": {
    summary:
      "Explore software development, technical systems support, and digital infrastructure roles across the UK and European technology ecosystems.",
    responsibilities: [
      "Developing, testing, and deploying scalable software applications and services",
      "Investigating technical issues and implementing system improvements",
      "Collaborating with engineering teams to ensure system uptime and security",
    ],
    requirements: [
      "Proficiency with modern programming languages, cloud platforms, or systems architecture",
      "Strong problem-solving ability and technical troubleshooting experience",
      "Experience working in collaborative agile workflows",
    ],
  },
};

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const editorial = categoryDescriptions[category.slug];
  const pageTitle = `${category.name} Jobs in the UK & Europe`;
  const pageDescription =
    editorial?.summary ||
    `Browse verified ${category.name} vacancies and direct career opportunities across the United Kingdom and Europe. Apply directly to official employer portals on AppBeb.`;
  const canonicalUrl = `${base}/jobs/category/${category.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageTitle} — AppBeb`,
      description: pageDescription,
      url: canonicalUrl,
      type: "website",
      siteName: "AppBeb",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  const [jobs, allCategories] = await Promise.all([
    fetchJobsByCategory(category.slug),
    fetchCategories(),
  ]);

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";
  const editorial = categoryDescriptions[category.slug];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Find Jobs", item: `${base}/jobs` },
      {
        "@type": "ListItem",
        position: 3,
        name: `${category.name} Jobs`,
        item: `${base}/jobs/category/${category.slug}`,
      },
    ],
  };

  const otherCategories = allCategories.filter((c) => c.slug !== category.slug).slice(0, 6);

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />

          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <Link href="/jobs">Find Jobs</Link>
            <Icon name="chevron-right" size={13} />
            <span>{category.name}</span>
          </div>

          <div className="eyebrow">
            <Icon name="briefcase" size={12} /> Industry Sector Directory
          </div>
          <h1>{category.name} Jobs</h1>
          <p>
            {editorial?.summary ||
              `Discover verified ${category.name.toLowerCase()} opportunities and official employer career links across the UK and European countries.`}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="jobs-layout">
            <div className="jobs-results">
              <div className="results-header" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", margin: 0 }}>
                  Current Opportunities ({jobs.length})
                </h2>
                <span style={{ fontSize: 13, color: "var(--navy-muted)" }}>
                  Verified direct employer links
                </span>
              </div>

              {jobs.length > 0 ? (
                <div className="job-list-stream">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "36px 30px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-lg)",
                    textAlign: "center",
                  }}
                >
                  <Icon name="briefcase" size={28} style={{ margin: "0 auto 12px", color: "var(--navy-muted)" }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--navy)" }}>
                    No Current Openings in {category.name}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--navy-muted)", maxWidth: 500, margin: "0 auto 20px" }}>
                    We update our verified employer vacancies daily. Browse our full directory of jobs or prepare your CV using our free AI tools.
                  </p>
                  <Link href="/jobs" className="button button-teal button-small">
                    View All Active Jobs <Icon name="arrow-up-right" size={14} />
                  </Link>
                </div>
              )}

              {/* Editorial Sector Guide */}
              {editorial && (
                <article
                  style={{
                    marginTop: 48,
                    padding: "32px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", margin: "0 0 14px" }}>
                    What Employers Look for in {category.name}
                  </h3>
                  <p style={{ fontSize: 14.5, color: "var(--navy-muted)", lineHeight: 1.6, margin: "0 0 20px" }}>
                    {editorial.summary}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 10px" }}>
                        Typical Responsibilities
                      </h4>
                      <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, color: "var(--navy-muted)", lineHeight: 1.6 }}>
                        {editorial.responsibilities.map((r, i) => (
                          <li key={i} style={{ marginBottom: 6 }}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 10px" }}>
                        Key Requirements & Attributes
                      </h4>
                      <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13.5, color: "var(--navy-muted)", lineHeight: 1.6 }}>
                        {editorial.requirements.map((req, i) => (
                          <li key={i} style={{ marginBottom: 6 }}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link
                      href={`/ai-tools/resume-builder`}
                      className="button button-teal button-small"
                    >
                      <Icon name="file-text" size={14} /> Tailor CV for {category.name}
                    </Link>
                    <Link
                      href="/career-guides"
                      className="button button-outline button-small"
                    >
                      <Icon name="file-text" size={14} /> Read UK Career Guides
                    </Link>
                  </div>
                </article>
              )}
            </div>

            {/* Sidebar: Explore Other Categories */}
            <aside className="jobs-sidebar" style={{ position: "sticky", top: 88 }}>
              <div
                style={{
                  padding: 24,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: "0 0 14px" }}>
                  Explore Other Categories
                </h3>
                <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {otherCategories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/jobs/category/${c.slug}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13.5,
                        color: "var(--navy)",
                        textDecoration: "none",
                        background: "var(--bg-subtle)",
                      }}
                    >
                      <span>{c.name}</span>
                      <Icon name="chevron-right" size={12} />
                    </Link>
                  ))}
                </nav>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                  <Link
                    href="/jobs"
                    style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    View All Categories & Filters <Icon name="arrow-up-right" size={13} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
