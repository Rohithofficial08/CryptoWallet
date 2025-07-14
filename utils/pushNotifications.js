import admin from "../firebase/firebaseConfig.js";

export const sendPushToUser = async (fcmToken, title, body, data = {}) => {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ FCM push sent:", response);
  } catch (err) {
    console.error("❌ FCM push failed:", err.message);
  }
};
