import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/logout", logout);

export default router;
