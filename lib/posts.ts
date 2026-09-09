import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore/lite';
import { db } from './firebase';
import type { Post, PostStatus } from './types';

const postsRef = collection(db, 'posts');

// Public: only published posts whose publishAt has passed.
// The publishAt filter here isn't just belt-and-suspenders — the Firestore
// rule for public post reads requires BOTH status == 'published' AND
// publishAt <= request.time. For a list query, Firestore has to prove from
// the query's own filters that every possible result satisfies the rule; it
// can't do that for an inequality it never filtered on, so a query missing
// the publishAt clause is rejected outright with "Missing or insufficient
// permissions" — even when the matching docs are genuinely published.
export async function getPublishedPosts(): Promise<Post[]> {
  const now = Timestamp.now();
  const q = query(
    postsRef,
    where('status', '==', 'published'),
    where('publishAt', '<=', now),
    orderBy('publishAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
}

// Public: published posts within a single category, for /category/[slug].
//
// Deliberately does NOT filter by `category` in the Firestore query itself.
// In practice, Firestore's list-query rule validator denies this specific
// query — status + category + publishAt (an inequality) all together — with
// "permission-denied", even though the rule only cares about status and
// publishAt, and a real matching document passes the rule fine on its own
// (verified in the Rules Playground). Rather than fight that, this reuses
// the exact getPublishedPosts() query shape (already proven to pass the
// rule) and filters by category client-side afterward. Safe for this app's
// scale — the whole point of the publishAt filter is to keep this list
// small in the first place.
export async function getPublishedPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.category === category);
}

// Public: single post by slug. Same reasoning as above — must filter on
// status AND publishAt to match the rule, or the query gets denied outright.
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const now = Timestamp.now();
  const q = query(
    postsRef,
    where('slug', '==', slug),
    where('status', '==', 'published'),
    where('publishAt', '<=', now)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Post;
}

// Admin: fetch a single post by id for the editor (used by /admin/new?id=...)
export async function getPostById(id: string): Promise<Post | null> {
  const ref = doc(db, 'posts', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Post;
}

// Admin: all posts regardless of status, for the dashboard table
export async function getAllPostsForAdmin(): Promise<Post[]> {
  const q = query(postsRef, orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
}

export async function createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) {
  return addDoc(postsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePost(id: string, data: Partial<Post>) {
  const ref = doc(db, 'posts', id);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function setPostStatus(id: string, status: PostStatus) {
  return updatePost(id, { status });
}

export async function deletePost(id: string) {
  return deleteDoc(doc(db, 'posts', id));
}
