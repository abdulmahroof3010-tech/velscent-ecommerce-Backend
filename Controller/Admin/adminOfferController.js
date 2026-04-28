const offerModel = require("../../Models/offerModel");
const mongoose = require("mongoose");


const createOffer = async (req, res) => {
  try {
    const { name, discount_percentage, applicableType, startDate, endDate } = req.body;

    // startDate & endDate are already Date objects (transformed by Zod middleware)
    const start = new Date(startDate);
    const end = new Date(endDate);

    const existing = await offerModel.findOne({
      applicableType,
      isActive: true,
      startDate: { $lte: end },
      endDate: { $gte: start }
    });

    if (existing) {
      return res.status(400).json({
        message: "An active offer already exists for this type in this period"
      });
    }

    const offer = await offerModel.create({
      name,
      discount_percentage,
      applicableType,
      startDate: start,
      endDate: end,
      isActive: true
    });

    res.status(201).json({ message: "Offer created", offer });

  } catch (e) {
    console.error("CREATE OFFER ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};


const getOffers = async (req, res) => {
  try {
    const offers = await offerModel.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ message: "Offers fetched successfully", offers });
  } catch (e) {
    console.error("GET OFFERS ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};


const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId before hitting DB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }

    const {
      name,
      discount_percentage,
      applicableType,
      startDate,
      endDate,
      isActive
    } = req.body;

    const offer = await offerModel.findById(id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const checkType  = applicableType  || offer.applicableType;
    // FIX: always convert to Date — req.body may send strings (PUT requests bypass Zod transform for optional fields)
    const checkStart = startDate  ? new Date(startDate)  : new Date(offer.startDate);
    const checkEnd   = endDate    ? new Date(endDate)    : new Date(offer.endDate);

    // Only check overlap if the resulting offer would be active
    const willBeActive = isActive !== undefined ? isActive : offer.isActive;

    if (willBeActive) {
      const existing = await offerModel.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(id) },
        applicableType: checkType,
        isActive: true,
        startDate: { $lte: checkEnd },
        endDate:   { $gte: checkStart }
      });

      if (existing) {
        return res.status(400).json({
          message: "Another active offer exists for this type in this period"
        });
      }
    }

    // FIX: store as Date objects, not raw strings
    offer.name                = name               ?? offer.name;
    offer.discount_percentage = discount_percentage ?? offer.discount_percentage;
    offer.applicableType      = applicableType      ?? offer.applicableType;
    offer.startDate           = startDate  ? new Date(startDate)  : offer.startDate;
    offer.endDate             = endDate    ? new Date(endDate)    : offer.endDate;
    offer.isActive            = isActive   !== undefined ? isActive : offer.isActive;

    await offer.save();

    res.status(200).json({ message: "Offer updated", offer });

  } catch (e) {
    console.error("UPDATE OFFER ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};


const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // FIX: validate ObjectId to avoid CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }

    const deleted = await offerModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({ message: "Offer deleted successfully" });

  } catch (e) {
    console.error("DELETE OFFER ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};


const toggleOffer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const offer = await offerModel.findById(id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Only check overlap when activating (inactive → active)
    if (!offer.isActive) {
      const existing = await offerModel.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(id) },
        applicableType: offer.applicableType,
        isActive: true,
        startDate: { $lte: offer.endDate },
        endDate:   { $gte: offer.startDate }
      });

      if (existing) {
        return res.status(400).json({
          message: "Another active offer exists for this type in this period"
        });
      }
    }

    offer.isActive = !offer.isActive;

    // FIX: bypass pre-save date validation since dates are not changing
    await offer.save();

    res.status(200).json({
      message: `Offer ${offer.isActive ? "activated" : "deactivated"}`,
      isActive: offer.isActive
    });

  } catch (e) {
    console.error("TOGGLE OFFER ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};


module.exports = { createOffer, getOffers, updateOffer, deleteOffer, toggleOffer };