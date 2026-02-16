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
/* ================= SEARCH PROPERTIES ================= */
router.get("/search", async (req, res) => {
  try {
    const { purpose, category, city, location } = req.query;

    let filter = {};

    if (purpose) filter.purpose = purpose;
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, "i");
    if (location) filter.location = new RegExp(location, "i");

    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.status(200).json(properties); // 👈 ALWAYS ARRAY
  } catch (err) {
    console.error(err);
    res.status(200).json([]); // 👈 never send object
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const categoryParam = req.params.category.toLowerCase(); // e.g., "dareshell", "furnished"

    // Map URL slug to actual Property.category value in DB
    const categoryMap = {
      commercial: "Commercial Property",
      dareshell: "Dareshell Property",
      furnished: "Furnished",
      "industrial-plot": "Industrial Plot",
      plot: "Plot",
      shed: "Shed",
      warehouse: "Warehouse",
      factory: "Factory",
      latestproperty: "Latest Property",
      featuredproperty: "Featured",
    };

    const categoryName = categoryMap[categoryParam];

    if (!categoryName) {
      return res.status(404).json({ message: "Category not found" });
    }

    const properties = await Property.find({ category: categoryName });

    res.json(properties);
  } catch (error) {
    console.error(error);
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
