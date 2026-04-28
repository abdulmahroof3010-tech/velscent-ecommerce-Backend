const z=require("zod");

const loginValidate=z.object({
    email:z.string().email(),
    password:z.string().min(5)
})

module.exports=loginValidate;