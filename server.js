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
