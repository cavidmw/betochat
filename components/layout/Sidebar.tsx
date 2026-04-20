"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui";

const navItems = [
  { href: "/chat", icon: MessageCircle, label: "Sohbetler" },
  { href: "/friends", icon: Users, label: "Arkadaşlar" },
  { href: "/settings", icon: Settings, label: "Ayarlar" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full w-[72px] flex-col items-center border-r border-border bg-bg-elevated py-4">
      {/* Logo */}
      <Link
        href="/chat"
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                isActive
                  ? "bg-accent/20 text-accent"
                  : "text-text-mute hover:bg-surface-mute hover:text-text"
              )}
            >
              <item.icon className="h-5 w-5" />
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-surface-strong px-3 py-1.5 text-xs font-medium text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <Link href="/settings" className="group relative">
          <Avatar
            src={user?.avatar_url}
            alt={user?.display_name || "Kullanıcı"}
            size="md"
          />
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-surface-strong px-3 py-1.5 text-xs font-medium text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {user?.display_name}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-text-mute transition-colors hover:bg-danger/20 hover:text-danger"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
