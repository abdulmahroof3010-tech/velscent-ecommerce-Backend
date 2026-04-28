const express=require("express");
const route=express.Router();
const {getAllProductOrByType,getProductById}=require("../Controller/user/productController");
const {productDetailLimiter,productListLimiter}=require("../Middleware/rateLimiter")


route.get("/",getAllProductOrByType);
route.get("/:id",getProductById);

module.exports=route;