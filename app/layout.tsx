import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./components/site-header";
import { Footer } from "./components/footer";
import { AnalyticsTracker } from "./components/analytics-tracker";
import { UiProvider } from "./components/ui-provider";
import { CookieConsent } from "./components/cookie-consent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AppBeb — Verified UK & European Job Opportunities & Free AI Tools",
    template: "%s | AppBeb",
  },
  description:
    "Simple, honest job search featuring verified UK and European vacancies, and private, local-first AI career tools for CV building and interview preparation.",
  openGraph: {
    type: "website",
    siteName: "AppBeb",
    title: "AppBeb — Find Your Next Opportunity",
    description: "Search verified job openings and prepare with private AI tools.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AppBeb — Verified UK & European Job Opportunities",
    description: "Search verified job openings and prepare with private AI tools.",
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
          <CookieConsent />
        </UiProvider>
      </body>
    </html>
  );
}
