import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { UserRepository } from "../repositories/user.respository";

const router = Router();
const userRepo = new UserRepository();

// Get pending owners
router.get(
  "/owners/pending",
  authenticateToken,
  authorizeRoles("superadmin"),
  async (req, res) => {
    try {
      const owners = await userRepo.getPendingUsersByRole("owner");

      res.json({
        success: true,
        data: owners,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Approve owner
router.patch(
  "/approve-owner/:id",
  authenticateToken,
  authorizeRoles("superadmin"),
  async (req, res) => {
    try {
      const updatedUser = await userRepo.updateUser(req.params.id, {
        status: "approved",
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Owner not found",
        });
      }

      res.json({
        success: true,
        message: "Owner approved successfully",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Delete owner
router.delete(
  "/owners/:id",
  authenticateToken,
  authorizeRoles("superadmin"),
  async (req, res) => {
    try {
      const deleted = await userRepo.deleteUser(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Owner not found",
        });
      }

      res.json({
        success: true,
        message: "Owner deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;