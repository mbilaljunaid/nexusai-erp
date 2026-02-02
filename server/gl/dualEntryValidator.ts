/**
 * Dual Entry Validator - Phase 3
 * Validates dual-entry accounting principles
 */

import type { GLEntry } from "@shared/types/metadata";

export interface GLValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
}

export class DualEntryValidator {
  /**
   * Validate GL entry set for dual-entry accounting
   */
  validateEntries(entries: GLEntry[]): GLValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (entries.length === 0) {
      return {
        valid: false,
        errors: ["No GL entries provided"],
        warnings: [],
        totalDebit: 0,
        totalCredit: 0,
        difference: 0,
      };
    }

    // Must have at least 1 debit and 1 credit entry
    const debits = entries.filter((e) => e.debitCredit === "debit");
    const credits = entries.filter((e) => e.debitCredit === "credit");

    if (debits.length === 0) {
      errors.push("No debit entries found - must have at least one debit");
    }

    if (credits.length === 0) {
      errors.push("No credit entries found - must have at least one credit");
    }

    // Calculate totals
    const totalDebit = debits.reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = credits.reduce((sum, e) => sum + e.amount, 0);
    const difference = Math.abs(totalDebit - totalCredit);

    // Check if balanced (allow small rounding difference)
    const isBalanced = difference < 0.01;

    if (!isBalanced) {
      errors.push(
        `Debit/Credit imbalance: Debit=${totalDebit.toFixed(2)}, Credit=${totalCredit.toFixed(2)}, Diff=${difference.toFixed(2)}`
      );
    }

    // Validate each entry
    for (const entry of entries) {
      if (!entry.account) {
        errors.push(`Entry missing GL account`);
      }

      if (entry.amount <= 0) {
        errors.push(`Entry has invalid amount: ${entry.amount}`);
      }

      if (!["debit", "credit"].includes(entry.debitCredit)) {
        errors.push(`Entry has invalid debit/credit: ${entry.debitCredit}`);
      }
    }

    return {
      valid: errors.length === 0 && isBalanced,
      errors,
      warnings,
      totalDebit,
      totalCredit,
      difference,
    };
  }

  /**
   * Validate single GL entry
   */
  validateEntry(entry: GLEntry): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!entry.account) {
      errors.push("GL account is required");
    }

    if (entry.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (!["debit", "credit"].includes(entry.debitCredit)) {
      errors.push("Debit/Credit must be 'debit' or 'credit'");
    }

    if (!entry.description) {
      errors.push("Description is required");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if GL entries balance
   */
  isBalanced(entries: GLEntry[]): boolean {
    const totalDebit = entries
      .filter((e) => e.debitCredit === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredit = entries
      .filter((e) => e.debitCredit === "credit")
      .reduce((sum, e) => sum + e.amount, 0);

    return Math.abs(totalDebit - totalCredit) < 0.01;
  }

  /**
   * Get accounts in debit and credit
   */
  getAccountsByType(entries: GLEntry[]): { debits: string[]; credits: string[] } {
    const debits = [...new Set(entries.filter((e) => e.debitCredit === "debit").map((e) => e.account))];
    const credits = [...new Set(entries.filter((e) => e.debitCredit === "credit").map((e) => e.account))];

    return { debits, credits };
  }
}

export const dualEntryValidator = new DualEntryValidator();
