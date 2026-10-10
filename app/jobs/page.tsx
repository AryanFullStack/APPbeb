"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Icon } from "../components/ui-icon";
import { JobCard } from "../components/job-card";
import { EmptyState } from "../components/empty-state";
import { useToast } from "../components/ui-provider";
import { fallbackJobs, fallbackCategories } from "../lib/data";
import type { Job, Category } from "../lib/types";

const PAGE_SIZE = 8;

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(fallbackJobs);
  const [categoriesList, setCategoriesList] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("query") || params.get("q") || "";
    }
    return "";
  });
  const [location, setLocation] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("location") || params.get("l") || "";
    }
    return "";
  });
  const [category, setCategory] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("category") || params.get("c") || "";
    }
    return "";
  });
  const [mode, setMode] = useState<string>("");
  const [type, setType] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { info } = useToast();

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };
  const handleLocationChange = (val: string) => {
    setLocation(val);
    setCurrentPage(1);
  };
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setCurrentPage(1);
  };
  const handleModeChange = (val: string) => {
    setMode(val);
    setCurrentPage(1);
  };
  const handleTypeChange = (val: string) => {
    setType(val);
    setCurrentPage(1);
  };

  // Load live jobs and categories from API
  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategoriesList(data.categories);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    return jobs.filter((job) => {
      const text = `${job.title} ${job.company} ${job.category} ${job.skills.join(" ")}`.toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
      const matchesCategory =
        !category ||
        job.category.toLowerCase() === category.toLowerCase() ||
        job.category.toLowerCase().includes(category.toLowerCase());
      const matchesMode = !mode || job.workMode.toLowerCase().includes(mode.toLowerCase());
      const matchesType = !type || job.employmentType.toLowerCase().includes(type.toLowerCase());

      return matchesQuery && matchesLocation && matchesCategory && matchesMode && matchesType;
    });
  }, [jobs, query, location, category, mode, type]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, currentPage]);

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== "undefined") {
      const el = document.getElementById("jobs-results-stream");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  useEffect(() => {
    if (!query && !location && !category && !mode && !type) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "job_search", path: window.location.pathname }),
      }).catch(() => undefined);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [query, location, category, mode, type]);

  function handleClearFilters() {
    setQuery("");
    setLocation("");
    setCategory("");
    setMode("");
    setType("");
    setCurrentPage(1);
    info("All filters cleared");
  }

  const activeFilterCount = [query, location, category, mode, type].filter(Boolean).length;
  const startIdx = results.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIdx = Math.min(currentPage * PAGE_SIZE, results.length);

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevron-right" size={13} />
            <span>Find Jobs</span>
          </div>
          <h1>Find work that fits.</h1>
          <p>
            Filter verified vacancies by skills, location, and the work schedule that fits your daily routine.
          </p>
        </div>
      </section>

      <div className="shell jobs-layout">
        {/* Mobile Filter Toggle */}
        <button
          type="button"
          className="button button-outline mobile-filter-toggle"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-expanded={showMobileFilters}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="filter" size={15} />
            {showMobileFilters ? "Hide Filters" : "Filter Jobs"}
          </span>
          {activeFilterCount > 0 && (
            <span
              style={{
                background: "var(--teal)",
                color: "#fff",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Filter Panel */}
        <aside className={`filter-panel ${!showMobileFilters ? "is-collapsed" : ""}`}>
          <div className="filter-panel-header">
            <h2>Filter Jobs</h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="text-link"
                onClick={handleClearFilters}
                style={{ fontSize: 12 }}
              >
                Reset
              </button>
            )}
          </div>

          <div className="filter-group">
            <label htmlFor="job-query">Job Title or Keyword</label>
            <input
              id="job-query"
              className="input-control"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="e.g. driver, warehouse, cleaner"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="job-location">Location or Town</label>
            <input
              id="job-location"
              className="input-control"
              value={location}
              onChange={(event) => handleLocationChange(event.target.value)}
              placeholder="e.g. London, York, Epsom, Warrington"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="job-category">Industry / Category</label>
            <select
              id="job-category"
              className="select-control"
              value={category}
              onChange={(event) => handleCategoryChange(event.target.value)}
            >
              <option value="">All Categories</option>
              {categoriesList.map((item) => (
                <option key={item.id || item.slug} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="job-mode">Work Mode</label>
            <select
              id="job-mode"
              className="select-control"
              value={mode}
              onChange={(event) => handleModeChange(event.target.value)}
            >
              <option value="">Any Work Mode</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="job-type">Employment Type</label>
            <select
              id="job-type"
              className="select-control"
              value={type}
              onChange={(event) => handleTypeChange(event.target.value)}
            >
              <option value="">Any Employment Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <button
            className="button button-outline button-small"
            type="button"
            onClick={handleClearFilters}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Clear All Filters
          </button>
        </aside>

        {/* Results Stream */}
        <section aria-label="Job results">
          <div className="data-banner">
            <Icon name="check" size={17} />
            <div>
              <strong>Verified Live UK & International Vacancies</strong> Direct applications to official employer feeds including GXO Logistics, Medequip UK, GLS, and Ryder with zero recruitment fees.
            </div>
          </div>

          <div id="jobs-results-stream" className="jobs-results-head">
            <h2>{results.length} Roles Found</h2>
            <span>
              {results.length > 0
                ? `Showing ${startIdx}–${endIdx} of ${results.length} roles (Page ${currentPage} of ${totalPages})`
                : loading
                ? "Loading vacancies…"
                : "No matching roles"}
            </span>
          </div>

          <div className="jobs-list">
            {paginatedResults.length ? (
              paginatedResults.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <EmptyState
                icon="search"
                title="No roles match your current criteria"
                description="Try broadening your keyword or location, or reset all active filters to view all available positions."
                actionLabel="Show All Roles"
                onAction={handleClearFilters}
              />
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination" role="navigation" aria-label="Pagination">
              <button
                className="page-button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                title="Previous page"
              >
                <Icon name="chevron-left" size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`page-button ${currentPage === pageNum ? "active" : ""}`}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="page-button"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                title="Next page"
              >
                <Icon name="chevron-right" size={15} />
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
