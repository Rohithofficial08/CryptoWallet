import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { airdropToNewUser } from "../utils/airdropService.js";
import { sendPushToUser } from "../utils/pushNotifications.js"; // ✅ Add this to send push

const SECRET = process.env.JWT_SECRET;

// Unique userId generator
const generateUserId = async (username) => {
  const prefix = username.slice(0, 3).toLowerCase();
  let userId, exists;
  do {
    const random = Math.floor(10000 + Math.random() * 90000);
    userId = (prefix + random).slice(0, 8);
    exists = await User.findOne({ userId });
  } while (exists);
  return userId;
};

export const register = async (req, res) => {
  const { username, email, password, walletAddress, fcmToken } = req.body;

  if (!username || !email || !password || !walletAddress) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const userId = await generateUserId(username);

    const user = await User.create({
      username,
      email,
      password: hashed,
      walletAddress,
      userId,
      walletVerified: false,
      isAirdropped: false,
      fcmToken: fcmToken || null
    });

    // ✅ Airdrop only once per user (if registered for first time)
    if (!user.isAirdropped) {
      const success = await airdropToNewUser(walletAddress);

      if (success) {
        user.isAirdropped = true;

        // ✅ Send FCM push notification
        if (user.fcmToken) {
          const title = "🎉 Airdrop Successful!";
          const body = "You received 50 tokens + gas on your wallet.";
          const data = {
            airdrop: "true",
            userId: user.userId,
            wallet: walletAddress
          };

          await sendPushToUser(user.fcmToken, title, body, data);
        }

        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "User registered",
      token,
      userId: user.userId,
      walletAddress: user.walletAddress
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


// ✅ Login untouched
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect Password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user.userId,
      walletAddress: user.walletAddress
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Token verification untouched
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username email userId walletAddress"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Token valid",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userId: user.userId,
        walletAddress: user.walletAddress
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
