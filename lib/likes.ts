import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore/lite';
import { db } from './firebase';

const likesRef = (postId: string) => collection(db, 'posts', postId, 'likes');

export async function getPostLikeState(postId: string, uid: string | null) {
  const likes = await getDocs(likesRef(postId));
  let liked = false;

  if (uid) {
    liked = (await getDoc(doc(db, 'posts', postId, 'likes', uid))).exists();
  }

  return { count: likes.size, liked };
}

export async function togglePostLike(postId: string, uid: string) {
  const ref = doc(db, 'posts', postId, 'likes', uid);
  const existing = await getDoc(ref);

  if (existing.exists()) return deleteDoc(ref);

  return setDoc(ref, {
    uid,
    createdAt: serverTimestamp(),
  });
}
