import { Injectable } from '@nestjs/common';

export interface TaxJurisdiction {
  id: string;
  name: string;
  taxRate: number;
  applicableTransactionTypes: string[];
  exemptions: string[];
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
}

@Injectable()
export class TaxEngineService {
  private jurisdictions: Map<string, TaxJurisdiction> = new Map([
    ['us-federal', {
      id: 'us-federal',
      name: 'US Federal',
      taxRate: 0.21,
      applicableTransactionTypes: ['sale', 'service', 'income'],
      exemptions: ['medical', 'nonprofit'],
      filingFrequency: 'quarterly',
    }],
    ['state-ny', {
      id: 'state-ny',
      name: 'New York State',
      taxRate: 0.06,
      applicableTransactionTypes: ['sale', 'service'],
      exemptions: ['medical', 'food'],
      filingFrequency: 'monthly',
    }],
  ]);

  private transactions: TaxableTransaction[] = [];

  calculateTax(transaction: TaxableTransaction): TaxCalculation {
    const jurisdiction = this.jurisdictions.get(transaction.jurisdiction);
    if (!jurisdiction) {
      return {
        transactionId: transaction.id,
        grossAmount: transaction.amount,
        taxRate: 0,
        taxableAmount: 0,
        taxAmount: 0,
        netAmount: transaction.amount,
      };
    }

    let taxableAmount = transaction.amount;
    let taxRate = jurisdiction.taxRate;

    // Check exemptions
    if (transaction.exemptionCode && jurisdiction.exemptions.includes(transaction.exemptionCode)) {
      taxableAmount = 0;
      taxRate = 0;
    }

    // Check applicability
    if (!jurisdiction.applicableTransactionTypes.includes(transaction.type)) {
      taxableAmount = 0;
      taxRate = 0;
    }

    const taxAmount = taxableAmount * taxRate;
    const netAmount = transaction.amount + taxAmount;

    this.transactions.push(transaction);

    return {
      transactionId: transaction.id,
      grossAmount: transaction.amount,
      taxRate,
      taxableAmount,
      taxAmount,
      netAmount,
    };
  }

  calculateTaxObligations(jurisdiction: string, period: { start: Date; end: Date }): {
    totalTaxable: number;
    totalTax: number;
    dueDate: Date;
  } {
    const juris = this.jurisdictions.get(jurisdiction);
    if (!juris) {
      return { totalTaxable: 0, totalTax: 0, dueDate: new Date() };
    }

    const periodTxs = this.transactions.filter(
      (tx) =>
        tx.jurisdiction === jurisdiction &&
        tx.date >= period.start &&
        tx.date <= period.end,
    );

    let totalTax = 0;
    let totalTaxable = 0;

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
