import crypto from 'crypto';

// Server-only. Deleting from Cloudinary needs a *signed* request — proof
// you hold the API secret — unlike the unsigned upload in lib/cloudinary.ts.
// The secret must never reach the browser, so this file is only ever
// imported from app/api/cloudinary/delete/route.ts.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; // not secret, fine to reuse
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error(
      'Missing Cloudinary server env vars — check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local'
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Cloudinary's signing rule: take every param going in the request
  // (besides file/api_key/signature/cloud_name), sort alphabetically by key,
  // join as key=value&key=value, append the API secret, then SHA-1 it.
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + API_SECRET)
    .digest('hex');

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary delete request failed: ${err}`);
  }

  const data = await res.json();
  // Cloudinary responds 200 with { result: 'not found' } instead of an
  // HTTP error when the public_id is already gone — treat that as success
  // too, since the end state (image not on Cloudinary) is what we want.
  if (data.result !== 'ok' && data.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${JSON.stringify(data)}`);
  }
}
