"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users, Clock, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} from "@/lib/db/friends";
import { searchUsersByUsername } from "@/lib/db/profiles";
import { getOrCreateConversation } from "@/lib/db/conversations";
import { Button, Input, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Tab = "friends" | "requests" | "add";

export default function FriendsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAppStore((s) => s.user);
  const onlineUsers = useAppStore((s) => s.onlineUsers);

  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: () => (user ? getFriends(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pending-requests", user?.id],
    queryFn: () => (user ? getPendingRequests(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (addresseeId: string) =>
      sendFriendRequest(user!.id, addresseeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      setSearchResults([]);
      setSearchQuery("");
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      respondToFriendRequest(id, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFriend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) return;

    setSearching(true);
    const results = await searchUsersByUsername(searchQuery.trim());
    setSearchResults(results);
    setSearching(false);
  };

  const handleStartChat = async (friendId: string) => {
    const conversationId = await getOrCreateConversation(friendId);
    if (conversationId) {
      router.push(`/chat/${conversationId}`);
    }
  };

  const tabs = [
    { id: "friends" as Tab, label: "Arkadaşlar", icon: Users, count: friends.length },
    { id: "requests" as Tab, label: "İstekler", icon: Clock, count: pendingRequests.length },
    { id: "add" as Tab, label: "Ekle", icon: UserPlus },
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <h1 className="text-base font-semibold text-text">Arkadaşlar</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-accent text-accent"
                : "text-text-mute hover:text-text"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 text-xxs font-medium text-accent">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Friends List */}
        {activeTab === "friends" && (
          <div className="divide-y divide-border/50">
            {friendsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            ) : friends.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-text-faint" />
                <p className="text-text-mute">Henüz arkadaşınız yok</p>
                <p className="mt-1 text-sm text-text-faint">
                  Yeni arkadaş eklemek için "Ekle" sekmesini kullanın
                </p>
              </div>
            ) : (
              friends.map((friendship) => (
                <div
                  key={friendship.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar
                    src={friendship.friend.avatar_url}
                    alt={friendship.friend.display_name}
                    size="lg"
                    online={onlineUsers.has(friendship.friend.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text">
                      {friendship.friend.display_name}
                    </p>
                    <p className="text-sm text-text-mute">
                      @{friendship.friend.username}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartChat(friendship.friend.id)}
                  >
                    Mesaj
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Requests */}
        {activeTab === "requests" && (
          <div className="divide-y divide-border/50">
            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="mx-auto mb-3 h-12 w-12 text-text-faint" />
                <p className="text-text-mute">Bekleyen istek yok</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar
                    src={request.friend.avatar_url}
                    alt={request.friend.display_name}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text">
                      {request.friend.display_name}
                    </p>
                    <p className="text-sm text-text-mute">
                      @{request.friend.username}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        respondMutation.mutate({ id: request.id, accept: true })
                      }
                    >
                      Kabul
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        respondMutation.mutate({ id: request.id, accept: false })
                      }
                    >
                      Reddet
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Friend */}
        {activeTab === "add" && (
          <div className="p-4">
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Kullanıcı adı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} loading={searching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="divide-y divide-border/50 rounded-xl border border-border">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text">
                        {profile.display_name}
                      </p>
                      <p className="text-sm text-text-mute">
                        @{profile.username}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendRequestMutation.mutate(profile.id)}
                      loading={sendRequestMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                      Ekle
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searching && (
              <p className="text-center text-text-mute">
                Kullanıcı bulunamadı
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
