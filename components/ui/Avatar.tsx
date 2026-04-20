"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

export function Avatar({ src, alt, size = "md", online, className }: AvatarProps) {
  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "rounded-full bg-surface-strong flex items-center justify-center overflow-hidden border border-border",
          sizeClasses[size]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={sizeMap[size]}
            height={sizeMap[size]}
            className="object-cover w-full h-full"
          />
        ) : (
          <span
            className={cn(
              "font-medium text-text-mute",
              size === "sm" && "text-xxs",
              size === "md" && "text-xs",
              size === "lg" && "text-sm",
              size === "xl" && "text-base"
            )}
          >
            {initials}
          </span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-bg",
            online ? "bg-success" : "bg-text-faint",
            size === "sm" && "h-2.5 w-2.5",
            size === "md" && "h-3 w-3",
            size === "lg" && "h-3.5 w-3.5",
            size === "xl" && "h-4 w-4"
          )}
        />
      )}
    </div>
  );
}
