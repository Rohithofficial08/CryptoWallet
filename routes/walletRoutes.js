import express from "express";
import { getWalletBalance } from "../controllers/walletControllers.js";

const router = express.Router();

router.get("/balance/:wallet", getWalletBalance);

export default router;
