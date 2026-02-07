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

    // 1️⃣ Update normal fields (EXCEPT images)
    Object.keys(req.body).forEach((key) => {
      if (
        !["amenities", "deletedImages", "existingImages"].includes(key)
      ) {
        property[key] = req.body[key];
      }
    });

    // 2️⃣ Amenities
    if (req.body.amenities) {
      property.amenities = JSON.parse(req.body.amenities);
    }

    // 3️⃣ Delete images ONLY if user deleted
    if (req.body.deletedImages) {
      const deleted = JSON.parse(req.body.deletedImages);
      property.images = property.images.filter(
        (img) => !deleted.includes(img)
      );
    }

    // 4️⃣ Upload new images (ADD only)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "synerzi-properties" }
        );
        property.images.push(uploadRes.secure_url);
      }
    }

    await property.save();

    res.json({
      message: "Property updated successfully ✅",
      property,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE PROPERTY
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Delete all images from Cloudinary
    if (property.images && property.images.length > 0) {
      for (const url of property.images) {
        // Extract public ID from Cloudinary URL
        const parts = url.split("/");
        const fileName = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`synerzi-properties/${fileName}`);
      }
    }

    // Delete property from DB
    await property.deleteOne();

    res.json({ message: "Property and its images deleted successfully ✅" });
  } catch (err) {
    console.error("DELETE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


