const productModel=require("../../Models/productModel");
const offerModel=require("../../Models/offerModel");
const calculateFinalPrice=require("../../Utils/priceCalculator");

const getAllProductOrByType=async(req,res)=>{
    try{

    const {type,name,limit,bestSeller,sort,page}=req.query;

    const filter={isActive:true}

    if(type){
        filter.type=type;
    }
    if(name && name.trim() !==""){
        filter.name={$regex:name.trim(),$options:"i"}

    }

    

    let sortOption={};

    if(sort==="newest"){
        sortOption.createdAt=-1;
    }else if(sort==="low"){
        sortOption.original_price=1;
    }else if(sort ==="high"){
        sortOption.original_price= -1;
    }else if(sort ==="bestseller"){
        filter.soldCount={$gte:2};
        sortOption.soldCount=-1
    }

    const pageNumber=Number(page) > 0 ? Number(page) : 1;
    const limitValue=Number(limit) > 0 ? Number(limit) : 6;
    const skip=(pageNumber -1)*limitValue;


    const  productsData=await productModel.find(filter).sort(sortOption).skip(skip).limit(limitValue).lean();
    const totalCount=await productModel.countDocuments(filter);

    const offers = await offerModel.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean();

    const formattedProduct=productsData.map(product=>{ 
        const { salePrice, discount,offerName}=calculateFinalPrice(product,offers);

        return{
            ...product,
            salePrice,
            discount,
            offerName,
        }
    });

    res
    .status(200)
    .json({Message:"Product  Get successfully",Products:formattedProduct,Count:totalCount,
        page:pageNumber,totalPages:Math.ceil(totalCount/limitValue)})


    }catch(e){
         res.status(500).json({Message:"Products Fetching error in server",Error:e.message})
    }
};


const getProductById=async(req,res)=>{
    try{
        const {id}=req.params;
        const productDataById= await productModel.findById({_id:id}).lean();
        if(!productDataById){
          return   res.status(404).json({Message:`No product by this Id no: ${id}`})
        };

        const offers = await offerModel.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean();


        const {salePrice,discount,offerName}=await calculateFinalPrice(productDataById,offers)

        res.status(200).json({Message:"Successfuly product get by Id",Product:{
            ...productDataById,
            salePrice,
            discount,
            offerName,
            stockCount:productDataById.stock
        
        }});

    }catch(e){

        res.status(500).json({Message:e.message})

    }
}

module.exports={getAllProductOrByType,getProductById}