import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nonceMap from "../utils/nonceStore.js";

const SECRET = process.env.JWT_SECRET;

// Step 1: Send nonce to client
export const getNonce = async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Wallet address required" });

  const nonce = `Login to your account - ${Math.floor(Math.random() * 1000000)}`;
  nonceMap.set(address.toLowerCase(), nonce);

  return res.status(200).json({ nonce });
};

// Step 2: Verify the signature (used for MetaMask-only login)
export const verifyWalletSignature = async (req, res) => {
  const { address, signature } = req.body;
  if (!address || !signature) return res.status(400).json({ error: "Missing fields" });

  const nonce = nonceMap.get(address.toLowerCase());
  if (!nonce) return res.status(400).json({ error: "Nonce expired or invalid" });

  try {
    const recovered = ethers.verifyMessage(nonce, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        walletAddress: address,
        username: `user_${address.slice(2, 8)}`,
        email: `eth_${address.slice(2, 8)}@walletuser.io`,
        password: "",
        userId: address.slice(2, 10),
      });
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });
    nonceMap.delete(address.toLowerCase());

    return res.status(200).json({
      message: "Wallet verified",
      token,
      userId: user.userId,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error("Signature verification error:", error.message);
    return res.status(500).json({ error: "Verification failed" });
  }
};
