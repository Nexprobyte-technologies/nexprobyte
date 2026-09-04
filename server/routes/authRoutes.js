import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { getMongoConnected } from "../store/memoryStore.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nexprobyte_secret_key_2026";

// Auth Login (POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Exact credentials requested by user: NexAdmin / Nex@.1A
  if (username === "NexAdmin" && password === "Nex@.1A") {
    const token = jwt.sign({ username: "NexAdmin", role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: { username: "NexAdmin", name: "Nexpro Admin", role: "admin" },
    });
  }

  // Also check MongoDB User model if connected
  if (getMongoConnected()) {
    try {
      const user = await User.findOne({ username });
      if (user && user.password === password) {
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, {
          expiresIn: "7d",
        });
        return res.json({
          token,
          user: { username: user.username, name: user.name, role: user.role },
        });
      }
    } catch (e) {
      console.error("Auth login error:", e);
    }
  }

  return res.status(401).json({ message: "Invalid username or password." });
});

// Verify Auth Token (GET /api/auth/me)
router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
