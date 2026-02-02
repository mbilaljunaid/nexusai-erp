import { Injectable, Logger } from '@nestjs/common';

export interface TaxJurisdiction {
  id: string;
  name: string;
  country: string;
  region?: string; // State, Province, etc.
  taxRate: number;
  applicableTransactionTypes: string[];
  exemptions: string[];
  nonRecoverableTypes?: string[]; // Types that are not recoverable
  filingFrequency: 'monthly' | 'quarterly' | 'annual';
}

export interface TaxableTransaction {
  id: string;
  date: Date;
  amount: number;
  type: string;
  jurisdiction?: string; // Optional if determined by POS

  // Location details for POS determination
  shipFromCountry: string;
  shipFromRegion?: string;
  shipToCountry: string;
  shipToRegion?: string;

  exemptionCode?: string;
}

export interface TaxCalculation {
  transactionId: string;
  grossAmount: number;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  netAmount: number;
  recoverable: boolean; // indicates if tax is recoverable per jurisdiction rules
  isReverseCharge?: boolean; // New flag
  details?: any[]; // optional details
}

@Injectable()
export class TaxEngineService {
  private readonly logger = new Logger(TaxEngineService.name);

  // Configured Nexus (In real app, this comes from DB/Settings)
  private companyNexus: Set<string> = new Set(['US', 'US-NY', 'US-CA', 'GB']);

  private jurisdictions: Map<string, TaxJurisdiction> = new Map([
    [
      'us-federal',
      {
        id: 'us-federal',
        name: 'US Federal',
        country: 'US',
        taxRate: 0.21,
        applicableTransactionTypes: ['sale', 'service', 'income', 'meals'],
        exemptions: ['medical', 'nonprofit'],
        nonRecoverableTypes: ['meals', 'entertainment'],
        filingFrequency: 'quarterly',
      },
    ],
    [
      'state-ny',
      {
        id: 'state-ny',
        name: 'New York State',
        country: 'US',
        region: 'NY',
        taxRate: 0.08875,
        applicableTransactionTypes: ['sale', 'service', 'meals'],
        exemptions: ['medical', 'food'],
        nonRecoverableTypes: ['meals'],
        filingFrequency: 'monthly',
      },
    ],
    [
      'gb-vat',
      {
        id: 'gb-vat',
        name: 'UK VAT',
        country: 'GB',
        taxRate: 0.20,
        applicableTransactionTypes: ['sale', 'service'],
        exemptions: [],
        filingFrequency: 'quarterly'
      }
    ]
  ]);

  private transactions: TaxableTransaction[] = [];

  private calculationCache: Map<string, TaxCalculation> = new Map();

  // Extensibility: Allow dynamic registration of jurisdictions (e.g. from plugins or DB)
  registerJurisdiction(jurisdiction: TaxJurisdiction) {
    if (this.jurisdictions.has(jurisdiction.id)) {
      this.logger.warn(`Overwriting existing jurisdiction configuration for ${jurisdiction.id}`);
    }
    this.jurisdictions.set(jurisdiction.id, jurisdiction);
    this.logger.log(`Registered tax jurisdiction: ${jurisdiction.name}`);
  }

