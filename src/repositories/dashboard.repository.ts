
import { DailyRecordModel } from "../models/dailyRecord.model";
import { BranchModel } from "../models/branch.model";
import mongoose from "mongoose";

export class DashboardRepository {

  async getOwnerDashboard(
    ownerId: string,
    branchId?: string,
    startDate?: Date,
    endDate?: Date
  ) {

    // Default to today if no dates provided
    if (!startDate || !endDate) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      startDate = todayStart;
      endDate = todayEnd;
    }

    // Get branches of owner
    const branchFilter = branchId
      ? { _id: new mongoose.Types.ObjectId(branchId), ownerId }
      : { ownerId };

    const branches = await BranchModel.find(branchFilter);

    const branchIds = branches.map(b => b._id);

    if (branchIds.length === 0) {
      return {
        totalSales: 0,
        totalExpense: 0,
        totalPurchases: 0,
        netProfit: 0,
        branchComparison: [],
        salesTrend: []
      };
    }

    const matchStage = {
      branchId: { $in: branchIds },
      date: { $gte: startDate, $lte: endDate }
    };

    // 1. Overall totals
    const totals = await DailyRecordModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalSales" },
          totalExpense: { $sum: "$totalExpense" },
          totalPurchases: { $sum: "$totalPurchases" }
        }
      }
    ]);

    const totalSales = totals[0]?.totalSales || 0;
    const totalExpense = totals[0]?.totalExpense || 0;
    const totalPurchases = totals[0]?.totalPurchases || 0;
    const netProfit = totalSales - totalExpense - totalPurchases;

    // 2. Branch comparison
    const branchComparison = await DailyRecordModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$branchId",
          sales: { $sum: "$totalSales" },
          expense: { $sum: "$totalExpense" },
          purchases: { $sum: "$totalPurchases" }
        }
      },
      {
        $project: {
          branchId: "$_id",
          sales: 1,
          expense: 1,
          purchases: 1,
          profit: { $subtract: ["$sales", { $add: ["$expense", "$purchases"] }] }
        }
      }
    ]);

    // 3. Sales trend (daily)
    const salesTrend = await DailyRecordModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$date",
          sales: { $sum: "$totalSales" },
          profit: {
            $sum: {
              $subtract: ["$totalSales", { $add: ["$totalExpense", "$totalPurchases"] }]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalSales,
      totalExpense,
      totalPurchases,
      netProfit,
      branchComparison,
      salesTrend
    };
  }
}




// • Aggregate across all branches of an owner
// • Support optional branch filter
// • Support date range filter
// • Default to today
// • Calculate profit
// • Return structured data for graphs
