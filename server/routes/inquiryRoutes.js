import express from "express";
import nodemailer from "nodemailer";
import { Inquiry } from "../models/Inquiry.js";
import { verifyToken } from "../middleware/auth.js";
import { getDbConnected, memoryStore } from "../store/memoryStore.js";

const router = express.Router();

// Helper to send email notification on new inquiry
async function sendInquiryEmail(inquiry) {
  const smtpUser = process.env.SMTP_USER || "nexprobyte@gmail.com";
  const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const targetEmail = process.env.NOTIFICATION_EMAIL || smtpUser;

  if (!smtpPass) return;

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"Nexprobyte Portal" <${smtpUser}>`,
      to: targetEmail,
      replyTo: inquiry.email,
      subject: `📩 New Contact Inquiry from ${inquiry.name} (${inquiry.service})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">New Website Contact Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 140px; color: #475569;">Name:</td><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${inquiry.name}</td></tr>
            <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Email:</td><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
            <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Phone:</td><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${inquiry.phone || "N/A"}</td></tr>
            <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Organization:</td><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${inquiry.organization || "N/A"}</td></tr>
            <tr><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Service:</td><td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${inquiry.service}</td></tr>
            <tr><td style="padding: 12px 16px; font-weight: bold; color: #475569; vertical-align: top;">Message:</td><td style="padding: 12px 16px; color: #0f172a; white-space: pre-line;">${inquiry.message}</td></tr>
          </table>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">Received via Nexprobyte Contact Form on ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Sent]: Inquiry notification delivered to ${targetEmail}`);
  } catch (err) {
    console.error("❌ [Email Error]: Failed to send inquiry email notification:", err.message);
  }
}

// Submit Contact Inquiry (POST /api/inquiries)
router.post("/", async (req, res) => {
  const { name, email, phone, service, organization, message } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ message: "Name is required." });
  if (!email || !email.includes("@")) return res.status(400).json({ message: "Valid email is required." });
  if (!message || message.trim().length < 5)
    return res.status(400).json({ message: "Message must be at least 5 characters long." });

  const newInquiry = {
    _id: "inq-" + Date.now(),
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : "",
    organization: organization || "",
    service: service || "General Inquiry",
    message: message.trim(),
    status: "New",
    createdAt: new Date().toISOString(),
  };

  let createdDoc = newInquiry;

  if (getDbConnected()) {
    try {
      createdDoc = await Inquiry.create(newInquiry);
    } catch (e) {
      console.error("Inquiry create error:", e);
      memoryStore.inquiries.unshift(newInquiry);
    }
  } else {
    memoryStore.inquiries.unshift(newInquiry);
  }

  // Trigger async email dispatch
  sendInquiryEmail(createdDoc).catch((err) => console.error("Async email dispatch failed:", err));

  return res.status(201).json({ message: "Inquiry submitted successfully!", inquiry: createdDoc });
});

// Get All Inquiries (GET /api/inquiries - Admin Protected)
router.get("/", verifyToken, async (req, res) => {
  if (getDbConnected()) {
    try {
      const docs = await Inquiry.find().sort({ createdAt: -1 });
      return res.json(docs);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(memoryStore.inquiries);
});

// Update Inquiry Status (PUT /api/inquiries/:id - Admin Protected)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (getDbConnected()) {
    try {
      const doc = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
      return res.json(doc);
    } catch (e) {
      console.error(e);
    }
  }

  const item = memoryStore.inquiries.find((i) => i._id === id || i.id === id);
  if (item) {
    item.status = status;
    return res.json(item);
  }
  return res.status(404).json({ message: "Inquiry not found." });
});

// Delete Inquiry (DELETE /api/inquiries/:id - Admin Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (getDbConnected()) {
    try {
      await Inquiry.findByIdAndDelete(id);
      return res.json({ message: "Deleted successfully." });
    } catch (e) {
      console.error(e);
    }
  }

  memoryStore.inquiries = memoryStore.inquiries.filter((i) => i._id !== id && i.id !== id);
  return res.json({ message: "Deleted successfully." });
});

export default router;
