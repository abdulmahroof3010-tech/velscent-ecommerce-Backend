const express=require("express");
const getBanner=require("../Controller/user/bannerController");

const route=express.Router();


route.get("/",getBanner);

module.exports=route;