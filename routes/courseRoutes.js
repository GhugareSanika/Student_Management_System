import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
} from "../controllers/courseController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  validateCourse,
  validateObjectId,
  validatePagination,
} from "../middleware/validation.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Course CRUD routes
router.get("/", validatePagination, getAllCourses);
router.get("/stats", getCourseStats);
router.get("/:id", validateObjectId, getCourseById);
router.post("/", validateCourse, createCourse);
router.put("/:id", validateObjectId, updateCourse);
router.delete("/:id", validateObjectId, deleteCourse);

export default router;
