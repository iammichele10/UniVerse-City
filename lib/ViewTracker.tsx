'use client';

import { useEffect } from 'react';
import { recordPostView } from './analytics';

export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `uvc-viewed-${postId}-${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    recordPostView(postId).catch((error) => console.error('Unable to record view:', error));
  }, [postId]);

  return null;
}
