'use client';

import { useEffect, useRef } from 'react';

export default function PropertyViewTracker({ propertyId }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'property', propertyId }),
    }).catch(() => {});
  }, [propertyId]);

  return null;
}
