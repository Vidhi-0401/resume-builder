// models/User.ts
import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  company?: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
export default User;
