import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero } from "../components/PageHero.jsx";

const EASE = [0.22, 1, 0.36, 1];

const TOPICS = [
  "New website",
  "App development",
  "Digital marketing",
  "SEO",
  "Social media",
  "Careers",
  "Something else",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "Company",
  topic: "New website",
  budget: "",
  message: "",
};

export default function Contact() {
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const topic = location.state?.topic;
    if (topic) {
      if (topic.startsWith("careers")) {
        setForm((f) => ({ ...f, topic: "Careers", message: `Applying for: ${topic.replace("careers: ", "")}` }));
      } else {
        setForm((f) => ({ ...f, topic }));
      }
    }
  }, [location.state]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const fe = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (!name) {
      fe.name = "Please enter your name.";
    } else if (name.length < 2) {
      fe.name = "Name must be at least 2 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      fe.email = "Please enter your email.";
    } else if (!emailRegex.test(email)) {
      fe.email = "Please enter a valid email (e.g. you@company.com).";
    }

    const phoneDigits = phone.replace(/[^0-9]/g, "");
    if (!phone) {
      fe.phone = "Please enter your phone number.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      fe.phone = "Please enter a valid phone number (10–11 digits).";
    } else if (!/^\+?[0-9]{1,4}[\s-]?[0-9]{6,14}$/.test(phone.trim())) {
      fe.phone = "Please enter a valid phone number (e.g. +91 98765 43210).";
    }

    if (!form.topic) {
      fe.topic = "Please select a topic.";
    }

    if (!message) {
      fe.message = "Please tell us a little about your project.";
    }

    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.topic,
          organization: form.company,
          message: `${form.message}${form.company ? ` (Organization: ${form.company})` : ""}${form.budget ? ` (Budget: ${form.budget})` : ""}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit inquiry.");
      }

      setSent(true);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        num="Contact"
        label="Let's talk"
        title={["Have a project", "in mind?"]}
        sub="Tell us where you are — we'll bring the map. We usually reply within one business day."
      />

      <section className="section wrap" style={{ paddingTop: 20 }}>
        <div className="contact-grid">
          <motion.div
            className="contact-form-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {sent ? (
              <div className="form-success">
                <span className="success-orb">✓</span>
                <h2>
                  Message <em className="italic-serif">sent!</em>
                </h2>
                <p>
                  Thanks, {form.name || "friend"} — we've got your message and will reply to{" "}
                  <b>{form.email || "your email"}</b> within one business day.
                </p>
                <button className="btn btn-solid" onClick={() => { setForm(initialForm); setSent(false); }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                {error && (
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
                    {error}
                  </div>
                )}
                <div className="form-row">
                  <label>
                    <span>Your name</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => {
                        set("name")(e);
                        if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
                      }}
                      placeholder="Enter Your name"
                      style={fieldErrors.name ? { borderColor: "#ef4444" } : undefined}
                    />
                    {fieldErrors.name && <em className="field-error">{fieldErrors.name}</em>}
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        set("email")(e);
                        if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                      }}
                      placeholder="you@company.com"
                      style={fieldErrors.email ? { borderColor: "#ef4444" } : undefined}
                    />
                    {fieldErrors.email && <em className="field-error">{fieldErrors.email}</em>}
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    <span>Phone</span>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => {
                        set("phone")(e);
                        if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                      }}
                      placeholder="+91 98765 43210"
                      style={fieldErrors.phone ? { borderColor: "#ef4444" } : undefined}
                    />
                    {fieldErrors.phone && <em className="field-error">{fieldErrors.phone}</em>}
                  </label>
                  <label>
                    <span>Organization</span>
                    <select value={form.company} onChange={set("company")}>
                      <option value="Company">Company</option>
                      <option value="Enquiry">Enquiry</option>
                    </select>
                  </label>
                </div>
                <label>
                  <span>What do you need?</span>
                  <div className="topic-grid">
                    {TOPICS.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`topic-pill ${form.topic === t ? "is-active" : ""}`}
                        onClick={() => setForm((f) => ({ ...f, topic: t }))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </label>
                {/* <div className="form-row">
                  <label>
                    <span>Budget range</span>
                    <select value={form.budget} onChange={set("budget")}>
                      <option value="">Select a range</option>
                      <option>Under ₹50k</option>
                      <option>₹50k – ₹1L</option>
                      <option>₹1L – ₹5L</option>
                      <option>₹5L+</option>
                    </select>
                  </label>
                </div> */}
                <label>
                  <span>Tell us more</span>
                  <textarea
                    rows={5}
                    value={form.message}
                    required
                    onChange={(e) => {
                      set("message")(e);
                      if (fieldErrors.message) setFieldErrors((p) => ({ ...p, message: "" }));
                    }}
                    placeholder="Goals, timeline, links to anything we should see…"
                    style={fieldErrors.message ? { borderColor: "#ef4444" } : undefined}
                  />
                  {fieldErrors.message && <em className="field-error">{fieldErrors.message}</em>}
                </label>
                <motion.button
                  type="submit"
                  className="btn btn-solid submit-btn"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send message <span className="arr">→</span>
                </motion.button>
              </form>
            )}
          </motion.div>

          <div className="contact-info">
            {[
              { k: "Visit", v: "1st Floor, Nanjiammal Complex, Above City Bakery, Maniyakarampalayam, Coimbatore, Tamil Nadu 641006", href: "https://maps.google.com/?q=10.9994017,76.9686834" },
              { k: "Email", v: "info@nexprobyte.com", href: "mailto:info@nexprobyte.com" },
              { k: "Phone", v: "+91 95000 42426", href: "tel:+919500042426" },
            ].map((c, i) => (
              <motion.a
                key={c.k}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="info-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: 0.08 * i, ease: EASE }}
              >
                <span className="num">0{i + 1}</span>
                <div>
                  <h4>{c.k}</h4>
                  <p>{c.v}</p>
                  <span className="link-hint">Open ↗</span>
                </div>
              </motion.a>
            ))}

            <motion.div
              className="hours-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            >
              <h4>Office hours</h4>
              <p>
                Mon – Sat · 9:30 AM – 6:30 PM IST
                <br />
                Sunday · by appointment
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Map Embed */}
      <section className="section wrap" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            borderRadius: "24px",
            overflow: "hidden",
            border: "1px solid var(--line, rgba(255,255,255,0.1))",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            lineHeight: 0,
          }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3722.124381683631!2d76.9683257!3d11.0477126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859142c1833e5%3A0x41a33eed27db17ec!2sNexprobyte%20Technologies!5e1!3m2!1sen!2sin!4v1788510203344!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Nexprobyte Technologies Location Map"
          />
        </motion.div>
      </section>
    </>
  );
}