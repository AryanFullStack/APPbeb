import type { MetadataRoute } from "next";
import { fetchCareerGuides, fetchJobs, fetchCategories } from "./lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

  const [jobs, categories, guides] = await Promise.all([
    fetchJobs(),
    fetchCategories(),
    fetchCareerGuides(),
  ]);

  // Only include active, non-expired jobs in the XML sitemap
  const activeIndexableJobs = jobs.filter(
    (job) => job.listingType !== "expired_or_closed"
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/terms`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/cookies`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/disclaimer`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/editorial-policy`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/report-job`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/career-guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/ai-tools`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/jobs/category/${cat.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${base}/career-guides/${guide.slug}`,
    lastModified: guide.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const jobRoutes: MetadataRoute.Sitemap = activeIndexableJobs.map((job) => ({
    url: `${base}/jobs/${job.slug}`,
    lastModified: job.publishedAt,
    changeFrequency: "daily" as const,
    priority: job.listingType === "verified_vacancy" ? 0.85 : 0.75,
  }));

  return [...staticRoutes, ...categoryRoutes, ...guideRoutes, ...jobRoutes];
}
