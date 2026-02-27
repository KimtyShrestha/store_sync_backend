import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { DashboardRepository } from "../repositories/dashboard.repository";

const router = Router();
const dashboardRepo = new DashboardRepository();

/**
 * Owner Dashboard Summary
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("owner"),
  async (req: Request, res: Response) => {
    try {
      const ownerId = (req as any).user.id;

      const { branchId, startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate && endDate) {
        start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);

        end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
      }

      const data = await dashboardRepo.getOwnerDashboard(
        ownerId,
        branchId as string | undefined,
        start,
        end
      );

      return res.json({
        success: true,
        data
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;