"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { ConversationWithDetails } from "@/lib/db/conversations";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const onlineUsers = useAppStore((s) => s.onlineUsers);

  return (
    <div className="divide-y divide-border/50">
      {conversations.map((conv) => {
        const isOnline = onlineUsers.has(conv.other_user.id);
        const lastMessagePreview = conv.last_message
          ? conv.last_message.type === "image"
            ? "📷 Fotoğraf"
            : truncate(conv.last_message.content || "", 40)
          : "Henüz mesaj yok";

        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-mute active:bg-surface"
          >
            <Avatar
              src={conv.other_user.avatar_url}
              alt={conv.other_user.display_name}
              size="lg"
              online={isOnline}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-text">
                  {conv.other_user.display_name}
                </span>
                {conv.last_message && (
                  <span className="shrink-0 text-xxs text-text-faint">
                    {formatRelativeTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm text-text-mute">
                  {lastMessagePreview}
                </p>
                {conv.unread_count > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-xxs font-medium text-bg">
                    {conv.unread_count > 99 ? "99+" : conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
