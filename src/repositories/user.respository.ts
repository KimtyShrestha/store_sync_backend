import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;

  getUserByEmail(email: string): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;

  getAllUsers(): Promise<IUser[]>;

  getUsersByRole(role: string): Promise<IUser[]>;
  getPendingUsersByRole(role: string): Promise<IUser[]>;
  

  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return await UserModel.find({ role });
  }

  async getPendingUsersByRole(role: string): Promise<IUser[]> {
    return await UserModel.find({ role, status: "pending" });
  }

  async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result ? true : false;
  }

  async getManagersByOwner(ownerId: string): Promise<IUser[]> {
  return await UserModel.find({
    ownerId,
    role: "manager",
  });
}

  async getPendingManagersByOwner(ownerId: string) {
  return await UserModel.find({
    role: "manager",
    status: "pending",
    ownerId: ownerId,
  });
}
}