const express=require("express");
const route=express.Router();
const {wishlistToggle,getWishlistData}=require("../Controller/user/wishlistController");
const protectRoutes=require("../Middleware/protectRouter");


route.get("/",protectRoutes,getWishlistData);
route.patch("/:productId",protectRoutes,wishlistToggle);



module.exports=route;

