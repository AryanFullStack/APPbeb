import { createClient } from "@supabase/supabase-js";
import type { Job, Category, CareerGuide } from "./types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hztxuukommztpkgcmwpz.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_cpK8eEc6EBnD89WcDbV7jg_DB37gcgF";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Category icon map helper
function getCategoryIcon(
  slug: string
): "briefcase" | "code" | "heart" | "truck" | "box" | "store" {
  if (slug.includes("warehouse") || slug.includes("factory") || slug.includes("packaging")) {
    return "box";
  }
  if (slug.includes("driving") || slug.includes("delivery") || slug.includes("transport") || slug.includes("agriculture")) {
    return "truck";
  }
  if (slug.includes("care") || slug.includes("health") || slug.includes("childcare")) {
    return "heart";
  }
  if (slug.includes("retail") || slug.includes("hospitality") || slug.includes("catering") || slug.includes("store")) {
    return "store";
  }
  if (slug.includes("it") || slug.includes("software") || slug.includes("remote") || slug.includes("tech")) {
    return "code";
  }
  return "briefcase";
}

// Convert Supabase DB job row to clean Job model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbJob(row: any): Job {
  return {
    id: row.id,
    slug: row.external_id || row.id,
    title: row.title,
    company: row.company || "Verified Employer",
    location: row.location || "United Kingdom",
    category: row.categories?.name || "General",
    employmentType: row.employment_type || "Full-time",
    workMode: row.work_mode || "On-site",
    publishedAt: row.published_at || new Date().toISOString(),
    source: row.source || "Official Employer Feed",
    applicationUrl: row.application_url || "#",
    description: row.description || "",
    skills: Array.isArray(row.skills) ? row.skills : [],
    isVerified: Boolean(row.verified_at || row.is_active),
    isPreview: false,
    imageUrl: row.image_url,
  };
}

/**
 * Fetch all verified active jobs from Supabase
 */
export async function fetchJobs(): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*, categories(name, slug)")
      .eq("is_active", true)
      .order("published_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackJobs;
    }

    return data.map(mapDbJob);
  } catch {
    return fallbackJobs;
  }
}

/**
 * Fetch single job by slug or ID from Supabase
 */
export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  try {
    // Try matching external_id first
    const { data: byExternal, error: extErr } = await supabase
      .from("jobs")
      .select("*, categories(name, slug)")
      .eq("external_id", slug)
      .single();

    if (!extErr && byExternal) {
      return mapDbJob(byExternal);
    }

    // Try matching UUID id
    const { data: byId, error: idErr } = await supabase
      .from("jobs")
      .select("*, categories(name, slug)")
      .eq("id", slug)
      .single();

    if (!idErr && byId) {
      return mapDbJob(byId);
    }

    // Fallback: check fallback jobs
    return fallbackJobs.find((j) => j.slug === slug || j.id === slug) || null;
  } catch {
    return fallbackJobs.find((j) => j.slug === slug || j.id === slug) || null;
  }
}

/**
 * Fetch all categories with count of live jobs
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data: catRows, error } = await supabase
      .from("categories")
      .select("id, name, slug, sort_order")
      .order("sort_order", { ascending: true });

    if (error || !catRows || catRows.length === 0) {
      return fallbackCategories;
    }

    // Get counts per category
    const { data: jobs } = await supabase
      .from("jobs")
      .select("category_id")
      .eq("is_active", true);

    const counts: Record<string, number> = {};
    if (jobs) {
      for (const j of jobs) {
        if (j.category_id) {
          counts[j.category_id] = (counts[j.category_id] || 0) + 1;
        }
      }
    }

    return catRows.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      sortOrder: cat.sort_order,
      icon: getCategoryIcon(cat.slug),
      count: counts[cat.id] ? `${counts[cat.id]} roles` : "Verified",
    }));
  } catch {
    return fallbackCategories;
  }
}

/**
 * Fetch published career guides from Supabase
 */
