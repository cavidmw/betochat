"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validation";
import { Button, Input } from "@/components/ui";
import { MessageCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Check username availability
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username.toLowerCase())
      .single();

    if (existingUser) {
      setError("Bu kullanıcı adı zaten alınmış");
      setLoading(false);
      return;
    }

    // Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username.toLowerCase(),
          display_name: data.display_name,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("Bu e-posta adresi zaten kayıtlı");
      } else {
        setError("Kayıt sırasında bir hata oluştu");
      }
      setLoading(false);
      return;
    }

    if (authData.user) {
      router.push("/chat");
      router.refresh();
    }
  };

  return (
    <div className="glass rounded-2xl p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20">
          <MessageCircle className="h-7 w-7 text-accent" />
        </div>
        <h1 className="text-xl font-semibold text-text">Kayıt Ol</h1>
        <p className="mt-1 text-sm text-text-mute">
          Yeni hesap oluşturun
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
            Kullanıcı Adı
          </label>
          <Input
            type="text"
            placeholder="kullanici_adi"
            autoComplete="username"
            {...register("username")}
            error={errors.username?.message}
          />
          <p className="mt-1 text-xxs text-text-faint">
            Küçük harf, rakam ve alt çizgi. 3-20 karakter.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-mute">
            Görünen İsim
          </label>
          <Input
            type="text"
            placeholder="Adınız Soyadınız"
            autoComplete="name"
            {...register("display_name")}
            error={errors.display_name?.message}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-mute">
            Şifre
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>

        {error && (
          <p className="text-sm text-danger text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Kayıt Ol
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-mute">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
