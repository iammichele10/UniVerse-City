import { doc, getDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';

export async function isEmailAdmin(email: string): Promise<boolean> {
  const ref = doc(db, 'admins', email);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email;
  if (!email || !(await isEmailAdmin(email))) {
    await signOut(auth);
    throw new Error('This Google account is not authorized as an admin.');
  }
  return result.user;
}

export function signOutAdmin() {
  return signOut(auth);
}

export function watchAdminAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
