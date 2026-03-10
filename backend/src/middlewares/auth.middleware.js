const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("🔐 authMiddleware called");
  
  try {
    const authHeader = req.header("Authorization");
    console.log("Headers:", authHeader);

    if (!authHeader) {
      console.log("❌ No token");
      return res.status(401).json({ message: "Không có token" });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Token:", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Token valid, user:", decoded);
    next();
  } catch (error) {
    console.log("❌ Error:", error.message);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
