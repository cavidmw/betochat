"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageItem } from "./MessageItem";
import type { MessageWithSender } from "@/lib/db/messages";

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId: string;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  onLoadMore,
  hasMore,
  isLoading,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll - load more when scrolling up
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // Scroll to bottom on new message
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only auto-scroll if near bottom
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  // Reverse messages for display (newest at bottom)
  const reversedMessages = [...messages].reverse();

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col-reverse overflow-y-auto px-4 py-4"
    >
      <div className="flex flex-col gap-1">
        {/* Top sentinel for infinite scroll */}
        <div ref={topSentinelRef} className="h-1" />

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        )}

        <AnimatePresence initial={false}>
          {reversedMessages.map((message, index) => {
            const prevMessage = reversedMessages[index - 1];
            const showAvatar =
              !prevMessage || prevMessage.sender_id !== message.sender_id;
            const isOwn = message.sender_id === currentUserId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageItem
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
