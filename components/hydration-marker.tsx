'use client';

import { useEffect } from 'react';

/**
 * Marks the document once React has taken over the page. Until then clicks and
 * key presses do nothing, so the browser tests wait for this before acting.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
  }, []);
  return null;
}
