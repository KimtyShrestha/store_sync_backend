import mongoose, { Schema, Document } from "mongoose";

export interface IDailyRecord extends Document {
  branchId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  date: Date;

  salesItems: {
    itemName: string;
    price: number;
  }[];

  expenseItems: {
    category: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];

  purchaseItems: {
    category: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];

  totalSales: number;
  totalExpense: number;
  totalPurchases: number;

  createdAt: Date;
  updatedAt: Date;
}

const dailyRecordSchema = new Schema<IDailyRecord>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    salesItems: [
      {
        itemName: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],

    expenseItems: [
      {
        category: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],

    purchaseItems: [
      {
        category: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],

    totalSales: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Important: Prevent duplicate daily records per branch per date
dailyRecordSchema.index({ branchId: 1, date: 1 }, { unique: true });

export const DailyRecordModel = mongoose.model<IDailyRecord>(
  "DailyRecord",
  dailyRecordSchema
);