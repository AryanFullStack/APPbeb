"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./ui-icon";
import { Modal } from "./modal";
import { useToast } from "./ui-provider";
import type { Resume } from "../lib/types";

const emptyResume: Resume = {
  id: "local-draft",
  updatedAt: new Date().toISOString(),
  personal: { name: "", email: "", phone: "", location: "", summary: "" },
  experience: [{ role: "", company: "", dates: "", details: "" }],
  education: [{ school: "", qualification: "", dates: "" }],
  skills: [],
};

const sampleResume: Resume = {
  id: "local-draft",
  updatedAt: new Date().toISOString(),
  personal: {
    name: "Alex Santos",
    email: "alex.santos@example.com",
    phone: "+1 (555) 382-9104",
    location: "Chicago, IL",
    summary:
      "Results-focused Operations & Team Coordinator with 5+ years of experience streamlining logistics workflows, improving cross-functional team productivity, and enhancing client satisfaction. Proven track record of reducing delivery discrepancies by 24% while maintaining strict compliance standards.",
  },
  experience: [
    {
      role: "Senior Logistics Coordinator",
      company: "Apex Global Freight",
      dates: "2022 – Present",
      details:
        "• Directed daily dispatch and warehouse routing for over 60 commercial accounts, achieving 99.4% on-time delivery.\n• Automated weekly shipment reconciliation using Excel macros, saving 6 team hours per week.\n• Trained and mentored 8 junior warehouse technicians on inventory management software and safety protocols.",
    },
    {
      role: "Inventory & Dispatch Associate",
      company: "Midwest Supply Co.",
      dates: "2020 – 2022",
      details:
        "• Managed inbound stock verification, processing over 1,500 SKU updates monthly with 99.8% inventory accuracy.\n• Resolved vendor shipment discrepancies promptly, reducing order turnaround time by 18%.\n• Coordinated with customer support to proactively resolve fulfillment delays.",
    },
  ],
  education: [
    {
      school: "Illinois State University",
      qualification: "B.S. in Business Administration",
      dates: "2016 – 2020",
    },
  ],
  skills: [
    "Logistics & Dispatch",
    "Inventory Control",
    "Process Optimization",
    "Cross-Functional Leadership",
    "Vendor Relations",
    "Excel & Data Analysis",
    "Customer Care",
  ],
};

function openDraftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("appbeb-resumes", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readDraft() {
  return openDraftDatabase().then(
    (database) =>
      new Promise<Resume | undefined>((resolve, reject) => {
        const request = database
          .transaction("drafts", "readonly")
          .objectStore("drafts")
          .get("local-draft");
        request.onsuccess = () => resolve(request.result as Resume | undefined);
        request.onerror = () => reject(request.error);
      })
  );
}

function writeDraft(draft: Resume) {
  return openDraftDatabase().then((database) => {
    database
      .transaction("drafts", "readwrite")
      .objectStore("drafts")
      .put(draft);
  });
}

function removeDraft() {
  return openDraftDatabase().then((database) => {
    database
      .transaction("drafts", "readwrite")
      .objectStore("drafts")
      .delete("local-draft");
  });
}

export function ResumeBuilder() {
  const [resume, setResume] = useState<Resume>(emptyResume);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading local draft…");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingSummaryAi, setLoadingSummaryAi] = useState(false);
  const [polishingIndex, setPolishingIndex] = useState<number | null>(null);
  const { success, info, error: toastError } = useToast();

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => {
      if (!("indexedDB" in window)) {
        if (mounted) {
          setReady(true);
          setSaveStatus("Local saving is not supported in this browser");
        }
        return;
      }
      readDraft()
        .then((draft) => {
          if (mounted) {
            if (draft) {
              setResume(draft);
              setSaveStatus("Draft restored locally");
            } else {
              setSaveStatus("Autosaves in your browser");
            }
            setReady(true);
          }
        })
        .catch(() => {
          if (mounted) {
            setReady(true);
            setSaveStatus("Autosave unavailable — you can still print your CV");
          }
        });
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready || !("indexedDB" in window)) return;
    const timer = window.setTimeout(() => {
      writeDraft({ ...resume, updatedAt: new Date().toISOString() })
        .then(() => setSaveStatus("Autosaved in your browser"))
        .catch(() => setSaveStatus("Could not save locally"));
    }, 450);

    return () => window.clearTimeout(timer);
  }, [resume, ready]);

  function updatePersonal(field: keyof Resume["personal"], value: string) {
    setResume((current) => ({
      ...current,
      personal: { ...current.personal, [field]: value },
    }));
  }

  function updateExperience(index: number, field: keyof Resume["experience"][number], value: string) {
    setResume((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addExperience() {
    setResume((current) => ({
      ...current,
      experience: [...current.experience, { role: "", company: "", dates: "", details: "" }],
    }));
    success("Added a new experience block");
  }

  function removeExperience(index: number) {
    setResume((current) => ({
      ...current,
      experience: current.experience.filter((_, itemIndex) => itemIndex !== index),
    }));
    info("Experience entry removed");
  }

  function updateEducation(index: number, field: keyof Resume["education"][number], value: string) {
    setResume((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addEducation() {
    setResume((current) => ({
      ...current,
      education: [...current.education, { school: "", qualification: "", dates: "" }],
    }));
    success("Added an education block");
  }

  function removeEducation(index: number) {
    setResume((current) => ({
      ...current,
      education: current.education.filter((_, itemIndex) => itemIndex !== index),
    }));
    info("Education entry removed");
  }

  function loadSample() {
    setResume(sampleResume);
    success("Loaded complete sample CV! You can now edit and preview it.");
  }

  async function generateAiSummary() {
    const role = resume.experience[0]?.role || "Professional";
    const skills = resume.skills.length > 0 ? resume.skills.join(", ") : "operations, communication, attention to detail";

    setLoadingSummaryAi(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tool: "resume-summary",
          input: {
            first: role,
            second: skills,
          },
        }),
      });

      const body = (await response.json()) as { result?: string; error?: string };
      if (!response.ok || !body.result) {
        throw new Error(body.error || "Failed to generate summary.");
      }

      // Parse first option if structured or use entire output
      let finalSummary = body.result;
      if (body.result.includes("Option 1 (Impact & Results-Driven):\n")) {
        const option1 = body.result.split("Option 1 (Impact & Results-Driven):\n")[1]?.split("\n\nOption 2")[0]?.trim();
        if (option1) finalSummary = option1;
      }

      setResume((curr) => ({
        ...curr,
        personal: { ...curr.personal, summary: finalSummary },
      }));
      success("Generated high-impact professional summary with AI!");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not generate summary.");
    } finally {
      setLoadingSummaryAi(false);
    }
  }

  async function polishExperienceBullets(index: number) {
    const item = resume.experience[index];
    if (!item) return;

    const rawRole = item.role || "Team Member";
    const rawDetails = item.details || "Handled daily responsibilities and supported team tasks.";

    setPolishingIndex(index);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tool: "resume-bullet",
          input: {
            first: rawRole,
            second: rawDetails,
          },
        }),
      });

      const body = (await response.json()) as { result?: string; error?: string };
      if (!response.ok || !body.result) {
        throw new Error(body.error || "Failed to polish bullet points.");
      }

      setResume((curr) => ({
        ...curr,
        experience: curr.experience.map((exp, i) =>
          i === index ? { ...exp, details: body.result || exp.details } : exp
        ),
      }));
      success(`Polished Role ${index + 1} with action-oriented bullet points!`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not polish bullet points.");
    } finally {
      setPolishingIndex(null);
    }
  }

  function confirmDeleteDraft() {
    setResume(emptyResume);
    if ("indexedDB" in window) {
      removeDraft().catch(() => undefined);
    }
    setSaveStatus("Local draft cleared");
    setShowDeleteModal(false);
    info("CV draft reset to empty template.");
  }

  function copyAsPlainText() {
    const lines: string[] = [];
    if (resume.personal.name) lines.push(resume.personal.name.toUpperCase());
    const contacts = [resume.personal.email, resume.personal.phone, resume.personal.location]
      .filter(Boolean)
      .join(" | ");
    if (contacts) lines.push(contacts);
    if (resume.personal.summary) {
      lines.push("\nPROFILE\n" + resume.personal.summary);
    }
    if (resume.experience.some((e) => e.role || e.company)) {
      lines.push("\nEXPERIENCE");
      resume.experience.forEach((e) => {
        if (e.role || e.company) {
          lines.push(`• ${e.role} — ${e.company} (${e.dates})`);
          if (e.details) lines.push(`  ${e.details}`);
        }
      });
    }
    if (resume.education.some((ed) => ed.school || ed.qualification)) {
      lines.push("\nEDUCATION & TRAINING");
      resume.education.forEach((ed) => {
        if (ed.qualification || ed.school) {
          lines.push(`• ${ed.qualification} — ${ed.school} (${ed.dates})`);
        }
      });
    }
    if (resume.skills.length > 0) {
      lines.push("\nSKILLS\n" + resume.skills.join(", "));
    }

    const fullText = lines.join("\n");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(fullText)
        .then(() => success("Resume copied to clipboard as plain text!"))
        .catch(() => toastError("Could not copy automatically."));
    } else {
      success("Resume ready!");
    }
  }

  return (
    <section className="form-page">
      <div className="shell">
        <div className="breadcrumb">
          <Link href="/ai-tools">AI Tools</Link>
          <Icon name="chevron-right" size={13} />
          <span>Resume Builder</span>
        </div>

        {/* Mobile View Switcher */}
        <div className="mobile-view-switcher" role="tablist" aria-label="Resume view mode">
          <button
            type="button"
            className={`mobile-view-btn ${mobileTab === "editor" ? "is-active" : ""}`}
            onClick={() => setMobileTab("editor")}
            role="tab"
            aria-selected={mobileTab === "editor"}
          >
            <Icon name="edit" size={14} /> Edit Form
          </button>
          <button
            type="button"
            className={`mobile-view-btn ${mobileTab === "preview" ? "is-active" : ""}`}
            onClick={() => setMobileTab("preview")}
            role="tab"
            aria-selected={mobileTab === "preview"}
          >
            <Icon name="eye" size={14} /> Document Preview
          </button>
        </div>

        <div className={`form-layout ${mobileTab === "editor" ? "show-editor" : "show-preview"}`}>
          {/* Editor Column */}
          <div className="form-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
              <div className="eyebrow" style={{ margin: 0 }}>
                <Icon name="lock" size={12} /> Private & Offline-Ready
              </div>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={loadSample}
                style={{ fontSize: 12, padding: "5px 12px" }}
                title="Fill with complete sample CV to preview immediately"
              >
                <Icon name="sparkles" size={13} /> Load Sample CV
              </button>
            </div>

            <h1 style={{ marginTop: 10 }}>Build a Clean, Professional CV</h1>
            <p>
              Your experience matters, whether it comes from practical work, steady projects, or formal education. All changes autosave in your browser without requiring an account.
            </p>

            {/* Personal Details */}
            <div className="form-section" style={{ borderTop: 0, paddingTop: 0, marginTop: 0 }}>
              <h2>Personal Details</h2>
              <div className="field-grid">
                <div>
                  <label className="field-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    className="input-control"
                    value={resume.personal.name}
                    onChange={(event) => updatePersonal("name", event.target.value)}
                    placeholder="e.g. Alex Santos"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className="input-control"
                    type="email"
                    value={resume.personal.email}
                    onChange={(event) => updatePersonal("email", event.target.value)}
                    placeholder="alex@example.com"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    className="input-control"
                    value={resume.personal.phone}
                    onChange={(event) => updatePersonal("phone", event.target.value)}
                    placeholder="+1 555 123 4567"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="location">
                    City & Country
                  </label>
                  <input
                    id="location"
                    className="input-control"
                    value={resume.personal.location}
                    onChange={(event) => updatePersonal("location", event.target.value)}
                    placeholder="e.g. Manila, Philippines"
                  />
                </div>
                <div className="field-full">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="field-label" htmlFor="summary" style={{ margin: 0 }}>
                      Professional Summary
                    </label>
                    <button
                      type="button"
                      className="button button-outline button-small"
                      onClick={generateAiSummary}
                      disabled={loadingSummaryAi}
                      style={{ fontSize: 11, padding: "3px 10px" }}
                      title="Generate or polish your summary using AI"
                    >
                      {loadingSummaryAi ? (
                        <>
                          <Icon name="loader" size={12} className="spin" /> Generating…
                        </>
                      ) : (
                        <>
                          <Icon name="sparkles" size={12} /> AI Summary Assist
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    id="summary"
                    className="textarea-control"
                    value={resume.personal.summary}
                    onChange={(event) => updatePersonal("summary", event.target.value)}
                    placeholder="A brief overview of your background, reliable strengths, and what kind of position you are seeking…"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="form-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2>Work & Practical Experience</h2>
                <button
                  className="button button-outline button-small"
                  type="button"
                  onClick={addExperience}
                >
                  <Icon name="plus" size={13} /> Add Role
                </button>
              </div>

              {resume.experience.map((item, index) => (
                <div className="list-editor" key={`experience-${index}`}>
                  <div className="list-editor-top">
                    <span className="list-editor-title">Role {index + 1}</span>
                    {resume.experience.length > 1 && (
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => removeExperience(index)}
                        aria-label="Delete experience"
                        title="Remove role"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </div>
                  <div className="field-grid">
                    <div>
                      <label className="field-label" htmlFor={`role-${index}`}>
                        Job Title
                      </label>
                      <input
                        id={`role-${index}`}
                        className="input-control"
                        value={item.role}
                        onChange={(event) => updateExperience(index, "role", event.target.value)}
                        placeholder="e.g. Delivery Specialist, Support Lead"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`company-${index}`}>
                        Employer or Project
                      </label>
                      <input
                        id={`company-${index}`}
                        className="input-control"
                        value={item.company}
                        onChange={(event) => updateExperience(index, "company", event.target.value)}
                        placeholder="Company or client name"
                      />
                    </div>
                    <div className="field-full">
                      <label className="field-label" htmlFor={`dates-${index}`}>
                        Dates
                      </label>
                      <input
                        id={`dates-${index}`}
                        className="input-control"
                        value={item.dates}
                        onChange={(event) => updateExperience(index, "dates", event.target.value)}
                        placeholder="2023 – Present"
                      />
                    </div>
                    <div className="field-full">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label className="field-label" htmlFor={`details-${index}`} style={{ margin: 0 }}>
                          Responsibilities & Achievements
                        </label>
                        <button
                          type="button"
                          className="button button-outline button-small"
                          onClick={() => polishExperienceBullets(index)}
                          disabled={polishingIndex === index}
                          style={{ fontSize: 11, padding: "3px 10px" }}
                          title="Transform duties into high-impact accomplishment bullets"
                        >
                          {polishingIndex === index ? (
                            <>
                              <Icon name="loader" size={12} className="spin" /> Polishing…
                            </>
                          ) : (
                            <>
                              <Icon name="sparkles" size={12} /> AI Polish Bullets
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        id={`details-${index}`}
                        className="textarea-control"
                        value={item.details}
                        onChange={(event) => updateExperience(index, "details", event.target.value)}
                        placeholder="Describe daily tasks, tools used, and measurable results…"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="form-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2>Education & Certifications</h2>
                <button
                  className="button button-outline button-small"
                  type="button"
                  onClick={addEducation}
                >
                  <Icon name="plus" size={13} /> Add Education
                </button>
              </div>

              {resume.education.map((item, index) => (
                <div className="list-editor" key={`education-${index}`}>
                  <div className="list-editor-top">
                    <span className="list-editor-title">Entry {index + 1}</span>
                    {resume.education.length > 1 && (
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => removeEducation(index)}
                        aria-label="Delete education"
                        title="Remove education"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </div>
                  <div className="field-grid">
                    <div>
                      <label className="field-label" htmlFor={`school-${index}`}>
                        Institution or Provider
                      </label>
                      <input
                        id={`school-${index}`}
                        className="input-control"
                        value={item.school}
                        onChange={(event) => updateEducation(index, "school", event.target.value)}
                        placeholder="School, college, or training center"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`qualification-${index}`}>
                        Degree or Certificate
                      </label>
                      <input
                        id={`qualification-${index}`}
                        className="input-control"
                        value={item.qualification}
                        onChange={(event) => updateEducation(index, "qualification", event.target.value)}
                        placeholder="e.g. Diploma in Logistics, Safety Certificate"
                      />
                    </div>
                    <div className="field-full">
                      <label className="field-label" htmlFor={`education-dates-${index}`}>
                        Dates
                      </label>
                      <input
                        id={`education-dates-${index}`}
                        className="input-control"
                        value={item.dates}
                        onChange={(event) => updateEducation(index, "dates", event.target.value)}
                        placeholder="2020 – 2022"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="form-section">
              <h2>Key Skills</h2>
              <label className="field-label" htmlFor="skills">
                Separate skills with commas
              </label>
              <input
                id="skills"
                className="input-control"
                value={resume.skills.join(", ")}
                onChange={(event) =>
                  setResume((current) => ({
                    ...current,
                    skills: event.target.value
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Team leadership, Inventory, Customer service, Excel, Python…"
              />
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                className="button button-teal"
                type="button"
                onClick={() => window.print()}
              >
                <Icon name="download" size={15} /> Download / Print PDF
              </button>

              <button
                className="button button-outline button-small"
                type="button"
                onClick={copyAsPlainText}
              >
                <Icon name="copy" size={14} /> Copy as text
              </button>

              <button
                className="button button-outline button-small"
                type="button"
                onClick={() => setShowDeleteModal(true)}
              >
                <Icon name="trash" size={14} /> Reset draft
              </button>

              <span className="save-status-badge">
                <span className="save-status-dot" />
                {saveStatus}
              </span>
            </div>

            <div className="local-note">
              <Icon name="lock" size={14} />
              Draft data resides solely in your browser’s IndexedDB. Nothing is uploaded to external servers.
            </div>
          </div>

          {/* Live Document Preview Column */}
          <div className="preview-card">
            <div className="preview-toolbar">
              <strong>Live Document Preview</strong>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => window.print()}
              >
                <Icon name="download" size={13} /> Print PDF
              </button>
            </div>
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Draft */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Reset Resume Draft?"
        description="Are you sure you want to clear this draft? All entered fields will be reset to empty template."
        confirmLabel="Yes, Reset Draft"
        confirmVariant="danger"
        onConfirm={confirmDeleteDraft}
      />
    </section>
  );
}

function ResumePreview({ resume }: { resume: Resume }) {
  const hasContact = Boolean(
    resume.personal.email || resume.personal.phone || resume.personal.location
  );

  return (
    <div className="resume-preview">
      <h2>{resume.personal.name || "Alex Santos"}</h2>
      <div className="preview-contact">
        {hasContact
          ? [resume.personal.email, resume.personal.phone, resume.personal.location]
              .filter(Boolean)
              .join("  ·  ")
          : "alex@example.com  ·  +1 555 123 4567  ·  City, Country"}
      </div>

      {resume.personal.summary ? (
        <div className="preview-section">
          <h3>Professional Profile</h3>
          <p>{resume.personal.summary}</p>
        </div>
      ) : (
        <div className="preview-section">
          <h3>Professional Profile</h3>
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
            Add your summary in the editor or click AI Summary Assist to generate one…
          </p>
        </div>
      )}

      <div className="preview-section">
        <h3>Experience</h3>
        {resume.experience.some((item) => item.role || item.company || item.details) ? (
          resume.experience.map(
            (item, index) =>
              (item.role || item.company || item.details) && (
                <div key={index} style={{ marginBottom: 14 }}>
                  <h4>
                    {item.role || "Job Title"}
                    {item.company && ` · ${item.company}`}
                  </h4>
                  {item.dates && <small>{item.dates}</small>}
                  {item.details && (
                    <p style={{ whiteSpace: "pre-line", marginTop: 4 }}>{item.details}</p>
                  )}
                </div>
              )
          )
        ) : (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
            Add your roles and practical experience…
          </p>
        )}
      </div>

      <div className="preview-section">
        <h3>Education & Credentials</h3>
        {resume.education.some((item) => item.school || item.qualification) ? (
          resume.education.map(
            (item, index) =>
              (item.school || item.qualification) && (
                <div key={index} style={{ marginBottom: 10 }}>
                  <h4>
                    {item.qualification || "Qualification"}
                    {item.school && ` · ${item.school}`}
                  </h4>
                  {item.dates && <small>{item.dates}</small>}
                </div>
              )
          )
        ) : (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
            Add your education or certifications…
          </p>
        )}
      </div>

      <div className="preview-section">
        <h3>Core Skills</h3>
        {resume.skills.length > 0 ? (
          <p>{resume.skills.join("  ·  ")}</p>
        ) : (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
            Add your practical skills above…
          </p>
        )}
      </div>
    </div>
  );
}
