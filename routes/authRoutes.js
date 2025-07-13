import express from "express";
import { register, login, verifyToken } from "../controllers/authController.js";
import {verifyTokenMiddleware} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/verify", verifyTokenMiddleware, verifyToken);

export default router;
