/**
 * GL Posting Engine - Phase 3
 * Automates GL entry creation from metadata configurations
 */

import type { FormMetadataAdvanced, GLMappingConfig, GLEntry } from "@shared/types/metadata";
import { FORM_GL_MAPPINGS, isValidGLAccount } from "../metadata/glMappings";
import { auditLogger } from "./auditLogger";

export interface GLPostRequest {
  formId: string;
  formData: Record<string, any>;
  metadata: FormMetadataAdvanced;
  userId?: string;
  description?: string;
}

export interface GLPostResult {
  success: boolean;
  entries: GLEntry[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  errors?: string[];
}

export class GLPostingEngine {
  private glEntries: Map<string, GLEntry[]> = new Map();
  private entryCounter: number = 0;

  /**
   * Create GL entries from form submission
   */
  async createGLEntries(request: GLPostRequest): Promise<GLPostResult> {
    const { formId, formData, metadata, userId, description } = request;

    const entries: GLEntry[] = [];
    const errors: string[] = [];

    // Get GL mappings for this form
    const mappings = FORM_GL_MAPPINGS[formId];
    if (!mappings || mappings.length === 0) {
      return { success: false, entries: [], totalDebit: 0, totalCredit: 0, balanced: false, errors: ["No GL mappings found"] };
    }

    // Create GL entries based on mappings
    for (const mapping of mappings) {
      try {
        // Validate GL account
        if (!isValidGLAccount(mapping.account)) {
          errors.push(`Invalid GL account: ${mapping.account}`);
          continue;
        }

        // Calculate amount
        let amount = mapping.amount === "dynamic" ? formData[mapping.amountField || "amount"] : mapping.amount;
        amount = Number(amount) || 0;

        if (amount === 0) {
          errors.push(`Zero amount for ${mapping.account}`);
          continue;
        }

        // Create GL entry
        const entry: GLEntry = {
          id: `GL-${Date.now()}-${++this.entryCounter}`,
          account: mapping.account,
          debitCredit: mapping.debitCredit,
          amount,
          description: description || `${mapping.description || ""} - Form: ${formId}`,
          formId,
          formData: formData,
          timestamp: new Date(),
          status: "posted",
          userId,
        };

        entries.push(entry);

        // Store entry
        const key = `${formId}-${Date.now()}`;
        this.glEntries.set(key, entries);

        // Log to audit trail
        if (userId) {
          await auditLogger.logGLEntry(entry, userId, "created");
        }
      } catch (error: any) {
        errors.push(`Error creating GL entry for ${mapping.account}: ${error.message}`);
      }
    }

    // Validate dual-entry accounting
    const totalDebit = entries
      .filter((e) => e.debitCredit === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredit = entries
      .filter((e) => e.debitCredit === "credit")
      .reduce((sum, e) => sum + e.amount, 0);

    const balanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow for floating point rounding

    return {
      success: errors.length === 0 && balanced,
      entries,
      totalDebit,
      totalCredit,
      balanced,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Post GL entries (if enabled in metadata)
   */
  async postGLEntries(request: GLPostRequest): Promise<GLPostResult> {
    // Check if auto-posting is enabled in metadata
    if (!request.metadata.glConfig?.autoCreateGL) {
      return { success: true, entries: [], totalDebit: 0, totalCredit: 0, balanced: true };
    }

    // Check if all mappings are configured for auto-posting
    const mappings = FORM_GL_MAPPINGS[request.formId];
    if (mappings && !mappings.every((m) => m.autoPost)) {
      return {
        success: false,
        entries: [],
        totalDebit: 0,
        totalCredit: 0,
        balanced: false,
        errors: ["Not all GL mappings are configured for auto-posting"],
      };
    }

    return this.createGLEntries(request);
  }

  /**
   * Get GL entries for a form
   */
  getGLEntriesForForm(formId: string): GLEntry[] {
    const entries: GLEntry[] = [];
    for (const value of this.glEntries.values()) {
      entries.push(...value.filter((e) => e.formId === formId));
    }
    return entries;
  }

  /**
   * Get GL entries for an account
   */
  getGLEntriesForAccount(account: string): GLEntry[] {
    const entries: GLEntry[] = [];
    for (const value of this.glEntries.values()) {
      entries.push(...value.filter((e) => e.account === account));
    }
    return entries;
  }

  /**
   * Get all GL entries
   */
  getAllGLEntries(): GLEntry[] {
    const entries: GLEntry[] = [];
    for (const value of this.glEntries.values()) {
      entries.push(...value);
    }
    return entries;
  }

  /**
   * Calculate account balance
   */
  getAccountBalance(account: string): { debit: number; credit: number; balance: number } {
    const entries = this.getGLEntriesForAccount(account);
    const debit = entries
      .filter((e) => e.debitCredit === "debit")
      .reduce((sum, e) => sum + e.amount, 0);
    const credit = entries
      .filter((e) => e.debitCredit === "credit")
      .reduce((sum, e) => sum + e.amount, 0);

    return { debit, credit, balance: debit - credit };
  }
}

export const glPostingEngine = new GLPostingEngine();
