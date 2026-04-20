export type MessageType = "text" | "image" | "video" | "system";
export type FriendshipStatus = "pending" | "accepted" | "declined" | "blocked";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  responded_at: string | null;
  requester?: Profile;
  addressee?: Profile;
}

export interface Conversation {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string | null;
  created_at: string;
  other_user?: Profile;
  last_message?: Message | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  content: string | null;
  media_url: string | null;
  media_meta: { width?: number; height?: number; size?: number } | null;
  reply_to_id: string | null;
  reply_to?: Message | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  sender?: Profile;
  status?: "sending" | "sent" | "delivered" | "read";
}

export interface MessageRead {
  conversation_id: string;
  user_id: string;
  last_read_message_id: string;
  last_read_at: string;
}

export interface TypingEvent {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
}

export interface PresenceState {
  user_id: string;
  online_at: string;
}
