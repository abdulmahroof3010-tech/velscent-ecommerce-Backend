const express=require("express");
const {showOrderList,orderSingleProduct,orderCartProduct,cancelOrderController}=require("../Controller/user/orderController")
const protectRouter=require("../Middleware/protectRouter");
const verifyPayment=require("../Utils/paymentVerify")
const route=express.Router();


route.get("/",protectRouter,showOrderList)
route.post("/single",protectRouter,orderSingleProduct)
route.post("/cart",protectRouter,orderCartProduct)
route.patch("/cancel/:id",protectRouter,cancelOrderController);
route.post("/verify-payment",protectRouter,verifyPayment)

module.exports=route

