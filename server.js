import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Configure Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "student-management-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Serve static files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/student_management"
    );
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Student Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api/health`);
  });
};

startServer();

export default app;