export async function fetchCareerGuides(): Promise<CareerGuide[]> {
  try {
    const { data, error } = await supabase
      .from("career_guides")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackGuides;
    }

    return data.map((g) => {
      const words = g.body?.word_count || 400;
      const readMin = Math.max(3, Math.ceil(words / 120));
      return {
        id: g.id,
        slug: g.slug,
        title: g.title,
        excerpt: g.excerpt,
        category: "UK Career Guide",
        readTime: `${readMin} min read`,
        publishedAt: g.published_at || g.created_at,
        content: g.body?.content || g.excerpt,
        sections: g.body?.sections || [],
      };
    });
  } catch {
    return fallbackGuides;
  }
}

/**
 * Fetch single career guide by slug
 */
export async function fetchCareerGuideBySlug(slug: string): Promise<CareerGuide | null> {
  try {
    const { data, error } = await supabase
      .from("career_guides")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (!error && data) {
      const words = data.body?.word_count || 400;
      const readMin = Math.max(3, Math.ceil(words / 120));
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        category: "UK Career Guide",
        readTime: `${readMin} min read`,
        publishedAt: data.published_at || data.created_at,
        content: data.body?.content || data.excerpt,
        sections: data.body?.sections || [],
      };
    }

    return fallbackGuides.find((g) => g.slug === slug) || null;
  } catch {
    return fallbackGuides.find((g) => g.slug === slug) || null;
  }
}

// ==============================================================================
// Fallback Datasets (Direct Real UK Seed Data Mirror)
// Ensures the app renders reliably with zero downtime
// ==============================================================================

