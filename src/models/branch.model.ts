import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  name: string;
  location: string;
  ownerId: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const BranchModel = mongoose.model<IBranch>("Branch", BranchSchema);