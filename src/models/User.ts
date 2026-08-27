import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  company: string;
  reraBrn: string;
  role: "owner" | "manager" | "viewer";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    company: { type: String, required: true, trim: true },
    reraBrn: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["owner", "manager", "viewer"],
      default: "owner",
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
