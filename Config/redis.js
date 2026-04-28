const {createClient}=require("redis");

const client=createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

client.on("error",(err)=>console.log("Redis error:",err));

async function connectRedis(){
    try{
 await client.connect();
 console.log("Redis connected successfully")
    }catch(e){
        console.log("redis connection fail",e.message)
    }
}

module.exports={client,connectRedis};