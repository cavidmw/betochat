import { create } from "zustand";
import type { Profile, Conversation, Message } from "@/lib/types";

interface AppState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;

  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;

  replyTo: Message | null;
  setReplyTo: (message: Message | null) => void;

  onlineUsers: Set<string>;
  setOnlineUsers: (users: Set<string>) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;

  typingUsers: Map<string, Set<string>>; // conversationId -> Set<userId>
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  replyTo: null,
  setReplyTo: (message) => set({ replyTo: message }),

  onlineUsers: new Set(),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    }),
  removeOnlineUser: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  typingUsers: new Map(),
  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const next = new Map(state.typingUsers);
      const users = new Set(next.get(conversationId) || []);
      if (isTyping) {
        users.add(userId);
      } else {
        users.delete(userId);
      }
      if (users.size === 0) {
        next.delete(conversationId);
      } else {
        next.set(conversationId, users);
      }
      return { typingUsers: next };
    }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
