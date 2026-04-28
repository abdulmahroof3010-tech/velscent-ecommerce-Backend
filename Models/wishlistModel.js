const mongoose=require("mongoose");


const wishlistSchem=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    items:{
        type:[
            {
                product:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Products"
                },
            },
        ],
    }
},{timestamps:true});

const wishlistModel=mongoose.model("Wishlist",wishlistSchem);

module.exports=wishlistModel
