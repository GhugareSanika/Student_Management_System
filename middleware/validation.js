import { body, param, query, validationResult } from "express-validator";

// Helper function to handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Student validation rules
export const validateStudent = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("age")
    .isInt({ min: 16, max: 100 })
    .withMessage("Age must be between 16 and 100"),

  body("department")
    .isIn([
      "IT",
      "Computer Science",
      "Electronics",
      "Mechanical",
      "Civil",
      "Chemical",
      "Electrical",
    ])
    .withMessage("Please provide a valid department"),

  body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be 10 digits"),

  handleValidationErrors,
];

export const validateStudentUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("age")
    .optional()
    .isInt({ min: 16, max: 100 })
    .withMessage("Age must be between 16 and 100"),

  body("department")
    .optional()
    .isIn([
      "IT",
      "Computer Science",
      "Electronics",
      "Mechanical",
      "Civil",
      "Chemical",
      "Electrical",
    ])
    .withMessage("Please provide a valid department"),

  body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be 10 digits"),

  handleValidationErrors,
];

// Course validation rules
export const validateCourse = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("credits")
    .isInt({ min: 1, max: 6 })
    .withMessage("Credits must be between 1 and 6"),

  body("courseCode")
    .matches(/^[A-Z]{2,4}\d{3,4}$/)
    .withMessage("Course code must be in format like CS101 or MATH1001"),

  body("department")
    .isIn([
      "IT",
      "Computer Science",
      "Electronics",
      "Mechanical",
      "Civil",
      "Chemical",
      "Electrical",
    ])
    .withMessage("Please provide a valid department"),

  body("instructor.name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Instructor name must be between 2 and 50 characters"),

  body("instructor.email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid instructor email"),

  body("duration")
    .isIn(["1 month", "2 months", "3 months", "4 months", "6 months", "1 year"])
    .withMessage("Please provide a valid duration"),

  body("startDate")
    .isISO8601()
    .withMessage("Please provide a valid start date"),

  body("endDate").isISO8601().withMessage("Please provide a valid end date"),

  handleValidationErrors,
];

// Auth validation rules
export const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Parameter validation
export const validateObjectId = [
  param("id").isMongoId().withMessage("Please provide a valid ID"),

  handleValidationErrors,
];

// Query validation for pagination and filtering
export const validateStudentQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("department")
    .optional()
    .isIn([
      "IT",
      "Computer Science",
      "Electronics",
      "Mechanical",
      "Civil",
      "Chemical",
      "Electrical",
    ])
    .withMessage("Please provide a valid department"),

  handleValidationErrors,
];

export const validateCourseQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("title")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search title cannot be empty"),

  handleValidationErrors,
];
