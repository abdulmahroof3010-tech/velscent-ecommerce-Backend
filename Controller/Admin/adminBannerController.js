const bannerModel=require("../../Models/bannerModel");
const cloudinary=require("../../Config/cloudinary")

const addBanner=async(req,res)=>{
    try{

        const file= req.file;

        if(!file){
            return res.status(400).json({message:"Image required"});
        };

        const banner=await bannerModel.create({
            image:{
                url:file.path,
                public_id:file.filename
            }
        });

        res.status(201).json({message:"Banner Added",banner})
  
  
    }catch(e){
       res.status(500).json({error:e.message})
    }
}

const adminGetBanner=async(req,res)=>{
    try{
        const banners=await bannerModel.find();

        res.status(200).json(banners)
    }catch(e){
        res.status(500).json({error:e.message})
    }
}

const adminBannerActiveHandling=async(req,res)=>{
    try{

        const { id } =req.params;

        const banner=await bannerModel.findById(id);

        if(!banner){
            return res.status(404).json({message:"Banner not Found"})
        }

        banner.isActive=!banner.isActive;
        await banner.save();

        res.status(200).json({message:"Banner status Updated",banner})

    }catch(e){

        res.status(500).json({error:e.message})
    }
}

const deleteBanner=async(req,res)=>{
    try{
        const {id}=req.params;

        const banner=await bannerModel.findById(id);

        if(!banner){
            return res.status(404).json({message:"Banner not found"})
        }

        if(banner.image?.public_id){
        await cloudinary.uploader.destroy(banner.image.public_id);
        }
        await bannerModel.findByIdAndDelete(id);

        res.status(200).json({message:"Banner deleted"})
   
    }catch(e){
        res.status(500).json({error:e.message})
    }

};


module.exports={addBanner,adminGetBanner,adminBannerActiveHandling,deleteBanner}