const express=require("express");
require("dotenv").config();
const cookieParser=require("cookie-parser")
const connectDB=require("./Config/db")
const cors=require("cors");
const app=express();
const {connectRedis}=require("./Config/redis.js")
const PORT = process.env.PORT || 5000



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


app.set("trust proxy", 1);
const allowedOrigins = [
  "https://velscent.store",
  "https://www.velscent.store",
  "https://velscent-ecommerce-frontend.vercel.app",
  
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
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

  app.listen(PORT, () => {
    console.log("Server Running Sucessfully", PORT);
  });

  
  connectRedis();
}catch(e){
  console.log("Server start error:",e)
  process.exit(1);
}
};

startServer();


