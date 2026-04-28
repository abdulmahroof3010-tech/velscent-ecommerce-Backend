const express=require("express");
require("dotenv").config();
const cookieParser=require("cookie-parser")
const connectDB=require("./Config/db")
const cors=require("cors");
const app=express();
const {connectRedis}=require("./Config/redis.js")
const PORT = process.env.PORT



//user route
const userRoute=require("./Routes/userRoutes.js");
const productRoute=require("./Routes/productRoutes.js");
const cartRoute=require("./Routes/cartRoutes.js");
const wishlistRoute=require("./Routes/wishlistRoutes.js");
const orderRoute=require("./Routes/orderRoute.js");
const bannerRoute=require("./Routes/bannerRoutes.js")

//admin route
const adminRoute=require("./Routes/Admin/adminRoutes.js");
const adminProductRoute=require("./Routes/Admin/adminProductRoutes.js");
const adminBannerRoute=require("./Routes/Admin/adminBannerRoute.js");
const adminOrderRoute=require("./Routes/Admin/adminOrderRoute.js")
const adminOfferRoute=require("./Routes/Admin/adminOfferRoute.js")



app.use(cors({
  origin:"http://localhost:5173", 
  credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth",userRoute);
app.use("/api/products",productRoute);
app.use("/api/cart",cartRoute);
app.use("/api/wishlist",wishlistRoute);
app.use("/api/order",orderRoute);
app.use("/api/banner",bannerRoute);

//Admin Routes 
app.use("/api/admin",adminRoute);
app.use("/api/admin/product",adminProductRoute);
app.use("/api/admin/banner",adminBannerRoute);
app.use("/api/admin/order",adminOrderRoute);
app.use("/api/admin/offers",adminOfferRoute)






    
  
const startServer = async () => {
  try{
  await connectDB();
  await connectRedis()

  app.listen(PORT, () => {
    console.log("Server Running Sucessfully", PORT);
  });
}catch(e){
  console.log("Server start error:",e)
}
};

startServer();


