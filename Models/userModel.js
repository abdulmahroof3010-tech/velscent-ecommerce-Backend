const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
    role:{
        default:"user",
        enum:["user","admin"],
        type:String
    },
    name:String,
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        select:false
     },
     address:{
        name:String,
        number:String,
        address:String,
        city:String,
        pincode:Number
    },
    isBlocked:{
        default:false,
        type:Boolean

    }

    
},{timestamps:true}
);

const userModel=mongoose.model("User",userSchema);
module.exports=userModel;