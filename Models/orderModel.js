const mongoose=require("mongoose");
const Razorpay = require("razorpay");


const orderSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },

    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Products",
                require:true
            },
            quantity:{
                type:Number,
                require:true,
                default:1
            },
            price:{
                type:Number,
                require:true
            }
        }
    ],

    shippingAddress:{
        name:String,
        phonenumber:String,
        pincode:Number,
        address:String,
        city:String,
        state:String

    },

    totalAmount:{
        type:Number,
        require:true
    },

    orderSource:{
        type:String,
        enum:["single","cart"],
        default:"single"
    },

    paymentMethod:{
        type:String,
        enum:["COD","ONLINE"],
        require:true
    },

    paymentStatus:{
        type:String,
        enum:["Pending","Paid","Failed"],
        default:"Pending"

    },
    razorpay:{
        type:{
            orderId:String,
            paymentId:String,
            signature:String,
        },
        default:null
    },

    orderStatus:{
        type:String,
        enum:["Pending", "Shipped", "Delivered", "Confirmed", "Cancelled"],
        default:"Pending"
    }

},{timestamps:true}
);

const orderModel=mongoose.model("order",orderSchema);

module.exports=orderModel;