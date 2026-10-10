import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionPayload,
  getAdminSession,
  validateAdminKey,
} from "../../../lib/admin-auth";
import { createClient } from "../../../lib/supabase/server";
import { memoryOverrides } from "../../../lib/supabase/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, adminKey } = body;

    // LOGOUT ACTION
    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete(ADMIN_COOKIE_NAME);

      try {
        const supabase = await createClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore supabase signout error
      }

      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    // LOGIN ACTION
    // Method 1: Check admin security key directly
    if (adminKey && validateAdminKey(adminKey)) {
      const adminEmail = email?.trim() || "admin@appbeb.com";
      const token = createAdminSessionPayload(adminEmail, "key");
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return NextResponse.json({
        success: true,
        user: { email: adminEmail, role: "super_admin" },
      });
    }

    // Method 2: Check Supabase Auth or Invited Member Temporary Password
    if (email && password) {
      const cleanEmail = email.trim().toLowerCase();

      // Check invited member temporary password
      for (const [, member] of memoryOverrides.members) {
        if (
          member.email?.toLowerCase() === cleanEmail &&
          member.temporary_password &&
          member.temporary_password === password
        ) {
          member.status = "active";
          member.last_active = "Active now";
          const token = createAdminSessionPayload(cleanEmail, "key");
          const cookieStore = await cookies();
          cookieStore.set(ADMIN_COOKIE_NAME, token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          });
          return NextResponse.json({
            success: true,
            user: { email: cleanEmail, role: member.role || "admin" },
          });
        }
      }

      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!error && data?.user) {
          // Check if admin key or user profile is verified
          const token = createAdminSessionPayload(data.user.email || email.trim(), "supabase");
          const cookieStore = await cookies();
          cookieStore.set(ADMIN_COOKIE_NAME, token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          });

          return NextResponse.json({
            success: true,
            user: { email: data.user.email, role: "admin" },
          });
        }
      } catch {
        // Fall through to error
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials. Please verify your email, password, or admin security key." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
