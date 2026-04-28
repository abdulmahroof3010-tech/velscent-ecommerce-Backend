const cartModel = require("../../Models/cartModel");
const productModel = require("../../Models/productModel");
const  calculateFinalPrice  = require("../../Utils/priceCalculator");

const getCartItems = async (req, res) => {
  try {
    let userId = req.user.userID;

    const cartData = await cartModel
      .findOne({ user: userId })
      .populate("items.product");

    if (!cartData) {
      return res
        .status(200)
        .json({ cartData: { items: [] }, count: 0,total:0, Message: "Cart is Empty" });
    }

    const count = cartData.items?.reduce((acc, item) => acc + item.quantity, 0);
    const total=cartData.items?.reduce((sum,item)=>sum + item.price * item.quantity,0)

    res
      .status(200)
      .json({ cartData: cartData, count,total, status: "success" });
  } catch (e) {
    res
      .status(500)
      .json({ Message: "Get Cart Items System Error", Error: e.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { productId } = req.params;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ Message: "Product Not Found" });
    }

    if(product.stock <1){
      return res.status(400).json({Message:"Out of Stock"})
    }

    const { salePrice, discount } = await calculateFinalPrice(product);

    const isAlreadyCart = await cartModel.findOne({
      user: userId,
     items:{$elemMatch:{product:productId}}
    });

    const MAX_LIMIT=5;

    if (isAlreadyCart) {
        const  item=isAlreadyCart.items.find((i)=>
          i.product.toString()===productId
        );

        
         
        if(item.quantity >=MAX_LIMIT){
          return res.status(400).json({Message:"Max  5 items allowed"})
        }
         if (product.stock <= item.quantity) {
        return res.status(400).json({ Message: "No more stock available" });
      }


      await cartModel.updateOne(
        {user:userId,"items.product":productId},
        {$inc:{"items.$.quantity":1}}
      );
      return res.status(200).json({Message:"Quantity increased"});
    }

     await cartModel.updateOne(
      { user: userId },
      {
        $push: {
          items: {
            product: productId,
            quantity: 1,
            price: salePrice,
            discount: discount,
          },
        },
      },
      { upsert: true },
    );

    res
      .status(200)
      .json({ Message: "Add to Cart Successfull", status: "Success" });
  } catch (e) {
    res.status(500).json({ Message: "Add to cart error", Error: e.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { productId } = req.params;

    const isAlreadyCart = await cartModel.findOne({
      user: userId,
      "items.product": productId,
    });

    if (!isAlreadyCart) {
      return res.status(404).json({ Message: "No product found In cart" });
    }

    await cartModel.updateOne(
      { user: userId },
      { $pull: { items: { product: productId } } },
    );

    res
      .status(200)
      .json({ Message: "Successfully remove from cart", status: "Success" });
  } catch (e) {
    res
      .status(500)
      .json({ Message: "Error in removeing from cart", Error: e.message });
  }
};

const increaseQuantity = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { productId } = req.params;

    const isAlreadyCart = await cartModel.findOne({
      user: userId,
      items: { $elemMatch: { product: productId, quantity: { $lt: 5 } } },
    });

    if (!isAlreadyCart) {
      return res
        .status(400)
        .json({ Message: "Item not found or quantity reached limit" });
    }

    const product=await productModel.findById(productId);

    const item=isAlreadyCart.items.find((i)=>i.product.toString()=== productId);

    if(product.stock <=item.quantity){
      return res.status(400).json({Message:"No More stock available"});
    }

    await cartModel.updateOne(
      { user: userId, "items.product": productId },
      { $inc: { "items.$.quantity": 1 } },
    );

    res.status(200).json({ Message: "Quantity increased" });
  } catch (e) {
    res
      .status(500)
      .json({ Message: "increaseing quantity error", Error: e.message });
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { productId } = req.params;

    const isAlreadyCart = await cartModel.findOne({
      user: userId,
      items:{$elemMatch:{product:productId,quantity:{$gt:1}}}
    });

    if (!isAlreadyCart) {
      return res.status(404).json({ Message: "Item not found " });
    }

    await cartModel.updateOne(
      { user: userId, "items.product": productId },
      { $inc: { "items.$.quantity": -1 } },
    );

    res.status(200).json({ Message: "Quantity decreased" });
  } catch (e) {
    res
      .status(500)
      .json({ Message: "decrease quantity error", Error: e.message });
  }
};

module.exports = {
  getCartItems,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  
};
