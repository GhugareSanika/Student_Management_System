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

router.use(authenticateToken);

router.get("/search", searchCourses);

router.get("/department/:department", getCoursesByDepartment);

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
