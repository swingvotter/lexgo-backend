const User = require("../model/userModel");

const adminOnly = async (req, res, next) => {
  try {
    const userId = req.userInfo && req.userInfo.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

module.exports = adminOnly;


