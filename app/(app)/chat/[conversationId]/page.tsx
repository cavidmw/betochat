"use client";

import { useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getConversation } from "@/lib/db/conversations";
import { getMessages, markAsRead } from "@/lib/db/messages";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Button } from "@/components/ui";
import { MessageList } from "@/components/chat/MessageList";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { ConversationWithDetails } from "@/lib/db/conversations";
import type { Message } from "@/lib/types";

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const conversationId = params.conversationId as string;

  const user = useAppStore((s) => s.user);
  const setActiveConversationId = useAppStore((s) => s.setActiveConversationId);
  const onlineUsers = useAppStore((s) => s.onlineUsers);
  const typingUsers = useAppStore((s) => s.typingUsers);
  const setTyping = useAppStore((s) => s.setTyping);

  const conversationRef = useRef<ConversationWithDetails | null>(null);

  // Fetch conversation details
  useEffect(() => {
    if (!user) return;

    async function fetchConversation() {
      const conv = await getConversation(conversationId, user!.id);
      if (conv) {
        conversationRef.current = conv;
        queryClient.setQueryData(["conversation", conversationId], conv);
      }
    }

    fetchConversation();
    setActiveConversationId(conversationId);

    return () => {
      setActiveConversationId(null);
    };
  }, [conversationId, user, queryClient, setActiveConversationId]);

  // Fetch messages with infinite scroll
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: messagesLoading,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) => getMessages(conversationId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });

  const messages = messagesData?.pages.flatMap((p) => p.messages) || [];
  const conversation = queryClient.getQueryData<ConversationWithDetails>([
    "conversation",
    conversationId,
  ]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Add to cache
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: typeof messagesData) => {
              if (!old) return old;
              const firstPage = old.pages[0];
              return {
                ...old,
                pages: [
                  {
                    ...firstPage,
                    messages: [newMessage, ...firstPage.messages],
                  },
                  ...old.pages.slice(1),
                ],
              };
            }
          );

          // Mark as read if from other user
          if (newMessage.sender_id !== user.id) {
            markAsRead(conversationId, user.id, newMessage.id);
          }
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, is_typing } = payload.payload as {
          user_id: string;
          is_typing: boolean;
        };
        if (user_id !== user.id) {
          setTyping(conversationId, user_id, is_typing);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient, setTyping]);

  // Mark messages as read on mount
  useEffect(() => {
    if (messages.length > 0 && user) {
      const lastMessage = messages[0];
      if (lastMessage.sender_id !== user.id) {
        markAsRead(conversationId, user.id, lastMessage.id);
      }
    }
  }, [messages, user, conversationId]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!conversation && !messagesLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-text-mute">Sohbet bulunamadı</p>
      </div>
    );
  }

  const otherUser = conversation?.other_user;
  const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
  const isTyping = typingUsers.get(conversationId)?.size ?? 0 > 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3">
        <button
          onClick={() => router.push("/chat")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-text-mute transition-colors hover:bg-surface-mute hover:text-text md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {otherUser && (
          <>
            <Avatar
              src={otherUser.avatar_url}
              alt={otherUser.display_name}
              size="md"
              online={isOnline}
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-text">
                {otherUser.display_name}
              </h1>
              <p className="text-xxs text-text-mute">
                {isTyping ? "yazıyor..." : isOnline ? "çevrimiçi" : "çevrimdışı"}
              </p>
            </div>
          </>
        )}

        <button className="flex h-9 w-9 items-center justify-center rounded-xl text-text-mute transition-colors hover:bg-surface-mute hover:text-text">
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={user?.id || ""}
        onLoadMore={handleLoadMore}
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
      />

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Composer */}
      <MessageComposer conversationId={conversationId} />
    </div>
  );
}
