import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message, Profile } from "@/lib/types";

export interface ConversationWithDetails extends Conversation {
  other_user: Profile;
  last_message: Message | null;
  unread_count: number;
}

export async function getConversations(
  userId: string
): Promise<ConversationWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      user_a_profile:profiles!conversations_user_a_fkey(*),
      user_b_profile:profiles!conversations_user_b_fkey(*),
      messages(
        id,
        content,
        type,
        created_at,
        sender_id
      )
    `
    )
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error || !data) return [];

  // Get read receipts
  const { data: reads } = await supabase
    .from("message_reads")
    .select("conversation_id, last_read_message_id")
    .eq("user_id", userId);

  const readMap = new Map(
    reads?.map((r) => [r.conversation_id, r.last_read_message_id]) || []
  );

  return data.map((conv) => {
    const otherUser =
      conv.user_a === userId ? conv.user_b_profile : conv.user_a_profile;

    // Get last message (messages are ordered by created_at desc by default)
    const messages = conv.messages || [];
    const lastMessage = messages.length > 0 ? messages[0] : null;

    // Calculate unread count
    const lastReadId = readMap.get(conv.id);
    let unreadCount = 0;
    if (lastReadId) {
      for (const msg of messages) {
        if (msg.id === lastReadId) break;
        if (msg.sender_id !== userId) unreadCount++;
      }
    } else {
      unreadCount = messages.filter((m: { sender_id: string }) => m.sender_id !== userId).length;
    }

    return {
      ...conv,
      other_user: otherUser,
      last_message: lastMessage,
      unread_count: unreadCount,
    };
  }) as ConversationWithDetails[];
}

export async function getOrCreateConversation(
  otherUserId: string
): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    other_user_id: otherUserId,
  });

  if (error) {
    console.error("Error creating conversation:", error);
    return null;
  }

  return data as string;
}

export async function getConversation(
  conversationId: string,
  userId: string
): Promise<ConversationWithDetails | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      user_a_profile:profiles!conversations_user_a_fkey(*),
      user_b_profile:profiles!conversations_user_b_fkey(*)
    `
    )
    .eq("id", conversationId)
    .single();

  if (error || !data) return null;

  const otherUser =
    data.user_a === userId ? data.user_b_profile : data.user_a_profile;

  return {
    ...data,
    other_user: otherUser,
    last_message: null,
    unread_count: 0,
  } as ConversationWithDetails;
}
