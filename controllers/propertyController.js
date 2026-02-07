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
    if (!property) return res.status(404).json({ message: "Property not found" });

    const fieldsToUpdate = { ...req.body };

    // Parse amenities
    if (fieldsToUpdate.amenities) {
      try {
        fieldsToUpdate.amenities = JSON.parse(fieldsToUpdate.amenities);
      } catch {
        fieldsToUpdate.amenities = [];
      }
    }

    // Handle deleted images (Cloudinary URLs)
    if (fieldsToUpdate.deletedImages) {
      const deleted = JSON.parse(fieldsToUpdate.deletedImages);
      property.images = property.images.filter(img => !deleted.includes(img));
    }

    // 🔥 Upload new images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "synerzi-properties" }
        );
        property.images.push(uploadRes.secure_url);
      }
    }

    // Update other fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (!["amenities", "deletedImages"].includes(key)) {
        property[key] = fieldsToUpdate[key];
      }
    });

    if (fieldsToUpdate.amenities) {
      property.amenities = fieldsToUpdate.amenities;
    }

    await property.save();

    res.json({ message: "Property updated successfully ✅", property });

  } catch (err) {
    console.error("UPDATE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
