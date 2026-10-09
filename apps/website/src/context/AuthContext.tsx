import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import type { Profile } from "../supabase";

export type UserRole = "guest" | "viewer" | "writer" | "editor";

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  userRole: UserRole;
  setUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  authLoading: boolean;
  mfaChallengeRequired: boolean;
  setMfaChallengeRequired: React.Dispatch<React.SetStateAction<boolean>>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [authLoading, setAuthLoading] = useState(true);
  const [mfaChallengeRequired, setMfaChallengeRequired] = useState(false);

  const fetchProfile = async (
    userId: string,
    email?: string,
    userMetadata?: Record<string, unknown>,
  ) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, display_name, username, avatar_url, bio, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          ...data,
          email: email || user?.email || "",
        });
        setUserRole((data.role as UserRole) || "viewer");
        return;
      }
    } catch (e) {
      console.warn("Failed to fetch profile from DB, using fallback", e);
    }

    // DB取得失敗またはレコード未作成時の安全なフォールバック
    const fallbackProfile: Profile = {
      id: userId,
      email: email || user?.email || "",
      role: "viewer",
      display_name:
        (userMetadata?.display_name as string) ||
        (userMetadata?.name as string) ||
        (userMetadata?.full_name as string) ||
        email?.split("@")[0] ||
        "ユーザー",
      username: (userMetadata?.username as string) || email?.split("@")[0] || "user",
      avatar_url: (userMetadata?.avatar_url as string) || null,
      bio: null,
    };
    setProfile(fallbackProfile);
    setUserRole("viewer");
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email, user.user_metadata);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = async (session: { user: User } | null) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);

        // AAL2 / MFA チェック（不要なリロード時全画面ブロックを防止）
        try {
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aalData?.currentLevel === "aal2") {
            if (isMounted) setMfaChallengeRequired(false);
          }
        } catch (mfaErr) {
          console.warn("MFA level check error", mfaErr);
        }
      } else {
        setUser(null);
        setProfile(null);
        setUserRole("guest");
        setMfaChallengeRequired(false);
      }
    };

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          await applySession(session);
        }
      } catch (e) {
        console.error("Auth initialization error", e);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // INITIAL_SESSION で session が null の場合は initAuth の getSession() に委ねる
      if (event === "INITIAL_SESSION") {
        if (session?.user) {
          await applySession(session);
          setAuthLoading(false);
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        await applySession(null);
        setAuthLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        await applySession(session);
        setAuthLoading(false);
        return;
      }

      if (session?.user) {
        await applySession(session);
      }
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    setProfile,
    userRole,
    setUserRole,
    authLoading,
    mfaChallengeRequired,
    setMfaChallengeRequired,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
