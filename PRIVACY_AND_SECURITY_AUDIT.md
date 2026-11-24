# Privacy, GDPR & Security Audit — AppBeb.com
**Audit Date:** November 24, 2026  
**Audited Domain:** https://appbeb.com/  
**Applicable Regulations:** UK GDPR, EU GDPR (Regulation (EU) 2016/679), Privacy and Electronic Communications Regulations (PECR), Google Publisher Policies  

---

## 1. Executive Privacy Summary

AppBeb targets job seekers primarily located within the United Kingdom and the European Economic Area (EEA). Operating within these jurisdictions requires strict adherence to transparency, user consent, local-first storage boundaries, and secure data transmission protocols.

This audit reviews AppBeb’s data lifecycles, browser storage mechanisms, AI processing workflows, API rate-limiting, and Google AdSense compliance requirements.

---

## 2. Privacy & GDPR Findings

### 2.1 Local-First Browser Storage (IndexedDB & LocalStorage)
* **Mechanisms Used:**
  - `indexedDB.open("appbeb-resumes", 1)` — Object store `drafts`, key `local-draft`.
  - `localStorage.getItem("appbeb_cookie_consent")` — Consent state (`all` | `essential`).
* **Audit Findings:**
  - CV drafts created in the Resume Builder (`app/components/resume-builder.tsx`) are saved directly to the user’s local browser storage.
  - No background background sync or auto-upload occurs to central databases while the user types or edits their CV.
  - A prominent one-click "Reset draft" button triggers `indexedDB.delete("local-draft")`, allowing instant, permanent local deletion.

---

### 2.2 AI Feature Data Transmission & Disclosure Alignment
* **Endpoints:** `/api/ai` (invoking `app/lib/ai-engine.ts` or upstream OpenRouter).
* **Pre-Audit Discrepancy:**
  - The CV Builder previously displayed: *"Draft data resides solely in your browser’s IndexedDB. Nothing is uploaded to external servers."*
  - In reality, clicking "AI Summary Assist" or "AI Polish Bullets" sends the specific role, skills, or job duties to `/api/ai` to generate text suggestions.
* **Remediation Implemented:**
  - Revised in-app disclosure: *"CV drafts autosave privately in your browser’s IndexedDB. When using optional AI Assist (Summary or Bullet Polishing), only the selected text snippet is securely processed in memory to generate suggestions."*
  - Updated `app/privacy/page.tsx` Section 1 and 2: explicitly outlines what data is sent (ephemeral text snippets), how it is processed (in-memory prompt execution over TLS), and confirms zero persistent storage or AI model training.

---

### 2.3 Cookie Consent Management (UK / EEA / Switzerland)
* **Pre-Audit Deficiency:**
  - The cookie banner allowed accepting or selecting essential-only cookies, but users had no interactive way to change or revoke their choice on `/cookies`.
* **Remediation Implemented:**
  - Developed and deployed `CookieManager` (`app/components/cookie-manager.tsx`) on `/cookies`.
  - Provides instant status indication ("All Cookies Allowed" vs "Essential Only"), "Accept All", "Reject Non-Essential", and "Reset Preferences" triggers.
* **Google Certified CMP Requirement Note:**
  - Under Google Publisher Policy (effective Jan 16, 2024), publishers serving personalized ads to visitors in the UK, EEA, and Switzerland must use a **Google-certified Consent Management Platform (CMP)** that integrates with the **IAB Transparency and Consent Framework (TCF v2.2)**.
  - **Action Required by Website Owner:** In the Google AdSense dashboard, navigate to **Privacy & messaging > GDPR** and activate Google’s built-in GDPR consent message. Google provides this pre-certified CMP for free, which automatically coordinates with AdSense ad tags.

---

## 3. Application Security Audit

### 3.1 API Key & Secret Exposure Safeguards
* **Audit Finding:**
  - Checked `.env.local`, public code, and client bundles.
  - No private API keys or service role secrets are exposed to client-side bundles.
  - OpenRouter API key (`OPENROUTER_API_KEY`) is read exclusively inside server-side route handlers (`app/api/ai/route.ts`).
  - Supabase keys in use are standard publishable/anonymous keys intended for public client read queries with Row Level Security (RLS).

---

### 3.2 Endpoint Rate Limiting & Input Validation
* **Endpoint:** `POST /api/ai`
  - In-memory rate limiting enforces a maximum of 30 requests per minute per IP address (`requests.get(clientKey)`).
  - Validates tool key against strict allowed whitelist (`matcher`, `cover-letter`, `interview`, `resume-summary`, `resume-bullet`).
  - Validates minimum and maximum string lengths to prevent buffer abuse or malformed prompt injection.
* **Endpoint:** `GET /api/jobs`
  - Validates search query, location, and category parameters with safe string normalization.
  - Rejects injection patterns and returns structured JSON responses with proper error handling.

---

### 3.3 Outbound Links & Anti-Phishing Warnings
* **Audit Finding:**
  - Outbound job application links open in new tabs with `rel="noopener noreferrer"`.
  - Every job detail page and platform footer displays a prominent anti-fraud warning: *"Never send money for any job application. Legitimate employers never charge application fees."*
  - Dedicated `/report-job` form enables community reporting of expired, broken, or suspicious listings.

