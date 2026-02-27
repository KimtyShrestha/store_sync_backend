import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "superadmin" | "owner" | "manager";
export type UserStatus = "pending" | "approved";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;

  role: UserRole;
  status: UserStatus;

  ownerId?: mongoose.Types.ObjectId; // Only for managers
  profileImage?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    firstName: { type: String },
    lastName: { type: String },

    role: {
      type: String,
      enum: ["superadmin", "owner", "manager"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);