const express=require("express");
const route=express.Router();
const {getCartItems,addToCart,removeFromCart,increaseQuantity,decreaseQuantity}=require("../Controller/user/cartController");
const protectRoutes=require("../Middleware/protectRouter");



route.get("/",protectRoutes,getCartItems);
route.post("/add/:productId",protectRoutes,addToCart);
route.patch("/remove/:productId",protectRoutes,removeFromCart);
route.patch("/increase/:productId",protectRoutes,increaseQuantity);
route.patch("/decrease/:productId",protectRoutes,decreaseQuantity);


module.exports=route;

