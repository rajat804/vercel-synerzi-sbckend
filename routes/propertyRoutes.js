import express from "express";
import { addProperty, upload , deleteProperty, updateProperty} from "../controllers/propertyController.js";
import { verifyAdmin, verifyUser } from "../middleware/authMiddleware.js";
import Property from "../models/PropertyModel.js";

const router = express.Router();

/* ================= ADD PROPERTY ================= */
// Jab koi bhi add kare -> default false hona chahiye (Model me set hoga)
router.post("/add", verifyUser, upload.array("images", 10), addProperty);


/* ================= GET ALL PROPERTIES (ONLY APPROVED) ================= */
router.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: true });
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= SEARCH PROPERTIES (ONLY APPROVED) ================= */
router.get("/search", async (req, res) => {
  try {
    const { purpose, category, city, location } = req.query;

    let filter = { isApproved: true };  // 👈 IMPORTANT

    if (purpose) filter.purpose = purpose;
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, "i");
    if (location) filter.location = new RegExp(location, "i");

    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
});


/* ================= CATEGORY (ONLY APPROVED) ================= */
router.get("/category/:category", async (req, res) => {
  try {
    const categoryParam = req.params.category.toLowerCase();

    const categoryMap = {
      commercial: "Commercial",
      dareshell: "Dareshell",
      furnished: "Furnished",
      "industrial-plot": "Industrial Plot",
      plot: "Plot",
      shed: "Shed",
      warehouse: "Warehouse",
      factory: "Factory",
      latestproperty: "Latest",
      featuredproperty: "Featured",
    };

    const categoryName = categoryMap[categoryParam];

    if (!categoryName) {
      return res.status(404).json({ message: "Category not found" });
    }

    const properties = await Property.find({ 
      category: categoryName,
      isApproved: true   // 👈 IMPORTANT
    });

    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


/* ADMIN ROUTE */
router.get("/admin/all", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ADMIN GET PROPERTY BY ID */
router.get("/admin/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (err) {
    console.error("ADMIN GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= UPDATE PROPERTY ================= */
// Admin edit karega aur approve karega
router.put("/:id", upload.array("images"), updateProperty);


/* ================= DELETE PROPERTY ================= */
router.delete("/:id", verifyAdmin, deleteProperty);



/* ================= GET PROPERTY BY ID ================= */
// Website ke liye sirf approved property
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      isApproved: true   // 👈 IMPORTANT
    });

    if (!property) {
      return res.status(404).json({ message: "Property not approved yet" });
    }

    res.status(200).json(property);
  } catch (err) {
    console.error("GET PROPERTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});




export default router;