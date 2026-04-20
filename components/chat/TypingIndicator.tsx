"use client";

export function TypingIndicator() {
  return (
    <div className="px-4 pb-2">
      <div className="inline-flex items-center gap-1 rounded-full bg-surface-mute px-3 py-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-text-mute [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-text-mute [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-text-mute" />
      </div>
    </div>
  );
}
