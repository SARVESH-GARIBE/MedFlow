import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload files to cloudinary (expects a local file path)
export async function uploadToCloudinary(filePath, folder) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });

    // remove the local file after uploading
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // return full result so caller can access secure_url and public_id
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

// delete an image from cloudinary if user removes it from the profile
export async function deleteFromCloudinary(publicId) {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

export default cloudinary;