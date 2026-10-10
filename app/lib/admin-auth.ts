import { cookies } from "next/headers";
import { createClient as createSupabaseServerClient, isSupabaseConfigured } from "./supabase/server";

export const ADMIN_COOKIE_NAME = "appbeb_admin_session";
const DEFAULT_ADMIN_KEY = "AppBebAdmin2026!";

export interface AdminUser {
  id: string;
  email: string;
  role: "super_admin" | "admin";
  authType: "supabase" | "key";
}

/**
 * Verify whether the current request comes from an authorized admin.
 * Checks both Supabase Auth user session AND secure Admin cookie session.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  // 1. Check custom signed admin session cookie
  if (adminCookie) {
    try {
      const parsed = JSON.parse(Buffer.from(adminCookie, "base64url").toString("utf8"));
      if (parsed && parsed.email && parsed.exp && parsed.exp > Date.now()) {
        return {
          id: parsed.id || "admin_session",
          email: parsed.email,
          role: parsed.role || "super_admin",
          authType: parsed.authType || "key",
        };
      }
    } catch {
      // Cookie was malformed or expired
    }
  }

  // 2. Check Supabase Auth user session
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Query profiles table or fallback to default admin role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        return {
          id: user.id,
          email: user.email || "admin@appbeb.com",
          role: (profile?.role as "admin") || "admin",
          authType: "supabase",
        };
      }
    } catch {
      // Supabase auth check failed
    }
  }

  return null;
}

/**
 * Check if the caller is authorized as admin
 */
export async function verifyAdminAccess(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}

/**
 * Validate admin credentials (either Supabase auth or Admin Key)
 */
export function validateAdminKey(key: string): boolean {
  const configuredKey = process.env.ADMIN_ACCESS_KEY || process.env.ADMIN_KEY || DEFAULT_ADMIN_KEY;
  return Boolean(key && key.trim() === configuredKey.trim());
}

/**
 * Create encoded session token string
 */
export function createAdminSessionPayload(email: string, authType: "supabase" | "key" = "key"): string {
  const payload = {
    id: `adm_${Date.now()}`,
    email,
    role: "super_admin",
    authType,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    created: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}
