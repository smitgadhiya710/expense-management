import { Document, Model, Schema, model } from 'mongoose';

export type UserRole = 'user' | 'admin';

export type PublicUser = {
  id: string;
  userName: string;
  phone: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUser = {
  token: string;
  id: string;
  userName: string;
  email: string;
  role: UserRole;
};

export interface IUser extends Document {
  userName: string;
  password: string;
  phone: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  toPublicJSON(): PublicUser;
  toAuthJSON(token: string): AuthUser;
}

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.methods.toPublicJSON = function toPublicJSON(): PublicUser {
  return {
    id: this._id.toString(),
    userName: this.userName,
    phone: this.phone,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

userSchema.methods.toAuthJSON = function toAuthJSON(token: string): AuthUser {
  return {
    token,
    id: this._id.toString(),
    userName: this.userName,
    email: this.email,
    role: this.role,
  };
};

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
