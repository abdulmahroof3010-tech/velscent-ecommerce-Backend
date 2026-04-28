const mongoose=require("mongoose");

const cartSchema=mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    items:[
        {
        product:{ 
            type:mongoose.Schema.Types.ObjectId,
           ref:"Products"
    },
    quantity:{
        type:Number,
        default:1,
        require:true
    },
    price:Number,
    discount:Number

    }
]
},
{timestamps:true});

const  cartModel=mongoose.model("carts",cartSchema);

module.exports=cartModel;