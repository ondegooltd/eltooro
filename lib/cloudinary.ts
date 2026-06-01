import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: Buffer,
  folder: string
): Promise<{
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `iherb/${folder}`,
          transformation: [
            { width: 800, height: 800, crop: "limit", quality: "auto" },
            { format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              width: result.width || 0,
              height: result.height || 0,
            });
          } else {
            reject(new Error("Upload failed"));
          }
        }
      )
      .end(file);
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
