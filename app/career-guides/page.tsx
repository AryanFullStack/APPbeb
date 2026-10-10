import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/ui-icon";
import { fetchCareerGuides } from "../lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  title: "UK & European Career Guides",
  description:
    "Practical career advice for UK CV writing, warehouse operative applications, commercial driver licensing, cleaning roles, interview prep, and avoiding recruitment scams.",
  alternates: {
    canonical: `${siteUrl}/career-guides`,
  },
  openGraph: {
    title: "Career Guides — AppBeb",
    description: "Clear, practical employment guides for job seekers in the UK and Europe.",
    url: `${siteUrl}/career-guides`,
  },
};

export default async function CareerGuidesPage() {
  const guides = await fetchCareerGuides();

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Career Guides</span>
          </div>
          <div className="eyebrow">
            <Icon name="sparkles" size={12} /> Clear, Practical UK Career Advice
          </div>
          <h1>Career advice in plain language.</h1>
          <p>
            Tested advice for writing a compelling UK CV, navigating driver and care licensing, spotting scams, and acing your interview.
          </p>
        </div>
      </section>

      <div className="shell article-grid">
        {guides.map((guide) => (
          <article className="article-card" key={guide.slug}>
            <div className="eyebrow">{guide.category}</div>
            <h2>{guide.title}</h2>
            <p>{guide.excerpt}</p>
            <div className="article-meta">
              <Icon
                name="clock"
                size={13}
                style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}
              />
              {guide.readTime}
            </div>
            <Link
              className="text-link"
              style={{ marginTop: 20 }}
              href={`/career-guides/${guide.slug}`}
            >
              Read guide <Icon name="arrow-up-right" size={14} />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
