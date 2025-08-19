import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 failed attempts
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json({
      message: "Too many failed login attempts. Please try again later.",
    });
  },
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // For normal requests
  standardHeaders: true,
  legacyHeaders: false,
});
