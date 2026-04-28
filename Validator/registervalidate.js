const z=require("zod");

const registerValidate=z.object({
    name:z.string().min(4),
    email:z.string().email(),
    password:z.string().min(5)
});

module.exports=registerValidate;