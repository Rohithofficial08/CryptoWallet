import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nonceMap from "../utils/nonceStore.js";
import { airdropToNewUser } from "../utils/airdropService.js";

const SECRET = process.env.JWT_SECRET;

const generateUserId = async (username) => {
  const prefix = username.slice(0, 3).toLowerCase();
  let userId;
  let exists;
  do {
    const random = Math.floor(10000 + Math.random() * 90000);
    userId = (prefix + random).slice(0, 8);
    exists = await User.findOne({ userId });
  } while (exists);
  return userId;
};

// ✅ UPDATED: No signature verification required
export const register = async (req, res) => {
  const { username, email, password, walletAddress } = req.body;

  // ✅ CHANGED: signature is optional now
  if (!username || !email || !password || !walletAddress) {
    return res.status(400).json({ error: "Missing required fields: username, email, password, walletAddress" });
  }

  try {
    // ✅ REMOVED: All nonce and signature verification logic
    // No need to verify signature for MVP
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    // Check if wallet already registered
    const walletExists = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (walletExists) return res.status(400).json({ error: "Wallet already registered" });

    // ✅ ADDED: Basic wallet address validation
    if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      return res.status(400).json({ error: "Invalid wallet address format" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = await generateUserId(username);

    const user = await User.create({
      username,
      email,
      password: hashed,
      walletAddress: walletAddress.toLowerCase(), // Store in lowercase for consistency
      userId,
      walletVerified: true, // ✅ Auto-verify for MVP (no signature needed)
    });

    // ✅ Airdrop APT tokens to new user
    if (!user.isAirdropped) {
      console.log(`🪂 Starting airdrop for new user: ${walletAddress}`);
      const success = await airdropToNewUser(walletAddress);
      if (success) {
        user.isAirdropped = true;
        await user.save();
        console.log(`✅ Airdrop successful for: ${walletAddress}`);
      } else {
        console.log(`⚠️ Airdrop failed for: ${walletAddress}`);
      }
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    console.log(`🎉 User registered successfully: ${username} (${walletAddress})`);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      userId: user.userId,
      walletAddress: user.walletAddress,
      username: user.username,
      airdropped: user.isAirdropped,
    });
  } catch (err) {
    console.error(`❌ Registration error:`, err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Normal login (email & password) - NO CHANGES NEEDED
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user.userId,
      walletAddress: user.walletAddress,
      username: user.username,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Token verification - NO CHANGES NEEDED
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email userId walletAddress");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Token valid",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userId: user.userId,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ OPTIONAL: Add nonce endpoint for future use (if you want to add signature verification later)
export const generateNonce = async (req, res) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address required" });
  }

  try {
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    nonceMap.set(walletAddress.toLowerCase(), nonce);
    
    // Expire nonce after 5 minutes
    setTimeout(() => {
      nonceMap.delete(walletAddress.toLowerCase());
    }, 5 * 60 * 1000);

    return res.status(200).json({ nonce });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};