import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollInCourse,
  unenrollFromCourse,
} from "../controllers/studentController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  validateStudent,
  validateStudentUpdate,
  validateObjectId,
  validatePagination,
} from "../middleware/validation.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Student CRUD routes
router.get("/", validatePagination, getAllStudents);
router.get("/:id", validateObjectId, getStudentById);
router.post("/", validateStudent, createStudent);
router.put("/:id", validateObjectId, validateStudentUpdate, updateStudent);
router.delete("/:id", validateObjectId, deleteStudent);

// Course enrollment routes
router.post("/:id/enroll", validateObjectId, enrollInCourse);
router.post("/:id/unenroll", validateObjectId, unenrollFromCourse);

export default router;
