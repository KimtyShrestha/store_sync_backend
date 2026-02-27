import { Router, Response } from "express";
import { authorizeRoles } from "../middleware/role.middleware";
import { UserRepository } from "../repositories/user.respository";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
const userRepo = new UserRepository();

/**
 * View pending managers of this owner
 */
router.get(
  "/pending-managers",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {

    const ownerId = req.user!.id;

    const managers = await userRepo.getPendingManagersByOwner(ownerId);

    return res.json({
      success: true,
      data: managers,
    });
  }
);

//  Approve manager

router.patch(
  "/approve-manager/:managerId",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {

    const managerId = req.params.managerId;  // ✅ FIXED
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
        message: "You cannot approve this manager",
      });
    }

    await userRepo.updateUser(managerId, {
      status: "approved",
    });

    return res.json({
      success: true,
      message: "Manager approved successfully",
    });
  }
);


//  Reject manager
 
router.delete(
  "/reject-manager/:managerId",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: AuthRequest, res: Response) => {

    const managerId = req.params.managerId;  // ✅ FIXED
    const ownerId = req.user!.id;

    const manager = await userRepo.getUserById(managerId);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    if (!manager.ownerId || manager.ownerId.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "You cannot reject this manager",
      });
    }

    await userRepo.deleteUser(managerId);

    return res.json({
      success: true,
      message: "Manager rejected and deleted",
    });
  }
);

export default router;