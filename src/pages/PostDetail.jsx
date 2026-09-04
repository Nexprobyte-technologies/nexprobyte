import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero, Breadcrumb, Prose } from "../components/PageHero.jsx";
import { POSTS } from "../data/content.js";

const EASE = [0.22, 1, 0.36, 1];

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(() => POSTS.find((x) => x.slug === slug));
  const [morePosts, setMorePosts] = useState(() =>
    POSTS.filter((x) => x.slug !== slug).slice(0, 2)
  );

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Post not found");
      })
      .then((data) => {
        if (data) setPost(data);
      })
      .catch(() => {
        const fallback = POSTS.find((x) => x.slug === slug);
        if (fallback) setPost(fallback);
      });

    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMorePosts(data.filter((x) => x.slug !== slug).slice(0, 2));
        }
      })
      .catch((e) => console.error(e));
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <>
      <PageHero
        num={post.category || "Article"}
        label={`${post.date || "Recent"} · ${post.read || "5 min"}`}
        title={[post.title]}
        sub={post.excerpt}
      />

      <section className="section wrap" style={{ paddingTop: 24 }}>
        <motion.div
          className="post-cover"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        >
          <img
            src={post.image || "/images/cover-web.jpg"}
            alt={post.title}
            loading="eager"
            onError={(e) => {
              e.target.src = "/images/cover-web.jpg";
            }}
          />
          <span className="post-cover-cat">{post.category}</span>
        </motion.div>
      </section>

      <section className="section wrap" style={{ paddingTop: 40 }}>
        <div className="prose-wrap">
          <div className="prose-side">
            <Breadcrumb
              items={[
                { label: "Home", to: "/" },
                { label: "Blog", to: "/blog" },
                { label: post.category || "Post" },
              ]}
            />
            <div className="prose-author">
              <img
                className="avatar"
                src="/images/testimonial.jpg"
                alt={post.author || "Nexprobyte team"}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div>
                <b>{post.author || "Nexprobyte Team"}</b>
                <span>Digital Strategy</span>
              </div>
            </div>
          </div>
          <Prose content={post.content} />
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 40 }}>
        <div className="eyebrow">
          <span className="num">✦</span>
          <span>Keep reading</span>
        </div>
        <div className="post-list" style={{ marginTop: 24 }}>
          {morePosts.map((m, i) => (
            <motion.article
              key={m.slug || m._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: 0.06 * i, ease: EASE }}
            >
              <Link to={`/blog/${m.slug}`} className="post-card">
                <div className="post-card-media">
                  <img
                    src={m.image || "/images/cover-web.jpg"}
                    alt={m.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/images/cover-web.jpg";
                    }}
                  />
                </div>
                <div className="post-card-body">
                  <div className="post-meta">
                    <span className="num">{m.category}</span>
                    <span>
                      {m.date || "Recent"} · {m.read || "5 min"}
                    </span>
                  </div>
                  <h2>{m.title}</h2>
                  <p>{m.excerpt}</p>
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