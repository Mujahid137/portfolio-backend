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

// CORS – allow your frontend origins
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, // e.g. https://mujahid137.github.io
  "http://localhost:5500",     // VSCode Live Server
  "http://127.0.0.1:5500",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (like Postman) with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// ========================
// NODEMAILER (GMAIL) SETUP
// ========================
// Make sure in your .env / Render env:
//
// MAIL_USER=yourgmail@gmail.com
// MAIL_PASS=your_app_password   (NOT normal password)
// MAIL_TO=yourgmail@gmail.com   (optional, defaults to MAIL_USER)
// FRONTEND_ORIGIN=https://mujahid137.github.io
//
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Optional: log if mail config is okay
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

// Simple test route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Optional health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};

  // Basic validation
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  // Very simple email format check (not perfect, just basic)
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
