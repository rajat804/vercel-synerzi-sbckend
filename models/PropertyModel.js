import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    title: { type: String, required: true },
    description: { type: String },

    category: { type: String },
    propertyType: { type: String },
    purpose: { type: String },
    status: { type: String }, // Hot Offer, New Offer
    /* ================= PRICE ================= */
    price: { type: String },
    priceLabel: { type: String }, // /month

    /* ================= LOCATION ================= */
    address: { type: String },
    city: { type: String, required: true },
    location: { type: String },
    area: { type: String },
    pincode: { type: String },
    country: { type: String, default: "India" },

    /* ================= PROPERTY DETAILS ================= */
    size: { type: String },
    builtUpArea: { type: String },
    yearBuilt: { type: String },
    flooring: { type: String },
    ownership: { type: String },
    possession: { type: String },
    structureType: { type: String },
    roadWidth: { type: String },
    openSides: { type: String },

    /* ================= BUILDING INFO ================= */
    totalFloors: { type: String },
    floorNo: { type: String },

    /* ================= ROOM DETAILS ================= */
    bhk: { type: String },
    bathrooms: { type: String },
    balconies: { type: String },
    facing: { type: String },
    parking: { type: String },

    /* ================= FEATURES ================= */
    amenities: [{ type: String }],

    /* ================= MEDIA ================= */
    images: [{ type: String }],

    /* ================= FLAGS ================= */
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isLatest: {
      type: Boolean,
      default: false,
    },

    /* ================= RELATION ================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
