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
 * Manager - Get All Records History
 */
router.get(
  "/history",
  authenticateToken,
  authorizeRoles("manager"),
  async (req: Request, res: Response) => {
    try {
      const managerId = (req as any).user.id;

      // Get branch assigned to manager
      const branch = await branchRepo.getBranchByManager(managerId);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Manager not assigned to any branch",
        });
      }

      // Fetch all records for this branch
      const records = await dailyRepo.getRecordsByBranch(
        branch._id.toString()
      );

      return res.json({
        success: true,
        data: records,
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
 * Owner - View Detailed Daily Records
 */
router.get(
  "/owner",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: Request, res: Response) => {
    try {
      const ownerId = (req as any).user.id;

      const { branchId, startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      // Date Parsing
      if (startDate && endDate) {
        start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);

        end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
      }

      // Call Repository
      const records = await dailyRepo.getOwnerRecords(
        ownerId,
        branchId as string | undefined,
        start,
        end
      );

      return res.json({
        success: true,
        data: records,
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

      const { salesItems } = req.body;

      if (!salesItems || !Array.isArray(salesItems) || salesItems.length === 0) {
        return res.status(400).json({
          success: false,
           message: "salesItems are required"
        });
      }

for (const item of salesItems) {
  if (item.quantity <= 0 || item.price < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid quantity or price"
    });
  }
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