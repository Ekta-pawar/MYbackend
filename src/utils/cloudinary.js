import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.cloudinary_NAME,
  api_key: process.env.cloudinary_API_KEY,
  api_secret: process.env.cloudinary_API_SECRET
});
const uploadOneCloudinary=async(localFilePath) => {
 try{
    if(!localFilePath) return null;
   const response = await cloudinary.uploader.upload(localFilePath, {
resource_type: "auto",
    });
    console.log("Uploaded to Cloudinary:", response.url);
    return response;
  }catch(error){
    fs.unlinkSync(localFilePath); //remove the locally saved file as the upload operation failed
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export { uploadOneCloudinary };