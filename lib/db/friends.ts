import { createClient } from "@/lib/supabase/client";
import type { Friendship, Profile } from "@/lib/types";

export interface FriendWithProfile extends Friendship {
  friend: Profile;
}

export async function getFriends(userId: string): Promise<FriendWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      *,
      requester:profiles!friendships_requester_id_fkey(*),
      addressee:profiles!friendships_addressee_id_fkey(*)
    `
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (error || !data) return [];

  return data.map((f) => ({
    ...f,
    friend: f.requester_id === userId ? f.addressee : f.requester,
  })) as FriendWithProfile[];
}

export async function getPendingRequests(
  userId: string
): Promise<FriendWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      *,
      requester:profiles!friendships_requester_id_fkey(*)
    `
    )
    .eq("addressee_id", userId)
    .eq("status", "pending");

  if (error || !data) return [];

  return data.map((f) => ({
    ...f,
    friend: f.requester,
  })) as FriendWithProfile[];
}

export async function getSentRequests(
  userId: string
): Promise<FriendWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      *,
      addressee:profiles!friendships_addressee_id_fkey(*)
    `
    )
    .eq("requester_id", userId)
    .eq("status", "pending");

  if (error || !data) return [];

  return data.map((f) => ({
    ...f,
    friend: f.addressee,
  })) as FriendWithProfile[];
}

export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`
    )
    .single();

  if (existing) {
    if (existing.status === "accepted") {
      return { success: false, error: "Zaten arkadaşsınız" };
    }
    if (existing.status === "pending") {
      return { success: false, error: "İstek zaten gönderilmiş" };
    }
    if (existing.status === "blocked") {
      return { success: false, error: "Bu kullanıcıyla iletişim kurulamıyor" };
    }
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: "pending",
  });

  if (error) {
    return { success: false, error: "İstek gönderilemedi" };
  }

  return { success: true };
}

export async function respondToFriendRequest(
  friendshipId: string,
  accept: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("friendships")
    .update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", friendshipId);

  if (error) {
    return { success: false, error: "İşlem başarısız" };
  }

  return { success: true };
}

export async function removeFriend(
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    return { success: false, error: "Arkadaş kaldırılamadı" };
  }

  return { success: true };
}
