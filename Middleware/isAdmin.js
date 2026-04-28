const jwt= require("jsonwebtoken");
const userModel=require("../Models/userModel");
require("dotenv").config();

const isAdmin=async(req ,res,next)=>{
        try{
            let token=req.cookies?.Access_Token;

            if(!token && req.headers.authorization?.startsWith("Bearer ")){
                token=req.headers.authorization.split(" ")[1];

            }

            if(!token){
                const err=new Error("Unauthorized, please login first");
                err.status=401;
                throw err
            }

            const decode= jwt.verify(token,process.env.ACCESS_TOKEN_KEY)
            const admin=await userModel.findById(decode.Id);
            if(!admin){
                const err =new Error("Admin not found");
                err.status=401;
                throw err
            }

            if(admin.role !=="admin"){
                const err=new Error("Access Reject.Admin only");
                err.status=401
                throw err
            }

            next();
        }catch(e){
            res.status(e.status ||401).json({Error:e.message    })
        }
}

module.exports=isAdmin;