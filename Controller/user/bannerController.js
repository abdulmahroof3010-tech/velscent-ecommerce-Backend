const bannerModel=require("../../Models/bannerModel");

const getBanner=async(req,res)=>{
    try{
        const banner=await bannerModel.find({isActive:true});

        res.json(banner)
    }catch(e){
        res.status(500).json({Error:e.message})
    }
}

module.exports=getBanner;