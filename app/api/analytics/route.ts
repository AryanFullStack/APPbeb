import { NextResponse } from "next/server";

const acceptedEvents = new Set(["page_view", "job_search", "job_detail_view", "outbound_application_click"]);

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return new NextResponse(null, { status: 204 }); }
  if (!body || typeof body !== "object") return new NextResponse(null, { status: 204 });
  const input = body as { event?: unknown; path?: unknown; jobId?: unknown };
  if (typeof input.event !== "string" || !acceptedEvents.has(input.event)) return new NextResponse(null, { status: 204 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) { await fetch(`${url}/rest/v1/analytics_events`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ event_name: input.event, path: typeof input.path === "string" ? input.path.slice(0, 300) : null, job_id: typeof input.jobId === "string" ? input.jobId.slice(0, 120) : null }) }).catch(() => undefined); }
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
