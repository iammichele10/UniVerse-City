import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from './firebaseAuth';

// Unlike adminAuth.ts's signInWithGoogle, this doesn't check the admins
// collection — any Google account is allowed to sign in and comment.
export async function signInReader() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export function signOutReader() {
  return signOut(auth);
}

export function watchReaderAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
