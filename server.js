import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js"
import { promises as dns } from "dns";
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import propertyRoutes from "./routes/propertyRoutes.js"
// Optional (not required now, but ok)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const port = process.env.PORT || 4000;

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// 🔥 AUTH ROUTES (MOST IMPORTANT)
app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/properties",propertyRoutes);
app.use("/api", propertyRoutes);


// Test API
app.get("/", (req, res) => {
  res.send("API Working");
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on PORT: ${port}`);
});
