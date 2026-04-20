const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim();
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    throw new Error(
      `Supabase environment variables are missing. Please set ${SUPABASE_URL_KEY} and ${SUPABASE_ANON_KEY} in both local (.env.local) and production (Vercel Environment Variables).`
    );
  }

  return { url, anonKey };
}
