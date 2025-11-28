// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ========================
// MIDDLEWARE
// ========================

// Parse JSON bodies
app.use(express.json());

// 🔥 SIMPLE CORS: allow ALL origins (OK for a small portfolio API)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Handle preflight for all routes
app.options("*", cors());

// ========================
// NODEMAILER (GMAIL) SETUP
// ========================
//
// In Render / .env:
//
// MAIL_USER=yourgmail@gmail.com
// MAIL_PASS=your_gmail_app_password
// MAIL_TO=yourgmail@gmail.com   (optional)
//

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Optional: check mail config at startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Nodemailer config error:", err.message || err);
  } else {
    console.log("✅ Mail server is ready to take messages");
  }
});

// ========================
// ROUTES
// ========================

// Root route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Please enter a valid email address." });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO || process.env.MAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <h2>New message from portfolio</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${String(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.json({ success: true, message: "Message sent!" });
  } catch (err) {
    console.error("❌ Mail error:", err.message || err);
    return res.status(500).json({
      success: false,
      error: "Server error while sending email. Please try again later.",
    });
  }
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
