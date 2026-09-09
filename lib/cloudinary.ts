// Client-side unsigned Cloudinary uploads.
// Used by both post covers and team photos.
//
// IMPORTANT:
// uploadImageToCloudinary() returns a string because the existing
// post editor expects the function to return the image URL.

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

type CloudinaryUploadOptions = {
  folder?: string;
  maxBytes?: number;
};

async function uploadToCloudinary(
  file: File,
  options?: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  const maxBytes = options?.maxBytes ?? 5 * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(
      `Image is too large. Maximum size is ${Math.round(
        maxBytes / 1024 / 1024
      )} MB.`
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Missing Cloudinary env vars — check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local'
    );
  }

  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  if (options?.folder) {
    formData.append('folder', options.folder);
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await res.json();

  if (!data.secure_url || !data.public_id) {
    throw new Error('Cloudinary returned an invalid upload response.');
  }

  return {
    secureUrl: data.secure_url as string,
    publicId: data.public_id as string,
  };
}

/**
 * Existing post-image uploader.
 *
 * Returns ONLY the URL so existing files such as
 * app/admin/new/page.tsx continue to work.
 */
export async function uploadImageToCloudinary(
  file: File
): Promise<string> {
  const result = await uploadToCloudinary(file, {
    maxBytes: 10 * 1024 * 1024,
  });

  return result.secureUrl;
}

/**
 * Team-photo uploader helper.
 *
 * This returns both the URL and Cloudinary public ID.
 * It is intentionally separate from uploadImageToCloudinary()
 * so existing post code is not broken.
 */
export async function uploadTeamImageToCloudinary(
  file: File,
  memberId: string
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, {
    folder: `student-blog/team/${memberId}`,
    maxBytes: 5 * 1024 * 1024,
  });
}