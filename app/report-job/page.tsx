"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "../components/ui-icon";

export default function ReportJobPage() {
  const [jobParam, setJobParam] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("job") || params.get("title") || "";
    }
    return "";
  });

  const [reason, setReason] = useState("expired");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      // Record analytics/telemetry if desired
      try {
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            event: "page_view",
            path: `/report-job?job=${encodeURIComponent(jobParam)}&reason=${reason}`,
          }),
        });
      } catch {}

      setSubmitted(true);
    });
  }

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <Link href="/jobs">Jobs</Link>
            <Icon name="chevron-right" size={13} />
            <span>Report a Job</span>
          </div>
          <div className="eyebrow">
            <Icon name="lock" size={12} /> Community Trust
          </div>
          <h1>Report a Job or Request Removal</h1>
          <p>
            Help us keep AppBeb clean and accurate. Flag expired vacancies, broken links, or suspicious employers.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell" style={{ maxWidth: 720 }}>
          <div className="form-card" style={{ padding: 36 }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--teal-soft)",
                    color: "var(--teal)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Icon name="check" size={26} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: "var(--navy)" }}>
                  Thank you for your report
                </h2>
                <p style={{ color: "var(--navy-muted)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
                  Our editorial review team has received your submission. We review flagged listings within 24 hours to expire, correct, or remove them as necessary.
                </p>
                <Link href="/jobs" className="button button-teal">
                  Return to Job Search <Icon name="arrow-up-right" size={14} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
                <div>
                  <label
                    htmlFor="job-identifier"
                    style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}
                  >
                    Job Title, URL, or ID *
                  </label>
                  <input
                    id="job-identifier"
                    required
                    value={jobParam}
                    onChange={(e) => setJobParam(e.target.value)}
                    placeholder="e.g. Warehouse Operative in Epsom, or vacancy URL"
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--line)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-reason"
                    style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}
                  >
                    Reason for Report *
                  </label>
                  <select
                    id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      background: "white",
                    }}
                  >
                    <option value="expired">Vacancy is expired or closed by employer</option>
                    <option value="broken_link">Broken application URL / 404 on employer site</option>
                    <option value="suspicious">Suspicious listing or suspected scam</option>
                    <option value="employer_request">I am the employer and request correction or removal</option>
                    <option value="inaccurate_details">Inaccurate salary, location, or company details</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="report-details"
                    style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}
                  >
                    Additional Details
                  </label>
                  <textarea
                    id="report-details"
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any additional context, error messages, or explanation..."
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--line)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reporter-email"
                    style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}
                  >
                    Your Email (Optional, if you wish to receive a resolution update)
                  </label>
                  <input
                    id="reporter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--line)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="button button-teal"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {isPending ? "Submitting Report..." : "Submit Report to Editorial Team"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
