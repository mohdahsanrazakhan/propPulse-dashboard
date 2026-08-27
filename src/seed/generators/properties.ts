import mongoose from "mongoose";
import communities from "../data/communities.json";
import { weightsFor } from "./property-types-data";
import { pad, pick, randFloat, randInt, weightedPick } from "./utils";

export interface PropertySeed {
  propertyId: string;
  type: string;
  community: string;
  building: string;
  bedrooms: number;
  sqft: number;
  listingType: "sale" | "rental";
  askingPrice: number;
  status: "active" | "under_offer" | "sold" | "rented" | "withdrawn";
  agentId: mongoose.Types.ObjectId;
  listedDate: Date;
}

interface AgentRef {
  _id: mongoose.Types.ObjectId;
  communities: string[];
}

const communityRecord = new Map(communities.map((c) => [c.name, c]));

let counter = 0;
function nextPropertyId() {
  counter += 1;
  return `PR-${pad(counter, 4)}`;
}

export function generateProperties(agents: AgentRef[], now: Date, count = 58): PropertySeed[] {
  const properties: PropertySeed[] = [];

  for (let i = 0; i < count; i++) {
    const agent = pick(agents);
    const community = agent.communities.length > 0 ? pick(agent.communities) : pick(communities).name;
    const listingType: "sale" | "rental" = Math.random() < 0.5 ? "sale" : "rental";

    const key = listingType === "sale" ? "sale" : "rental";
    const weights = weightsFor(key);
    const type = weightedPick(weights.map((w) => ({ item: w.type, weight: w.weight })));

    const data = communityRecord.get(community);
    const base = listingType === "sale" ? data?.avgSalePrice ?? 1200000 : data?.avgRent ?? 65000;
    const askingPrice = Math.round(base * randFloat(0.85, 1.25));

    const listedDate = new Date(now);
    listedDate.setDate(listedDate.getDate() - randInt(1, 180));

    properties.push({
      propertyId: nextPropertyId(),
      type,
      community,
      building: `${community.split(" ")[0]} ${pick(["Tower", "Residence", "Heights", "Court"])} ${randInt(1, 12)}`,
      bedrooms: type === "office" || type === "retail" || type === "land" ? 0 : randInt(0, 5),
      sqft: type === "villa" || type === "townhouse" ? randInt(2200, 5500) : randInt(650, 2200),
      listingType,
      askingPrice,
      status: "active",
      agentId: agent._id,
      listedDate,
    });
  }

  return properties;
}
