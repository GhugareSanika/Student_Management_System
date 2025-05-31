import mongoose from "mongoose";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/database.log" }),
  ],
});

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("Mongoose connection closed due to app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
