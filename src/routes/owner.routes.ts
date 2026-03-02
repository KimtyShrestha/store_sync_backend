import { Router, Response } from "express";
import { authorizeRoles } from "../middleware/role.middleware";
import { UserRepository } from "../repositories/user.respository";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";
import { Types } from "mongoose";
import bcrypt from "bcrypt"; 

const router = Router();
const userRepo = new UserRepository();



/**
 * Create Manager (Auto Approved)
 */
router.post(
  "/create-manager",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const ownerId = new Types.ObjectId(req.user!.id);

      const existingUser = await userRepo.getUserByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      //HASH PASSWORD HERE
      const hashedPassword = await bcrypt.hash(password, 10);

      const newManager = await userRepo.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword, // ✅ FIXED
        role: "manager",
        status: "approved",
        ownerId,
      });

      return res.json({
        success: true,
        message: "Manager created successfully",
        data: newManager,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error creating manager",
      });
    }
  }
);

/**
 * Get All Managers of This Owner
 */
router.get(
  "/managers",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user!.id;

      const managers = await userRepo.getManagersByOwner(ownerId);

      return res.json({
        success: true,
        data: managers,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching managers",
      });
    }
  }
);

/**
 * Delete Manager
 */
router.delete(
  "/delete-manager/:managerId",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const managerId = req.params.managerId;
      const ownerId = req.user!.id;

      const manager = await userRepo.getUserById(managerId);

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      if (manager.role !== "manager") {
        return res.status(400).json({
          success: false,
          message: "User is not a manager",
        });
      }

      if (!manager.ownerId || manager.ownerId.toString() !== ownerId) {
        return res.status(403).json({
          success: false,
          message: "You cannot delete this manager",
        });
      }

      await userRepo.deleteUser(managerId);

      return res.json({
        success: true,
        message: "Manager deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting manager",
      });
    }
  }
);

export default router;