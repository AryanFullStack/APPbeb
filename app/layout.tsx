import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./components/site-header";
import { Footer } from "./components/footer";
import { AnalyticsTracker } from "./components/analytics-tracker";
import { UiProvider } from "./components/ui-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "AppBeb — Find your next opportunity", template: "%s | AppBeb" },
  description: "Simple job search and practical AI career tools for every kind of worker.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AppBeb",
    title: "AppBeb — Find your next opportunity",
    description: "Find a better job and prepare for it with simple AI career tools.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AppBeb — Find your next opportunity",
    description: "Simple job search and practical AI career tools.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AppBeb",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/jobs?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <UiProvider>
          <SiteHeader />
          <main className="site-main">{children}</main>
          <Footer />
          <AnalyticsTracker />
        </UiProvider>
      </body>
    </html>
  );
}
