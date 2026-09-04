import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, default: "Web" },
    date: { type: String },
    read: { type: String, default: "5 min" },
    palette: { type: String, default: "cobalt" },
    excerpt: { type: String, required: true },
    image: { type: String, default: "/images/cover-web.jpg" },
    content: { type: mongoose.Schema.Types.Mixed },
    author: { type: String, default: "Nexprobyte Team" },
    published: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Post =
  mongoose.models.Post || mongoose.model("Post", postSchema);
