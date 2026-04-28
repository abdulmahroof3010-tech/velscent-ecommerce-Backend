const mongoose= require("mongoose")

const imageSchema=mongoose.Schema({
    url:String,
    public_id:String
},{_id:false});

module.exports=imageSchema;