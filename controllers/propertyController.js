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

    // ---------- AMENITIES ----------
    if (req.body.amenities) {
      property.amenities = JSON.parse(req.body.amenities);
    }

    // ---------- EXISTING IMAGES (IMPORTANT) ----------
    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    }

    // remove null / "null"
    existingImages = existingImages.filter(
      (img) => img && img !== "null"
    );

    // ---------- DELETED IMAGES ----------
    let deletedImages = [];
    if (req.body.deletedImages) {
      deletedImages = Array.isArray(req.body.deletedImages)
        ? req.body.deletedImages
        : [req.body.deletedImages];
    }

    // keep only images that are not deleted
    property.images = existingImages.filter(
      (img) => !deletedImages.includes(img)
    );

    // ---------- NEW IMAGES (Cloudinary upload) ----------
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const upload = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "synerzi-properties" }
        );
        property.images.push(upload.secure_url);
      }
    }

    // ---------- OTHER FIELDS ----------
    Object.keys(req.body).forEach((key) => {
      if (!["amenities", "existingImages", "deletedImages"].includes(key)) {
        property[key] = req.body[key];
      }
    });

    await property.save();

    res.json({
      message: "Property updated successfully ✅",
      property,
    });

  } catch (err) {
    console.error("UPDATE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


