import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "share_quest_followed_writers";

export function useFollows() {
  const [followedIds, setFollowedIds] = useState<string[]>(() => {
    if (typeof window === "undefined" || !window.localStorage) return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(followedIds));
    }
  }, [followedIds]);

  const isFollowing = useCallback(
    (writerId: string) => followedIds.includes(writerId),
    [followedIds],
  );

  const toggleFollow = useCallback((writerId: string) => {
    setFollowedIds((prev) =>
      prev.includes(writerId) ? prev.filter((id) => id !== writerId) : [...prev, writerId],
    );
  }, []);

  return {
    followedIds,
    isFollowing,
    toggleFollow,
  };
}
