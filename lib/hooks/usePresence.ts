"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";

export function usePresence(userId: string | undefined) {
  const setOnlineUsers = useAppStore((s) => s.setOnlineUsers);
  const addOnlineUser = useAppStore((s) => s.addOnlineUser);
  const removeOnlineUser = useAppStore((s) => s.removeOnlineUser);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set(Object.keys(state));
        setOnlineUsers(onlineIds);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        addOnlineUser(key);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        removeOnlineUser(key);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setOnlineUsers, addOnlineUser, removeOnlineUser]);
}
