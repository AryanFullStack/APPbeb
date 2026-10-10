import { NextResponse } from "next/server";
import { verifyAdminAccess } from "../../../lib/admin-auth";
import { supabase } from "../../../lib/data";

export async function GET() {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // 1. Supabase ping & table audit
    const [jobsRes, catsRes, guidesRes, profilesRes, eventsRes] = await Promise.all([
      supabase.from("jobs").select("count", { count: "exact" }),
      supabase.from("categories").select("count", { count: "exact" }),
      supabase.from("career_guides").select("count", { count: "exact" }),
      supabase.from("profiles").select("count", { count: "exact" }),
      supabase.from("analytics_events").select("count", { count: "exact" }),
    ]);

    const dbLatencyMs = Date.now() - startTime;

    // 2. OpenRouter check
    const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);
    const openRouterModel = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

    // 3. Environment configuration audit
    const envAudit = [
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        maskedValue: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 18)}…`
          : "Not set",
        critical: true,
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        configured: Boolean(
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ),
        maskedValue: "sb_pub_••••••••",
        critical: true,
      },
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        maskedValue: process.env.SUPABASE_SERVICE_ROLE_KEY ? "ey••••••••" : "Optional (local in-memory active)",
        critical: false,
      },
      {
        name: "OPENROUTER_API_KEY",
        configured: hasOpenRouterKey,
        maskedValue: hasOpenRouterKey ? "sk-or-••••••••" : "Optional (Built-in AI active)",
        critical: false,
      },
      {
        name: "NEXT_PUBLIC_SITE_URL",
        configured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
        maskedValue: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        critical: true,
      },
    ];

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latencyMs: dbLatencyMs,
        tables: {
          jobs: jobsRes.count ?? 0,
          categories: catsRes.count ?? 0,
          career_guides: guidesRes.count ?? 0,
          profiles: profilesRes.count ?? 0,
          analytics_events: eventsRes.count ?? 0,
        },
      },
      aiGateway: {
        provider: "OpenRouter",
        configured: hasOpenRouterKey,
        model: openRouterModel,
        mode: hasOpenRouterKey ? "Production Cloud AI" : "Built-in Career Engine",
      },
      envAudit,
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.floor(process.uptime()),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Diagnostic check failed";
    return NextResponse.json(
      {
        status: "degraded",
        error: message,
        database: { connected: false, latencyMs: Date.now() - startTime },
      },
      { status: 500 }
    );
  }
}
