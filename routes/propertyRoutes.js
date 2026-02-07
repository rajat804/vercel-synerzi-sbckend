import express from "express";
import { addProperty, upload , deleteProperty} from "../controllers/propertyController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import Property from "../models/PropertyModel.js";

const router = express.Router();



/* ================= ADD PROPERTY ================= */
router.post("/add", verifyAdmin, upload.array("images", 10), addProperty);

/* ================= GET ALL PROPERTIES ================= */
router.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (err) {
    console.error("GET PROPERTIES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET PROPERTY BY ID ================= */
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json(property);
  } catch (err) {
    console.error("GET PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE PROPERTY ================= */
router.put("/:id", verifyAdmin, upload.array("images"), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // ================= DELETE OLD IMAGES FROM SERVER =================
    if (req.body.deletedImages) {
      let toDelete = [];
      if (typeof req.body.deletedImages === "string") {
        toDelete = [req.body.deletedImages];
      } else {
        toDelete = req.body.deletedImages; // array
      }

      toDelete.forEach((img) => {
        const imgPath = path.join(process.cwd(), "uploads", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    // ================= UPDATE PROPERTY =================
    const fieldsToUpdate = { ...req.body };

    // handle amenities
    if (fieldsToUpdate.amenities) {
      try {
        fieldsToUpdate.amenities = JSON.parse(fieldsToUpdate.amenities);
      } catch {
        fieldsToUpdate.amenities = [];
      }
    }

    // handle existing images
    if (req.body.existingImages) {
      if (typeof req.body.existingImages === "string") {
        fieldsToUpdate.images = [req.body.existingImages];
      } else {
        fieldsToUpdate.images = req.body.existingImages;
      }
    } else {
      fieldsToUpdate.images = [];
    }

    // add new uploaded images
    if (req.files && req.files.length > 0) {
      const uploadedFiles = req.files.map(file => file.filename);
      fieldsToUpdate.images = [...fieldsToUpdate.images, ...uploadedFiles];
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true }
    );

    res.json({ message: "Property updated successfully ✅", property: updatedProperty });

  } catch (err) {
    console.error("UPDATE PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= DELETE PROPERTY ================= */

router.delete("/:id", verifyAdmin, deleteProperty);

export default router;
