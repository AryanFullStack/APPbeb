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
            A simpler, honest way to find your next opportunity and prepare for it with confidence.
          </p>
        </div>

        <div className="footer-links">
          <span className="footer-label">Explore</span>
          <Link href="/jobs">Find Jobs</Link>
          <Link href="/ai-tools">AI Career Tools</Link>
          <Link href="/career-guides">Career Guides</Link>
        </div>

        <div className="footer-links">
          <span className="footer-label">AppBeb</span>
          <Link href="/about">About AppBeb</Link>
          <Link href="/contact">Contact & Support</Link>
          <Link href="/pricing">Pricing & Plans</Link>
        </div>

        <div className="footer-links">
          <span className="footer-label">Trust & Legal</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Preferences</Link>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© 2026 AppBeb. Built for the next step.</span>
        <span>Job listings are published from verified, authorized sources only.</span>
      </div>
    </footer>
  );
}
