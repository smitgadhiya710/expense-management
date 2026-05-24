import { Document, Model, Schema, Types, model } from 'mongoose';

import { PublicExpenseType } from './expense-type.model.js';
import { PublicUser } from './user.model.js';

export type PaymentMode = 'cash' | 'bank' | 'upi' | 'card' | 'other';

export type PublicExpense = {
  id: string;
  userId: string;
  expenseTypeId: string;
  title: string;
  amount: number;
  expenseDate: Date;
  paymentMode: PaymentMode;
  vendor?: string;
  notes?: string;
  billNumber?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: PublicUser;
  expenseType?: PublicExpenseType;
};

export interface IExpense extends Document {
  userId: Types.ObjectId;
  expenseTypeId: Types.ObjectId;
  title: string;
  amount: number;
  expenseDate: Date;
  paymentMode: PaymentMode;
  vendor?: string;
  notes?: string;
  billNumber?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toPublicJSON(): PublicExpense;
}

const expenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expenseTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpenseType',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expenseDate: {
      type: Date,
      required: true,
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'bank', 'upi', 'card', 'other'],
      default: 'cash',
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    billNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    collection: 'expenses',
    timestamps: true,
    versionKey: false,
  },
);

expenseSchema.methods.toPublicJSON = function toPublicJSON(): PublicExpense {
  const populatedUser = this.populated('userId') ? (this.userId as unknown as { toPublicJSON: () => PublicUser }) : undefined;
  const populatedExpenseType = this.populated('expenseTypeId')
    ? (this.expenseTypeId as unknown as { toPublicJSON: () => PublicExpenseType })
    : undefined;

  return {
    id: this._id.toString(),
    userId: this.userId._id ? this.userId._id.toString() : this.userId.toString(),
    expenseTypeId: this.expenseTypeId._id ? this.expenseTypeId._id.toString() : this.expenseTypeId.toString(),
    title: this.title,
    amount: this.amount,
    expenseDate: this.expenseDate,
    paymentMode: this.paymentMode,
    vendor: this.vendor,
    notes: this.notes,
    billNumber: this.billNumber,
    isDeleted: this.isDeleted,
    deletedAt: this.deletedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    user: populatedUser?.toPublicJSON(),
    expenseType: populatedExpenseType?.toPublicJSON(),
  };
};

const Expense: Model<IExpense> = model<IExpense>('Expense', expenseSchema);

export default Expense;
