
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs-extra'

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadImage = async (filePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "api-nocountry/users",
      quality: 70,
      format: "webp",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Image upload failed");
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (fsError) {
      console.warn("No se pudo eliminar el archivo temporal:", fsError);
    }
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const parts = url.split("/");
    const publicIdWithExt = parts.slice(parts.indexOf("upload") + 2).join("/");

    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    throw new Error('Image deletion failed')
  }
}
