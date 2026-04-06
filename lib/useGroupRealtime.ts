"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface UseGroupRealtimeOptions {
  /** Supabase session ID — channels only subscribe once this is set */
  sessionId: string | null;
  /** Prefix for channel names to avoid collisions (e.g. "lobby", "mood") */
  channelPrefix: string;
  /** Called on every Realtime event + polling tick */
  onUpdate: () => void;
  /** Called when the session row is deleted (e.g. host disbands) */
  onDelete?: () => void;
  /** Set to true to pause polling (e.g. during loading or transition) */
  paused?: boolean;
}

/**
 * Sets up Supabase Realtime subscriptions on session_participants + sessions
 * tables, plus a 2s polling fallback. Cleans up on unmount.
 */
export function useGroupRealtime({
  sessionId,
  channelPrefix,
  onUpdate,
  onDelete,
  paused = false,
}: UseGroupRealtimeOptions) {
  // Always hold the latest callbacks without re-subscribing
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  });

  // Realtime subscriptions
  useEffect(() => {
    if (!sessionId) return;

    const participantsChannel = supabase
      .channel(`${channelPrefix}-participants-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          onUpdateRef.current();
        },
      )
      .subscribe();

    const sessionChannel = supabase
      .channel(`${channelPrefix}-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            onDeleteRef.current?.();
            return;
          }
          onUpdateRef.current();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, channelPrefix]);

  // Polling fallback every 2s
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      onUpdateRef.current();
    }, 2000);
    return () => clearInterval(interval);
  }, [paused]);
}
