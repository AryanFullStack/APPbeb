import { NextResponse } from "next/server";
import { verifyAdminAccess } from "../../../lib/admin-auth";
import { getAdminSupabaseClient, memoryOverrides } from "../../../lib/supabase/admin";
import { supabase } from "../../../lib/data";

const DEFAULT_SEO = {
  siteTitle: "AppBeb — Find your next opportunity",
  siteDescription: "Simple job search and practical AI career tools for every kind of worker.",
  canonicalUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://appbeb.com",
  googleVerification: "",
  allowIndexing: true,
  sitemapEnabled: true,
  ogImage: "/og-image.png",
  twitterHandle: "@appbeb",
};

export async function GET() {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await supabase.from("seo_settings").select("*");

    const settingsMap: Record<string, unknown> = { ...DEFAULT_SEO };

    if (data && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.key && row.value) {
          settingsMap[row.key] = row.value;
        }
      });
    }

    // Apply memory overrides if any
    memoryOverrides.seoSettings.forEach((val, key) => {
      settingsMap[key] = val;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch {
    return NextResponse.json({ settings: DEFAULT_SEO });
  }
}

export async function POST(request: Request) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const adminSb = await getAdminSupabaseClient();

    // Persist key-values
    const updates = Object.entries(body);
    for (const [key, value] of updates) {
      memoryOverrides.seoSettings.set(key, value);
      try {
        await adminSb
          .from("seo_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() });
      } catch {
        // Fall back to memory override
      }
    }

    return NextResponse.json({ success: true, settings: body });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save SEO settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
