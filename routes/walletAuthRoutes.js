import express from "express";
import { getNonce, verifyWalletSignature } from "../controllers/walletAuthControllers.js";

const router = express.Router();

// POST /api/metamask/nonce
router.post("/nonce", getNonce);

// POST /api/metamask/verify
router.post("/verify", verifyWalletSignature);

export default router;
