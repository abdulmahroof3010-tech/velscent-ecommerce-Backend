const userModel = require("../../Models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const userData = await userModel.aggregate([
      { $match: { role: "user" } },

      {
        $lookup: {
          from: "carts",
          localField: "_id",
          foreignField: "user",
          as: "cartData",
        },
      },

      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "user",
          as: "wishlistData",
        },
      },

      {
        $addFields: {
          cartCount: {
            $sum: {
              $map: {
                input: "$cartData",
                as: "cart",
                in: { $size: { $ifNull: ["$$cart.items", []] } },
              },
            },
          },
          wishlistCount: {
            $sum: {
              $map: {
                input: "$wishlistData",
                as: "wish",
                in: { $size: { $ifNull: ["$$wish.items", []] } },
              },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      UserData: userData,
    });
  } catch (e) {
    res.status(e.status || 500).json({ Error: e.message });
  }
};

const adminBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      const err = Error("No User ID");
      err.status = 400;
      throw err;
    }

    const user = await userModel.findById(id);

    if (!user) {
      const err = Error("User not found");
      err.status = 404;
      throw err;
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res
      .status(200)
      .json({
        Message: user.isBlocked
          ? "User Blocked  successfully"
          : "User unBlocked successfully ",
        userData: user,
      });
  } catch (e) {
    res.status(e.status || 500).json({ Message: e.message });
  }
};

module.exports = { getAllUsers, adminBlockUser };
