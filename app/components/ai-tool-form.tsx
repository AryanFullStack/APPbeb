"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "./ui-icon";
import { useToast } from "./ui-provider";

const config = {
  matcher: {
    title: "Match Your Resume to a Job",
    intro:
      "Paste your resume and a target job description. You’ll get a plain-language match evaluation, ATS keyword alignment, and prioritized recommendations.",
    primary: "Analyze Job Match",
    firstLabel: "Your resume or background summary",
    firstPlaceholder: "Paste your existing resume, work experience, or background summary here…",
    secondLabel: "Target job description & requirements",
    secondPlaceholder: "Paste the requirements, responsibilities, and qualifications from the vacancy…",
    filename: "resume-job-match.txt",
    sample: {
      first:
        "Alex Santos — Operations & Customer Support Lead\n\nExperience:\n• 4 years managing multi-channel support (Zendesk, email, phone) with 98% CSAT rating.\n• Led a team of 6 representatives; developed standard operating procedures and onboarding guides.\n• Proficient in CRM data entry, dispute resolution, Excel, and cross-functional communication.\n• Reduced ticket backlog by 35% through triage optimization and automated response templates.",
      second:
        "Senior Customer Care Associate needed for fast-growing logistics & tech company.\n\nResponsibilities:\n• Oversee daily customer interactions, handling escalated tickets via Zendesk and phone.\n• Train and coach junior representatives on team procedures and communication standards.\n• Collaborate with logistics and engineering teams to identify software defects and process bottlenecks.\n• Must have 3+ years in customer support, strong conflict resolution, Excel proficiency, and process improvement experience.",
    },
  },
  "cover-letter": {
    title: "Write a Focused Cover Letter",
    intro:
      "Share your role, employer, and core strengths. Get an authentic, persuasive first draft tailored specifically to what the employer is seeking.",
    primary: "Draft Cover Letter",
    firstLabel: "Your experience & key strengths",
    firstPlaceholder: "Tell us about your background, achievements, and practical skills…",
    secondLabel: "Target role & employer details",
    secondPlaceholder: "Paste the job description, role overview, or employer name…",
    filename: "cover-letter-draft.txt",
    sample: {
      first:
        "Alex Santos — Logistics & Operations Specialist with 4 years experience.\n• Managed daily warehouse inventory and shipment schedules with 99.4% on-time delivery.\n• Coordinated with freight carriers, supervised 10 floor staff, and ensured OSHA safety compliance.\n• Streamlined stock auditing workflows using automated spreadsheets, reducing error rates by 20%.",
      second:
        "Logistics Operations Supervisor at Apex Global Freight.\nLooking for an organized team lead to supervise inbound shipments, manage warehouse stock systems, and oversee safety procedures for our regional distribution hub in Chicago.",
    },
  },
  interview: {
    title: "Prepare for Your Interview",
    intro:
      "Specify your target role and background. Get likely interview questions, winning talking points, and an actionable 24-hour preparation blueprint.",
    primary: "Generate Prep Plan",
    firstLabel: "Role you’re interviewing for",
    firstPlaceholder: "e.g. Warehouse Supervisor, Care Assistant, Frontend Engineer, Junior Accountant…",
    secondLabel: "Your background & questions you fear",
    secondPlaceholder: "Share what experience you bring and which questions or topics make you nervous…",
    filename: "interview-prep-guide.txt",
    sample: {
      first: "Senior Operations Coordinator / Team Supervisor",
      second:
        "I have 4 years of hands-on warehouse and logistics experience. I'm strong with day-to-day operations and team mentoring, but I get nervous when asked about high-stakes budget management, handling severe conflicts between direct reports, or explaining why I want to step up into management.",
    },
  },
} as const;

