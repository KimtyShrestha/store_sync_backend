import { Router } from "express";
import { AuthController } from "../controller/auth.controller";


console.log("Auth routes file loaded");

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
// add remaning routes like login, logout, etc.

router.get("/test", (req, res) => {
  console.log("Auth route working");
  res.json({ message: "Auth route working" });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;