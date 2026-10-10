"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link href="/" className="brand footer-brand" aria-label="AppBeb home">
            <span className="brand-mark">A</span>
            <span>
              AppBeb<span className="brand-dot">.</span>
            </span>
          </Link>
          <p className="footer-copy">
            A simpler, honest way to find your next opportunity across the UK and Europe, and prepare for it with calm confidence.
          </p>
        </div>

        <div className="footer-links">
          <span className="footer-label">Explore Jobs</span>
          <Link href="/jobs">Find Jobs</Link>
          <Link href="/jobs/category/warehouse-logistics">Warehouse & Logistics</Link>
          <Link href="/jobs/category/driving-delivery">Driving & Delivery</Link>
          <Link href="/jobs/category/cleaning-facilities">Cleaning & Facilities</Link>
          <Link href="/jobs/category/care-support">Care & Support</Link>
        </div>

        <div className="footer-links">
          <span className="footer-label">Career Resources</span>
          <Link href="/ai-tools">AI Career Tools</Link>
          <Link href="/career-guides">Career Guides</Link>
          <Link href="/about">About AppBeb</Link>
          <Link href="/contact">Contact & Support</Link>
          <Link href="/pricing">Pricing & Plans</Link>
        </div>

        <div className="footer-links">
          <span className="footer-label">Trust & Compliance</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Preferences</Link>
          <Link href="/disclaimer">Platform Disclaimer</Link>
          <Link href="/editorial-policy">Job Verification Policy</Link>
          <Link href="/report-job">Report a Job / Removal</Link>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© 2026 AppBeb. Built for verified opportunity.</span>
        <span>Independent job directory. Never send money for any job application.</span>
      </div>
    </footer>
  );
}
