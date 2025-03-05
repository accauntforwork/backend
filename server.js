const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Google Sheets API sozlamalari
const auth = new google.auth.GoogleAuth({
  keyFile: "google-credentials.json", // Xizmat akkaunt JSON fayli
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // Google Sheets ID .env faylidan olinadi

// Buyurtma qabul qilish endpointi
app.post("/submit-order", async (req, res) => {
  const { name, phone, product, price } = req.body;

  if (!name || !phone || !product || !price) {
    return res.status(400).json({
      success: false,
      message: "Barcha maydonlar to‘ldirilishi kerak!",
    });
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "A:D",
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, phone, product, price]],
      },
    });

    res.json({
      success: true,
      message: "Buyurtma qabul qilindi va Google Sheets-ga yozildi!",
    });
  } catch (error) {
    console.error("Google Sheets API xatosi:", error);
    res
      .status(500)
      .json({ success: false, message: "Xatolik yuz berdi", error });
  }
});

// Serverni ishga tushirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi!`);
});
