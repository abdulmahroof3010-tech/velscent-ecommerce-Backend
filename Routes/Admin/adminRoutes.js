const {getAllUsers,adminBlockUser}=require("../../Controller/Admin/adminUserController");
const isAdmin=require("../../Middleware/isAdmin")
const express=require("express");
const route=express.Router();


route.get("/usersList",isAdmin,getAllUsers);
route.patch("/blockOrUnblock/:id",isAdmin,adminBlockUser);

module.exports=route