import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

export function mapAuthErrorToMessage(error: AuthError | null): string {
  const rawMessage = (error?.message ?? "").toLowerCase();
  const status = error?.status;

  if (!error) {
    return "Bilinmeyen bir kimlik doğrulama hatası oluştu.";
  }

  if (rawMessage.includes("email not confirmed")) {
    return "Hesabınız oluşturuldu fakat e-posta onayı bekleniyor. Gelen kutunuzu kontrol edip onayladıktan sonra giriş yapın.";
  }

  if (rawMessage.includes("invalid login credentials") || status === 400) {
    return "E-posta veya şifre hatalı.";
  }

  if (rawMessage.includes("user already registered")) {
    return "Bu e-posta adresi zaten kayıtlı.";
  }

  if (rawMessage.includes("password should be at least")) {
    return "Şifre en az 6 karakter olmalı.";
  }

  if (rawMessage.includes("signup is disabled")) {
    return "Kayıt işlemi şu anda kapalı.";
  }

  return error.message || "Kimlik doğrulama sırasında bir hata oluştu.";
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
