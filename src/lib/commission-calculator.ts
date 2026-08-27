// Dubai RERA commission calculator
// Sale: 2% commission, Rental: 5% commission (standard rates), VAT: 5%

import { VAT_RATE } from "./constants";

export interface CommissionInput {
  dealType: "sale" | "rental" | "off_plan";
  transactionValue: number; // AED: sale price or annual rent
  commissionRate: number; // % (default: 2 for sales, 5 for rentals)
  agentSplitPercent: number; // % agent keeps (50-70)
  isCoBroker: boolean;
  coBrokerSplitPercent: number; // % paid to co-broker (usually 50)
  vatRate?: number; // 5% UAE standard
}

export interface CommissionResult {
  grossCommission: number;
  vatAmount: number;
  totalWithVat: number;
  coBrokerAmount: number;
  netCommission: number; // after co-broker
  agentAmount: number;
  agencyAmount: number;
}

export function calculateCommission(input: CommissionInput): CommissionResult {
  const vatRate = input.vatRate ?? VAT_RATE;

  const gross = Math.max(0, input.transactionValue) * (input.commissionRate / 100);
  const vat = gross * (vatRate / 100);
  const totalWithVat = gross + vat;

  const coBrokerAmount = input.isCoBroker
    ? gross * (input.coBrokerSplitPercent / 100)
    : 0;

  const net = gross - coBrokerAmount;
  const agentAmount = net * (input.agentSplitPercent / 100);
  const agencyAmount = net - agentAmount;

  return {
    grossCommission: Math.round(gross),
    vatAmount: Math.round(vat),
    totalWithVat: Math.round(totalWithVat),
    coBrokerAmount: Math.round(coBrokerAmount),
    netCommission: Math.round(net),
    agentAmount: Math.round(agentAmount),
    agencyAmount: Math.round(agencyAmount),
  };
}
