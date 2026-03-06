import { Router, Request, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { BranchRepository } from "../repositories/branch.repository";
import { UserRepository } from "../repositories/user.respository";
import mongoose from "mongoose";

const router = Router();
const branchRepo = new BranchRepository();
const userRepo = new UserRepository();

/**
 * Owner creates branch
 */
router.post(
  "/create",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = new mongoose.Types.ObjectId(req.user!.id);
      const { name, location } = req.body;

      if (!name || !location) {
        return res.status(400).json({
          success: false,
          message: "Name and location are required",
        });
      }

      const branch = await branchRepo.createBranch({
        name,
        location,
        ownerId,
      });

      return res.status(201).json({
        success: true,
        message: "Branch created successfully",
        data: branch,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
);

/**
 * Owner views own branches
 */
router.get(
  "/my-branches",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user!.id;

      const branches = await branchRepo.getBranchesByOwner(ownerId);

      return res.json({
        success: true,
        data: branches,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
);

/**
 * Manager gets their branch info (Dashboard use)
 */
router.get(
  "/my-branch",
  authenticateToken,
  authorizeRoles("manager"),
  async (req: AuthRequest, res: Response) => {
    try {
      const managerId = req.user!.id;

      const branch = await branchRepo.getBranchByManager(managerId);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      const owner = await userRepo.getUserById(
        branch.ownerId.toString()
      );

      return res.json({
        success: true,
        data: {
          branchName: branch.name,
          location: branch.location,
          ownerName: owner
            ? `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim()
            : "Unknown",
        },
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
);

/**
 * Assign Manager (ONE branch only restriction)
 */
router.patch(
  "/assign-manager/:branchId/:managerId",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user!.id;
      const { branchId, managerId } = req.params;

      const branch = await branchRepo.getBranchById(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      if (branch.ownerId.toString() !== ownerId) {
        return res.status(403).json({
          success: false,
          message: "You cannot modify this branch",
        });
      }

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
          message: "Manager does not belong to you",
        });
      }

      if (manager.status !== "approved") {
        return res.status(400).json({
          success: false,
          message: "Manager is not approved yet",
        });
      }

      // ONE branch per manager rule
      const existingBranch = await branchRepo.getBranchByManager(managerId);

      if (existingBranch && existingBranch._id.toString() !== branchId) {
        return res.status(400).json({
          success: false,
          message: "Manager is already assigned to another branch",
        });
      }

      const updatedBranch = await branchRepo.assignManager(
        branchId,
        managerId
      );

      return res.json({
        success: true,
        message: branch.managerId
          ? "Manager replaced successfully"
          : "Manager assigned successfully",
        data: updatedBranch,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
);

/**
 * Remove Manager
 */
router.patch(
  "/remove-manager/:branchId",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user!.id;
      const { branchId } = req.params;

      const branch = await branchRepo.getBranchById(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      if (branch.ownerId.toString() !== ownerId) {
        return res.status(403).json({
          success: false,
          message: "You cannot modify this branch",
        });
      }

      if (!branch.managerId) {
        return res.status(400).json({
          success: false,
          message: "No manager assigned to this branch",
        });
      }

      const updatedBranch = await branchRepo.removeManager(branchId);

      return res.json({
        success: true,
        message: "Manager removed successfully",
        data: updatedBranch,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
);

export default router;