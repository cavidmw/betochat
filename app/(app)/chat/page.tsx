"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MessageCircle, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getConversations } from "@/lib/db/conversations";
import { ConversationList } from "@/components/chat/ConversationList";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function ChatPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setActiveConversationId = useAppStore((s) => s.setActiveConversationId);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => (user ? getConversations(user.id) : Promise.resolve([])),
    enabled: !!user,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setActiveConversationId(null);
  }, [setActiveConversationId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
          <MessageCircle className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-text">
          Henüz sohbet yok
        </h2>
        <p className="mb-6 max-w-xs text-sm text-text-mute">
          Arkadaş ekleyerek sohbet başlatabilirsiniz
        </p>
        <Link href="/friends">
          <Button>
            <Plus className="h-4 w-4" />
            Arkadaş Ekle
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <h1 className="text-base font-semibold text-text">Sohbetler</h1>
      </header>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <ConversationList conversations={conversations} />
      </div>
    </div>
  );
}
