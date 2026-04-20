import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

export function mapAuthErrorToMessage(error: AuthError | null): string {
  if (!error) {
    return "Bilinmeyen bir hata oluştu.";
  }

  const msg = (error.message ?? "").toLowerCase();

  // Rate limit
  if (msg.includes("email rate limit exceeded") || msg.includes("rate limit")) {
    return "Çok fazla deneme yaptınız. Lütfen birkaç dakika bekleyip tekrar deneyin.";
  }

  // Email confirmation required
  if (msg.includes("email not confirmed")) {
    return "E-posta adresinizi onaylamanız gerekiyor. Gelen kutunuzu kontrol edin.";
  }

  // Invalid credentials
  if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
    return "E-posta veya şifre hatalı.";
  }

  // Email already registered
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "Bu e-posta adresi zaten kayıtlı.";
  }

  // Username duplicate (from DB constraint)
  if (msg.includes("profiles_username_key") || (msg.includes("duplicate") && msg.includes("username"))) {
    return "Bu kullanıcı adı zaten alınmış.";
  }

  // Password validation
  if (msg.includes("password") && (msg.includes("at least") || msg.includes("too short"))) {
    return "Şifre en az 6 karakter olmalı.";
  }

  // Signup disabled
  if (msg.includes("signup") && msg.includes("disabled")) {
    return "Kayıt işlemi şu anda kapalı.";
  }

  // Network/timeout
  if (msg.includes("network") || msg.includes("timeout") || msg.includes("fetch")) {
    return "Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.";
  }

  // Fallback
  return error.message || "Bir hata oluştu. Lütfen tekrar deneyin.";
}

export async function ensureProfileExists(
  supabase: SupabaseClient,
  user: User,
  maxAttempts = 5
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i += 1) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data?.id) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return false;
}
