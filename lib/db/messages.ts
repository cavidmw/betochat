import { createClient } from "@/lib/supabase/client";
import type { Message, MessageType } from "@/lib/types";

const PAGE_SIZE = 30;

export interface MessageSender {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface MessageWithSender extends Omit<Message, "sender"> {
  sender: MessageSender;
  reply_to?: Message | null;
}

export interface MessagesPage {
  messages: MessageWithSender[];
  nextCursor: string | null;
}

export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<MessagesPage> {
  const supabase = createClient();

  let query = supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url),
      reply_to:messages!messages_reply_to_id_fkey(id, content, type, sender_id)
    `
    )
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { messages: [], nextCursor: null };
  }

  const messages = data as MessageWithSender[];
  const nextCursor =
    messages.length === PAGE_SIZE
      ? messages[messages.length - 1].created_at
      : null;

  return { messages, nextCursor };
}

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  content?: string;
  type?: MessageType;
  mediaUrl?: string;
  mediaMeta?: { width?: number; height?: number; size?: number };
  replyToId?: string;
}): Promise<Message | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      content: params.content || null,
      type: params.type || "text",
      media_url: params.mediaUrl || null,
      media_meta: params.mediaMeta || null,
      reply_to_id: params.replyToId || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  return data as Message;
}

export async function markAsRead(
  conversationId: string,
  userId: string,
  messageId: string
): Promise<void> {
  const supabase = createClient();

  await supabase.from("message_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: userId,
      last_read_message_id: messageId,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "conversation_id,user_id",
    }
  );
}

export async function getMessageById(
  messageId: string
): Promise<MessageWithSender | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
    `
    )
    .eq("id", messageId)
    .single();

  if (error) return null;
  return data as MessageWithSender;
}
