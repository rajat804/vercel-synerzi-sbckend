import cloudinary from "../config/cloudinary.js";
import Property from "../models/PropertyModel.js";
import multer from "multer";
import path from "path";

/* ===== MULTER SETUP ===== */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ===== ADD PROPERTY ===== */

export const addProperty = async (req, res) => {
  try {
    const {
      title, category, purpose, price,
      city, state, location, area,
      bhk, parking, description, amenities
    } = req.body;

    let parsedAmenities = [];
    try {
      parsedAmenities = JSON.parse(amenities || "[]");
    } catch {}

    // 🔥 CLOUDINARY IMAGE UPLOAD
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "synerzi-properties" }
        );
        imageUrls.push(uploadRes.secure_url);
      }
    }

    const property = await Property.create({
      title,
      category,
      purpose,
      price,
      city,
      state,
      location,
      area,
      bhk,
      parking,
      description,
      amenities: parsedAmenities,
      images: imageUrls, // ✅ FIXED
      createdBy: req.admin.id,
    });

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      property,
    });

  } catch (err) {
    console.error("ADD PROPERTY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};




// ================= UPDATE PROPERTY =================
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    /* =======================
       1️⃣ AMENITIES
    ======================= */
    if (req.body.amenities) {
      try {
        property.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        property.amenities = [];
      }
    }

    /* =======================
       2️⃣ DELETE OLD IMAGES
    ======================= */
    if (req.body.deletedImages) {
      let deleted = [];

      try {
        deleted = JSON.parse(req.body.deletedImages);
      } catch {
        deleted = [];
      }

      property.images = property.images.filter(
        (img) => !deleted.includes(img)
      );
    }

    /* =======================
       3️⃣ UPLOAD NEW IMAGES
    ======================= */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "synerzi-properties" }
        );

        property.images.push(uploadRes.secure_url);
      }
    }

    /* =======================
       4️⃣ UPDATE NORMAL FIELDS
       (IMPORTANT FIX)
    ======================= */
    const blockedFields = ["amenities", "deletedImages", "images"];

    Object.keys(req.body).forEach((key) => {
      if (!blockedFields.includes(key)) {
        property[key] = req.body[key];
      }
    });

    await property.save();

    res.json({
      success: true,
      message: "Property updated successfully ✅",
      property,
    });
  } catch (err) {
    console.error("UPDATE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

