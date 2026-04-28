const jwt=require("jsonwebtoken");



const tokenRegenerator=(req,res)=>{
    try{
        
        let token=req.cookies?.Refresh_Token ;

        if(!token){
            return res.status(401).json({message:"No Refresh_Token Founded"});
        }

        const decode=jwt.verify(token,process.env.REFRESH_TOKEN_KEY);
        
        const role=decode.role??decode.user;

        const AccessToken=jwt.sign({Email:decode.Email,Id:decode.Id,role},process.env.ACCESS_TOKEN_KEY,{expiresIn:"15m"});

        const RefreshToken=jwt.sign({Email:decode.Email,Id:decode.Id,role},process.env.REFRESH_TOKEN_KEY,{expiresIn:"7d"});

        res
        .cookie("Access_Token",AccessToken,{sameSite:"lax",secure:false,httpOnly:true})
        .cookie("Refresh_Token",RefreshToken,{sameSite:"lax",secure:false,httpOnly:true})
        .json({Message:"SuccessFuly Regenrator Access_Token" })

    }catch(e){
        res.status(401).json({Message:"Refresh Token expired"});
    }
};

module.exports=tokenRegenerator;