import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero } from "../components/PageHero.jsx";
import { POSTS } from "../data/content.js";

const EASE = [0.22, 1, 0.36, 1];

export default function Blog() {
  const [postsList, setPostsList] = useState(POSTS);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPostsList(data);
        }
      })
      .catch((e) => console.error("Could not fetch blog posts from backend:", e));
  }, []);

  const categories = ["All", ...new Set(postsList.map((p) => p.category).filter(Boolean))];

  const filteredPosts =
    cat === "All" ? postsList : postsList.filter((p) => p.category === cat);

  return (
    <>
      <PageHero
        num="Journal"
        label="Ideas & insights"
        title={["Notes on building", "digital businesses"]}
        sub="Practical thinking on web, design, marketing and growth — written by the Nexprobyte team."
      />

      <section className="section wrap" style={{ paddingTop: 30 }}>
        <motion.div
          className="filter-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        >
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-pill ${cat === c ? "is-active" : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </motion.div>

        <div className="post-list">
          {filteredPosts.map((p, i) => (
            <motion.article
              key={p.slug || p._id}
              layout
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: 0.04 * i, ease: EASE }}
            >
              <Link to={`/blog/${p.slug}`} className="post-card">
                <div className="post-card-media">
                  <img
                    src={p.image || "/images/cover-web.jpg"}
                    alt={p.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/images/cover-web.jpg";
                    }}
                  />
                </div>
                <div className="post-card-body">
                  <div className="post-meta">
                    <span className="num">{p.category}</span>
                    <span>
                      {p.date || "Recent"} · {p.read || "5 min"}
                    </span>
                  </div>
                  <h2>{p.title}</h2>
                  <p>{p.excerpt}</p>
                  <span className="read-more">
                    Read article <span className="arr">→</span>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}