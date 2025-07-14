import User from "../models/User.js";
import QRCode from "qrcode";
import { sendPushToUser } from "../utils/pushNotifications.js";

// 🚀 Generate QR Code (userId + walletAddress)
export const generateQrCode = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const qrPayload = {
      userId: user.userId,
      walletAddress: user.walletAddress,
    };

    const qrImage = await QRCode.toDataURL(JSON.stringify(qrPayload));
    res.status(200).json({ qrImage, qrPayload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚀 Send Coin Notification (after successful MetaMask tx)
export const sendCoinNotification = async (req, res) => {
  const { senderId, receiverId, amount, note, txHash } = req.body;

  try {
    if (senderId === receiverId) {
      return res.status(400).json({ error: "❌ Cannot send coins to yourself." });
    }

    const receiver = await User.findOne({ userId: receiverId });
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    // 🔔 Real-time notify via Socket.IO
    const receiverSocketId = global.userSocketMap?.get(receiverId);
    if (receiverSocketId && global.io) {
      global.io.to(receiverSocketId).emit("coinReceived", {
        from: senderId,
        amount,
        note,
        txHash,
        timestamp: Date.now()
      });
    }

    // 🔔 Push notify via FCM
    if (receiver.fcmToken) {
      await sendPushToUser(
        receiver.fcmToken,
        "🎉 You received coins!",
        `${senderId} sent you ${amount} APT`,
        { senderId, amount: String(amount), txHash }
      );
    }
    console.log("Verified");
    res.status(200).json({ message: "✅ Notification sent to receiver." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
