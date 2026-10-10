import type { MetadataRoute } from "next";
import { fetchCareerGuides, fetchJobs } from "./lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

  const [jobs, guides] = await Promise.all([
    fetchJobs(),
    fetchCareerGuides(),
  ]);

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/ai-tools`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/career-guides`, changeFrequency: "weekly", priority: 0.7 },
    ...guides.map((guide) => ({
      url: `${base}/career-guides/${guide.slug}`,
      lastModified: guide.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...jobs.map((job) => ({
      url: `${base}/jobs/${job.slug}`,
      lastModified: job.publishedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
