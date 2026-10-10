import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCareerGuideBySlug } from "../../lib/data";
import { Icon } from "../../components/ui-icon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await fetchCareerGuideBySlug(slug);
  return guide
    ? {
        title: `${guide.title} | AppBeb Career Guides`,
        description: guide.excerpt,
      }
    : { title: "Guide Not Found" };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await fetchCareerGuideBySlug(slug);
  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    author: { "@type": "Organization", name: "AppBeb" },
    datePublished: guide.publishedAt,
  };

  // Split content paragraphs
  const paragraphs = guide.content
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="detail-section">
      <div className="shell" style={{ maxWidth: 840 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="breadcrumb">
          <Link href="/career-guides">Career Guides</Link>
          <Icon name="chevron-right" size={13} />
          <span>{guide.category}</span>
        </div>

        <div className="eyebrow">
          <Icon name="sparkles" size={12} /> {guide.category} · {guide.readTime}
        </div>

        <h1
          style={{
            fontSize: "clamp(30px, 4.4vw, 48px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.12,
            margin: "0 0 16px",
            fontWeight: 800,
            color: "var(--navy)",
          }}
        >
          {guide.title}
        </h1>

        <p style={{ color: "var(--navy-muted)", fontSize: 18, lineHeight: 1.6, margin: "0 0 36px" }}>
          {guide.excerpt}
        </p>

        <div className="detail-copy" style={{ borderTop: "1px solid var(--line)", paddingTop: 32 }}>
          {paragraphs.map((paragraph, index) => (
            <p key={index} style={{ marginBottom: 20, lineHeight: 1.75, fontSize: 16 }}>
              {paragraph}
            </p>
          ))}

          {guide.sections && guide.sections.length > 0 && (
            <div style={{ marginTop: 32 }}>
              {guide.sections.map((section, sIndex) => (
                <div key={sIndex} style={{ marginBottom: 24 }}>
                  {section.heading && (
                    <h2 style={{ fontSize: 22, marginTop: 28, marginBottom: 12 }}>
                      {section.heading}
                    </h2>
                  )}
                  <p style={{ lineHeight: 1.75, fontSize: 16 }}>{section.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action Callout Box */}
          <div
            style={{
              marginTop: 48,
              padding: "24px 28px",
              background: "var(--bg-surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
                Ready to put this advice to work?
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--navy-muted)" }}>
                Build a tailored UK CV draft directly in your browser or search verified roles.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/ai-tools/resume-builder" className="button button-teal button-small">
                Build My CV <Icon name="arrow-up-right" size={14} />
              </Link>
              <Link href="/jobs" className="button button-outline button-small">
                Find Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
