import { uploadTeamImageToCloudinary } from '@/lib/cloudinary';

export async function uploadTeamPhoto(
  file: File,
  memberId: string
) {
  const result = await uploadTeamImageToCloudinary(
    file,
    memberId
  );

  return {
    url: result.secureUrl,
    publicId: result.publicId,
  };
}