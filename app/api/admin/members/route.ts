import { NextResponse } from "next/server";
import { getAdminSession, verifyAdminAccess } from "../../../lib/admin-auth";
import { memoryOverrides } from "../../../lib/supabase/admin";

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  status: "active" | "invited" | "suspended";
  created_at: string;
  last_active?: string;
  invite_token?: string;
  temporary_password?: string;
}

const defaultMembers: AdminMember[] = [
  {
    id: "mem-super-1",
    name: "System Super Admin",
    email: "admin@appbeb.com",
    role: "super_admin",
    status: "active",
    created_at: "2026-01-10T08:00:00Z",
    last_active: "Active now",
  },
  {
    id: "mem-ops-2",
    name: "Operations & Feeds Lead",
    email: "operations@appbeb.com",
    role: "admin",
    status: "active",
    created_at: "2026-02-01T10:30:00Z",
    last_active: "3 hours ago",
  },
];

export async function GET() {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getAdminSession();

  // Combine default members with memory additions
  let members = [...defaultMembers].filter((m) => !memoryOverrides.deletedMembers.has(m.id));

  // If the logged in user is different from default, make sure they are included
  if (session && !members.some((m) => m.email.toLowerCase() === session.email.toLowerCase())) {
    members.unshift({
      id: session.id,
      name: "Current Administrator",
      email: session.email,
      role: session.role === "super_admin" ? "super_admin" : "admin",
      status: "active",
      created_at: new Date().toISOString(),
      last_active: "Active now",
    });
  }

  // Apply memory overrides
  members = members.map((m) => {
    if (memoryOverrides.members.has(m.id)) {
      return { ...m, ...memoryOverrides.members.get(m.id) };
    }
    return m;
  });

  // Add newly invited memory members
  memoryOverrides.members.forEach((val, key) => {
    if (!members.some((m) => m.id === key) && !memoryOverrides.deletedMembers.has(key)) {
      members.push(val);
    }
  });

  return NextResponse.json({ members });
}

export async function POST(request: Request) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    const memberId = `mem-${Date.now()}`;
    const token = `inv_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `AppBeb-${randomPin}!`;

    const newMember: AdminMember = {
      id: memberId,
      name: name?.trim() || email.split("@")[0],
      email: email.trim().toLowerCase(),
      role: role || "admin",
      status: "invited",
      created_at: new Date().toISOString(),
      last_active: "Pending acceptance",
      invite_token: token,
      temporary_password: tempPassword,
    };

    memoryOverrides.members.set(memberId, newMember);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/admin/login?invite=${token}&email=${encodeURIComponent(newMember.email)}`;

    return NextResponse.json({
      success: true,
      member: newMember,
      inviteLink,
      temporaryPassword: tempPassword,
      message: `Invitation generated for ${newMember.email}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to invite admin member";
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
    const { id, role, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    const current = memoryOverrides.members.get(id) || defaultMembers.find((m) => m.id === id) || {};
    const updated = { ...current, id };

    if (role) updated.role = role;
    if (status) updated.status = status;

    memoryOverrides.members.set(id, updated);

    return NextResponse.json({ success: true, member: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update member";
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
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    memoryOverrides.deletedMembers.add(id);
    memoryOverrides.members.delete(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
