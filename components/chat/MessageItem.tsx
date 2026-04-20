"use client";

import Image from "next/image";
import { Reply } from "lucide-react";
import { cn, formatMessageTime } from "@/lib/utils";
import { Avatar } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import type { MessageWithSender } from "@/lib/db/messages";

interface MessageItemProps {
  message: MessageWithSender;
  isOwn: boolean;
  showAvatar: boolean;
}

export function MessageItem({ message, isOwn, showAvatar }: MessageItemProps) {
  const setReplyTo = useAppStore((s) => s.setReplyTo);

  const handleReply = () => {
    setReplyTo(message as any);
  };

  return (
    <div
      className={cn(
        "group flex gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
        !showAvatar && (isOwn ? "pr-12" : "pl-12")
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="w-10 shrink-0">
          {!isOwn && (
            <Avatar
              src={message.sender.avatar_url}
              alt={message.sender.display_name}
              size="md"
            />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "relative max-w-[75%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "bg-gradient-to-br from-accent to-accent/80 text-bg"
            : "glass"
        )}
      >
        {/* Reply Preview */}
        {message.reply_to && (
          <div
            className={cn(
              "mb-2 rounded-lg px-3 py-1.5 text-xs",
              isOwn ? "bg-white/20" : "bg-surface-mute"
            )}
          >
            <p className="truncate text-text-mute">
              {message.reply_to.content || "📷 Fotoğraf"}
            </p>
          </div>
        )}

        {/* Image Message */}
        {message.type === "image" && message.media_url && (
          <div className="mb-2 overflow-hidden rounded-xl">
            <Image
              src={message.media_url}
              alt="Gönderilen görsel"
              width={message.media_meta?.width || 300}
              height={message.media_meta?.height || 200}
              className="max-h-64 w-auto object-contain"
            />
          </div>
        )}

        {/* Text Content */}
        {message.content && (
          <p className={cn("text-sm", isOwn ? "text-bg" : "text-text")}>
            {message.content}
          </p>
        )}

        {/* Time */}
        <p
          className={cn(
            "mt-1 text-right text-xxs",
            isOwn ? "text-bg/70" : "text-text-faint"
          )}
        >
          {formatMessageTime(message.created_at)}
        </p>

        {/* Reply Button */}
        <button
          onClick={handleReply}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-strong opacity-0 transition-opacity group-hover:opacity-100",
            isOwn ? "-left-9" : "-right-9"
          )}
        >
          <Reply className="h-4 w-4 text-text-mute" />
        </button>
      </div>
    </div>
  );
}