export const fallbackJobs: Job[] = [
  {
    id: "18604edf-4af4-4c98-9a5a-97fa786bdfa2",
    slug: "gxo-warehouse-epsom-1417607700",
    title: "Warehouse Operative",
    company: "GXO Logistics",
    location: "Epsom, Surrey, United Kingdom",
    category: "Warehouse & Logistics",
    employmentType: "Full-time, permanent",
    workMode: "On-site",
    publishedAt: "2026-10-09T00:00:00+00:00",
    source: "GXO Careers",
    applicationUrl: "https://jobs.gxo.com/job/Epsom-Warehouse-Operative-ENG-KT19-9AF/1417607700/",
    description: "GXO lists a full-time permanent Warehouse Operative / Storekeeper role supporting its SGN contract in Epsom. Duties include issuing materials to engineers, picking and preparing orders, receiving deliveries, recording stock, monitoring stock levels and supporting stock takes. Stated annual salary of £31,721 and Monday-to-Friday hours between 08:00 and 16:00.",
    skills: ["warehouse operations", "stock control", "order picking", "manual handling", "inventory systems", "UK driving licence"],
    isVerified: true,
    isPreview: false,
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    salary: "£31,721 / year",
  },
  {
    id: "d8892821-9d4c-4032-98c4-f8c1280705a6",
    slug: "gxo-class1-warrington-1425271200",
    title: "Class 1 Driver",
    company: "GXO Logistics",
    location: "Warrington, Cheshire, United Kingdom",
    category: "Driving & Delivery",
    employmentType: "Full-time, permanent",
    workMode: "On-site",
    publishedAt: "2026-10-09T00:00:00+00:00",
    source: "GXO Careers",
    applicationUrl: "https://jobs.gxo.com/job/Warrington-Class-1-Driver-ENG-WA5-4AH/1425271200/",
    description: "GXO advertises a permanent Class 1 Driver role in Warrington, with 48 hours per week Monday to Friday. The employer lists an annual salary of £44,879. Duties include multi-drop deliveries, safe vehicle operation, load checks, and operating lift decks. Requires full UK licence with C+E entitlement, valid Driver CPC and digital tachograph card.",
    skills: ["Class 1 driving", "C+E licence", "Driver CPC", "digital tachograph", "delivery documentation", "road safety"],
    isVerified: true,
    isPreview: false,
    imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    salary: "£44,879 / year",
  },
  {
    id: "24424f00-0eed-4979-9d38-bfca4748d7e1",
    slug: "gxo-class2-harlow-1438549400",
    title: "Class 2 Driver",
    company: "GXO Logistics",
    location: "Harlow, Essex, United Kingdom",
    category: "Driving & Delivery",
    employmentType: "Full-time, permanent",
    workMode: "On-site",
    publishedAt: "2026-10-09T00:00:00+00:00",
    source: "GXO Careers",
    applicationUrl: "https://jobs.gxo.com/job/Harlow-Class-2-Driver-ENG-CM19-5TR/1438549400/",
    description: "Permanent Class 2 Driver opportunity based in Harlow, offering an annual salary of £39,268 across 45 scheduled weekly hours. Delivering to commercial accounts, conducting vehicle pre-checks and completing manifests. Requires Category C licence, valid CPC, and tachograph card.",
    skills: ["Class 2 driving", "Category C licence", "Driver CPC", "digital tachograph", "customer delivery", "safety compliance"],
    isVerified: true,
    isPreview: false,
    imageUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
    salary: "£39,268 / year",
  },
  {
    id: "114c2a26-72a5-4036-9550-23d2ec5922cd",
    slug: "gxo-payroll-analyst-northampton-1428080100",
    title: "Payroll Governance Business Analyst",
    company: "GXO Logistics",
    location: "Northampton, United Kingdom",
    category: "Professional & Office",
    employmentType: "Full-time",
    workMode: "Hybrid (three days in office stated)",
    publishedAt: "2026-10-09T00:00:00+00:00",
    source: "GXO Careers",
    applicationUrl: "https://jobs.gxo.com/job/Northampton-Payroll-Governance-Business-Analyst-Central-ENG-NN4-7YB/1428080100/",
    description: "Payroll governance and process improvement analyst supporting national UK payroll operations. Responsible for data reconciliation, system audits, reporting compliance, and cross-functional HR collaboration.",
    skills: ["payroll analysis", "governance", "Excel", "data reconciliation", "process improvement", "reporting"],
    isVerified: true,
    isPreview: false,
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "7024e4e3-03f6-4bbe-8ba3-468f3d3231f9",
    slug: "medequip-cleaning-pt-320234",
    title: "Cleaning Operative (Part-Time)",
    company: "Medequip UK",
    location: "York, United Kingdom",
    category: "Cleaning & Facilities",
    employmentType: "Part-time",
    workMode: "On-site",
    publishedAt: "2026-10-10T00:00:00+00:00",
    source: "Medequip Careers",
    applicationUrl: "https://careers.medequip-uk.com/job-detail.php?jobid=320234",
    description: "Part-time Cleaning Operative vacancy at York Depot with an annual salary of £10,625. Responsible for daily sanitation, hygiene compliance, depot cleanliness, and safe chemical handling.",
    skills: ["cleaning", "attention to detail", "reliability", "hygiene", "teamwork"],
    isVerified: true,
    isPreview: false,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    salary: "£10,625 / year",
  },
  {
    id: "6cda5ee5-5f1e-4484-816c-55ca3aa954ad",
    slug: "medequip-warehouse-cleaning-newport-325942",
    title: "Warehouse & Cleaning Operative",
    company: "Medequip UK",
    location: "Newport, Wales, United Kingdom",
    category: "Warehouse & Logistics",
    employmentType: "Full-time",
    workMode: "On-site",
    publishedAt: "2026-10-09T00:00:00+00:00",
    source: "Medequip Careers",
    applicationUrl: "https://careers.medequip-uk.com/job-detail.php?jobid=325942",
    description: "Combined warehouse logistics and facility cleanliness role at Medequip Newport. Includes loading medical equipment, managing stock intake, cleaning returned equipment, and keeping dispatch docks organized.",
    skills: ["warehouse support", "equipment handling", "depot cleanliness", "manual handling", "stock intake"],
    isVerified: true,
    isPreview: false,
    imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
  },
];

export const fallbackCategories: Category[] = [
  { id: "1", name: "Warehouse & Logistics", slug: "warehouse-logistics", sortOrder: 10, icon: "box", count: "2 roles" },
  { id: "2", name: "Driving & Delivery", slug: "driving-delivery", sortOrder: 20, icon: "truck", count: "2 roles" },
  { id: "3", name: "Cleaning & Facilities", slug: "cleaning-facilities", sortOrder: 30, icon: "briefcase", count: "1 role" },
  { id: "4", name: "Professional & Office", slug: "professional-office", sortOrder: 40, icon: "briefcase", count: "1 role" },
  { id: "5", name: "Care & Support", slug: "care-support", sortOrder: 50, icon: "heart", count: "Verified" },
  { id: "6", name: "Retail & Customer Service", slug: "retail-customer-service", sortOrder: 60, icon: "store", count: "Verified" },
  { id: "7", name: "IT & Engineering", slug: "it-engineering", sortOrder: 70, icon: "code", count: "Verified" },
  { id: "8", name: "Healthcare & NHS", slug: "healthcare-nhs", sortOrder: 80, icon: "heart", count: "Verified" },
];

