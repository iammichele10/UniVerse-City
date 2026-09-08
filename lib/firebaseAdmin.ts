import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Server-only counterpart to lib/firebase.ts (the browser client SDK).
// Needed anywhere an API route has to (a) verify who's calling it, or
// (b) read/write Firestore with full access, ignoring firestore.rules.
//
// Requires its own service account credentials — these are NOT the same
// as the NEXT_PUBLIC_FIREBASE_* values used by the client SDK:
//   Firebase console -> Project settings -> Service accounts
//   -> Generate new private key (downloads a JSON file)
// Copy client_email -> FIREBASE_ADMIN_CLIENT_EMAIL
// Copy private_key  -> FIREBASE_ADMIN_PRIVATE_KEY (see .env.local.example
// for the quoting/newline gotcha)

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // .env files can't hold real newlines, so the key is pasted with literal
  // "\n" sequences — convert those back before handing it to the SDK.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars — check FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local'
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
