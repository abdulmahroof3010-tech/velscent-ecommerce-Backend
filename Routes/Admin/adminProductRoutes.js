const express=require("express");
const isAdmin=require("../../Middleware/isAdmin")
const {adminGetProducts,getSpecificProduct,addProduct,editProduct,productActiveHandling,getCategories   }=require("../../Controller/Admin/adminProductController")
const upload=require("../../Config/multerProduct");
const {validate}=require("../../Middleware/validate")
const productValidate=require("../../Validator/productValidate")


const route=express.Router();


route.get("/",isAdmin,adminGetProducts);
route.get("/categories",isAdmin,getCategories)
route.get("/:id",isAdmin,getSpecificProduct);
route.post("/",isAdmin,upload.single("image"),validate(productValidate),addProduct);
route.put("/:id",isAdmin,upload.single("image"),editProduct);
route.patch("/:id/status",isAdmin,productActiveHandling);


module.exports=route;