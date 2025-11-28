// server.js
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

// ========================
// BASIC MIDDLEWARE
// ========================

// Parse JSON request bodies
app.use(express.json());

// ========================
// FIXED CORS (MANUAL)
// ========================
// This *guarantees* GitHub Pages → Render works.
// No cors() package needed.
// Handles OPTIONS preflight automatically.

app.use((req, res, next) => {
  // Allow GitHub Pages
  res.header("Access-Control-Allow-Origin", "https://mujahid137.github.io");

  // Allowed methods
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  // Allowed headers
  res.header("Access-Control-Allow-Headers", "Content-Type");

  // Respond immediately to preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ========================
// NODEMAILER SETUP (GMAIL)
// ========================
//
// IMPORTANT: In Render Dashboard → Environment Variables:
//
// MAIL_USER = yourgmail@gmail.com
// MAIL_PASS = your Google App Password
// MAIL_TO   = yourgmail@gmail.com (optional)
//
// Normal Gmail password WILL NOT WORK.
//

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Debug mail configuration
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email config error:", err.message || err);
  } else {
    console.log("✅ Mail server ready");
  }
});

// ========================
// ROUTES
// ========================

// Root route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running correctly" });
});

// Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};

  // Validate input
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Please enter a valid email address." });
  }

  try {
    // Send email
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO || process.env.MAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <h2>You got a new portfolio message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${String(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Mail sending error:", err.message || err);
    return res.status(500).json({
      success: false,
      error: "Server error. Could not send message.",
    });
  }
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
