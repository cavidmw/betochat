import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "display_name" | "bio" | "avatar_url">>
): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) return null;
  return data as Profile;
}

export async function searchUsersByUsername(
  query: string,
  limit = 10
): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("search_users_by_username", {
    search_query: query.toLowerCase(),
    result_limit: limit,
  });

  if (error) return [];
  return data as Profile[];
}

export async function updateLastSeen(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", userId);
}
