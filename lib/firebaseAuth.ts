import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { app } from './firebase';

// Import this only from client components ('use client') — the admin panel.
// Never import it from lib/posts.ts, lib/settings.ts, or anything a
// server-rendered page.tsx touches. See the comment in lib/firebase.ts
// for why that matters on Cloudflare Workers specifically.
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
