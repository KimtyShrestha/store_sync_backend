import { Router, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { BranchRepository } from "../repositories/branch.repository";
import { Request } from "express";
import { UserRepository } from "../repositories/user.respository";

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
  async (req: Request, res: Response) => {
    const ownerId = (req as any).user.id;

    const { name, location } = req.body;

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
  }
);

/**
 * Owner views own branches
 */
router.get(
  "/my-branches",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: Request, res: Response) => {
    const ownerId = (req as any).user.id;

    const branches = await branchRepo.getBranchesByOwner(ownerId);

    return res.json({
      success: true,
      data: branches,
    });
  }
);


// Assign manager to branch

router.patch(
  "/assign-manager/:branchId/:managerId",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: Request, res: Response) => {
    try {
      const ownerId = (req as any).user.id;
      const { branchId, managerId } = req.params;

      //  Check branch exists
      const branch = await branchRepo.getBranchById(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      // Ensure branch belongs to owner
      if (branch.ownerId.toString() !== ownerId) {
        return res.status(403).json({
          success: false,
          message: "You cannot modify this branch",
        });
      }

      // Check manager exists
      const manager = await userRepo.getUserById(managerId);
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      //  Ensure user is actually a manager
      if (manager.role !== "manager") {
        return res.status(400).json({
          success: false,
          message: "User is not a manager",
        });
      }

      //  Ensure manager belongs to this owner
      if (!manager.ownerId || manager.ownerId.toString() !== ownerId) {
        return res.status(403).json({
          success: false,
          message: "Manager does not belong to you",
        });
      }

      //  Ensure manager is approved
      if (manager.status !== "approved") {
        return res.status(400).json({
          success: false,
          message: "Manager is not approved yet",
        });
      }

      //  Assign manager safely
      const updatedBranch = await branchRepo.assignManager(
        branchId,
        managerId
      );

      return res.json({
        success: true,
        message: "Manager assigned successfully",
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