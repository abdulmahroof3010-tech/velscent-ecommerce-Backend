const wishlistModel=require("../../Models/wishlistModel");


const getWishlistData=async(req,res)=>{
    try{
        const userId=req.user.userID;

        const wishlistData=await wishlistModel.findOne({user:userId}).populate("items.product").lean();

        if(!wishlistData ||wishlistData?.items?.length===0){
            return res.status(200).json({Message:"wishlist is Empty"});
        }

        res.status(200).json({WishlistData:wishlistData,Status:"Success"})

    }catch(e){

        res.status(500).json({Message:"Error in getWishListData Function",Error:e.message});

    }

};


const wishlistToggle=async(req,res)=>{
    try{

        let userId=req.user.userID;
        let {productId}=req.params;

        let exist=await wishlistModel.findOne({ user:userId,"items.product":productId});

        if(exist){
            await wishlistModel.updateOne({user:userId,"items.product":productId},{$pull:{items:{product:productId}}});

            return res.status(200).json({Message:"Remove product from wishlist"})
        }

        await wishlistModel.updateOne({user:userId},{$addToSet:{items:{product:productId}}},{upsert:true});

        res.status(200).json({Message:"item addto wishlist"})

    }catch(e){
        res.status(500).json({Message:"error in wishlist function",Error:e.message})

    }
}

module.exports={wishlistToggle,getWishlistData};

