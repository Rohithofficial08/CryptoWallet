import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoutes.js";
import profileRoute from "./routes/profileRoutes.js";
import walletRoute from "./routes/walletRoutes.js";
import walletAuthRoutes from "./routes/walletAuthRoutes.js";
import transactionRoute from "./routes/transactionRoute.js";
import "./firebase/firebaseConfig.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or use your frontend URL for production
    methods: ["GET", "POST"]
  }
});

global.io = io; // To access Socket.IO in controllers
global.userSocketMap = new Map(); // Track connected users

// Socket.IO connection logic
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) global.userSocketMap.set(userId, socket.id);

  console.log(`📡 User connected: ${userId} -> ${socket.id}`);

  socket.on("disconnect", () => {
    if (userId) global.userSocketMap.delete(userId);
    console.log(`❌ User disconnected: ${userId}`);
  });
});

connectDB();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Server is running and DB is connected!");
});

app.use("/api/auth",authRoute);
app.use("/api",profileRoute);
app.use("/api/wallet",walletRoute);
app.use("/api/metamask",walletAuthRoutes);
app.use("/api/transactions", transactionRoute);


const PORT = process.env.PORT || 5070;
app.listen(PORT,'0.0.0.0',() => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
console.log("Loaded JWT secret:", process.env.JWT_SECRET);
});
