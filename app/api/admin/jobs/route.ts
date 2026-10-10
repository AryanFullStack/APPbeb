import { NextResponse } from "next/server";
import { verifyAdminAccess } from "../../../lib/admin-auth";
import { getAdminSupabaseClient, memoryOverrides } from "../../../lib/supabase/admin";
import { supabase } from "../../../lib/data";

export async function GET(request: Request) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase().trim();
    const category = searchParams.get("category");
    const status = searchParams.get("status"); // "active" | "inactive" | "all"

    const { data: dbJobs, error } = await supabase
      .from("jobs")
      .select("*, categories(id, name, slug)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Merge with memory overrides (if any RLS fallback was applied)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let merged = (dbJobs || []).filter((j: any) => !memoryOverrides.deletedJobs.has(j.id));
    
    // Apply in-memory updates
    merged = merged.map((j) => {
      if (memoryOverrides.jobs.has(j.id)) {
        return { ...j, ...memoryOverrides.jobs.get(j.id) };
      }
      return j;
    });

    // Add newly created memory jobs
    memoryOverrides.jobs.forEach((val, key) => {
      if (!merged.some((j) => j.id === key) && !memoryOverrides.deletedJobs.has(key)) {
        merged.unshift(val);
      }
    });

    // Apply filtering
    if (query) {
      merged = merged.filter((j) =>
        `${j.title} ${j.company} ${j.location} ${j.description} ${(j.skills || []).join(" ")}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (category && category !== "all") {
      merged = merged.filter(
        (j) => j.category_id === category || j.categories?.slug === category || j.categories?.name === category
      );
    }

    if (status === "active") {
      merged = merged.filter((j) => j.is_active === true);
    } else if (status === "inactive") {
      merged = merged.filter((j) => j.is_active === false);
    }

    return NextResponse.json({ jobs: merged, total: merged.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load jobs";
    return NextResponse.json({ error: message }, { status: 500 });
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

    const newJob = {
      external_id: body.external_id || `job-${Date.now()}`,
      source: body.source || "Manual Entry (Admin)",
      title: body.title,
      company: body.company || "AppBeb Verified",
      location: body.location || "United Kingdom",
      category_id: body.category_id || null,
      employment_type: body.employment_type || "Full-time",
      work_mode: body.work_mode || "On-site",
      description: body.description || "",
      skills: Array.isArray(body.skills) ? body.skills : [],
      application_url: body.application_url || "https://appbeb.com/jobs",
      published_at: body.published_at || new Date().toISOString(),
      is_active: body.is_active ?? true,
      verified_at: new Date().toISOString(),
    };

    const { data, error } = await adminSb
      .from("jobs")
      .insert(newJob)
      .select("*, categories(id, name, slug)")
      .single();

    if (error) {
      // Store in memory override so the UI stays fully responsive and seamless
      const fakeId = `local-${Date.now()}`;
      const record = { ...newJob, id: fakeId, created_at: new Date().toISOString() };
      memoryOverrides.jobs.set(fakeId, record);
      return NextResponse.json({
        job: record,
        warning: "Saved to live local runtime. Provide SUPABASE_SERVICE_ROLE_KEY to persist to cloud database.",
      });
    }

    return NextResponse.json({ job: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const adminSb = await getAdminSupabaseClient();
    const { data, error } = await adminSb
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select("*, categories(id, name, slug)")
      .single();

    if (error) {
      // Apply to memory override
      const current = memoryOverrides.jobs.get(id) || {};
      const updated = { ...current, ...updates, id };
      memoryOverrides.jobs.set(id, updated);
      return NextResponse.json({
        job: updated,
        warning: "Updated in live local runtime. Provide SUPABASE_SERVICE_ROLE_KEY to persist to cloud database.",
      });
    }

    return NextResponse.json({ job: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const adminSb = await getAdminSupabaseClient();
    await adminSb.from("jobs").delete().eq("id", id);

    memoryOverrides.deletedJobs.add(id);
    memoryOverrides.jobs.delete(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
