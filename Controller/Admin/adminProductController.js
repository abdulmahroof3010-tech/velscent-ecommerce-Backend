const productModel=require("../../Models/productModel");
const calculateFinalPrice=require("../../Utils/priceCalculator");
const cloudinary=require("../../Config/cloudinary");
const offerModel=require("../../Models/offerModel")


const adminGetProducts=async(req ,res)=>{
    try{
        const {name,type,limit,isActive,page=1}=req.query;

        const filter={};

        if(type){
            filter.type=type;

        }

        if(isActive !==undefined){
            filter.isActive=isActive==="true"
        }

        if(name && name.trim() !==""){
            filter.name={$regex:`${name}`,$options:"i"};
        }

        
        const  parsedPage=Number(page)>0?Number(page):1;
        const skip=(parsedPage-1)* Number(limit)
        
        const productsData=await productModel.find(filter).skip(skip).limit(limit?Number(limit):0).lean();
        const totalCount=await productModel.countDocuments(filter);

        const offers = await offerModel.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean();
       
        const formattedProduct=productsData.map(product=>{ 
            const { salePrice, discount,offerName}= calculateFinalPrice(product,offers);

            const stockStatus=product.stock=== 0?"Out of Stock" : product.stock <5 ? "Low Stock" :  "In Stock";
            
        return{
            ...product,
            salePrice,
            discount,
            offerName,
            stockStatus,
        }
    });
    

    res.status(200).json({Message:"Products Get successfully",Product:formattedProduct,Count:totalCount,Page:parsedPage});
    }catch(e){
        res.status(500).json({Message:"Products Fetching error in server",Error:e.message})


    }
}


const getSpecificProduct=async(req,res)=>{
    try{
        const { id } =req.params;

         if (!id) {
      return res.status(400).json({ Error: "No product Id" });
    }

        const productDataById=await   productModel.findById(id);

        if (!productDataById) {
      return res.status(404).json({ Error: "Product not found" });
    }
        const offers = await offerModel.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean();

    const { salePrice, discount, offerName } =
      calculateFinalPrice(productDataById, offers);

        res.status(200).json({Status:"success",Product:{...productDataById,salePrice, discount, offerName,}})
    }catch(e){
        res.status(e.status ||500).json({Error:e.message})
    }
}


const addProduct=async(req,res)=>{
    try{

        const {name,type,
            ml,original_price,
             discount_percentage,
              description,
              stock
        }=req.body;

       

        const existing=await productModel.findOne({name});
        if(existing){
            return res.status(400).json({Message:"Product already exists"})
        };

        if(!req.file){
            return res.status(400).json({Message:"Image  is required"})
        }

       const image_url = [{
         url: req.file.path,
      public_id: req.file.filename
    }]
   
       
     
        if(image_url.length===0){
            return res.status(400).json({Message:"Image is required"})
        }

        const product=await productModel.create({
            name,type,
            ml,original_price,
             discount_percentage,
              description,
              image_url,
              stock
        })

        res.status(201).json({Message:"Product added successfully",product});

    }catch(e){
        res.status(500).json({Error:e.message})
    }
}




const editProduct=async(req,res)=>{
    try{

        const {id}=req.params;
        const {name,
            type,
            ml,
            original_price,
             discount_percentage,
              description,
              stock
            }=req.body;

            const product=await productModel.findById(id);
            if(!product){
                return res.status(404).json({Message:"Product not found"})
            }

            if(name){
                const existing=await productModel.findOne({
                    name,
                    _id:{$ne:id}
                });

                if(existing){
                    return res.status(400).json({message:"Product name already exists"});
                }
            }

            let image_url=product.image_url;

            if(req.file){
                for(let img of product.image_url){
                    await  cloudinary.uploader.destroy(img.public_id)
                }

               image_url = [
        {
          url: req.file.path,
          public_id: req.file.filename,
        },
      ];
            }


            const updated=await productModel.findByIdAndUpdate(id,{
                name:name?? product.name,
                type:type ?? product.type,
                ml:ml ?? product.ml,
                original_price:original_price ?? product.original_price,
                discount_percentage: discount_percentage ?? product.discount_percentage,
                description : description ?? product.description,
                stock:stock ?? product.stock,
                image_url

            },{new:true});

            res.status(200).json({Message:"Product Updated Successfully",product:updated})

        }catch(e){
            res.status(500).json({Error:e.message})


        }
};


const productActiveHandling=async(req,res)=>{
    try{
        const {id}=req.params;

        if(!id){
            return res.status(400).json({Error:"No product Id"})
        }

        const product=await productModel.findById(id);
        if(!product){
            return res.status(404).json({Error:"No product found"})
        }

        product.isActive=!product.isActive;
        await product.save();

        res.status(200).json({Status:"success",Message:"Product status updated successfully",isActive:product.isActive})

    }catch(e){
        res.status(500).json({Error:e.message})
    }
}


const getCategories = async (req, res) => {
  try {
    const categories = await productModel.distinct("type");
    
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





module.exports={adminGetProducts,getSpecificProduct,addProduct,editProduct,productActiveHandling,getCategories};



