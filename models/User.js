import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    walletAddress: { type: String, required: true, unique: true },
    userId: { type: String, unique: true, required: true },
    isAirdropped: { type: Boolean, default: false }, // ✅ Airdrop only once
    fcmToken: { type: String }, // ✅ Push notification
    qrCodeData: { type: Object },
    qrCodeImageUrl: { type: String },
    walletVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
