// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Allow JSON body
app.use(express.json());

// Allow frontend to call this backend
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5500",
  })
);

// Mail setup (using Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Simple test route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
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
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.json({ success: true, message: "Message sent!" });
  } catch (err) {
    console.error("Mail error:", err.message);
    return res
      .status(500)
      .json({ success: false, error: "Server error. Try again later." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
