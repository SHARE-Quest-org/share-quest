import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || typeof supabaseUrl !== "string") {
  throw new Error(
    "環境変数 VITE_SUPABASE_URL が設定されていません。\n" +
      ".env.example を参考に apps/website/.env を作成してください。",
  );
}

if (!supabaseAnonKey || typeof supabaseAnonKey !== "string") {
  throw new Error(
    "環境変数 VITE_SUPABASE_ANON_KEY が設定されていません。\n" +
      ".env.example を参考に apps/website/.env を作成してください。",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "viewer" | "writer" | "editor";

export interface Profile {
  id: string;
  email?: string;
  role: UserRole;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio?: string | null;
}