  calculateTax(transaction: TaxableTransaction): TaxCalculation {
    const startTime = performance.now();
    const cacheKey = `${transaction.id}-${transaction.amount}-${transaction.jurisdiction || 'auto'}-${transaction.type}-${transaction.exemptionCode}`;

    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)!;
    }

    // Determine place of supply
    const placeOfSupplyJurisdictionId = this.determinePlaceOfSupply(transaction);

    // Logic: if explicit jurisdiction is provided, use it. Otherwise use POS.
    const jurisdictionId = transaction.jurisdiction || placeOfSupplyJurisdictionId;

    if (!jurisdictionId) {
      const result: TaxCalculation = {
        transactionId: transaction.id,
        grossAmount: transaction.amount,
        taxRate: 0,
        taxableAmount: 0,
        taxAmount: 0,
        netAmount: transaction.amount,
        recoverable: false,
        details: []
      };
      this.calculationCache.set(cacheKey, result);
      return result;
    }

    const jurisdiction = this.jurisdictions.get(jurisdictionId);

    if (!jurisdiction) {
      // Validation error or unknown jurisdiction
      const result: TaxCalculation = {
        transactionId: transaction.id,
        grossAmount: transaction.amount,
        taxRate: 0,
        taxableAmount: 0,
        taxAmount: 0,
        netAmount: transaction.amount,
        recoverable: false,
        details: ['Unknown Jurisdiction']
      };
      this.calculationCache.set(cacheKey, result);
      return result;
    }

    // Apply Nexus Rules
    const nexusApplicable = this.applyNexusRules(jurisdiction, transaction);

    if (!nexusApplicable) {
      const result: TaxCalculation = {
        transactionId: transaction.id,
        grossAmount: transaction.amount,
        taxRate: 0,
        taxableAmount: 0,
        taxAmount: 0,
        netAmount: transaction.amount,
        recoverable: false,
      };
      this.calculationCache.set(cacheKey, result);
      return result;
    }

    let taxableAmount = transaction.amount;
    let taxRate = jurisdiction.taxRate;

    // Check exemptions
    if (transaction.exemptionCode && jurisdiction.exemptions.includes(transaction.exemptionCode)) {
      taxableAmount = 0;
      taxRate = 0;
    }

    // Check applicability of transaction type
    if (!jurisdiction.applicableTransactionTypes.includes(transaction.type)) {
      taxableAmount = 0;
      taxRate = 0;
    }

    let taxAmount = taxableAmount * taxRate;
    const recoverable = this.isRecoverableTax(jurisdiction, transaction);

    // Reverse Charge Check
    // Logic: If ShipTo != ShipFrom AND B2B (sale/service) AND Cross-Border (e.g. not same country)
    // We assume 'sale' or 'service' implies B2B for this simplified engine unless 'B2C' type is explicit.
    let isReverseCharge = false;
    let finalTaxAmount = taxAmount;

    if (transaction.shipFromCountry !== transaction.shipToCountry &&
      ['sale', 'service'].includes(transaction.type)) {
      // Check if jurisdiction supports RCM (simplified: all VAT regimes do)
      if (jurisdiction.id.includes('vat')) {
        isReverseCharge = true;
        finalTaxAmount = 0; // Customer accounts for it
      }
    }

    this.transactions.push(transaction);

    const result: TaxCalculation = {
      transactionId: transaction.id,
      grossAmount: transaction.amount,
      taxRate: isReverseCharge ? 0 : taxRate, // Effective rate 0 for invoice
      taxableAmount,
      taxAmount: finalTaxAmount,
      netAmount: transaction.amount + finalTaxAmount,
      recoverable,
      isReverseCharge,
      details: isReverseCharge ? ['Reverse Charge Applies'] : []
    };

    this.calculationCache.set(cacheKey, result);

    const endTime = performance.now();
    if (endTime - startTime > 100) {
      this.logger.warn(`Tax calculation for ${transaction.id} took ${endTime - startTime}ms`);
    }

    return result;
  }

  // Helper: determine place of supply
  private determinePlaceOfSupply(transaction: TaxableTransaction): string | undefined {
    // General Rule: Destination Based Tax
    // If shipping to NY, taxable in NY

    if (transaction.shipToCountry === 'US') {
      if (transaction.shipToRegion === 'NY') return 'state-ny';
      // Fallback or federal? usually US doesn't have federal VAT, but for this engine simulation:
      return 'us-federal';
    }
    if (transaction.shipToCountry === 'GB') {
      return 'gb-vat';
    }

    return undefined;
  }

  // Helper: apply nexus rules
  private applyNexusRules(
    jurisdiction: TaxJurisdiction,
    transaction: TaxableTransaction,
  ): boolean {
    // Check if company has nexus in the country or specific region
    if (this.companyNexus.has(jurisdiction.country)) return true;
    if (jurisdiction.region && this.companyNexus.has(`${jurisdiction.country}-${jurisdiction.region}`)) return true;

    // If no nexus, usually no tax obligation (unless economic nexus thresholds met - advanced logic)
    return false;
  }

  // Helper: determine if tax is recoverable based on jurisdiction rules
  private isRecoverableTax(jurisdiction: TaxJurisdiction, transaction: TaxableTransaction): boolean {
    if (jurisdiction.nonRecoverableTypes && jurisdiction.nonRecoverableTypes.includes(transaction.type)) {
      return false;
    }
    // Default to recoverable for applicable types unless specified otherwise
    return true;
  }

  // Calculate tax obligations for a period
  calculateTaxObligations(
    jurisdictionId: string,
    period: { start: Date; end: Date },
  ): { totalTaxable: number; totalTax: number; dueDate: Date } {
    const juris = this.jurisdictions.get(jurisdictionId);
    if (!juris) {
      return { totalTaxable: 0, totalTax: 0, dueDate: new Date() };
    }

    const periodTxs = this.transactions.filter(
      (tx) =>
        (tx.jurisdiction === jurisdictionId || this.determinePlaceOfSupply(tx) === jurisdictionId) &&
        tx.date >= period.start &&
        tx.date <= period.end,
    );

    let totalTax = 0;
    let totalTaxable = 0;

    // Optimization: Pre-calculate common scenarios or use parallel processing if async
    for (const tx of periodTxs) {
      const calc = this.calculateTax(tx);
      totalTax += calc.taxAmount;
      totalTaxable += calc.taxableAmount;
    }

    const dueDate = new Date(period.end);
    if (juris.filingFrequency === 'monthly') {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else if (juris.filingFrequency === 'quarterly') {
      dueDate.setMonth(dueDate.getMonth() + 3);
    } else {
      dueDate.setFullYear(dueDate.getFullYear() + 1);
    }

    return { totalTaxable, totalTax, dueDate };
  }
}
