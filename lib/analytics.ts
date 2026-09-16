import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore/lite';

import { db } from './firebase';

export type DailyView = {
  id?: string;
  postId: string;
  date: string;
  views: number;
};

function toDailyView(id: string, data: DocumentData): DailyView {
  return {
    id,
    postId: typeof data.postId === 'string' ? data.postId : '',
    date: typeof data.date === 'string' ? data.date : '',
    views: typeof data.views === 'number' ? data.views : 0,
  };
}

/**
 * Records one view for a post in today's dailyViews document.
 */
export async function recordPostView(postId: string): Promise<void> {
  if (!postId.trim()) return;

  const date = new Date().toISOString().slice(0, 10);
  const viewId = `${postId}_${date}`;
  const viewRef = doc(db, 'dailyViews', viewId);

  const existing = await getDoc(viewRef);

  if (existing.exists()) {
    const currentViews = Number(existing.data().views || 0);

    await setDoc(
      viewRef,
      {
        postId,
        date,
        views: currentViews + 1,
      },
      { merge: true }
    );
  } else {
    await setDoc(viewRef, {
      postId,
      date,
      views: 1,
    });
  }
}

/**
 * Gets daily views from the last specified number of days.
 */
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

  return snap.docs.map((item) => toDailyView(item.id, item.data()));
}

/**
 * Gets daily views from a specified date.
 */
export async function getDailyViewsSince(
  since: string
): Promise<DailyView[]> {
  const q = query(
    collection(db, 'dailyViews'),
    where('date', '>=', since),
    orderBy('date', 'asc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => toDailyView(item.id, item.data()));
}

/**
 * Gets all daily view records.
 */
export async function getAllDailyViews(): Promise<DailyView[]> {
  const q = query(
    collection(db, 'dailyViews'),
    orderBy('date', 'asc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => toDailyView(item.id, item.data()));
}