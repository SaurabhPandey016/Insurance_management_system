import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate requests via JWT stored in HttpOnly cookies
 */
export function protect(req, res, next) {
  try {
    let token = null;

    // Retrieve token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing. Please log in.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id, email, role, name
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
    });
  }
}

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles - Allowed roles (ADMIN, AGENT, CUSTOMER)
 */
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to perform this action.",
      });
    }
    next();
  };
}
