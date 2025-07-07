const express = require("express");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

// NEW: Very early request logger
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    // Only log API requests
    console.log(
      `[${new Date().toISOString()}] Incoming API Request: ${req.method} ${req.path} from IP: ${req.ip}`
    );
  }
  next();
});

// Security middleware (Helmet)
app.use(helmet());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware for parsing request bodies and cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS Configuration
const frontendOrigin = process.env.CLIENT_URL;

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// Development vs Production rate limiting
const isDevelopment = process.env.NODE_ENV !== "production";

// General rate limiting - much more lenient for development
const limiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 300,
  message: {
    error: "Too many requests from this IP",
    retryAfter: isDevelopment ? "1 minute" : "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment) {
      const clientIP = req.ip || req.connection.remoteAddress;
      return (
        clientIP === "127.0.0.1" ||
        clientIP === "::1" ||
        clientIP.includes("localhost")
      );
    }
    return false;
  },
});

// Apply general rate limiting to all API routes
app.use("/api/", limiter);

// Auth-specific rate limiting - more lenient for development
const authLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: isDevelopment ? 100 : 20,
  message: {
    error: "Too many authentication attempts from this IP",
    retryAfter: isDevelopment ? "1 minute" : "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment) {
      const clientIP = req.ip || req.connection.remoteAddress;
      return (
        clientIP === "127.0.0.1" ||
        clientIP === "::1" ||
        clientIP.includes("localhost")
      );
    }
    return false;
  },
});
app.use("/api/auth", authLimiter);

// Special rate limiter for refresh endpoint - even more lenient
const refreshLimiter = rateLimit({
  windowMs: isDevelopment ? 30 * 1000 : 5 * 60 * 1000,
  max: isDevelopment ? 50 : 10,
  message: {
    error: "Too many token refresh attempts",
    retryAfter: isDevelopment ? "30 seconds" : "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDevelopment) {
      const clientIP = req.ip || req.connection.remoteAddress;
      return (
        clientIP === "127.0.0.1" ||
        clientIP === "::1" ||
        clientIP.includes("localhost")
      );
    }
    return false;
  },
});
app.use("/api/auth/refresh", refreshLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/portfolios", portfolioRoutes);

// Simple test route
app.get("/test", (req, res) => {
  res.send("Test route works!");
});

// Ping route to keep backend awake
app.get("/api/ping", (req, res) => {
  return res.status(200).json({ success: true, message: "Backend is awake" });
});

// Development logging middleware (This is good, keep it)
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`
    );
    next();
  });
}

// Error Handling Middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(
    `[${new Date().toISOString()}] Backend Error Caught: ${err.message}`
  ); // NEW: Log all caught errors
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack); // NEW: Log stack in dev
  }
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
  console.log(`Frontend URL configured for CORS: ${process.env.CLIENT_URL}`);
  if (isDevelopment) {
    console.log("🚀 Development mode: Rate limiting is relaxed for localhost");
  }
});
