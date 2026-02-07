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
      images: [], // 🔥 for now
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

    // Parse amenities if sent as JSON string
    if (fieldsToUpdate.amenities) {
      try {
        fieldsToUpdate.amenities = JSON.parse(fieldsToUpdate.amenities);
      } catch {
        fieldsToUpdate.amenities = [];
      }
    }

    // Handle deleted images (frontend should send array of deleted images)
    const deletedImages = fieldsToUpdate.deletedImages
      ? JSON.parse(fieldsToUpdate.deletedImages)
      : [];

    if (deletedImages.length > 0) {
      deletedImages.forEach((img) => {
        const imgPath = path.join(process.cwd(), "uploads", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });

      // Remove deleted images from property.images
      property.images = property.images.filter((img) => !deletedImages.includes(img));
    }

    // Handle existing images from frontend
    if (fieldsToUpdate.existingImages) {
      if (typeof fieldsToUpdate.existingImages === "string") {
        property.images.push(fieldsToUpdate.existingImages);
      } else if (Array.isArray(fieldsToUpdate.existingImages)) {
        property.images.push(...fieldsToUpdate.existingImages);
      }
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const uploadedFiles = req.files.map((file) => file.filename);
      property.images.push(...uploadedFiles);
    }

    // Update all other fields
    const excludeFields = ["deletedImages", "existingImages", "amenities"];
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (!excludeFields.includes(key)) {
        property[key] = fieldsToUpdate[key];
      }
    });

    // Save amenities separately
    if (fieldsToUpdate.amenities) property.amenities = fieldsToUpdate.amenities;

    await property.save();

    res.json({ message: "Property updated successfully ✅", property });

  } catch (err) {
    console.error("UPDATE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};