import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { memoryStore, getDbConnected } from "../store/memoryStore.js";
import { About } from "../models/About.js";

const router = express.Router();

// Get About Content (Public)
router.get("/", async (req, res) => {
  if (getDbConnected()) {
    try {
      let doc = await About.findOne();
      if (!doc) {
        doc = await About.create(memoryStore.about);
      }
      return res.json(doc);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(memoryStore.about);
});

// Update About Content (Admin Protected)
router.put("/", verifyToken, async (req, res) => {
  const updates = req.body;

  if (getDbConnected()) {
    try {
      let doc = await About.findOne();
      if (doc) {
        doc = await About.findByIdAndUpdate(doc._id, updates, { new: true });
      } else {
        doc = await About.create(updates);
      }
      return res.json(doc);
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.about = { ...memoryStore.about, ...updates };
  return res.json(memoryStore.about);
});

export default router;
