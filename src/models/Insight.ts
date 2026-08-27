import mongoose, { Schema, models, model } from "mongoose";

export interface IInsight {
  _id: mongoose.Types.ObjectId;
  type: "agent" | "lead" | "commission" | "community" | "pipeline" | "general";
  severity: "info" | "warning" | "critical" | "opportunity";
  title: string;
  description: string;
  metric: string;
  recommendation: string;
  isRead: boolean;
  createdAt: Date;
}

const InsightSchema = new Schema<IInsight>({
  type: {
    type: String,
    enum: ["agent", "lead", "commission", "community", "pipeline", "general"],
    required: true,
    index: true,
  },
  severity: {
    type: String,
    enum: ["info", "warning", "critical", "opportunity"],
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  metric: { type: String, default: "" },
  recommendation: { type: String, default: "" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default models.Insight || model<IInsight>("Insight", InsightSchema);
