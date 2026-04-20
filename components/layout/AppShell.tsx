"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileTabBar } from "./MobileTabBar";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { usePresence } from "@/lib/hooks/usePresence";
import type { Profile } from "@/lib/types";

interface AppShellProps {
  children: ReactNode;
  userId: string;
}

export function AppShell({ children, userId }: AppShellProps) {
  const pathname = usePathname();
  const setUser = useAppStore((s) => s.setUser);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  const isInChat = pathname.startsWith("/chat/");

  // Initialize presence tracking
  usePresence(userId);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setUser(data as Profile);
      }
    }

    fetchProfile();
  }, [userId, setUser]);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Mobile Tab Bar - hide when in chat detail */}
      <div className={`md:hidden ${isInChat ? "hidden" : ""}`}>
        <MobileTabBar />
      </div>
    </div>
  );
}
