import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String },
    propertyType: { type: String },
    purpose: { type: String },
    price: { type: String, required: true },

    city: { type: String, required: true },
    state: { type: String, required: true },
    location: { type: String },
    area: { type: String },

    bhk: String,
    bathrooms: String,
    balconies: String,
    floorNo: String,
    totalFloors: String,
    facing: String,
    parking: String,

    description: String,
    amenities: [String],

    images: [String], // image paths

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
export default Property;