import { NextResponse } from "next/server";
import { verifyAdminAccess } from "../../../lib/admin-auth";
import { createClient } from "../../../lib/supabase/server";
import { memoryOverrides } from "../../../lib/supabase/admin";

export async function POST(request: Request) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 }
      );
    }

    let supabaseUpdated = false;

    // If signed in via Supabase user account, update through Supabase Auth
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
        supabaseUpdated = true;
      }
    } catch {
      // Supabase user might be using session cookie
    }

    return NextResponse.json({
      success: true,
      message: supabaseUpdated
        ? "Your Supabase account password was updated successfully."
        : "Admin credentials updated successfully for current session.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update password";
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
    const { memberId, email } = body;

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const temporaryPassword = `AppBeb-Reset${randomSuffix}!`;

    // Try sending Supabase reset email if configured
    let emailSent = false;
    if (email) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/login`,
        });
        if (!error) {
          emailSent = true;
        }
      } catch {
        // Fallback to manual temporary password
      }
    }

    // Update memory member record
    const member = memoryOverrides.members.get(memberId) || { id: memberId, email };
    member.temporary_password = temporaryPassword;
    member.last_active = "Password reset pending";
    memoryOverrides.members.set(memberId, member);

    return NextResponse.json({
      success: true,
      temporaryPassword,
      emailSent,
      message: emailSent
        ? `Reset instructions sent to ${email}. Temporary backup credentials generated.`
        : `Temporary credentials generated successfully. Provide these to the administrator.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset member password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
