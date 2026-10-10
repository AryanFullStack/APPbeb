import { NextResponse } from "next/server";
import { verifyAdminAccess } from "../../../lib/admin-auth";
import { getAdminSupabaseClient, memoryOverrides } from "../../../lib/supabase/admin";
import { supabase } from "../../../lib/data";

export async function GET() {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: dbGuides, error } = await supabase
      .from("career_guides")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let merged = (dbGuides || []).filter((g: any) => !memoryOverrides.deletedCareerGuides.has(g.id));

    merged = merged.map((g) => {
      if (memoryOverrides.careerGuides.has(g.id)) {
        return { ...g, ...memoryOverrides.careerGuides.get(g.id) };
      }
      return g;
    });

    memoryOverrides.careerGuides.forEach((val, key) => {
      if (!merged.some((g) => g.id === key) && !memoryOverrides.deletedCareerGuides.has(key)) {
        merged.unshift(val);
      }
    });

    return NextResponse.json({ guides: merged });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load guides";
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

    const slug =
      body.slug?.trim() ||
      body.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newGuide = {
      title: body.title,
      slug,
      excerpt: body.excerpt || "",
      body: body.body || { content: body.content || "" },
      status: body.status || "draft",
      published_at: body.status === "published" ? new Date().toISOString() : null,
    };

    const { data, error } = await adminSb
      .from("career_guides")
      .insert(newGuide)
      .select()
      .single();

    if (error) {
      const fakeId = `local-guide-${Date.now()}`;
      const record = { ...newGuide, id: fakeId, created_at: new Date().toISOString() };
      memoryOverrides.careerGuides.set(fakeId, record);
      return NextResponse.json({ guide: record });
    }

    return NextResponse.json({ guide: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create guide";
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
      return NextResponse.json({ error: "Guide ID required" }, { status: 400 });
    }

    if (updates.status === "published" && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const adminSb = await getAdminSupabaseClient();
    const { data, error } = await adminSb
      .from("career_guides")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const current = memoryOverrides.careerGuides.get(id) || {};
      const updated = { ...current, ...updates, id };
      memoryOverrides.careerGuides.set(id, updated);
      return NextResponse.json({ guide: updated });
    }

    return NextResponse.json({ guide: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update guide";
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
      return NextResponse.json({ error: "Guide ID required" }, { status: 400 });
    }

    const adminSb = await getAdminSupabaseClient();
    await adminSb.from("career_guides").delete().eq("id", id);

    memoryOverrides.deletedCareerGuides.add(id);
    memoryOverrides.careerGuides.delete(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete guide";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
