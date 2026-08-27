import mongoose, { Schema, models, model } from "mongoose";

export interface IAgentTargets {
  monthlyDeals: number;
  monthlyRevenue: number;
  leadResponseMinutes: number;
}

export interface IAgent {
  _id: mongoose.Types.ObjectId;
  agentId: string;
  name: string;
  email: string;
  phone: string;
  reraId: string;
  photo: string;
  nationality: string;
  languages: string[];
  specialization: "sales" | "rentals" | "off-plan" | "commercial" | "mixed";
  communities: string[];
  joinDate: Date;
  isActive: boolean;
  targets: IAgentTargets;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    agentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    reraId: { type: String, required: true },
    photo: { type: String, default: "" },
    nationality: { type: String, required: true },
    languages: { type: [String], default: [] },
    specialization: {
      type: String,
      enum: ["sales", "rentals", "off-plan", "commercial", "mixed"],
      required: true,
    },
    communities: { type: [String], default: [], index: true },
    joinDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    targets: {
      monthlyDeals: { type: Number, required: true },
      monthlyRevenue: { type: Number, required: true },
      leadResponseMinutes: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default models.Agent || model<IAgent>("Agent", AgentSchema);
