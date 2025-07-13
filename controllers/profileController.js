import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username userId email");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        username: user.username,
        userId: user.userId,
        email: user.email,
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};