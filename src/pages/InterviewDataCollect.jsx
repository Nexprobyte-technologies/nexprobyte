import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { PageHero, Breadcrumb } from "../components/PageHero.jsx";

const EASE = [0.22, 1, 0.36, 1];

const EMPTY = {
  name: "",
  dob: "",
  email: "",
  address: "",
  experienceType: "Fresher",
  experienceYears: "",
};

export default function InterviewDataCollect() {
  const [formData, setFormData] = useState(EMPTY);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeSize, setResumeSize] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef(null);

  const set = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

  const handleFileChange = (file) => {
    setErrors((prev) => ({ ...prev, resume: "" }));
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrors((prev) => ({ ...prev, resume: "Invalid file type. Please upload a PDF file (.pdf) only." }));
      setResumeFile(null);
      setResumeData("");
      setResumeFileName("");
      setResumeSize("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: "File size exceeds 5MB limit. Please upload a smaller PDF." }));
      setResumeFile(null);
      setResumeData("");
      setResumeFileName("");
      setResumeSize("");
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    setResumeFile(file);
    setResumeFileName(file.name);
    setResumeSize(sizeStr);

    const reader = new FileReader();
    reader.onload = () => setResumeData(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeData("");
    setResumeFileName("");
    setResumeSize("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required.";
    else if (formData.name.trim().length < 2) e.name = "Name must be at least 2 characters.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) e.email = "Email address is required.";
    else if (!emailRegex.test(formData.email.trim())) e.email = "Please enter a valid email address.";

    if (!formData.dob) e.dob = "Date of Birth is required.";
    else if (new Date(formData.dob) > new Date()) e.dob = "Date of Birth cannot be in the future.";

    if (!formData.address.trim()) e.address = "Address is required.";
    else if (formData.address.trim().length < 5) e.address = "Please enter your full address.";

    if (formData.experienceType === "Experienced" && !formData.experienceYears.trim()) {
      e.experienceYears = "Please enter your years of experience.";
    }

    if (!resumeData && !resumeFile) e.resume = "Resume (PDF format) is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError("");

    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        dob: formData.dob,
        email: formData.email.trim(),
        address: formData.address.trim(),
        experienceType: formData.experienceType,
        experienceYears: formData.experienceType === "Fresher" ? "0 Years" : formData.experienceYears.trim(),
        resumeFileName: resumeFileName || `${formData.name.replace(/\s+/g, "_")}_Resume.pdf`,
        resumeData: resumeData || "",
        resumeSize: resumeSize || "PDF Document",
      };

      const res = await fetch("/api/interview-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to submit. Please try again.");

      setSubmitted(true);
      window.scrollTo({ top: 150, behavior: "smooth" });
    } catch (err) {
      setServerError(err.message || "An error occurred while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (err) => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.06)",
    border: err ? "1.5px solid #ef4444" : "1.5px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    fontSize: "14.5px",
    outline: "none",
  });

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "var(--fg, #fff)",
  };

  const selectStyle = (err) => ({
    ...inputStyle(err),
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    paddingRight: "40px",
  });

  return (
    <>
      <PageHero
        num="Interview"
        label="Register Here"
        title={["Collect Interview Data", "Register for Your Interview"]}
        sub="Fill in your details and upload your resume. Your information goes straight to our HR team."
      >
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Careers", to: "/careers" },
            { label: "Interview Data" },
          ]}
        />
      </PageHero>

      <section className="section wrap" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          {submitted ? (
            /* Success Card */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{
                background: "var(--card-bg, #0f1422)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "24px",
                padding: "48px 36px",
                textAlign: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  fontSize: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                ✓
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px", color: "var(--fg, #fff)" }}>
                Details Submitted Successfully!
              </h2>
              <p style={{ fontSize: "16px", color: "var(--muted, #94a3b8)", lineHeight: 1.6, maxWidth: "520px", margin: "0 auto 28px" }}>
                Thank you, <strong>{formData.name}</strong>. Your interview details and resume have been received.
                Our HR team will contact you via <strong style={{ color: "var(--accent, #ff4d6d)" }}>{formData.email}</strong> shortly.
              </p>
              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/careers" className="btn btn-solid">← Back to Careers</Link>
                <Link to="/" className="btn btn-line">Visit Homepage</Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
                padding: "40px 36px",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Company Logo + Title */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <img
                  src="/images/nxtpro-logo.png"
                  alt="Nexprobyte Logo"
                  style={{ height: 56, objectFit: "contain", marginBottom: "16px" }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
                  <span className="mini-tag accent-tag">Interview Registration</span>
                  <span className="mini-tag">Collect Data</span>
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--fg, #fff)" }}>
                  Interview Candidate Details
                </h2>
                <p style={{ fontSize: "14px", color: "var(--muted, #94a3b8)", marginTop: "4px" }}>
                  Please fill out the fields below. Fields marked with <span style={{ color: "#ff4d6d" }}>*</span> are required.
                </p>
              </div>

              {serverError && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  marginBottom: "24px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}>
                  ⚠️ {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Name & Email */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", marginBottom: "22px" }}>
                  <div>
                    <label style={labelStyle}>Name <span style={{ color: "#ff4d6d" }}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => { set("name", e.target.value); if (errors.name) setErrors({ ...errors, name: "" }); }}
                      style={inputStyle(errors.name)}
                    />
                    {errors.name && <div style={{ color: "#f87171", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.name}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address <span style={{ color: "#ff4d6d" }}>*</span></label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => { set("email", e.target.value); if (errors.email) setErrors({ ...errors, email: "" }); }}
                      style={inputStyle(errors.email)}
                    />
                    {errors.email && <div style={{ color: "#f87171", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.email}</div>}
                  </div>
                </div>

                {/* DOB & Experience Type */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", marginBottom: "22px" }}>
                  <div>
                    <label style={labelStyle}>Date of Birth <span style={{ color: "#ff4d6d" }}>*</span></label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => { set("dob", e.target.value); if (errors.dob) setErrors({ ...errors, dob: "" }); }}
                      style={{
                        ...inputStyle(errors.dob),
                        colorScheme: "dark",
                      }}
                    />
                    {errors.dob && <div style={{ color: "#f87171", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.dob}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Experience Type <span style={{ color: "#ff4d6d" }}>*</span></label>
                    <select
                      value={formData.experienceType}
                      onChange={(e) => { set("experienceType", e.target.value); if (errors.experienceYears) setErrors({ ...errors, experienceYears: "" }); }}
                      style={selectStyle(false)}
                    >
                      <option value="Fresher" style={{ background: "#181022", color: "#fff" }}>Fresher</option>
                      <option value="Experienced" style={{ background: "#181022", color: "#fff" }}>Experienced</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div style={{ marginBottom: "22px" }}>
                  <label style={labelStyle}>Address <span style={{ color: "#ff4d6d" }}>*</span></label>
                  <textarea
                    rows={3}
                    placeholder="Full postal address"
                    value={formData.address}
                    onChange={(e) => { set("address", e.target.value); if (errors.address) setErrors({ ...errors, address: "" }); }}
                    style={{
                      ...inputStyle(errors.address),
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                  {errors.address && <div style={{ color: "#f87171", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.address}</div>}
                </div>

                {/* Experience Years (Experienced only) */}
                {formData.experienceType === "Experienced" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3, ease: EASE }}
                    style={{ marginBottom: "22px", overflow: "hidden" }}
                  >
                    <label style={labelStyle}>Years of Experience <span style={{ color: "#ff4d6d" }}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. 4 Years"
                      value={formData.experienceYears}
                      onChange={(e) => { set("experienceYears", e.target.value); if (errors.experienceYears) setErrors({ ...errors, experienceYears: "" }); }}
                      style={inputStyle(errors.experienceYears)}
                    />
                    {errors.experienceYears && <div style={{ color: "#f87171", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.experienceYears}</div>}
                  </motion.div>
                )}

                {/* Resume / PDF Upload */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={labelStyle}>
                    Upload Resume (PDF Only, Max 5MB) <span style={{ color: "#ff4d6d" }}>*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleFileChange(e.target.files[0]);
                    }}
                  />
                  {!resumeFile ? (
                    <div
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      style={{
                        border: errors.resume ? "2px dashed #ef4444" : "2px dashed rgba(255, 255, 255, 0.2)",
                        borderRadius: "16px",
                        padding: "32px 20px",
                        textAlign: "center",
                        background: "rgba(255, 255, 255, 0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--fg, #fff)", marginBottom: "4px" }}>
                        Click to browse or drag &amp; drop your resume
                      </div>
                      <div style={{ fontSize: "12.5px", color: "var(--muted, #94a3b8)" }}>
                        Supported format: <strong>.PDF</strong> (Maximum file size: 5MB)
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderRadius: "14px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            background: "rgba(16, 185, 129, 0.2)",
                            color: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            fontWeight: 800,
                          }}
                        >
                          PDF
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "14.5px", color: "#fff" }}>{resumeFileName}</div>
                          <div style={{ fontSize: "12px", color: "var(--muted, #94a3b8)", marginTop: "2px" }}>
                            {resumeSize} · Verified PDF Ready for submission
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                  {errors.resume && <div style={{ color: "#f87171", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.resume}</div>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-solid"
                  style={{
                    width: "100%",
                    padding: "16px",
                    fontSize: "15px",
                    fontWeight: 800,
                    justifyContent: "center",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Data →"}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}