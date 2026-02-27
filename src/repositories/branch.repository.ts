import { BranchModel, IBranch } from "../models/branch.model";
import mongoose from "mongoose";

export class BranchRepository {

  async createBranch(data: Partial<IBranch>): Promise<IBranch> {
    const branch = new BranchModel(data);
    return await branch.save();
  }

  async getBranchesByOwner(ownerId: string): Promise<IBranch[]> {
    return await BranchModel.find({ ownerId });
  }

  async getBranchById(id: string): Promise<IBranch | null> {
    return await BranchModel.findById(id);
  }

  async assignManager(branchId: string, managerId: string): Promise<IBranch | null> {
    return await BranchModel.findByIdAndUpdate(
      branchId,
      {
        $addToSet: {
          managers: new mongoose.Types.ObjectId(managerId),
        },
      },
      { new: true }
    );
  }
}