import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET || "nexprobyte_admin_secret_key_2026";
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
