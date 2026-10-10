import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionPayload,
  getAdminSession,
  validateAdminKey,
} from "../../../lib/admin-auth";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/server";
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

    // LOGIN ACTION - STRICT RESTRICTIONS ENFORCED:
    // Only recorded administrators verified in the database are allowed to log in.

    // 1. Check Credentials (Email & Password)
    if (email && password) {
      const cleanEmail = email.trim().toLowerCase();

      // Check database via Supabase Auth + mandatory 'profiles' table verification
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && data?.user) {
            // DATABASE RECORD VERIFICATION:
            // Query profiles table to ensure user exists and is recorded with admin role
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("id, role")
              .eq("id", data.user.id)
              .maybeSingle();

            if (!profileError && profile && profile.role === "admin") {
              const token = createAdminSessionPayload(data.user.email || cleanEmail, "supabase");
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
            } else {
              // User exists in auth but has no administrator record in database
              await supabase.auth.signOut();
              return NextResponse.json(
                {
                  success: false,
                  error: "Access denied: Account is not recorded as an administrator in the database.",
                },
                { status: 403 }
              );
            }
          }
        } catch {
          // Continue to fallback check for recorded team members
        }
      }

      // Check recorded invited / internal admin members
      for (const [, member] of memoryOverrides.members) {
        if (
          member.email?.toLowerCase() === cleanEmail &&
          member.status !== "suspended" &&
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
    }

    // 2. Emergency Server Access Key (Only allowed if explicitly configured in server environment AND for recorded admins)
    if (adminKey && validateAdminKey(adminKey)) {
      const cleanEmail = email?.trim().toLowerCase();
      const isRecordedAdmin =
        cleanEmail &&
        (cleanEmail === "admin@appbeb.com" ||
          cleanEmail === "operations@appbeb.com" ||
          Array.from(memoryOverrides.members.values()).some(
            (m) => m.email?.toLowerCase() === cleanEmail && m.status !== "suspended"
          ));

      if (isRecordedAdmin) {
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
          user: { email: cleanEmail, role: "super_admin" },
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Access restricted: Operator email must match a recorded administrator in the database.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Access restricted: Invalid credentials or user not recorded in the database.",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
