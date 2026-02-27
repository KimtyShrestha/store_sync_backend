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

  async assignManager(branchId: string, managerId: string) {
  return await BranchModel.findByIdAndUpdate(
    branchId,
    { managerId },
    { new: true }
  );
  }

  async removeManager(branchId: string) {
  return await BranchModel.findByIdAndUpdate(
    branchId,
    { managerId: null },
    { new: true }
  );
  }
  
}