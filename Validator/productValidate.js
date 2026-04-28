const z =require("zod");

const productValidate=z.object({
    name:z.string().trim().min(4,"Name must be atleast 4 charater").regex(/^[a-zA-Z0-9\s]+$/, "Invalid product name"),
    type:z.string().trim().min(4,"Type must be atleast 4 characters"),
    ml:z.coerce.number().positive("ML must be greater than 0"),
    original_price:z.coerce.number().positive("Price must be greater than 0"),
    discount_percentage:z.coerce.number().min(0,"Discount cannot be negative  ").max(100,"Discount cannot exceed 100").optional().default(0),
    description:z.string().trim(),
    stock:z.coerce.number().int("stock must be integer").nonnegative("Stock cannot be negative"),   


})
module.exports=productValidate;