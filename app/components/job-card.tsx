"use client";

import Link from "next/link";
import { useSyncExternalStore, useCallback } from "react";
import { Icon } from "./ui-icon";
import type { Job } from "../lib/types";
import { formatDate } from "../lib/utils";
import { useToast } from "./ui-provider";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("appbeb-saved-jobs-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("appbeb-saved-jobs-change", callback);
  };
}

function getServerSnapshot() {
  return false;
}

export function JobCard({ job }: { job: Job }) {
  const { success, info } = useToast();

  const getSnapshot = useCallback(() => {
    try {
      const raw = localStorage.getItem("appbeb-saved-jobs");
      if (!raw) return false;
      const savedIds = JSON.parse(raw) as string[];
      return savedIds.includes(job.id);
    } catch {
      return false;
    }
  }, [job.id]);

  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem("appbeb-saved-jobs");
      let savedIds: string[] = raw ? JSON.parse(raw) : [];
      if (saved) {
        savedIds = savedIds.filter((id) => id !== job.id);
        info(`Removed "${job.title}" from saved jobs`);
      } else {
        savedIds.push(job.id);
        success(`Saved "${job.title}" to your bookmarks`);
      }
      localStorage.setItem("appbeb-saved-jobs", JSON.stringify(savedIds));
      window.dispatchEvent(new Event("appbeb-saved-jobs-change"));
    } catch {
      // Local storage unavailable
    }
  }

  return (
    <article className="job-card">
      <div>
        <div className="job-card-top">
          <div className="company-avatar" aria-hidden="true">
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="job-card-meta">
            <div className="job-company">
              <span>{job.company}</span>
              {job.isVerified ? (
                <span className="verified">
                  <Icon name="check" size={11} /> Verified Vacancy
                </span>
              ) : job.listingType === "career_portal_resource" ? (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--navy-muted)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--line)",
                    padding: "2px 8px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title="Direct link to employer recruitment portal"
                >
                  <Icon name="briefcase" size={11} /> Career Portal
                </span>
              ) : null}
            </div>
            <Link href={`/jobs/${job.slug}`} className="job-title">
              {job.title}
            </Link>
          </div>
          <button
            type="button"
            className={`job-save-btn ${saved ? "is-saved" : ""}`}
            onClick={toggleSave}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
            title={saved ? "Saved" : "Save this job"}
          >
            <Icon name="star" size={18} strokeWidth={saved ? 2.2 : 1.6} />
          </button>
        </div>

        <div className="job-details">
          <span>
            <Icon name="pin" size={14} />
            {job.location}
          </span>
          <span>
            <Icon name="briefcase" size={14} />
            {job.employmentType}
          </span>
          {job.salary && (
            <span style={{ color: "var(--teal)", fontWeight: 700 }}>
              <Icon name="sparkles" size={13} />
              {job.salary}
            </span>
          )}
          <span>
            <Icon name="clock" size={14} />
            {formatDate(job.publishedAt)}
          </span>
        </div>
      </div>

      <div className="job-card-bottom">
        <span
          className={
            job.isPreview ? "source-pill preview-pill" : "source-pill"
          }
        >
          {job.source}
        </span>
        <Link href={`/jobs/${job.slug}`} className="text-link">
          View role <Icon name="arrow-up-right" size={14} />
        </Link>
      </div>
    </article>
  );
}
