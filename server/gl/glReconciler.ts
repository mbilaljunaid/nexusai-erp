/**
 * GL Reconciler - Phase 3
 * Reconciliation tools for GL accounts
 */

import type { GLEntry } from "@shared/types/metadata";

export interface GLAccountBalance {
  account: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  entries: GLEntry[];
}

export interface GLReconciliationReport {
  period: { start: Date; end: Date };
  accounts: GLAccountBalance[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  discrepancies: string[];
}

export class GLReconciler {
  /**
   * Generate reconciliation report for a date range
   */
  generateReconciliationReport(entries: GLEntry[], startDate: Date, endDate: Date): GLReconciliationReport {
    // Filter entries by date range
    const filteredEntries = entries.filter(
      (e) => e.timestamp >= startDate && e.timestamp <= endDate
    );

    // Group by account
    const accountMap = new Map<string, GLEntry[]>();
    for (const entry of filteredEntries) {
      if (!accountMap.has(entry.account)) {
        accountMap.set(entry.account, []);
      }
      accountMap.get(entry.account)!.push(entry);
    }

    // Calculate balances
    const accounts: GLAccountBalance[] = [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (const [account, accountEntries] of accountMap) {
      const debitTotal = accountEntries
        .filter((e) => e.debitCredit === "debit")
        .reduce((sum, e) => sum + e.amount, 0);

      const creditTotal = accountEntries
        .filter((e) => e.debitCredit === "credit")
        .reduce((sum, e) => sum + e.amount, 0);

      accounts.push({
        account,
        debitTotal,
        creditTotal,
        balance: debitTotal - creditTotal,
        entries: accountEntries,
      });

      totalDebits += debitTotal;
      totalCredits += creditTotal;
    }

    // Check for discrepancies
    const discrepancies: string[] = [];
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    if (!isBalanced) {
      discrepancies.push(`System imbalance: Debits=${totalDebits}, Credits=${totalCredits}`);
    }

    return {
      period: { start: startDate, end: endDate },
      accounts,
      totalDebits,
      totalCredits,
      isBalanced,
      discrepancies,
    };
  }

  /**
   * Reconcile account balances
   */
  reconcileAccount(entries: GLEntry[], account: string, expectedBalance: number): { reconciled: boolean; difference: number } {
    const accountEntries = entries.filter((e) => e.account === account);
    const debitTotal = accountEntries
      .filter((e) => e.debitCredit === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    const creditTotal = accountEntries
      .filter((e) => e.debitCredit === "credit")
      .reduce((sum, e) => sum + e.amount, 0);

    const actualBalance = debitTotal - creditTotal;
    const difference = Math.abs(actualBalance - expectedBalance);
    const reconciled = difference < 0.01;

    return { reconciled, difference };
  }

  /**
   * Find unbalanced transactions
   */
  findUnbalancedTransactions(entries: GLEntry[]): GLEntry[][] {
    const transactionMap = new Map<string, GLEntry[]>();

    // Group by transaction ID
    for (const entry of entries) {
      const txId = entry.id?.split("-").slice(0, 2).join("-") || "";
      if (!transactionMap.has(txId)) {
        transactionMap.set(txId, []);
      }
      transactionMap.get(txId)!.push(entry);
    }

    // Find unbalanced transactions
    const unbalanced: GLEntry[][] = [];
    for (const transaction of transactionMap.values()) {
      const totalDebit = transaction
        .filter((e) => e.debitCredit === "debit")
        .reduce((sum, e) => sum + e.amount, 0);

      const totalCredit = transaction
        .filter((e) => e.debitCredit === "credit")
        .reduce((sum, e) => sum + e.amount, 0);

      if (Math.abs(totalDebit - totalCredit) >= 0.01) {
        unbalanced.push(transaction);
      }
    }

    return unbalanced;
  }

  /**
   * Get trial balance
   */
  getTrialBalance(entries: GLEntry[]): { account: string; balance: number }[] {
    const accountMap = new Map<string, number>();

    for (const entry of entries) {
      const current = accountMap.get(entry.account) || 0;
      const delta = entry.debitCredit === "debit" ? entry.amount : -entry.amount;
      accountMap.set(entry.account, current + delta);
    }

    return Array.from(accountMap.entries()).map(([account, balance]) => ({
      account,
      balance,
    }));
  }
}

export const glReconciler = new GLReconciler();
