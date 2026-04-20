"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/db/profiles";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validation";
import { Button, Input, Avatar } from "@/components/ui";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      display_name: user?.display_name || "",
      bio: user?.bio || "",
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Dosya boyutu 2MB'dan küçük olmalı");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `avatars/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      const updated = await updateProfile(user.id, {
        avatar_url: urlData.publicUrl,
      });

      if (updated) {
        setUser(updated);
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileUpdateInput) => {
    if (!user) return;

    setSaving(true);

    try {
      const updated = await updateProfile(user.id, {
        display_name: data.display_name,
        bio: data.bio || "",
      });

      if (updated) {
        setUser(updated);
      }
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <h1 className="text-base font-semibold text-text">Ayarlar</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
        <div className="mx-auto max-w-md space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar
                src={user.avatar_url}
                alt={user.display_name}
                size="xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-bg transition-transform hover:scale-105 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="mt-2 text-sm text-text-mute">@{user.username}</p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-mute">
                Görünen İsim
              </label>
              <Input
                {...register("display_name")}
                error={errors.display_name?.message}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-mute">
                Bio
              </label>
              <textarea
                {...register("bio")}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="Kendinizden bahsedin..."
              />
              {errors.bio && (
                <p className="mt-1.5 text-xs text-danger">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={saving}>
              Kaydet
            </Button>
          </form>

          {/* Logout */}
          <div className="border-t border-border pt-6">
            <Button
              variant="danger"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
