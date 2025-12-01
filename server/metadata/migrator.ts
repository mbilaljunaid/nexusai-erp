/**
 * Metadata Migrator - Batch Migration Script for Phase 1
 * Safely migrate all 810 forms from basic to advanced metadata schema
 */

import { FormMetadataAdvanced, MigrationResult } from "@shared/types/metadata";
import { metadataValidator } from "./validator";
import { createSimpleMasterDataMetadata, createStandardTransactionMetadata } from "./templates";
import { FORM_GL_MAPPINGS } from "./glMappings";

export interface MigrationOptions {
  formId?: string; // Migrate specific form
  category?: "A" | "B" | "C" | "D"; // Migrate category
  skipValidation?: boolean; // For testing
  dryRun?: boolean; // Preview changes without saving
  verbose?: boolean; // Log details
}

export class MetadataMigrator {
  private oldMetadata: Map<string, any> = new Map();
  private newMetadata: Map<string, FormMetadataAdvanced> = new Map();
  private errors: Array<{ formId: string; error: string }> = [];
  private verbose: boolean = false;

  /**
   * Load existing metadata for migration
   */
  loadExistingMetadata(metadata: Record<string, any>): void {
    this.oldMetadata = new Map(Object.entries(metadata));
  }

  /**
   * Migrate single form from old to new schema
   */
  migrateForm(formId: string, oldMeta: any, category: "A" | "B"): FormMetadataAdvanced | null {
    try {
      if (category === "A") {
        // Category A: Simple master data
        return this.migrateSimpleForm(formId, oldMeta);
      } else {
        // Category B: Standard transactions
        return this.migrateTransactionForm(formId, oldMeta);
      }
    } catch (error: any) {
      this.errors.push({ formId, error: error.message });
      return null;
    }
  }

  /**
   * Migrate Category A (Simple) form
   */
  private migrateSimpleForm(formId: string, oldMeta: any): FormMetadataAdvanced {
    const module = oldMeta.module || "General";
    const name = oldMeta.name || formId;

    if (this.verbose) {
      console.log(`[MIGRATE] Simple form: ${formId}`);
    }

    // Use template for Category A forms
    const newMeta = createSimpleMasterDataMetadata(formId, name, module, oldMeta.description);

    // Preserve existing field information if available
    if (oldMeta.fields && Array.isArray(oldMeta.fields)) {
      newMeta.fields = oldMeta.fields.map((field: any) => ({
        ...field,
        validations: field.validations || [{ type: "required" as const, message: `${field.label} is required` }],
      }));
    }

    return newMeta;
  }

  /**
   * Migrate Category B (Transaction) form
   */
  private migrateTransactionForm(formId: string, oldMeta: any): FormMetadataAdvanced {
    const module = oldMeta.module || "General";
    const name = oldMeta.name || formId;

    if (this.verbose) {
      console.log(`[MIGRATE] Transaction form: ${formId}`);
    }

    // Migrate fields from old format to new format
    const migratedFields = (oldMeta.fields || []).map((field: any) => {
      const newField: any = {
        name: field.name,
        label: field.label,
        type: this.mapFieldType(field.type),
        required: field.required ?? false,
        searchable: field.searchable ?? false,
      };

      // Add validations
      if (field.validation) {
        newField.validations = [{ type: "custom" as const, message: field.validation }];
      }

      if (newField.required) {
        newField.validations = newField.validations || [];
        newField.validations.push({
          type: "required" as const,
          message: `${field.label} is required`,
        });
      }

      return newField;
    });

    // Check if this form needs GL mapping
    const hasGLMapping = FORM_GL_MAPPINGS[formId];
    const hasWorkflow =
      oldMeta.statusWorkflow || ["invoices", "orders", "payroll", "expenses"].includes(formId);

    // Create transaction metadata
    const newMeta = createStandardTransactionMetadata(formId, name, module, migratedFields, {
      description: oldMeta.description,
      requiresGL: !!hasGLMapping,
      hasWorkflow,
    });

    return newMeta;
  }

