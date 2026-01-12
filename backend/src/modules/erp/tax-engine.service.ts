import { Injectable, Logger } from '@nestjs/common';

export interface TaxJurisdiction {
  id: string;
  name: string;
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
  jurisdiction: string;
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
  details?: any[]; // optional details
}

@Injectable()
export class TaxEngineService {
  private readonly logger = new Logger(TaxEngineService.name);

  private jurisdictions: Map<string, TaxJurisdiction> = new Map([
    [
      'us-federal',
      {
        id: 'us-federal',
        name: 'US Federal',
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
        taxRate: 0.06,
        applicableTransactionTypes: ['sale', 'service', 'meals'],
        exemptions: ['medical', 'food'],
        nonRecoverableTypes: ['meals'],
        filingFrequency: 'monthly',
      },
    ],
  ]);

  private transactions: TaxableTransaction[] = [];

  private calculationCache: Map<string, TaxCalculation> = new Map();

  // Core tax calculation with recoverable flag, place‑of‑supply and nexus placeholders
  calculateTax(transaction: TaxableTransaction): TaxCalculation {
    const startTime = performance.now();
    const cacheKey = `${transaction.id}-${transaction.amount}-${transaction.jurisdiction}-${transaction.type}-${transaction.exemptionCode}`;

    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)!;
    }

    const jurisdiction = this.jurisdictions.get(transaction.jurisdiction);
    if (!jurisdiction) {
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

    // Placeholder: determine place of supply (could be based on transaction data)
    const placeOfSupply = this.determinePlaceOfSupply(transaction);
    // Placeholder: apply nexus rules (currently always true)
    const nexusApplicable = this.applyNexusRules(jurisdiction, transaction, placeOfSupply);
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

    const taxAmount = taxableAmount * taxRate;
    const netAmount = transaction.amount + taxAmount;
    const recoverable = this.isRecoverableTax(jurisdiction, transaction);

    this.transactions.push(transaction);

    const result: TaxCalculation = {
      transactionId: transaction.id,
      grossAmount: transaction.amount,
      taxRate,
      taxableAmount,
      taxAmount,
      netAmount,
      recoverable,
      details: []
    };

    this.calculationCache.set(cacheKey, result);

    const endTime = performance.now();
    if (endTime - startTime > 100) {
      this.logger.warn(`Tax calculation for ${transaction.id} took ${endTime - startTime}ms`);
    }

    return result;
  }

  // Helper: determine place of supply (stub implementation)
  private determinePlaceOfSupply(transaction: TaxableTransaction): string {
    return transaction.jurisdiction; // simplistic placeholder
  }

  // Helper: apply nexus rules (stub implementation, always true for now)
  private applyNexusRules(
    jurisdiction: TaxJurisdiction,
    transaction: TaxableTransaction,
    placeOfSupply: string,
  ): boolean {
    return true;
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
        tx.jurisdiction === jurisdictionId && tx.date >= period.start && tx.date <= period.end,
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