export function AiToolForm({ tool }: { tool: keyof typeof config }) {
  const toolConfig = config[tool];
  const [first, setFirst] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (tool === "interview" && roleParam) {
        return decodeURIComponent(roleParam);
      }
    }
    return "";
  });

  const [second, setSecond] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jobParam = params.get("job");
      if ((tool === "matcher" || tool === "cover-letter") && jobParam) {
        return decodeURIComponent(jobParam);
      }
    }
    return "";
  });

  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { success, error: toastError, info } = useToast();

  function loadSample() {
    setFirst(toolConfig.sample.first);
    setSecond(toolConfig.sample.second);
    setError("");
    info("Loaded realistic sample data! Click below to generate.");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setResult("");

    if (first.trim().length < 10 || second.trim().length < 10) {
      const msg = "Please provide at least a couple of sentences in both fields to generate an accurate result.";
      setError(msg);
      toastError(msg);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool, input: { first, second } }),
      });
      const body = (await response.json()) as { result?: string; error?: string };
      if (!response.ok) {
        throw new Error(body.error || "AI service is currently unavailable. Please try again later.");
      }
      const outputText = body.result || "No result was returned.";
      setResult(outputText);
      success("Generated successfully! You can now edit, copy, or download it.");

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "AI is unavailable right now. Try again later.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    const textToCopy = resultRef.current?.innerText || result;
    if (!textToCopy) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => success("Result copied to clipboard!"))
        .catch(() => fallbackCopy(textToCopy));
    } else {
      fallbackCopy(textToCopy);
    }
  }

  function fallbackCopy(text: string) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      success("Result copied to clipboard!");
    } catch {
      toastError("Could not copy automatically. Please select the text manually.");
    }
  }

  function handleDownload() {
    const textToDownload = resultRef.current?.innerText || result;
    if (!textToDownload) return;

    try {
      const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = toolConfig.filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      success(`Downloaded ${toolConfig.filename}`);
    } catch {
      toastError("Download failed. You can copy the text directly.");
    }
  }

  function handleReset() {
    setFirst("");
    setSecond("");
    setResult("");
    setError("");
    info("Form cleared.");
  }

  return (
    <section className="form-page">
      <div className="shell tool-form-container">
        <div className="breadcrumb">
          <Link href="/ai-tools">AI Tools</Link>
          <Icon name="chevron-right" size={13} />
          <span>{toolConfig.title}</span>
        </div>

        <form className="form-card" onSubmit={submit}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div className="eyebrow" style={{ margin: 0 }}>
              <Icon name="sparkles" size={13} /> AI Career Assistant
            </div>
            <button
              type="button"
              className="button button-outline button-small"
              onClick={loadSample}
              style={{ fontSize: 12, padding: "5px 12px" }}
              title="Pre-fill with realistic sample data to test instantly"
            >
              <Icon name="sparkles" size={13} /> Try Sample Data
            </button>
          </div>

          <h1 style={{ marginTop: 12 }}>{toolConfig.title}</h1>
          <p>
            {toolConfig.intro} Your input is processed securely and is never stored in AppBeb’s database.
          </p>

          <div className="form-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="field-label" htmlFor="first-input">
                {toolConfig.firstLabel}
              </label>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {first.length} characters
              </span>
            </div>
            <textarea
              id="first-input"
              className="textarea-control"
              value={first}
              onChange={(event) => setFirst(event.target.value)}
              placeholder={toolConfig.firstPlaceholder}
              rows={4}
              required
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 18 }}>
              <label className="field-label" htmlFor="second-input">
                {toolConfig.secondLabel}
              </label>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {second.length} characters
              </span>
            </div>
            <textarea
              id="second-input"
              className="textarea-control"
              value={second}
              onChange={(event) => setSecond(event.target.value)}
              placeholder={toolConfig.secondPlaceholder}
              rows={4}
              required
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              className="button button-teal"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <span className="loading-label">
                  <Icon name="loader" size={15} className="spin" /> Generating…
                </span>
              ) : (
                <>
                  {toolConfig.primary} <Icon name="arrow-up-right" size={15} />
                </>
              )}
            </button>

            <button
              type="button"
              className="button button-outline button-small"
              onClick={loadSample}
              disabled={loading}
            >
              Load Example
            </button>

            {(first || second || result) && (
              <button
                type="button"
                className="button button-outline button-small"
                onClick={handleReset}
                disabled={loading}
              >
                Clear
              </button>
            )}

            <span className="local-note" style={{ margin: 0, marginLeft: "auto" }}>
              <Icon name="lock" size={13} /> Private processing
            </span>
          </div>
        </form>

        {result && (
          <div className="result-card" style={{ marginTop: 28 }}>
            <div className="result-card-header">
              <div>
                <h2>Your Editable Result</h2>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  Click into the box below to edit before copying or downloading
                </span>
              </div>
              <div className="result-actions">
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={handleCopy}
                  title="Copy result to clipboard"
                >
                  <Icon name="copy" size={14} /> Copy text
                </button>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={handleDownload}
                  title="Download as a text file"
                >
                  <Icon name="download" size={14} /> Download .txt
                </button>
              </div>
            </div>

            <div
              ref={resultRef}
              className="result-content"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setResult(e.currentTarget.innerText)}
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 13.5,
                lineHeight: 1.65,
                padding: "16px 20px",
                whiteSpace: "pre-wrap",
                minHeight: 220,
              }}
            >
              {result}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
