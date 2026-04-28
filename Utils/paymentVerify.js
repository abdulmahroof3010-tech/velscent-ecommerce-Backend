const crypto = require("crypto");
require("dotenv").config();

const orderModel = require("../Models/orderModel");
const cartModel = require("../Models/cartModel");
const productModel=require("../Models/productModel")

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      totalAmount,
      orderSource,
      productId,   
      quantity,
      price
    } = req.body;

  
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

   
    let orderItems = [];

    //  CART ORDER
    if ((orderSource || "cart") === "cart") {
      const cart = await cartModel.findOne({ user: req.user.userID });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      orderItems = cart.items;
    }

   
    if (orderSource === "single") {
      if (!productId || !quantity || !price) {
        return res.status(400).json({
          message: "Missing product details for single order",
        });
      }

      orderItems = [
        {
          product: productId,
          quantity,
          price,
        },
      ];
    }

    const order = await orderModel.create({
      user: req.user.userID, 
      items: orderItems,     
      shippingAddress: address,
      totalAmount,

      paymentMethod: "ONLINE",
      paymentStatus: "Paid",
      orderStatus: "Confirmed",

      orderSource: orderSource || "cart",

      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });
  await productModel.bulkWrite(
  orderItems.map(item => ({
    updateOne: {
      filter: { _id: item.product._id || item.product },
      update: { $inc: { soldCount: item.quantity } }
    }
  }))
);

   
    if ((orderSource || "cart") === "cart") {
      await cartModel.updateOne(
        { user: req.user.userID },
        { $set: { items: [] } }
      );
    }

    return res.json({
      success: true,
      orderId: order._id,
    });
  } catch (e) {
    console.error("Verify Payment Error:", e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = verifyPayment;