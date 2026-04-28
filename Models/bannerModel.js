const mongoose =require("mongoose");
const imageSchema=require("./imageModel");

const bannerSchema=mongoose.Schema({
    image:imageSchema,
    isActive :{
        type:Boolean,
        default:true
    }      

},{timestamps:true});

const bannerModel=mongoose.model("Banner",bannerSchema);

module.exports=bannerModel;