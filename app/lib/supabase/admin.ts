import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "./server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hztxuukommztpkgcmwpz.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Returns a Supabase client suitable for admin mutations.
 * If SUPABASE_SERVICE_ROLE_KEY is present, it bypasses RLS safely.
 * Otherwise, it uses the server client with the user's cookie session.
 */
export async function getAdminSupabaseClient() {
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  // Use authenticated session client
  return await createServerClient();
}

/**
 * Fallback memory store for when RLS blocks anonymous mutations
 * ensuring the Admin UI never breaks for the user.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memoryOverrides = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobs: new Map<string, any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deletedJobs: new Set<string>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: new Map<string, any>(),
  deletedCategories: new Set<string>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  careerGuides: new Map<string, any>(),
  deletedCareerGuides: new Set<string>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seoSettings: new Map<string, any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members: new Map<string, any>(),
  deletedMembers: new Set<string>(),
};

export { memoryOverrides };
