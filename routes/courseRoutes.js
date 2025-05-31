import express from "express";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByDepartment,
  searchCourses,
  getCourseStats,
} from "../controllers/courseController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  validateCourse,
  validateObjectId,
  validateCourseQuery,
} from "../middleware/validation.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Search route (must be before /:id route)
router.get("/search", searchCourses);

// Department-specific routes
router.get("/department/:department", getCoursesByDepartment);

// Course CRUD routes
router
  .route("/")
  .get(validateCourseQuery, getCourses)
  .post(validateCourse, createCourse);

router
  .route("/:id")
  .get(validateObjectId, getCourse)
  .put(validateObjectId, updateCourse)
  .delete(validateObjectId, deleteCourse);

// Course statistics
router.get("/:id/stats", validateObjectId, getCourseStats);

export default router;
