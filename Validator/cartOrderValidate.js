const {z}=require("zod");


const baseOrderValidate=z.object({
   

paymentMethod:z.enum(["COD", "ONLINE"],{errorMap:()=>({message:"Invalid payment method"})}),

address:z.object({
    fullName:z.string().trim().min(1,"Full name is required"),
    phone:z.string().trim().min(10,"Phone number must be at least 10 characters"),
    street:z.string().trim().min(1,"Street is required"),
    city:z.string().trim().min(1,"City is required"),
    pincode:z.string().trim().min(6,"Pincode must be at least 6 characters")
})

});

module.exports=baseOrderValidate;
