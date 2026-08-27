import raw from "../data/property-types.json";

export interface PropertyTypeWeight {
  type: string;
  weight: number;
}

interface PropertyTypesData {
  sale: PropertyTypeWeight[];
  rental: PropertyTypeWeight[];
  off_plan: PropertyTypeWeight[];
  developers: string[];
}

export const propertyTypesData = raw as PropertyTypesData;

export function weightsFor(key: "sale" | "rental" | "off_plan"): PropertyTypeWeight[] {
  return propertyTypesData[key];
}

export const DEVELOPERS = propertyTypesData.developers;
