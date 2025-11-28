require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());

// CORS – manual, always runs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://mujahid137.github.io");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ Email config error:", err.message || err);
  else console.log("✅ Mail server ready");
});

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running correctly" });
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
