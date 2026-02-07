import jwt from "jsonwebtoken";
import Admin from "../models/AdminModel.js"; // make sure path is correct

export const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    // Fetch the full admin from DB
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.admin = admin; // <-- attach full admin object
    next();
  } catch (err) {
    console.error("VERIFY ADMIN ERROR:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
