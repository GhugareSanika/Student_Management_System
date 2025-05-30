import { body, param, query, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
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
    .optional()
    .isInt({ min: 16, max: 100 })
    .withMessage("Age must be between 16 and 100"),
  body("department")
    .isIn([
      "IT",
      "Computer Science",
      "Engineering",
      "Business",
      "Arts",
      "Science",
    ])
    .withMessage("Invalid department"),
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
      "Engineering",
      "Business",
      "Arts",
      "Science",
    ])
    .withMessage("Invalid department"),
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
  body("instructor")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Instructor name must be between 2 and 50 characters"),
  body("department")
    .isIn([
      "IT",
      "Computer Science",
      "Engineering",
      "Business",
      "Arts",
      "Science",
    ])
    .withMessage("Invalid department"),
  body("duration")
    .isIn(["1 month", "2 months", "3 months", "6 months", "1 year"])
    .withMessage("Invalid duration"),
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
  param("id").isMongoId().withMessage("Invalid ID format"),
  handleValidationErrors,
];

// Query validation
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];
