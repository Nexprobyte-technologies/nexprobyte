import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { memoryStore, getDbConnected } from "../store/memoryStore.js";
import { Post } from "../models/Post.js";

const router = express.Router();

// Get All Blog Posts (Public)
router.get("/", async (req, res) => {
  if (getDbConnected()) {
    try {
      const docs = await Post.find().sort({ createdAt: -1 });
      if (docs.length > 0) return res.json(docs);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(memoryStore.posts);
});

// Get Single Blog Post by Slug (Public)
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  if (getDbConnected()) {
    try {
      const doc = await Post.findOne({ slug });
      if (doc) {
        // Increment views
        doc.views = (doc.views || 0) + 1;
        await doc.save();
        return res.json(doc);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const post = memoryStore.posts.find((p) => p.slug === slug || p._id === slug);
  if (post) {
    post.views = (post.views || 0) + 1;
    return res.json(post);
  }
  return res.status(404).json({ message: "Post not found." });
});

// Create Blog Post (Admin Protected)
router.post("/", verifyToken, async (req, res) => {
  const { title, category, read, excerpt, content, image, palette, author, published } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ message: "Title is required." });
  if (!excerpt || !excerpt.trim()) return res.status(400).json({ message: "Excerpt is required." });

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newPost = {
    _id: "post-" + Date.now(),
    slug,
    title: title.trim(),
    category: category || "Web",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    read: read || "5 min",
    palette: palette || "cobalt",
    excerpt: excerpt.trim(),
    image: image || "/images/cover-web.jpg",
    content: Array.isArray(content)
      ? content
      : typeof content === "string"
      ? [{ h: "Overview" }, { p: content }]
      : [{ p: excerpt }],
    author: author || "Nexprobyte Team",
    published: published !== false,
    views: 0,
    createdAt: new Date().toISOString(),
  };

  if (getDbConnected()) {
    try {
      const doc = await Post.create(newPost);
      return res.status(201).json(doc);
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.posts.unshift(newPost);
  return res.status(201).json(newPost);
});

// Update Blog Post (Admin Protected)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (getDbConnected()) {
    try {
      const doc = await Post.findByIdAndUpdate(id, updates, { new: true });
      if (doc) return res.json(doc);
    } catch (e) {
      console.error(e);
    }
  }

  const index = memoryStore.posts.findIndex((p) => p._id === id || p.id === id || p.slug === id);
  if (index !== -1) {
    memoryStore.posts[index] = { ...memoryStore.posts[index], ...updates };
    return res.json(memoryStore.posts[index]);
  }
  return res.status(404).json({ message: "Post not found." });
});

// Delete Blog Post (Admin Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (getDbConnected()) {
    try {
      await Post.findByIdAndDelete(id);
      return res.json({ message: "Post deleted successfully." });
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.posts = memoryStore.posts.filter((p) => p._id !== id && p.id !== id && p.slug !== id);
  return res.json({ message: "Post deleted successfully." });
});

export default router;
