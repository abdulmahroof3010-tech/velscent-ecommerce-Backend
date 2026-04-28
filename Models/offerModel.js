const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    discount_percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    applicableType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

offerSchema.index({
  applicableType: 1,
  isActive: 1,
  startDate: 1,
  endDate: 1
});

module.exports = mongoose.model("Offer", offerSchema);