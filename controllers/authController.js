// import User from "../models/User.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// const SECRET = process.env.JWT_SECRET;

// function generateUserId(username) {
//   const prefix = username.slice(0, 3).toLowerCase();
//   const random = Math.floor(10000 + Math.random() * 89999); 
//   return (prefix + random).slice(0, 8);
// }

// export const register = async (req, res) => {
//   const { username, email, password, walletAddress } = req.body;

//   if (!email || !password || !walletAddress) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ error: "User already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, email, password: hashed, walletAddress });

//     const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });
//     res.status(201).json({ message: "User registered", token, walletAddress });
//   } catch (err) {
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// export const login = async (req, res) => {
//   const { username, email, password, walletAddress } = req.body;

//   try {
//     const user = await User.findOne({ email, username });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid password" });

//     if (walletAddress !== user.walletAddress) {
//       return res.status(401).json({ error: "Wallet address mismatch" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       walletAddress: user.walletAddress
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };


// export const verifyToken = async (req, res) => {
//   res.status(200).json({ message: "Token valid", userId: req.user.id });
// };

import dotenv from "dotenv";
dotenv.config(); 
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

function generateUserId(username) {
  const prefix = username.slice(0, 3).toLowerCase();
  const random = Math.floor(10000 + Math.random() * 89999); // ensures 5-digit number
  return (prefix + random).slice(0, 8);
}

export const register = async (req, res) => {
  const { username, email, password, walletAddress } = req.body;

  if (!username || !email || !password || !walletAddress) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // 🔑 Generate and ensure unique userId
    let userId = generateUserId(username);
    while (await User.findOne({ userId })) {
      userId = generateUserId(username); // regenerate if taken
    }

    const user = await User.create({
      username,
      email,
      password: hashed,
      walletAddress,
      userId
    });

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

export const login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect Password" });

    // if (walletAddress !== user.walletAddress) {
    //   return res.status(401).json({ error: "Wallet address mismatch" });
    // }

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

export const verifyToken = async (req, res) => {
  res.status(200).json({ message: "Token valid", userId: req.user.id });
};
