import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function uploadTeamPhoto(file: File, memberId: string) {
  const result = await uploadImageToCloudinary(file, {
    folder: `student-blog/team/${memberId}`,
    maxBytes: 5 * 1024 * 1024,
  });

  return {
    url: result.secureUrl,
    publicId: result.publicId,
  };
}
