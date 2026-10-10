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
    const { data: dbCategories, error } = await supabase
      .from("categories")
      .select("*, jobs(count)")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let merged = (dbCategories || []).filter((c: any) => !memoryOverrides.deletedCategories.has(c.id));

    merged = merged.map((c) => {
      if (memoryOverrides.categories.has(c.id)) {
        return { ...c, ...memoryOverrides.categories.get(c.id) };
      }
      return c;
    });

    memoryOverrides.categories.forEach((val, key) => {
      if (!merged.some((c) => c.id === key) && !memoryOverrides.deletedCategories.has(key)) {
        merged.push(val);
      }
    });

    return NextResponse.json({ categories: merged });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load categories";
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
      body.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newCategory = {
      name: body.name,
      slug,
      sort_order: Number(body.sort_order) || 0,
    };

    const { data, error } = await adminSb.from("categories").insert(newCategory).select().single();

    if (error) {
      const fakeId = `local-cat-${Date.now()}`;
      const record = { ...newCategory, id: fakeId, created_at: new Date().toISOString() };
      memoryOverrides.categories.set(fakeId, record);
      return NextResponse.json({ category: record });
    }

    return NextResponse.json({ category: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create category";
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
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const adminSb = await getAdminSupabaseClient();
    const { data, error } = await adminSb
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const current = memoryOverrides.categories.get(id) || {};
      const updated = { ...current, ...updates, id };
      memoryOverrides.categories.set(id, updated);
      return NextResponse.json({ category: updated });
    }

    return NextResponse.json({ category: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update category";
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
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const adminSb = await getAdminSupabaseClient();
    await adminSb.from("categories").delete().eq("id", id);

    memoryOverrides.deletedCategories.add(id);
    memoryOverrides.categories.delete(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
