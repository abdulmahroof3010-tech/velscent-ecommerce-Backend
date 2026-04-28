const {z}= require("zod");
const baseOrderValidate=require("./cartOrderValidate");

const singleOrderValidate=baseOrderValidate.extend({
     productId:z.string().min(1,"Product ID is required"),


quantity:z.number({invalid_type_error:"Quantity must be a number"}).min(1,"Quantity must be at least 1"),
})

module.exports=singleOrderValidate;