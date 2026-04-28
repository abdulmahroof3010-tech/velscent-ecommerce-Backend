const mongoose=require("mongoose");
const imageSchema=require("./imageModel")

const productSchema=mongoose.Schema({
    name:String,
    type:String,
    ml:Number,
    original_price:Number,
    discount_percentage:{
        type:Number,
        default:0,
        min:0,
        max:100
    },
    description:String,
    image_url:[imageSchema],
    stock:{type:Number,default:0},
    soldCount:{type:Number,default:0},
    isActive:{type:Boolean,default:true}
},{timestamps:true});

const productModel=mongoose.model("Products",productSchema);

module.exports=productModel;