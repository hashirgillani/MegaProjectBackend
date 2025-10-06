import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;


    filepath = filepath.replace(/\\/g, "/");

    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });

    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    console.log("✅ Uploaded to Cloudinary:", response.url);
    return response;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error.message);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    return null;
  }
};


export default uploadonCloudinary;
