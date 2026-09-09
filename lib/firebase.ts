import { initializeApp, getApps, getApp } from 'firebase/app';
// firestore/lite (not plain 'firebase/firestore') deliberately — the full
// SDK's Node build pulls in @grpc/proto-loader, which uses new Function()
// internally and crashes with "Code generation from strings disallowed"
// on Cloudflare Workers. Lite is REST-based (via undici/fetch) instead, so
// it has no such dependency. It has no onSnapshot()/realtime listeners or
// offline persistence, but this app only ever does one-shot reads/writes,
// so nothing here relies on those.
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore only, deliberately — this file gets imported by server-rendered
// pages (via lib/posts.ts / lib/settings.ts) as well as the admin panel.
// Firebase Auth (see lib/firebaseAuth.ts) is browser-only and must never be
// initialized as a side effect of importing this file, or it runs during
// server-side rendering too — harmless on a plain Node server, but it
// crashes outright on Cloudflare Workers, which lacks the browser APIs
// (IndexedDB, navigator.locks) Auth's persistence layer expects.
export const db = getFirestore(app);
