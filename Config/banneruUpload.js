const multer=require("multer");
const {CloudinaryStorage}=require("multer-storage-cloudinary");
const cloudinary=require("./cloudinary");

const storage=new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"banners",
        allowed_formats:["jpg", "png", "jpeg", "webp"]
    }
});

const bannerUpload=multer({
    storage,
    limits:{
        fileSize:5*1024*1024
    }
});

module.exports=bannerUpload;