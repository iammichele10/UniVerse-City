import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Post, PostStatus } from './types';

const postsRef = collection(db, 'posts');

// Public: only published posts whose publishAt has passed
export async function getPublishedPosts(): Promise<Post[]> {
  const q = query(
    postsRef,
    where('status', '==', 'published'),
    orderBy('publishAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Post))
    .filter((p) => (p.publishAt as unknown as Timestamp).toMillis() <= Date.now());
}

// Public: published posts within a single category, for /category/[slug]
export async function getPublishedPostsByCategory(category: string): Promise<Post[]> {
  const q = query(
    postsRef,
    where('status', '==', 'published'),
    where('category', '==', category),
    orderBy('publishAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Post))
    .filter((p) => (p.publishAt as unknown as Timestamp).toMillis() <= Date.now());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(postsRef, where('slug', '==', slug));
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
