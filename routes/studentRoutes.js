import express from "express";
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollStudentInCourse,
  unenrollStudentFromCourse,
  getStudentsByDepartment,
} from "../controllers/studentController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  uploadProfilePicture,
  handleUploadError,
} from "../middleware/upload.js";
import {
  validateStudent,
  validateStudentUpdate,
  validateObjectId,
  validateStudentQuery,
} from "../middleware/validation.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Student CRUD routes
router
  .route("/")
  .get(validateStudentQuery, getStudents)
  .post(
    uploadProfilePicture,
    handleUploadError,
    validateStudent,
    createStudent
  );

router
  .route("/:id")
  .get(validateObjectId, getStudent)
  .put(
    validateObjectId,
    uploadProfilePicture,
    handleUploadError,
    validateStudentUpdate,
    updateStudent
  )
  .delete(validateObjectId, deleteStudent);

// Course enrollment routes
router.post("/:id/enroll/:courseId", validateObjectId, enrollStudentInCourse);
router.delete(
  "/:id/unenroll/:courseId",
  validateObjectId,
  unenrollStudentFromCourse
);

// Department-specific routes
router.get("/department/:department", getStudentsByDepartment);

export default router;
