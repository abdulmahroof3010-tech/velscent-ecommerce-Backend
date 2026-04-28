const jwt=require("jsonwebtoken");
require("dotenv").config();

const buildTokenPayload=(email,userID,role)=>({
    Email:email,
    Id:userID,
    role,
});

const generateToken=(email,userId,role)=>{
    const payload=buildTokenPayload(email,userId,role);

    const AccessToken=jwt.sign(payload,process.env.ACCESS_TOKEN_KEY,{expiresIn:"15m"});
    
    const RefreshToken= jwt.sign(payload,process.env.REFRESH_TOKEN_KEY,{expiresIn:"7d"});

    return {RefreshToken,AccessToken};

}

module.exports=generateToken;
