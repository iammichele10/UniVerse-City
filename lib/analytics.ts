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

export async function recordPostView(postId: string) {
  const date = new Date().toISOString().slice(0, 10);
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