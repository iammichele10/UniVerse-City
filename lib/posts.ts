import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore/lite';
import { db } from './firebase';
import type { Post, PostStatus } from './types';

const postsRef = collection(db, 'posts');

function isLivePost(post: Post): boolean {
  if (post.status !== 'published') {
    return false;
  }

  if (!post.publishAt) {
    return true;
  }

  const publishAt = post.publishAt;

  if (publishAt instanceof Timestamp) {
    return publishAt.toMillis() <= Date.now();
  }

  if (publishAt instanceof Date) {
    return publishAt.getTime() <= Date.now();
  }

  return true;
}

// Public: get published posts.
// Future scheduled posts are removed after Firestore returns the
// published documents.
export async function getPublishedPosts(): Promise<Post[]> {
  const q = query(
    postsRef,
    where('status', '==', 'published'),
    orderBy('publishAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
    } as Post))
    .filter(isLivePost);
}

// Public: get published posts in a category.
export async function getPublishedPostsByCategory(
  category: string
): Promise<Post[]> {
  const posts = await getPublishedPosts();

  return posts.filter(
    (post) => post.category === category
  );
}

// Public: get one published post by slug.
export async function getPostBySlug(
  slug: string
): Promise<Post | null> {
  // The status condition is intentional.
  // Firestore security rules only allow public reads of
  // documents whose status is "published".
  const q = query(
    postsRef,
    where('slug', '==', slug),
    where('status', '==', 'published')
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    return null;
  }

  const post = {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  } as Post;

  return isLivePost(post) ? post : null;
}

// Admin: get any post by ID, including drafts.
export async function getPostById(
  id: string
): Promise<Post | null> {
  const ref = doc(db, 'posts', id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  } as Post;
}

// Admin: get all posts regardless of status.
export async function getAllPostsForAdmin(): Promise<Post[]> {
  const q = query(
    postsRef,
    orderBy('updatedAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      } as Post)
  );
}

// Create a post.
export async function createPost(
  data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
) {
  return addDoc(postsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Update a post.
export async function updatePost(
  id: string,
  data: Partial<Post>
) {
  const ref = doc(db, 'posts', id);

  return updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Change post status.
export async function setPostStatus(
  id: string,
  status: PostStatus
) {
  return updatePost(id, { status });
}

// Delete a post.
export async function deletePost(id: string) {
  return deleteDoc(doc(db, 'posts', id));
}