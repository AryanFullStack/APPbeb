import type { Metadata } from "next";
import { siteUrl } from "../lib/utils";

const base = siteUrl;

export const metadata: Metadata = {
  title: "Find Verified Jobs in the UK & Europe | AppBeb",
  description:
    "Search live verified job vacancies across logistics, driving, healthcare, cleaning, customer service, and tech in the UK and Europe. Apply directly to official employer portals.",
  alternates: {
    canonical: `${base}/jobs`,
  },
  openGraph: {
    title: "Find Verified Jobs in the UK & Europe — AppBeb",
    description:
      "Search live verified job vacancies across the UK and Europe with direct official employer application links.",
    url: `${base}/jobs`,
    type: "website",
    siteName: "AppBeb",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Verified Jobs in the UK & Europe — AppBeb",
    description: "Search live verified job vacancies across the UK and Europe.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
