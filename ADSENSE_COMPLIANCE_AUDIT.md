# Google AdSense Compliance Audit — AppBeb.com
**Audit Date:** November 24, 2026  
**Audited Domain:** https://appbeb.com/  
**Technology:** Next.js (App Router, React 19, TypeScript)  
**Publisher ID:** `pub-1772306849032580`  
**Auditor Roles:** Senior Google AdSense Compliance Specialist, Content Quality Auditor, Technical SEO Auditor  

---

## 1. Executive Summary

AppBeb.com is an independent UK and European job discovery platform and local-first AI career toolkit. This audit provides an exhaustive evaluation of all publicly accessible routes against the official **Google AdSense Program Policies**, **Google Publisher Policies**, and **Search Central Guidelines**.

All policy risks, thin/duplicate content patterns, misleading trust indicators, job listing inaccuracies, and consent management configurations have been audited and resolved to prepare AppBeb.com for manual Google AdSense re-review.

---

## 2. Policy-by-Policy Compliance Audit

### 2.1 Value & Original Content (Google Publisher Policies: Thin & Low-Value Content)
* **Official Policy Reference:** [Google Publisher Policies — Content Quality](https://support.google.com/adsense/answer/10502938)
* **Pre-Audit Finding:** 
  - Career guide pages rendered `guide.content` in full, immediately followed by `guide.sections[0]` containing the exact same body text under an `<h2>Overview</h2>` header. This resulted in duplicate paragraphs across all 12 published career guides.
* **Evidence:** `app/career-guides/[slug]/page.tsx` line 130 rendered `paragraphs` and then looped over `guide.sections` without deduplication.
* **Severity:** **HIGH**
* **Remediation Implemented:**
  - Updated `app/career-guides/[slug]/page.tsx` to automatically filter duplicate overview sections.
  - Added dedicated, verified UK statutory employment reference blocks linking directly to official sources: **GOV.UK National Minimum Wage**, **ACAS (Advisory, Conciliation and Arbitration Service)**, and the **National Careers Service**.
* **Current Status:** **COMPLIANT**

---

### 2.2 Misleading Trust Indicators & Deceptive Representations
* **Official Policy Reference:** [Google AdSense Program Policies — Misrepresentative Content](https://support.google.com/adsense/answer/48182)
* **Pre-Audit Finding:**
  - The homepage hero section featured `★ ★ ★ ★ ★` (5 out of 5 stars) without citations, verified reviews platform links (such as Trustpilot or Reviews.io), or user review count.
* **Evidence:** `app/page.tsx` line 110: `<div className="trust-stars" aria-label="5 out of 5 stars">★ ★ ★ ★ ★</div>`.
* **Severity:** **HIGH**
* **Remediation Implemented:**
  - Removed unverified star rating markup.
  - Replaced with factual, verified feature highlights: `Direct Employer Applications · Zero Middleman Fees · Private Browser Storage`.
* **Current Status:** **COMPLIANT**

---

### 2.3 Job Listing Authenticity, Deadlines & Closed Vacancies
* **Official Policy Reference:** [Google Search Central — JobPosting Guidelines](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
* **Pre-Audit Finding:**
  - Listing `gxo-warehouse-epsom-1417607700` ("Warehouse Operative at GXO Logistics Epsom") was marked as an active, verified vacancy even though the employer careers portal reported the position filled.
  - Active outbound application links remained enabled for expired positions.
* **Evidence:** Database row `18604edf-4af4-4c98-9a5a-97fa786bdfa2` had `listing_type = "verified_vacancy"`.
* **Severity:** **CRITICAL**
* **Remediation Implemented:**
  - Explicitly classified `gxo-warehouse-epsom-1417607700` as `listingType: "expired_or_closed"` and `isVerified: false`.
  - Updated `app/jobs/[slug]/page.tsx`: expired listings now display an "Applications Closed / Position Filled" banner, disable outbound application buttons, provide immediate navigation to active jobs, and omit Schema.org `JobPosting` structured data.
  - Synchronized `app/sitemap.ts` and search filtering to exclude closed roles from XML sitemaps and live search feeds.
* **Current Status:** **COMPLIANT**

---

### 2.4 Geographic Relevance & Category Consistency
* **Official Policy Reference:** [Google Publisher Policies — Misleading Navigation & Deceptive Site Design](https://support.google.com/adsense/answer/10502938)
* **Pre-Audit Finding:**
  - Category listings contained 7 non-UK/EU entries (5 in Canada, 1 in Australia, 1 in Singapore) despite AppBeb's clear site-wide positioning for UK and European job seekers.
* **Evidence:** Rows with `intl-gls-canada-*`, `intl-ryder-canada-*`, `intl-hellofresh-australia-*`, and `intl-dhl-singapore-*` appeared in general logistics categories.
* **Severity:** **MEDIUM**
* **Remediation Implemented:**
  - Added strict geographic filtering in `classifyJobRow()` and `fetchJobs()` in `app/lib/data.ts`.
  - Non-UK/EU rows are marked as `rejected_or_invalid` and excluded from all public feeds and category counts.
* **Current Status:** **COMPLIANT**

---

### 2.5 Job Counts & Homepage-to-Search Alignment
* **Official Policy Reference:** [Google Webmaster Guidelines — Consistency & Functional Navigation](https://support.google.com/adsense/answer/48182)
* **Pre-Audit Finding:**
  - Inconsistent job counts appeared between the homepage (displaying live database count) and `/jobs` (which fell back to 6 mock jobs before client hydration).
* **Severity:** **MEDIUM**
* **Remediation Implemented:**
  - Both `/api/jobs` and `app/page.tsx` now compute active counts identically: filtering out closed vacancies and non-target regions.
  - Total active verified vacancies and category badges reflect identical totals across the entire platform.
* **Current Status:** **COMPLIANT**

---

### 2.6 Privacy, GDPR & Consent Management Platform (CMP)
* **Official Policy Reference:** [Google AdSense Consent Management Requirements for EEA & UK](https://support.google.com/adsense/answer/13554116)
* **Pre-Audit Finding:**
  - CV Builder claimed "Draft data resides solely in your browser’s IndexedDB. Nothing is uploaded to external servers" while optional AI Summary and Polish Bullets features transmitted prompt text to `/api/ai`.
  - `/cookies` page had no interactive controls for users to adjust or revoke consent after initial selection.
* **Severity:** **HIGH**
* **Remediation Implemented:**
  - Updated CV Builder note in `app/components/resume-builder.tsx`: clarifies that drafts remain local by default, while optional AI assist sends only the active text snippet in memory.
  - Added `app/components/cookie-manager.tsx` onto `/cookies` allowing users to view their active consent status, accept all cookies, choose essential-only storage, or reset preferences at any time.
  - Added clear documentation regarding Google AdSense Privacy & Messaging (GDPR / IAB TCF v2.2) certification requirement for UK/EEA publishers.
* **Current Status:** **COMPLIANT**

---

### 2.7 Ad Placement & Structural Integration
* **Official Policy Reference:** [Ad Placement Policies & Accidental Clicks](https://support.google.com/adsense/answer/1346295)
* **Audit Findings:**
  - Sticky header ad scripts were completely removed per user request.
  - `public/ads.txt` is properly formatted with publisher ID `pub-1772306849032580` and authorized reseller ID.
  - Interactive buttons, navigation links, and PDF print triggers maintain clear spacing (>24px) from any future ad containers.
* **Current Status:** **COMPLIANT**

---

## 3. Summary of Findings & Audit Matrix

| Audit Area | Pre-Audit Finding | Severity | Resolution | Policy Status |
| :--- | :--- | :--- | :--- | :--- |
| **Career Guides** | Duplicate paragraph & overview rendering | High | Deduplicated sections & added UK statutory sources | **Passed** |
| **Trust Badges** | Fabricated 5-star rating stars | High | Replaced with verified operational features | **Passed** |
| **Closed Jobs** | GXO Epsom role listed as active verified | Critical | Marked expired, removed schema, disabled apply | **Passed** |
| **Geographic Scope** | Canada/Australia jobs on UK site | Medium | Excluded non-UK/EU rows from feeds and counts | **Passed** |
| **Search Sync** | Inconsistent counts on homepage vs /jobs | Medium | Unified active count logic across all endpoints | **Passed** |
| **AI Privacy Disclosures** | Inaccurate "nothing uploaded" claim | High | Clarified local draft vs optional AI assist scope | **Passed** |
| **Cookie Controls** | No revocation controls on /cookies | High | Created interactive `CookieManager` component | **Passed** |
| **Canonical URLs** | Possible localhost domain in production metadata | Medium | Enforced production canonical fallback `appbeb.com` | **Passed** |
| **Admin Route Indexing** | Admin pages potentially crawled without noindex | Medium | Verified `noindex, nofollow` on `/admin/layout.tsx` | **Passed** |
| **ads.txt** | Verified format and publisher ID | None | Confirmed matching `pub-1772306849032580` | **Passed** |

