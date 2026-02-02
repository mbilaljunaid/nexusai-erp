import { Injectable } from '@nestjs/common';

export interface BankTransaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'matched' | 'unmatched';
}

export interface GLEntry {
  id: string;
  date: Date;
  amount: number;
  description: string;
  reference: string;
  reconciled: boolean;
}

export interface ReconciliationResult {
  totalBankAmount: number;
  totalGLAmount: number;
  discrepancies: { bankTx: BankTransaction; glEntry?: GLEntry; variance: number }[];
  matchedTransactions: number;
  unmatchedBankTransactions: BankTransaction[];
  unmatchedGLEntries: GLEntry[];
  reconciliationScore: number;
}

@Injectable()
export class BankReconciliationService {
  private bankTransactions: BankTransaction[] = [];
  private glEntries: GLEntry[] = [];

  addBankTransaction(tx: BankTransaction): BankTransaction {
    this.bankTransactions.push(tx);
    return tx;
  }

  addGLEntry(entry: GLEntry): GLEntry {
    this.glEntries.push(entry);
    return entry;
  }

  reconcile(): ReconciliationResult {
    const matched: BankTransaction[] = [];
    const unmatched: BankTransaction[] = [];
    const discrepancies: ReconciliationResult['discrepancies'] = [];

    for (const bankTx of this.bankTransactions) {
      const glMatch = this.glEntries.find(
        (gl) =>
          Math.abs(gl.amount - bankTx.amount) < 0.01 &&
          Math.abs(gl.date.getTime() - bankTx.date.getTime()) < 24 * 60 * 60 * 1000,
      );

      if (glMatch) {
        matched.push(bankTx);
        bankTx.status = 'matched';
        glMatch.reconciled = true;
      } else {
        unmatched.push(bankTx);
        bankTx.status = 'unmatched';
        discrepancies.push({
          bankTx,
          variance: 0,
        });
      }
    }

    const unmatchedGL = this.glEntries.filter((gl) => !gl.reconciled);
    const totalBankAmount = this.bankTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalGLAmount = this.glEntries.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalBankAmount,
      totalGLAmount,
      discrepancies,
      matchedTransactions: matched.length,
      unmatchedBankTransactions: unmatched,
      unmatchedGLEntries: unmatchedGL,
      reconciliationScore: (matched.length / this.bankTransactions.length) * 100,
    };
  }

  autoReconcile(): { matched: number; recommendations: string[] } {
    const recommendations: string[] = [];
    let autoMatched = 0;

    // Fuzzy matching for similar amounts within tolerance
    for (const bankTx of this.bankTransactions.filter((tx) => tx.status === 'unmatched')) {
      const closeMatches = this.glEntries.filter(
        (gl) =>
          !gl.reconciled &&
          Math.abs(gl.amount - bankTx.amount) / bankTx.amount < 0.02 && // 2% tolerance
          Math.abs(gl.date.getTime() - bankTx.date.getTime()) < 7 * 24 * 60 * 60 * 1000, // 7 days
      );

      if (closeMatches.length === 1) {
        bankTx.status = 'matched';
        closeMatches[0].reconciled = true;
        autoMatched++;
      } else if (closeMatches.length > 1) {
        recommendations.push(`Multiple matches found for transaction ${bankTx.reference}`);
      }
    }

    return { matched: autoMatched, recommendations };
  }
}
