import express from "express";
import { addProperty, upload , deleteProperty, updateProperty} from "../controllers/propertyController.js";
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
router.put("/:id", verifyAdmin, upload.array("images"), updateProperty);


/* ================= DELETE PROPERTY ================= */

router.delete("/:id", verifyAdmin, deleteProperty);

export default router;
