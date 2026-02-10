import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import { promises as dns } from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/* ==============================
   DATABASE
============================== */
connectDB();

/* ==============================
   CORS CONFIG
============================== */
const allowedOrigins = [
  "http://localhost:5173",
  "https://synerzi.vercel.app",
  "https://shreeramrealtygroup.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// ✅ THIS handles preflight automatically (NO crash)
app.use(cors(corsOptions));

/* ==============================
   MIDDLEWARE
============================== */
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ==============================
   ROUTES
============================== */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api",propertyRoutes);


/* ==============================
   TEST ROUTE
============================== */
app.get("/", (req, res) => {
  res.send("✅ API Working");
});

/* ==============================
   START SERVER
============================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
