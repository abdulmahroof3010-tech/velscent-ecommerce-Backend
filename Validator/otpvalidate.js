const  z=require("zod");


const verifyOtpValidate=z.object({
    email:z.string().email("Invalid email"),
    otp:z.string().length(4,"OTP must be 4 digits")
});

module.exports=verifyOtpValidate;