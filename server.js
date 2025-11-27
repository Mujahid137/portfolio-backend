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

// CORS – allow your frontend(s)
const corsOptions = {
  origin: [
    "https://mujahid137.github.io", // your GitHub Pages URL
    "http://localhost:5500",        // local dev (VS Code Live Server)
    "http://127.0.0.1:5500",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
// Handle preflight for all routes
app.options("*", cors(corsOptions));

// ========================
// NODEMAILER (GMAIL) SETUP
// ========================
//
// In Render / .env, you MUST set:
//
// MAIL_USER=yourgmail@gmail.com
// MAIL_PASS=your_gmail_app_password   (NOT your normal password)
// MAIL_TO=yourgmail@gmail.com         (optional, defaults to MAIL_USER)
//
// FRONTEND_ORIGIN is NOT required anymore, we hard-coded origins above.
//

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Optional: verify mail configuration on server start
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

// Basic root route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Health check (optional)
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

  // Simple email pattern check (not perfect, but good enough)
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
