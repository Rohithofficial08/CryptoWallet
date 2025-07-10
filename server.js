import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5070;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Server is running and DB is connected!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
