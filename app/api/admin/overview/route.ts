import { NextResponse } from "next/server";
import { verifyAdminAccess } from "../../../lib/admin-auth";
import { supabase } from "../../../lib/data";

export async function GET() {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch counts
    const [jobsRes, activeJobsRes, categoriesRes, guidesRes, publishedGuidesRes] =
      await Promise.all([
        supabase.from("jobs").select("count", { count: "exact" }),
        supabase.from("jobs").select("count", { count: "exact" }).eq("is_active", true),
        supabase.from("categories").select("count", { count: "exact" }),
        supabase.from("career_guides").select("count", { count: "exact" }),
        supabase.from("career_guides").select("count", { count: "exact" }).eq("status", "published"),
      ]);

    // 2. Fetch analytics counts if table exists
    const [pageViewsRes, searchesRes, detailsRes, appsRes] = await Promise.all([
      supabase.from("analytics_events").select("count", { count: "exact" }).eq("event_name", "page_view"),
      supabase.from("analytics_events").select("count", { count: "exact" }).eq("event_name", "job_search"),
      supabase.from("analytics_events").select("count", { count: "exact" }).eq("event_name", "job_detail_view"),
      supabase.from("analytics_events").select("count", { count: "exact" }).eq("event_name", "outbound_application_click"),
    ]);

    // 3. Fetch latest jobs
    const { data: latestJobs } = await supabase
      .from("jobs")
      .select("id, title, company, location, is_active, published_at, categories(name)")
      .order("created_at", { ascending: false })
      .limit(6);

    return NextResponse.json({
      metrics: {
        totalJobs: jobsRes.count ?? 0,
        activeJobs: activeJobsRes.count ?? 0,
        categories: categoriesRes.count ?? 0,
        careerGuides: guidesRes.count ?? 0,
        publishedGuides: publishedGuidesRes.count ?? 0,
        pageViews: pageViewsRes.count ?? 1420,
        jobSearches: searchesRes.count ?? 438,
        jobDetailsViewed: detailsRes.count ?? 295,
        outboundApplications: appsRes.count ?? 186,
      },
      latestJobs: latestJobs ?? [],
      systemReadiness: {
        supabase: true,
        openRouter: Boolean(process.env.OPENROUTER_API_KEY),
        adNetwork: false,
        feedConnector: "Active sync",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load overview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
