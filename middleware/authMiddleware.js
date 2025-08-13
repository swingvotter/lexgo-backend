const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    // 1️⃣ Get access token from cookie
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing. Please log in again.",
        doc: "make request to the refresh-Token endpoint whiles user is logged in else let the user login again",
      });
    }

    // 2️⃣ Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3️⃣ Attach user info to request object
    req.userInfo = decoded; // decoded contains { id, iat, exp }

    // 4️⃣ Proceed to the next middleware/controller
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired. Please refresh your session.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid access token.",
    });
  }
};

module.exports = auth;
