"use client";

import { useState, useEffect } from "react";

/**
 * Reads the guest participantId from localStorage.
 * Returns { participantId, ready } — ready is false until
 * localStorage has been checked, preventing premature API calls.
 */
export function useParticipantId() {
  const [state, setState] = useState<{
    participantId: string | null;
    ready: boolean;
  }>({ participantId: null, ready: false });

  useEffect(() => {
    const stored = localStorage.getItem("participantId");
    setState({ participantId: stored, ready: true });
  }, []);

  return state;
}
