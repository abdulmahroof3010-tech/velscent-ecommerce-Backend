const express=require("express");
const {createOffer,getOffers,updateOffer,deleteOffer,toggleOffer}=require("../../Controller/Admin/adminOfferController");
const isAdmin=require("../../Middleware/isAdmin")
const route=express.Router();
const {offerValidation,updateOfferValidation}=require("../../Validator/offerValidation");
const {validate}=require("../../Middleware/validate")

route.post("/",isAdmin,validate(offerValidation),createOffer);
route.get("/",isAdmin,getOffers);
route.put("/:id",isAdmin,validate(updateOfferValidation),updateOffer);
route.delete("/:id",isAdmin,deleteOffer);
route.patch("/:id/toggle",isAdmin,toggleOffer)

module.exports=route