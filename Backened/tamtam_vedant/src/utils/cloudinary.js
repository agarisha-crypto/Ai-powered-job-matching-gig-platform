import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
    try {
        if(!filePath) return null
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type: "auto",
        });
        console.log("Image uploaded to Cloudinary successfully");
        if(filePath !== "public/default_profile_picture.png")
            {
             fs.unlinkSync(filePath);
            }
        return response;
    } catch (error) {
        fs.unlinksync(filePath)
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image");
    }};


export {uploadToCloudinary};