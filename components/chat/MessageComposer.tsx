"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { cn, throttle } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { sendMessage } from "@/lib/db/messages";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useAppStore((s) => s.user);
  const replyTo = useAppStore((s) => s.replyTo);
  const setReplyTo = useAppStore((s) => s.setReplyTo);

  // Typing indicator with throttle
  const sendTypingEvent = useCallback(
    throttle(() => {
      const supabase = createClient();
      supabase.channel(`messages:${conversationId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: user?.id, is_typing: true },
      });
    }, 2000),
    [conversationId, user?.id]
  );

  // Stop typing after 3 seconds of inactivity
  useEffect(() => {
    if (!text) return;

    const timeout = setTimeout(() => {
      const supabase = createClient();
      supabase.channel(`messages:${conversationId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: user?.id, is_typing: false },
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [text, conversationId, user?.id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalı");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!text.trim() && !imageFile) || !user) return;

    setSending(true);

    try {
      let mediaUrl: string | undefined;
      let mediaMeta: { width?: number; height?: number; size?: number } | undefined;

      // Upload image if present
      if (imageFile) {
        const supabase = createClient();
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${conversationId}/${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-media")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("chat-media")
          .getPublicUrl(fileName);

        mediaUrl = urlData.publicUrl;
        mediaMeta = { size: imageFile.size };

        // Get image dimensions
        if (imagePreview) {
          const img = new Image();
          img.src = imagePreview;
          await new Promise((resolve) => {
            img.onload = () => {
              mediaMeta!.width = img.width;
              mediaMeta!.height = img.height;
              resolve(null);
            };
          });
        }
      }

      await sendMessage({
        conversationId,
        senderId: user.id,
        content: text.trim() || undefined,
        type: imageFile ? "image" : "text",
        mediaUrl,
        mediaMeta,
        replyToId: replyTo?.id,
      });

      setText("");
      clearImage();
      setReplyTo(null);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="shrink-0 border-t border-border p-3">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface-mute px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xxs text-text-mute">Yanıtlanıyor</p>
            <p className="truncate text-sm text-text">
              {replyTo.content || "📷 Fotoğraf"}
            </p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="shrink-0 text-text-mute hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <img
            src={imagePreview}
            alt="Önizleme"
            className="h-20 w-auto rounded-lg object-cover"
          />
          <button
            onClick={clearImage}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-mute transition-colors hover:bg-surface-mute hover:text-text"
        >
          <ImageIcon className="h-5 w-5" />
        </button>

        {/* Text Input */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTypingEvent();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Mesaj yaz..."
          rows={1}
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={(!text.trim() && !imageFile) || sending}
          loading={sending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
