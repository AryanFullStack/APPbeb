# Technical SEO & Crawlability Audit — AppBeb.com
**Audit Date:** November 24, 2026  
**Audited Domain:** https://appbeb.com/  
**Framework:** Next.js (App Router, Server-Side Rendering & Static Generation)  
**Target Search Engines:** Googlebot, Bingbot  

---

## 1. Executive SEO Overview

This technical SEO audit evaluates AppBeb.com's indexing readiness, crawler accessibility, structured data compliance, canonical hygiene, heading hierarchy, and performance characteristics.

---

## 2. Technical SEO Checklist & Findings

### 2.1 Server-Side Rendering & Bot Readability
* **Status:** **PASS**
* **Findings:**
  - All public routes (Homepage, Category pages, Job detail pages, Career guides, Trust and Policy pages) utilize Next.js Server Components.
  - Page HTML received by Googlebot contains full article copy, job descriptions, metadata, and breadcrumbs without requiring client JavaScript execution.
  - Interactive search filtering on `/jobs` seamlessly loads live data with server fallbacks.

---

### 2.2 Canonical URLs & Metadata Base
* **Status:** **PASS**
* **Findings:**
  - Root layout defines `metadataBase: new URL("https://appbeb.com")`.
  - Every individual page (`/jobs/[slug]`, `/career-guides/[slug]`, `/jobs/category/[slug]`, `/about`, `/contact`, `/pricing`, `/privacy`, `/terms`, `/cookies`, `/disclaimer`, `/editorial-policy`) generates a self-referencing canonical URL.
  - Guard logic ensures `NEXT_PUBLIC_SITE_URL=http://localhost:3000` does not leak into production canonical tags or OpenGraph URLs.

---

### 2.3 XML Sitemap (`/sitemap.xml`)
* **Status:** **PASS**
* **Findings:**
  - Dynamic route handler `app/sitemap.ts` generates dynamic XML sitemaps covering:
    - 13 primary static routes.
    - All active category pages (`/jobs/category/[slug]`).
    - All 12 published career guides (`/career-guides/[slug]`).
    - All verified, active vacancies (`/jobs/[slug]`).
  - **Crucial Search Central Rule Enforced:** Vacancies marked as `expired_or_closed` are automatically omitted from `/sitemap.xml`.

---

### 2.4 Robots.txt Configuration (`/robots.txt`)
* **Status:** **PASS**
* **Findings:**
  - Generated via `app/robots.ts`.
  - Allows search engines access to `/` while disallowing `/admin/`, `/admin`, `/api/`, and `/api`.
  - Correctly references `https://appbeb.com/sitemap.xml`.

---

### 2.5 Structured Data (Schema.org / JSON-LD)
* **Status:** **PASS**
* **Implemented Schemas:**
  1. **WebSite Schema:** Present on root layout with `SearchAction` potential action.
  2. **BreadcrumbList Schema:** Present on all job detail and career guide pages.
  3. **JobPosting Schema:**
     - Restricted strictly to active, verified vacancies with confirmed employers, specific titles, and verified locations.
     - Automatically suppressed for expired or closed vacancies (`gxo-warehouse-epsom-1417607700`) and directory portal leads (`career_portal_resource`), in full compliance with [Google Search Central JobPosting Policy](https://developers.google.com/search/docs/appearance/structured-data/job-posting).
  4. **Article Schema:** Present on career guide detail pages with publisher, headline, and date information.

---

### 2.6 Staff Portal Isolation (Noindex)
* **Status:** **PASS**
* **Findings:**
  - `app/admin/layout.tsx` enforces `robots: { index: false, follow: false, nocache: true, noarchive: true, googleBot: { index: false, follow: false, noimageindex: true } }`.
  - Ensures administrative dashboard and login screens are excluded from public search engine indexes.

---

### 2.7 Heading Hierarchy & Semantic Structure
* **Status:** **PASS**
* **Findings:**
  - Single `<h1>` per page across all templates.
  - Logical nesting: `<h1>` page title -> `<h2>` main section headings -> `<h3>` sub-features or article subsections.
  - All interactive buttons have explicit text or `aria-label` attributes.
  - All form controls have associated `<label>` tags with `htmlFor` bindings.

---

### 2.8 Open Graph & Twitter Cards
* **Status:** **PASS**
* **Findings:**
  - Rich social sharing metadata (`og:title`, `og:description`, `og:url`, `og:site_name`, `twitter:card`, `twitter:title`) configured on all major templates.
  - Enhances click-through rates and brand visibility when shared across social networks and professional platforms.

