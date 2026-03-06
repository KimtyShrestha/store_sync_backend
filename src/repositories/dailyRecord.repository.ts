import { DailyRecordModel, IDailyRecord } from "../models/dailyRecord.model";
import { BranchModel } from "../models/branch.model";

export class DailyRecordRepository {

  // Helper: get today's date at midnight
  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Get today's record
  async getTodayRecord(branchId: string): Promise<IDailyRecord | null> {
    const today = this.getTodayDate();

    return await DailyRecordModel.findOne({
      branchId,
      date: today,
    });
  }

  // Create or Update today's record
  async createOrUpdateTodayRecord(
    branchId: string,
    managerId: string,
    data: Partial<IDailyRecord>
  ): Promise<IDailyRecord> {

    const today = data.date ? new Date(data.date) : this.getTodayDate();
    today.setHours(0, 0, 0, 0);

    let record = await DailyRecordModel.findOne({
      branchId,
      date: today,
    });

    // Prepare sales items safely
    const salesItems =
    data.salesItems?.map((item) => ({
    itemName: item.itemName,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.quantity * item.price,
  })) || [];

    // Prepare expense items with subtotal
    const expenseItems =
      data.expenseItems?.map((item) => ({
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })) || [];

    // Prepare purchase items with subtotal
    const purchaseItems =
      data.purchaseItems?.map((item) => ({
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })) || [];

    // Calculate totals
    const totalSales = salesItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

    const totalExpense = expenseItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const totalPurchases = purchaseItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    if (!record) {
      // Create new record
      record = await DailyRecordModel.create({
        branchId,
        managerId,
        date: today,
        salesItems,
        expenseItems,
        purchaseItems,
        totalSales,
        totalExpense,
        totalPurchases,
      });
    } else {
      // Update existing record (only today allowed)
      record.salesItems = salesItems;
      record.expenseItems = expenseItems;
      record.purchaseItems = purchaseItems;
      record.totalSales = totalSales;
      record.totalExpense = totalExpense;
      record.totalPurchases = totalPurchases;

      await record.save();
    }

    return record;
  }

  // Owner view records by branch
  async getRecordsByBranch(branchId: string) {
    return await DailyRecordModel.find({ branchId }).sort({ date: -1 });
  }


  async getOwnerRecords(
  ownerId: string,
  branchId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = {};



  //  Get branches belonging to this owner
  const branchFilter = branchId
    ? { _id: branchId, ownerId }
    : { ownerId };

  const branches = await BranchModel.find(branchFilter);

  const branchIds = branches.map(b => b._id);

  if (branchIds.length === 0) {
    return [];
  }

  //  Filter daily records by branchIds
  match.branchId = { $in: branchIds };

  //  Optional date filtering
  if (startDate && endDate) {
    match.date = { $gte: startDate, $lte: endDate };
  }

  // Fetch records with populated branch + manager info
  return await DailyRecordModel.find(match)
    .populate("branchId", "name location")
    .populate("managerId", "firstName lastName email")
    .sort({ date: -1 });
}
}