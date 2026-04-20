"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { ensureProfileExists, mapAuthErrorToMessage } from "@/lib/supabase/auth-errors";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Button, Input } from "@/components/ui";
import { MessageCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      setError(null);

      const email = data.email.trim().toLowerCase();
      const password = data.password;

      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(mapAuthErrorToMessage(authError));
        setLoading(false);
        return;
      }

      if (!authData.session || !authData.user) {
        setError("Giriş tamamlanamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      // Wait for profile to be ready
      const profileReady = await ensureProfileExists(supabase, authData.user, 10);

      if (!profileReady) {
        setError("Profil bilgileri henüz hazır değil. Lütfen birkaç saniye sonra tekrar deneyin.");
        setLoading(false);
        return;
      }

      router.push("/chat");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20">
          <MessageCircle className="h-7 w-7 text-accent" />
        </div>
        <h1 className="text-xl font-semibold text-text">Giriş Yap</h1>
        <p className="mt-1 text-sm text-text-mute">
          Hesabınıza giriş yapın
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-mute">
            E-posta
          </label>
          <Input
            type="email"
            placeholder="ornek@email.com"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-mute">
            Şifre
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>

        {error && (
          <p className="text-sm text-danger text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Giriş Yap
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-mute">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
