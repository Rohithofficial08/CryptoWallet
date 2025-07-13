import express from "express";
import { getUserProfile } from "../controllers/profileController.js";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyTokenMiddleware, getUserProfile);

export default router;
