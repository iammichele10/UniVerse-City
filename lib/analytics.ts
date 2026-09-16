import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore/lite';

import { db } from './firebase';

export interface DailyView {
  id: string;
  postId: string;
  date: string;
  views: number;
}

function toDailyView(
  id: string,
  data: Record<string, unknown>
): DailyView {
  return {
    id,
    postId: typeof data.postId === 'string' ? data.postId : '',
    date: typeof data.date === 'string' ? data.date : '',
    views: typeof data.views === 'number' ? data.views : 0,
  };
}

/**
 * Returns today's date in YYYY-MM-DD format.
 */
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Creates the local storage key used to remember
 * whether this browser has viewed this post today.
 */
function getViewStorageKey(postId: string, date: string): string {
  return `uvc-viewed-${postId}-${date}`;
}

/**
 * Records one view for a post.
 *
 * A post can only be counted once per day in the
 * same browser/device storage.
 *
 * localStorage is used instead of sessionStorage so
 * that different tabs of the same browser share the
 * viewed state.
 */
export async function recordPostView(postId: string): Promise<void> {
  if (!postId) {
    return;
  }

  // Server/client code safety.
  if (typeof window === 'undefined') {
    return;
  }

  const date = getToday();
  const storageKey = getViewStorageKey(postId, date);

  try {
    // Already viewed this post today.
    if (localStorage.getItem(storageKey)) {
      return;
    }

    /*
     * Set this BEFORE the Firestore request.
     *
     * This is important because another tab could otherwise
     * call recordPostView() while the first Firestore request
     * is still waiting.
     */
    localStorage.setItem(storageKey, '1');

    const id = `${postId}_${date}`;
    const ref = doc(db, 'dailyViews', id);

    await setDoc(
      ref,
      {
        postId,
        date,
        views: increment(1),
      },
      { merge: true }
    );
  } catch (error) {
    /*
     * If Firestore fails, remove the local marker so the
     * view can be attempted again later.
     */
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore localStorage cleanup errors.
    }

    throw error;
  }
}

export async function getRecentDailyViews(
  days = 7
): Promise<DailyView[]> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - (days - 1));

  const since = sinceDate.toISOString().slice(0, 10);

  const q = query(
    collection(db, 'dailyViews'),
    where('date', '>=', since),
    orderBy('date', 'asc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) =>
    toDailyView(
      item.id,
      item.data() as Record<string, unknown>
    )
  );
}

export async function getAllDailyViews(): Promise<DailyView[]> {
  const q = query(
    collection(db, 'dailyViews'),
    orderBy('date', 'asc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) =>
    toDailyView(
      item.id,
      item.data() as Record<string, unknown>
    )
  );
}