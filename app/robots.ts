import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBase = process.env.NEXT_PUBLIC_SITE_URL;
  const base = rawBase && !rawBase.includes("localhost") ? rawBase : "https://appbeb.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin", "/api/", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
