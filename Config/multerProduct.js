const multer=require("multer");
const {CloudinaryStorage}=require("multer-storage-cloudinary");
const cloudinary=require("./cloudinary");

const storage=new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"products",
        allowed_formats:["jpg", "png", "jpeg", "webp"],

    }
});

const upload=multer({
    storage,
    limits:{
        fileSize:2*1024*1024
    }
});

module.exports=upload