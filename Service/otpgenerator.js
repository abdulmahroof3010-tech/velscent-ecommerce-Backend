const {client}=require("../Config/redis");
const transporter=require("../Config/nodemailer");
const generateOtp=require("../Utils/otp");
require("dotenv").config();
const ejs=require("ejs");
const path=require("path")




const sendOtp=async(email)=>{
    try{
        const otp=generateOtp();
        

        await client.set(`otp:${email}`,otp,{EX:60});

        const templatePath=path.join(__dirname,"templates","otpTemplate.ejs");

        const html=await ejs.renderFile(templatePath,{otp});


        

         

        await transporter.sendMail({
            from:` "VELSCENT" <${process.env.EMAIL_NAME}>`,
            to:email,
            subject:"Your OTP Code",
            html:html
    
        })

        return {success:true};

    }catch(e){
        
        console.log("Send OTP Error",e);
        return{success:false,message:"Failed to send OTP"}

    }
};


const verifyOTP=async(email,userOtp)=>{
    try{
        const storedOtp= await client.get(`otp:${email}`);
       

        if(!storedOtp){
            return {success:false}
        }

        if(storedOtp===userOtp){
            await client.del(`otp:${email}`);
            return {success:true}
        }

        return {success:false}

    }catch(e){
        console.log("Verify OTP Error:",e);
        return {success:false,message:"Something went wrong"};


    }
}

module.exports={sendOtp,verifyOTP};