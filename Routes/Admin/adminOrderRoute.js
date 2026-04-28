const express=require("express");
const isAdmin=require("../../Middleware/isAdmin")
const {UpdateOrderStatus,FetchAllOrdersList,specificUserOrderList}= require("../../Controller/Admin/adminOrderController")

const route=express.Router();

route.get("/",isAdmin,FetchAllOrdersList);
route.get("/userOrder/:id",isAdmin,specificUserOrderList);
route.post("/orderStatus/:id",isAdmin,UpdateOrderStatus);

module.exports=route;