  /**
   * Map old field types to new field types
   */
  private mapFieldType(
    oldType: string
  ): "text" | "email" | "number" | "date" | "datetime" | "select" | "multiselect" | "textarea" | "checkbox" | "radio" | "file" | "lineitem" | "nested" | "calculated" {
    const typeMap: Record<string, any> = {
      text: "text",
      email: "email",
      number: "number",
      date: "date",
      select: "select",
      textarea: "textarea",
      currency: "number", // Map currency to number
      decimal: "number",
      boolean: "checkbox",
    };

    return typeMap[oldType] || "text";
  }

  /**
   * Migrate all forms in a category
   */
  migrateCategory(category: "A" | "B", forms: string[]): MigrationResult {
    const result: MigrationResult = { success: 0, failed: 0, errors: [] };

    for (const formId of forms) {
      const oldMeta = this.oldMetadata.get(formId);
      if (!oldMeta) {
        continue;
      }

      const newMeta = this.migrateForm(formId, oldMeta, category);
      if (newMeta) {
        // Validate migrated metadata
        const validationResult = metadataValidator.validateMetadataStructure(newMeta);
        if (validationResult.valid) {
          this.newMetadata.set(formId, newMeta);
          result.success++;
        } else {
          result.failed++;
          result.errors.push({
            formId,
            error: validationResult.errors.map((e) => e.message).join("; "),
          });
        }
      } else {
        result.failed++;
      }
    }

    return result;
  }

  /**
   * Batch migrate all forms
   */
  async migrateAll(options: MigrationOptions = {}): Promise<MigrationResult> {
    this.verbose = options.verbose ?? false;
    const result: MigrationResult = { success: 0, failed: 0, errors: [] };

    if (this.verbose) {
      console.log("Starting metadata migration...");
    }

    // Migrate Category A forms (600 simple forms)
    const categoryAForms = Array.from(this.oldMetadata.keys()).slice(0, 600);
    const categoryAResult = this.migrateCategory("A", categoryAForms);
    result.success += categoryAResult.success;
    result.failed += categoryAResult.failed;
    result.errors.push(...categoryAResult.errors);

    if (this.verbose) {
      console.log(`Category A migration: ${categoryAResult.success} success, ${categoryAResult.failed} failed`);
    }

    // Migrate Category B forms (150 transaction forms)
    const categoryBForms = Array.from(this.oldMetadata.keys()).slice(600, 750);
    const categoryBResult = this.migrateCategory("B", categoryBForms);
    result.success += categoryBResult.success;
    result.failed += categoryBResult.failed;
    result.errors.push(...categoryBResult.errors);

    if (this.verbose) {
      console.log(`Category B migration: ${categoryBResult.success} success, ${categoryBResult.failed} failed`);
    }

    return result;
  }

  /**
   * Get migrated metadata
   */
  getMigratedMetadata(): Map<string, FormMetadataAdvanced> {
    return new Map(this.newMetadata);
  }

  /**
   * Export migrated metadata as JSON
   */
  exportAsJSON(): Record<string, FormMetadataAdvanced> {
    const result: Record<string, FormMetadataAdvanced> = {};
    for (const [key, meta] of this.newMetadata) {
      result[key] = meta;
    }
    return result;
  }

  /**
   * Get migration report
   */
  getMigrationReport(): {
    totalForms: number;
    successful: number;
    failed: number;
    successRate: string;
    errors: Array<{ formId: string; error: string }>;
  } {
    const total = this.newMetadata.size + this.errors.length;
    const successful = this.newMetadata.size;
    const failed = this.errors.length;
    const successRate = ((successful / total) * 100).toFixed(2);

    return {
      totalForms: total,
      successful,
      failed,
      successRate: `${successRate}%`,
      errors: this.errors,
    };
  }

  /**
   * Reset migrator state
   */
  reset(): void {
    this.oldMetadata.clear();
    this.newMetadata.clear();
    this.errors = [];
  }
}

/**
 * Execute migration (helper function)
 */
export async function executeMigration(
  oldMetadata: Record<string, any>,
  options: MigrationOptions = {}
): Promise<MigrationResult> {
  const migrator = new MetadataMigrator();
  migrator.loadExistingMetadata(oldMetadata);

  const result = await migrator.migrateAll(options);

  if (options.verbose) {
    console.log("Migration Report:", migrator.getMigrationReport());
  }

  return result;
}
