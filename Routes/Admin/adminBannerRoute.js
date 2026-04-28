const express=require("express");
const isAdmin=require("../../Middleware/isAdmin");
const bannerUpload=require("../../Config/banneruUpload")

const {addBanner,adminGetBanner,adminBannerActiveHandling,deleteBanner}=require("../../Controller/Admin/adminBannerController")

const route=express.Router();


route.get("/",isAdmin,adminGetBanner);
route.post("/addBanner",isAdmin,bannerUpload.single("image"),addBanner);
route.patch("/:id/toggle",isAdmin,adminBannerActiveHandling);
route.delete("/:id",isAdmin,deleteBanner);

module.exports=route
