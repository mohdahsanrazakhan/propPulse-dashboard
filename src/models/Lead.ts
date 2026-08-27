import mongoose, { Schema, models, model } from "mongoose";

export interface ILead {
  _id: mongoose.Types.ObjectId;
  leadId: string;

  source:
    | "bayut"
    | "property_finder"
    | "dubizzle"
    | "website"
    | "walk_in"
    | "referral"
    | "social_media"
    | "cold_call";
  sourceDetail: string;

  name: string;
  email: string;
  phone: string;
  nationality: string;

  inquiryType: "buy" | "rent" | "off_plan";
  propertyType:
    | "apartment"
    | "villa"
    | "townhouse"
    | "penthouse"
    | "office"
    | "retail"
    | "land";
  budgetMin: number;
  budgetMax: number;
  preferredCommunities: string[];
  bedrooms: number | null;
  isPreApproved: boolean;

  assignedAgentId: mongoose.Types.ObjectId;
  assignedAt: Date;

  status:
    | "new"
    | "contacted"
    | "qualified"
    | "viewing_scheduled"
    | "viewing_done"
    | "offer_made"
    | "negotiating"
    | "won"
    | "lost"
    | "dead";

  firstResponseAt: Date | null;
  responseTimeMinutes: number | null;

  convertedToDealId: mongoose.Types.ObjectId | null;
  lostReason:
    | "budget_mismatch"
    | "not_ready"
    | "chose_competitor"
    | "unresponsive"
    | "left_dubai"
    | "no_requirement"
    | null;

  lastActivityAt: Date;
  touchpoints: number;
  viewingsCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    leadId: { type: String, required: true, unique: true, index: true },

    source: {
      type: String,
      enum: [
        "bayut",
        "property_finder",
        "dubizzle",
        "website",
        "walk_in",
        "referral",
        "social_media",
        "cold_call",
      ],
      required: true,
      index: true,
    },
    sourceDetail: { type: String, default: "" },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    nationality: { type: String, required: true },

    inquiryType: {
      type: String,
      enum: ["buy", "rent", "off_plan"],
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ["apartment", "villa", "townhouse", "penthouse", "office", "retail", "land"],
      required: true,
    },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    preferredCommunities: { type: [String], default: [] },
    bedrooms: { type: Number, default: null },
    isPreApproved: { type: Boolean, default: false },

    assignedAgentId: { type: Schema.Types.ObjectId, ref: "Agent", index: true },
    assignedAt: { type: Date },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "viewing_scheduled",
        "viewing_done",
        "offer_made",
        "negotiating",
        "won",
        "lost",
        "dead",
      ],
      required: true,
      index: true,
    },

    firstResponseAt: { type: Date, default: null },
    responseTimeMinutes: { type: Number, default: null },

    convertedToDealId: { type: Schema.Types.ObjectId, ref: "Deal", default: null },
    lostReason: {
      type: String,
      enum: [
        "budget_mismatch",
        "not_ready",
        "chose_competitor",
        "unresponsive",
        "left_dubai",
        "no_requirement",
        null,
      ],
      default: null,
    },

    lastActivityAt: { type: Date, default: Date.now },
    touchpoints: { type: Number, default: 0 },
    viewingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LeadSchema.index({ createdAt: -1 });

export default models.Lead || model<ILead>("Lead", LeadSchema);
