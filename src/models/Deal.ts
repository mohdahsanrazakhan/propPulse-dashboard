import mongoose, { Schema, models, model } from "mongoose";

export interface IDealProperty {
  type: "apartment" | "villa" | "townhouse" | "penthouse" | "office" | "retail" | "land";
  community: string;
  building: string;
  unitNumber: string;
  bedrooms: number;
  sqft: number;
  developer: string | null;
}

export interface IDealCommission {
  rate: number;
  grossAmount: number;
  vatAmount: number;
  agentSplit: number;
  agentAmount: number;
  agencyAmount: number;
  status: "pending" | "invoiced" | "partially_paid" | "paid";
  paidDate: Date | null;
  invoiceNumber: string | null;
}

export interface IDeal {
  _id: mongoose.Types.ObjectId;
  dealId: string;
  type: "sale" | "rental" | "off_plan";

  property: IDealProperty;

  transactionValue: number;
  commission: IDealCommission;

  agentId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId | null;
  clientName: string;
  clientNationality: string;
  clientType: "buyer" | "seller" | "tenant" | "landlord";

  stage:
    | "prospect"
    | "viewing"
    | "offer"
    | "negotiation"
    | "agreed"
    | "documentation"
    | "transfer"
    | "completed"
    | "fallen_through";

  listingDate: Date | null;
  viewingDate: Date | null;
  offerDate: Date | null;
  agreedDate: Date | null;
  completionDate: Date | null;

  daysToClose: number | null;
  isCobroker: boolean;
  cobrokerAgency: string | null;
  cobrokerSplit: number | null;

  notes: string;

  stageEnteredAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    dealId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["sale", "rental", "off_plan"], required: true, index: true },

    property: {
      type: {
        type: String,
        enum: ["apartment", "villa", "townhouse", "penthouse", "office", "retail", "land"],
        required: true,
      },
      community: { type: String, required: true, index: true },
      building: { type: String, default: "" },
      unitNumber: { type: String, default: "" },
      bedrooms: { type: Number, default: 0 },
      sqft: { type: Number, default: 0 },
      developer: { type: String, default: null },
    },

    transactionValue: { type: Number, required: true },

    commission: {
      rate: { type: Number, required: true },
      grossAmount: { type: Number, required: true },
      vatAmount: { type: Number, required: true },
      agentSplit: { type: Number, required: true },
      agentAmount: { type: Number, required: true },
      agencyAmount: { type: Number, required: true },
      status: {
        type: String,
        enum: ["pending", "invoiced", "partially_paid", "paid"],
        default: "pending",
        index: true,
      },
      paidDate: { type: Date, default: null },
      invoiceNumber: { type: String, default: null },
    },

    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", default: null },
    clientName: { type: String, required: true },
    clientNationality: { type: String, required: true },
    clientType: {
      type: String,
      enum: ["buyer", "seller", "tenant", "landlord"],
      required: true,
    },

    stage: {
      type: String,
      enum: [
        "prospect",
        "viewing",
        "offer",
        "negotiation",
        "agreed",
        "documentation",
        "transfer",
        "completed",
        "fallen_through",
      ],
      required: true,
      index: true,
    },

    listingDate: { type: Date, default: null },
    viewingDate: { type: Date, default: null },
    offerDate: { type: Date, default: null },
    agreedDate: { type: Date, default: null },
    completionDate: { type: Date, default: null, index: true },

    daysToClose: { type: Number, default: null },
    isCobroker: { type: Boolean, default: false },
    cobrokerAgency: { type: String, default: null },
    cobrokerSplit: { type: Number, default: null },

    notes: { type: String, default: "" },

    stageEnteredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Deal || model<IDeal>("Deal", DealSchema);
