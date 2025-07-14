import express from "express";
import {
  generateQrCode,
  sendCoinNotification
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/generate-qr", generateQrCode);
router.post("/send", sendCoinNotification);

export default router;
