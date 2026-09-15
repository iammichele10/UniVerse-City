'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getPostLikeState, togglePostLike } from '@/lib/likes';
import { signInReader, watchReaderAuth } from '@/lib/readerAuth';

function HeartIcon({
  filled,
  animate,
}: {
  filled: boolean;
  animate: boolean;
}) {
  return (
    <span
      className={`inline-flex ${
        animate ? 'animate-like-pop' : ''
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[21px] w-[21px]"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function LikeButton({ postId }: { postId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    return watchReaderAuth(setUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getPostLikeState(postId, user?.uid ?? null)
      .then((state) => {
        if (!cancelled) {
          setCount(state.count);
          setLiked(state.liked);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [postId, user?.uid]);

  async function handleClick() {
    if (busy) return;

    if (!user) {
      try {
        await signInReader();
      } catch {
        // Reader dismissed the sign-in popup.
      }
      return;
    }

    const previousLiked = liked;
    const previousCount = count;

    const nextLiked = !liked;
    const nextCount = nextLiked
      ? count + 1
      : Math.max(0, count - 1);

    // Update the interface immediately.
    setLiked(nextLiked);
    setCount(nextCount);

    // Start the heart animation.
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 300);

    setBusy(true);

    try {
      await togglePostLike(postId, user.uid);
    } catch {
      // Restore the previous state if saving fails.
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={liked ? 'Unlike post' : 'Like post'}
      className={`inline-flex items-center gap-2 text-sm transition-all duration-200 disabled:opacity-60 ${
        liked
          ? 'text-red-600'
          : 'text-ink hover:text-red-600'
      }`}
    >
      <HeartIcon
        filled={liked}
        animate={animate}
      />

      <span>{count}</span>
    </button>
  );
}