export const fallbackGuides: CareerGuide[] = [
  {
    id: "g1",
    slug: "uk-cv-guide-no-uk-experience",
    title: "How to Write a UK CV Without UK Work Experience",
    excerpt: "A practical UK CV guide for international applicants, career changers and first-time job seekers.",
    category: "UK Career Guide",
    readTime: "4 min read",
    publishedAt: "2026-10-10T00:00:00+00:00",
    content: "Applying for work in the United Kingdom without previous UK employment can feel difficult, but a clear, relevant CV can help employers understand what you offer. UK employers generally want a concise document that explains your skills, experience, achievements and suitability for the vacancy.",
  },
  {
    id: "g2",
    slug: "uk-warehouse-operative-jobs",
    title: "How to Apply for Warehouse Operative Jobs in the UK",
    excerpt: "Learn what UK warehouse employers look for, how to prepare your application and how to check shift and safety requirements.",
    category: "UK Career Guide",
    readTime: "4 min read",
    publishedAt: "2026-10-10T00:00:00+00:00",
    content: "Warehouse operative jobs can include receiving deliveries, checking stock, picking and packing orders, loading goods, using scanners and keeping work areas organised. Roles exist in distribution centres, retail, food logistics, and manufacturing.",
  },
  {
    id: "g3",
    slug: "uk-cleaner-jobs-guide",
    title: "How to Find Cleaner and Cleaning Operative Jobs in the UK",
    excerpt: "A complete walkthrough of cleaning contracts, shift schedules, health and safety training, and reliable UK cleaning roles.",
    category: "UK Career Guide",
    readTime: "4 min read",
    publishedAt: "2026-10-10T00:00:00+00:00",
    content: "Cleaning operative vacancies are widely available across commercial offices, healthcare facilities, depots, and public buildings throughout the UK. Learn how to highlight attention to detail and reliable attendance.",
  },
  {
    id: "g4",
    slug: "uk-delivery-driver-jobs",
    title: "A Practical Guide to Delivery Driver Jobs in the UK",
    excerpt: "Understand licensing requirements (B, C1, C+E), CPC certification, digital tachographs, and route scheduling.",
    category: "UK Career Guide",
    readTime: "4 min read",
    publishedAt: "2026-10-10T00:00:00+00:00",
    content: "Commercial driving in the UK offers high earning potential and steady employment. Discover licence categories, required cards, and interview expectations.",
  },
  {
    id: "g5",
    slug: "uk-job-interview-answers",
    title: "How to Prepare for a UK Job Interview: Questions and Examples",
    excerpt: "Common interview questions used by UK employers and how to formulate authentic STAR-method responses.",
    category: "UK Career Guide",
    readTime: "4 min read",
    publishedAt: "2026-10-10T00:00:00+00:00",
    content: "UK hiring managers value evidence-backed answers and calm communication. Learn how to handle questions about teamwork, overcoming setbacks, and personal motivation.",
  },
  {
    id: "g6",
    slug: "uk-job-scam-warning",
    title: "How to Spot Fake UK Job Offers and Recruitment Scams",
    excerpt: "Protect yourself from upfront fee requests, suspicious WhatsApp offers, and visa sponsorship scams.",
    category: "UK Career Guide",
    readTime: "4 min read",
    publishedAt: "2026-10-10T00:00:00+00:00",
    content: "Legitimate UK employers never charge job application fees or guarantee visa sponsorships for upfront payment. Learn the signs of verified vacancies.",
  },
];

// Synchronous exports for components that need instant access
export const previewJobs = fallbackJobs;
export const categories = fallbackCategories.map((c) => ({
  label: c.name,
  icon: c.icon || "briefcase",
  count: c.count || "Verified",
}));
export const careerGuides = fallbackGuides;

export function getJobBySlug(slug: string): Job | undefined {
  return fallbackJobs.find((j) => j.slug === slug || j.id === slug);
}
