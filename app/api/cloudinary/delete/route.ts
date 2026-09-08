import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { deleteCloudinaryImage } from '@/lib/cloudinaryAdmin';

// Deletes one Cloudinary image by public_id. Kept as its own route (rather
// than folded into the post-save flow) because this is the one place the
// Cloudinary API secret is used — it must run server-side only, unlike the
// unsigned browser upload in lib/cloudinary.ts.
//
// Gated to admins, same as Firestore's isAdmin() rule, but checked here
// independently via Firebase Admin SDK: unlike /api/revalidate (which only
// refreshes public cache and has nothing worth protecting), this endpoint
// can delete any asset in the Cloudinary account, so an open route would be
// a real way for a stranger to wipe it.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  let email: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    email = decoded.email;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Token has no email' }, { status: 401 });
  }

  const adminDoc = await adminDb.collection('admins').doc(email).get();
  if (!adminDoc.exists) {
    return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
  }

  const { publicId } = await req.json().catch(() => ({ publicId: null }));
  if (!publicId || typeof publicId !== 'string') {
    return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
  }

  try {
    await deleteCloudinaryImage(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', err);
    return NextResponse.json({ error: 'Cloudinary delete failed' }, { status: 502 });
  }

  return NextResponse.json({ deleted: true });
}
