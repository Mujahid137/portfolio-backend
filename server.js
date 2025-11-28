// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ==========================
// CORS CONFIG
// ==========================
// For development: allow all origins
// For production, you can restrict to your GitHub Pages domain.
app.use(
  cors({
    origin: [
      "http://localhost:5500",                // local dev (VS Code Live Server etc.)
      "http://127.0.0.1:5500",
      "https://mujahid137.github.io"          // your GitHub Pages portfolio
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// ==========================
// CONTACT API
// ==========================
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required.",
    });
  }

  try {
    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT
        ? parseInt(process.env.SMTP_PORT, 10)
        : 587,
      secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: subject || `New message from ${name}`,
      text: `You have a new message from your portfolio contact form:

Name: ${name}
Email: ${email}

Message:
${message}
`,
    });

    console.log(`✅ Email sent from ${name} <${email}>`);

    return res.json({
      success: true,
      message: "Email sent successfully.",
    });
  } catch (err) {
    console.error("❌ Error sending email:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to send email. Please try again later.",
    });
  }
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
