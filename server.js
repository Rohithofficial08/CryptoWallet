import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5070;

connectDB();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Server is running and DB is connected!");
});
app.use("/api/auth",authRoute);

app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
console.log("Loaded JWT secret:", process.env.JWT_SECRET);
});
