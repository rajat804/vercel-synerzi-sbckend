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
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const {
      title,
      description,
      category,
      propertyType,
      purpose,
      status,
      price,
      priceLabel,
      address,
      city,
      location,
      area,
      pincode,
      country,
      size,
      builtUpArea,
      yearBuilt,
      flooring,
      ownership,
      possession,
      structureType,
      roadWidth,
      openSides,
      totalFloors,
      floorNo,
      bhk,
      bathrooms,
      balconies,
      facing,
      parking,
      amenities,
      isFeatured,
      isLatest
    } = req.body;

    // ================= VALIDATION =================
    if (!title || !city) {
      return res.status(400).json({
        success: false,
        message: "Title and City are required",
      });
    }

    // if (!req.admin || !req.admin.id) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Admin not authenticated",
    //   });
    // }

    // ================= AMENITIES PARSE =================
    let parsedAmenities = [];
    if (amenities) {
      try {
        parsedAmenities =
          typeof amenities === "string"
            ? JSON.parse(amenities)
            : amenities;
      } catch (err) {
        console.log("Amenities parse error");
      }
    }

    // ================= IMAGE UPLOAD =================
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: "synerzi-properties",
          }
        );

        imageUrls.push(uploadRes.secure_url);
      }
    }

    // ================= CREATE PROPERTY =================
    const property = await Property.create({
      title,
      description,
      category,
      propertyType,
      purpose,
      status,
      price,
      priceLabel,
      address,
      city,
      location,
      area,
      pincode,
      country,
      size,
      builtUpArea,
      yearBuilt,
      flooring,
      ownership,
      possession,
      structureType,
      roadWidth,
      openSides,
      totalFloors,
      floorNo,
      bhk,
      bathrooms,
      balconies,
      facing,
      parking,
      amenities: parsedAmenities,
      images: imageUrls,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isLatest: isLatest === "true" || isLatest === true,
      
    });

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      property,
    });

  } catch (err) {
    console.error("ADD PROPERTY ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};





// ================= UPDATE PROPERTY =================
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    const ignoreFields = [
      "amenities",
      "deletedImages",
      "existingImages",
    ];

    // 1️⃣ Update normal fields (INCLUDING featured & latest)
    Object.keys(req.body).forEach((key) => {
      if (!ignoreFields.includes(key)) {

        // ✅ handle checkbox boolean values
        if (key === "isFeatured" || key === "isLatest") {
          property[key] = req.body[key] === "true" || req.body[key] === true;
        } else {
          property[key] = req.body[key];
        }
      }
    });

    // 2️⃣ Update amenities
    if (req.body.amenities) {
      try {
        property.amenities = JSON.parse(req.body.amenities);
      } catch {
        property.amenities = [];
      }
    }

    // 3️⃣ Handle deleted images
    if (req.body.deletedImages) {
      let deleted = [];
      try {
        deleted = JSON.parse(req.body.deletedImages);
      } catch {}

      property.images = property.images.filter(
        (img) => !deleted.includes(img)
      );

      for (const url of deleted) {
        try {
          const parts = url.split("/");
          const fileName = parts[parts.length - 1].split(".")[0];
          const publicId = `synerzi-properties/${fileName}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Failed to delete image from Cloudinary:", url);
        }
      }
    }

    // 4️⃣ Merge existing images
    if (req.body.existingImages) {
      const existingImgs = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];

      existingImgs.forEach((img) => {
        if (!property.images.includes(img)) {
          property.images.push(img);
        }
      });
    }

    // 5️⃣ Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "synerzi-properties" }
        );
        property.images.push(uploadRes.secure_url);
      }
    }

    // 6️⃣ Save
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


