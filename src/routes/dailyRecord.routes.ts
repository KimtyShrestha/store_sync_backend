import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { DailyRecordRepository } from "../repositories/dailyRecord.repository";
import { BranchRepository } from "../repositories/branch.repository";

const router = Router();
const dailyRepo = new DailyRecordRepository();
const branchRepo = new BranchRepository();

/**
 * Manager - Get Today's Record
 */
router.get(
  "/today",
  authenticateToken,
  authorizeRoles("manager"),
  async (req: Request, res: Response) => {
    try {
      const managerId = (req as any).user.id;

      // Find branch assigned to manager
      const branch = await branchRepo.getBranchByManager(managerId);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Manager not assigned to any branch",
        });
      }

      const record = await dailyRepo.getTodayRecord(branch._id.toString());

      return res.json({
        success: true,
        data: record,
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
 * Manager - Create or Update Today's Record
 */
router.post(
  "/today",
  authenticateToken,
  authorizeRoles("manager"),
  async (req: Request, res: Response) => {
    try {
      const managerId = (req as any).user.id;

      const branch = await branchRepo.getBranchByManager(managerId);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Manager not assigned to any branch",
        });
      }

      const record = await dailyRepo.createOrUpdateTodayRecord(
        branch._id.toString(),
        managerId,
        req.body
      );

      return res.json({
        success: true,
        message: "Daily record saved successfully",
        data: record,
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

// Automatically detect manager from token
// • Automatically detect branch from manager
// • Allow only manager role
// • Allow only today record
// • Auto create if not exists
// • Update same record if exists