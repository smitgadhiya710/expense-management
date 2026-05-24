import { Document, Model, Schema, model } from 'mongoose';

export type PublicExpenseType = {
  id: string;
  name: string;
  key: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface IExpenseType extends Document {
  name: string;
  key: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toPublicJSON(): PublicExpenseType;
}

const expenseTypeSchema = new Schema<IExpenseType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      unique: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100,
      unique: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'expense_types',
    timestamps: true,
    versionKey: false,
  },
);

expenseTypeSchema.methods.toPublicJSON = function toPublicJSON(): PublicExpenseType {
  return {
    id: this._id.toString(),
    name: this.name,
    key: this.key,
    description: this.description,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const ExpenseType: Model<IExpenseType> = model<IExpenseType>('ExpenseType', expenseTypeSchema);

export default ExpenseType;
