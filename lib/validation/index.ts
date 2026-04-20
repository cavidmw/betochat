import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Kullanıcı adı en az 3 karakter olmalı")
  .max(20, "Kullanıcı adı en fazla 20 karakter olabilir")
  .regex(
    /^[a-z0-9_]+$/,
    "Sadece küçük harf, rakam ve alt çizgi kullanılabilir"
  );

export const displayNameSchema = z
  .string()
  .min(1, "Görünen isim boş olamaz")
  .max(50, "Görünen isim en fazla 50 karakter olabilir");

export const bioSchema = z
  .string()
  .max(160, "Bio en fazla 160 karakter olabilir")
  .optional()
  .or(z.literal(""));

export const emailSchema = z.string().email("Geçerli bir e-posta adresi girin");

export const passwordSchema = z
  .string()
  .min(6, "Şifre en az 6 karakter olmalı");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  display_name: displayNameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const profileUpdateSchema = z.object({
  display_name: displayNameSchema,
  bio: bioSchema,
});

export const messageSchema = z.object({
  content: z.string().min(1).max(4000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
