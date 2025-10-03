import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
        });
    

        const uploadonCloudinary = async(filepath)=>{
            try {
                if (!filepath) return null
                // upload file 
                const response = await cloudinary.uploader.upload(filepath, {
               resource_type: "auto",
                })

                fs.unlinkSync(filepath)// delete file from temp folder
                return response
            } 
            
            catch (error) {
                fs.unlinkSync(filepath) //delete file from temp folder
                return null
            }
        }

export default uploadonCloudinary;