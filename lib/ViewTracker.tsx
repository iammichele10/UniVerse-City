'use client';

import { useEffect } from 'react';
import { recordPostView } from './analytics';

export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    if (!postId) return;

    recordPostView(postId).catch((error) => {
      console.error('Unable to record view:', error);
    });
  }, [postId]);

  return null;
}