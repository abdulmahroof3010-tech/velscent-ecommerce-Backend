const orderModel = require("../../Models/orderModel");
const cartModel=require("../../Models/cartModel")
const productModel=require("../../Models/productModel")
const cardOrderValidate=require("../../Validator/cartOrderValidate");
const singleOrderValidare=require("../../Validator/singleOrderValidate")
const calculateFinalPrice = require("../../Utils/priceCalculator");
const razorpay=require("../../Config/razorPay");


const orderSingleProduct = async(req, res) => {
  
  try {
    
    const userId = req.user.userID;
   
    const result=singleOrderValidare.safeParse(req.body);

     if(!result.success){
      return res.status(400).json({
        Message: result.error.errors[0].message,
      });
    
     }

     const {productId,quantity,address,paymentMethod}=result.data;

    const cleanAddress={
      name:address.fullName,
      phonenumber:address.phone,
      address:address.street,
      city:address.city,
      pincode:address.pincode 
    }

    const product=await productModel.findOneAndUpdate(
      {_id:productId,stock:{$gte:quantity}},
      {$inc:{stock: -quantity}},
      {new :true}
    )
    if (!product) {
      return res.status(404).json({ Message: "Product not found or insufficient stock" });
    }




    const { salePrice } = await calculateFinalPrice(product);

    const totalAmount = salePrice * quantity;
  
    if(paymentMethod ==="COD"){
      const order=await orderModel.create({
        user:userId,
        items:[{product:productId,quantity,price:salePrice}],
        shippingAddress:cleanAddress,
        totalAmount,
        paymentMethod:"COD",
        orderStatus:"Pending",
        paymentStatus:"Pending"
      });
      return res.status(200).json({Message:"Order Placed",orderId:order._id})
    }

    if(paymentMethod ==="ONLINE"){
       const razorpayOrder=await razorpay.orders.create({
          amount:totalAmount *100,
          currency:"INR",
          receipt:`temp_${Date.now()}`
        });


      return res.status(200).json({
        success:true,
        
        razorpayOrder,
        key:process.env.RAZORPAY_KEY_ID,

         orderData: {
               productId,
              quantity,
             price: salePrice,
            address: cleanAddress,
           totalAmount,
              orderSource: "single"
    }
      })
    }

    res
      .status(400)
      .json({ Message: "Invalid payment method"});
  } catch (err) {
    res.status(500).json({
     Message: err.message,
     
    });
  }
};

const orderCartProduct = async (req, res) => {
  try {
    const userId = req.user.userID;

    const result=cardOrderValidate.safeParse(req.body);

    if(!result.success){
       return res.status(400).json({
        Message: result.error.errors[0].message,
      });
    }



    const { address, paymentMethod } = result.data;;

    const cart = await cartModel
      .findOne({ user: userId })
      .populate("items.product");
    

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ Message: "cart is empty" });
    };

    
    const cleanAddress={
      name:address.fullName,
      phonenumber:address.phone,
      address:address.street,
      city:address.city,
      pincode:address.pincode 
    }

    let totalAmount=0;
    const orderItems=[];

    for (const item of cart.items){
      const updatedProduct=await productModel.findOneAndUpdate(
        {_id:item.product._id,stock:{$gte:item.quantity}},
        {$inc:{stock: -item.quantity}},
        {new :true}
      );

      if(!updatedProduct){
        return res.status(404).json({Message:`Product ${item.product.name} is out of stock .`})
      };

      const {salePrice} = await calculateFinalPrice(updatedProduct);

      totalAmount +=salePrice *item.quantity;

      orderItems.push({
        product:item.product._id,
        quantity:item.quantity,
        price:salePrice
      });

    }

    if(paymentMethod ==="COD"){
      const order=await orderModel.create({
      user: userId,
      items: orderItems,
      shippingAddress: cleanAddress,
      totalAmount,
      paymentMethod:"COD",
      orderStatus: "Pending",
      paymentStatus: "Pending",
    });

    await cartModel.updateOne({user:userId},{$set:{items:[]}});

    return res.status(200).json({Message:"Order Placed Successfully",orderId:order._id});

  }

  if(paymentMethod==="ONLINE"){

  const razorpayOrder=await razorpay.orders.create({
    amount:Math.round(totalAmount * 100),
    currency:"INR",
    receipt:`temp_${Date.now()}`

  });



  return res.status(200).json({success:true,razorpayOrder,key:process.env.RAZORPAY_KEY_ID,
     orderData: {
      items: orderItems,
      address: cleanAddress,
      totalAmount,
      orderSource: "cart"
    }
  })

}

    res.status(400).json({Message: "Invalid payment Method" });
  } catch (err) {
    res.status(500).json({
      Message: "Error in cart order",
      Error: err.message,
    });
  }
};

const showOrderList = async (req, res) => {
  try {
    const userId = req.user.userID;

    const orderData = await orderModel
      .find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 })
      .lean();

    if (orderData.length === 0) {
      return res.status(200).json({ Message: "Order list is empty" });
    }
    res.status(200).json({ orderData: orderData, status: "success" });
  } catch (e) {
    res
      .status(500)
      .json({ Message: "Error in showOrderList", Error: e.message });
  }
};

const cancelOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userID;

    const order = await orderModel.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({ Message: "Order not found" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(409).json({ Message: "order is already cancelled" });
    }

    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      return res
        .status(403)
        .json({
          Message: "Order cannot cancel that is already shipped or deliverd ",
        });
    }

    for(const item of order.items){
      await productModel.updateOne(
        {_id:item.product},
        {$inc:{stock:item.quantity}}
      );
    }



    await orderModel.updateOne(
      { _id: id },
      { $set: { orderStatus: "Cancelled", paymentStatus: "Failed" } },
    );

    res.status(200).json({ Message: "Order cancelled successfully"});
  } catch (e) {
    res.status(500).json({ Message: "Cancelled failed" });
  }
};

module.exports = {
  showOrderList,
  orderSingleProduct,
  orderCartProduct,
  cancelOrderController,
};
