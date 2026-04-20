"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/chat", icon: MessageCircle, label: "Sohbetler" },
  { href: "/friends", icon: Users, label: "Arkadaşlar" },
  { href: "/settings", icon: Settings, label: "Ayarlar" },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 glass-strong safe-bottom">
      <div className="flex h-16 items-center justify-around px-4">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
                isActive ? "text-accent" : "text-text-mute"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xxs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
