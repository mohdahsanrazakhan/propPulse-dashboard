import mongoose, { Schema, models, model } from "mongoose";

// Represents an active listing (for "Active Listings" KPI and community coverage)
export interface IProperty {
  _id: mongoose.Types.ObjectId;
  propertyId: string;
  type: "apartment" | "villa" | "townhouse" | "penthouse" | "office" | "retail" | "land";
  community: string;
  building: string;
  bedrooms: number;
  sqft: number;
  listingType: "sale" | "rental";
  askingPrice: number;
  status: "active" | "under_offer" | "sold" | "rented" | "withdrawn";
  agentId: mongoose.Types.ObjectId;
  listedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    propertyId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["apartment", "villa", "townhouse", "penthouse", "office", "retail", "land"],
      required: true,
    },
    community: { type: String, required: true, index: true },
    building: { type: String, default: "" },
    bedrooms: { type: Number, default: 0 },
    sqft: { type: Number, default: 0 },
    listingType: { type: String, enum: ["sale", "rental"], required: true },
    askingPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "under_offer", "sold", "rented", "withdrawn"],
      default: "active",
      index: true,
    },
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true, index: true },
    listedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default models.Property || model<IProperty>("Property", PropertySchema);
