const jwt=require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../Models/userModel");

const protectRoutes=async(req,res,next)=>{
    try{
        
        let token=req.cookies?.Access_Token
        
        if(!token){
        return res.status(401).json({Message:"Unauthorized,Please Login First"});
        }
        const  decode=jwt.verify(token,process.env.ACCESS_TOKEN_KEY);

           const user = await userModel.findById(decode.Id);

           if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

     if (user.isBlocked) {
      return res.status(403).json({ message: "Access denied. You are blocked by admin." });
    }

        req.user={
            Email:user.email,
            userID:user._id,
            role:user.role ,
            isBlocked: user.isBlocked,
        };
        next();

    }catch(e){

        res.status(401).json({message:"Protect Router Issue",Error:e.message});

    }
};

module.exports=protectRoutes;