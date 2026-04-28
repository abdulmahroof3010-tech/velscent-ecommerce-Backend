const mongoose = require("mongoose");
const orderModel = require("../../Models/orderModel");
const productModel = require("../../Models/productModel");

const specificUserOrderList = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("No user Id");
      err.status = 400;
      throw err;
    }

    const orderData = await orderModel
      .find({ user: id })
      .populate("items.product")
      .sort({ createAt: -1 })
      .lean();

    if (orderData.length === 0) {
      const err = new Error("Order is Empty");
      err.status = 404;
      throw err;
    }

    res.status(200).json({ orderData: orderData, status: "success" });
  } catch (e) {
    res.status(e.status || 500).json({ Error: e.message });
  }
};

const FetchAllOrdersList = async (req, res) => {
  try {
    const { name, status } = req.query;

    const filter = {};
    if (status) {
      filter.orderStatus = status;
    }

    const orders = await orderModel
      .find(filter)
      .populate({
        path: "user",
        match: name ? { firstName: { $regex: name, $options: "i" } } : {},
      })
      .populate("items.product")
      .sort({ createAt: -1 })
      .lean();

    const amountStatus = await orderModel.aggregate([
      {
        $group: {
          _id: null,

          Paid: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0],
            },
          },

          Pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$paymentStatus", "Pending"] },
                    { $ne: ["$orderStatus", "Cancelled"] },
                  ],
                },
                "$totalAmount",
                0,
              ],
            },
          },

          Failed: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Failed"] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]);

    const filteredOrders = orders.filter((o) => o.user);

    if (filteredOrders.length === 0) {
      return res.status(200).json({ Message: "order List Is Empty" });
    }

    res
      .status(200)
      .json({
        orderData: filteredOrders,
        AmountStatus: amountStatus,
        status: "success",
      });
  } catch (e) {
    res
      .status(500)
      .json({ Message: "Error in FetchAllOrdersList", Error: e.message });
  }
};

const UpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ Error: "No order Id" });
    }

    const orderData = await orderModel.findById(id);

    if (!orderData) {
      return res.status(404).json({ Error: "No order found" });
    }

    orderData.orderStatus = status;

    if (status === "Delivered"  && orderData.orderStatus !=="Delivered") {
      orderData.paymentStatus = "Paid";
      await productModel.bulkWrite(
        orderData.items.map(item=>({
          updateOne:{
            filter:{_id:item.product},
            update:{$inc:{soldCount:item.quantity}}
          }
        }))
      )
    } else if (status === "Cancelled") {
      orderData.paymentStatus = "Failed";
    } else if (status === "Shipped" || status === "Pending") {
      if (orderData.paymentMethod === "COD") {
        orderData.paymentStatus = "Pending";
      }
    }

    await orderData.save();

    res
      .status(200)
      .json({ Status: "Success", Message: "Status Updated Successfully" });
  } catch (e) {
    res.status(500).json({ Error: e.message });
  }
};

module.exports = {
  UpdateOrderStatus,
  FetchAllOrdersList,
  specificUserOrderList,
};
