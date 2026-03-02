import { Router, Response } from "express";
import { authorizeRoles } from "../middleware/role.middleware";
import { UserRepository } from "../repositories/user.respository";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model";

const router = Router();
const userRepo = new UserRepository();


//   OWNER PROFILE ROUTES


/**
 * Get Owner Profile
 */
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user!.id;

      const owner = await UserModel.findById(ownerId).select("-password");

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner not found",
        });
      }

      return res.json({
        success: true,
        data: owner,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * Update Owner Profile
 */
router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user!.id;
      const { firstName, lastName } = req.body;

      const updatedOwner = await UserModel.findByIdAndUpdate(
        ownerId,
        { firstName, lastName },
        { new: true }
      ).select("-password");

      return res.json({
        success: true,
        data: updatedOwner,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * Change Owner Password
 */
router.put(
  "/change-password",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      const owner = await UserModel.findById(ownerId);

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner not found",
        });
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        owner.password
      );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      owner.password = hashedPassword;
      await owner.save();

      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


//  MANAGER MANAGEMENT ROUTES
 


  // Create Manager (Auto Approved)

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

      const hashedPassword = await bcrypt.hash(password, 10);

      const newManager = await userRepo.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "manager",
        status: "approved",
        ownerId,
      });

      return res.json({
        success: true,
        message: "Manager created successfully",
        data: newManager,
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
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

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
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

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;