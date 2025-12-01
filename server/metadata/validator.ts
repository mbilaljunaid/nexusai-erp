/**
 * Metadata Validator - Validates form metadata structure and consistency
 */

import {
  FormMetadataAdvanced,
  FormFieldConfig,
  GLMappingConfig,
  WorkflowTransition,
  ValidationResult,
  ValidationError,
  FormFieldCondition,
} from "@shared/types/metadata";

export class MetadataValidator {
  private glAccounts: Set<string>;

  constructor() {
    // Initialize with standard GL accounts
    this.glAccounts = new Set([
      "1000", // Cash
      "1100", // Petty Cash
      "1200", // Accounts Receivable
      "1300", // Inventory
      "1400", // Prepaid Expenses
      "1500", // Equipment
      "1600", // Accumulated Depreciation
      "2000", // Accounts Payable
      "2100", // Accrued Expenses
      "2200", // Short-term Debt
      "3000", // Equity
      "4000", // Product Revenue
      "4100", // Service Revenue
      "4200", // Other Revenue
      "5000", // Cost of Goods Sold
      "5100", // Employee Compensation
      "5200", // Office Supplies
      "5300", // Utilities
      "6000", // Professional Services
      "6100", // Marketing Expenses
      "6200", // Travel Expenses
      "6300", // Depreciation Expense
      "6400", // Interest Expense
    ]);
  }

  /**
   * Validate entire metadata structure
   */
  validateMetadataStructure(metadata: FormMetadataAdvanced): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!metadata.id) errors.push({ field: "id", message: "Form ID is required" });
    if (!metadata.name) errors.push({ field: "name", message: "Form name is required" });
    if (!metadata.apiEndpoint) errors.push({ field: "apiEndpoint", message: "API endpoint is required" });
    if (!metadata.module) errors.push({ field: "module", message: "Module is required" });
    if (!metadata.fields || metadata.fields.length === 0) errors.push({ field: "fields", message: "At least one field is required" });

    // Validate field configs
    if (metadata.fields) {
      for (const field of metadata.fields) {
        const fieldErrors = this.validateFieldConfig(field, metadata.fields);
        errors.push(...fieldErrors);
      }
    }

    // Validate search fields exist
    if (metadata.searchFields) {
      const fieldNames = metadata.fields?.map((f) => f.name) || [];
      for (const searchField of metadata.searchFields) {
        if (!fieldNames.includes(searchField)) {
          errors.push({
            field: "searchFields",
            message: `Search field "${searchField}" does not exist in fields`,
          });
        }
      }
    }

    // Validate display field exists
    if (metadata.displayField) {
      const fieldNames = metadata.fields?.map((f) => f.name) || [];
      if (!fieldNames.includes(metadata.displayField)) {
        errors.push({
          field: "displayField",
          message: `Display field "${metadata.displayField}" does not exist in fields`,
        });
      }
    }

    // Validate sections if provided
    if (metadata.sections) {
      const fieldNames = metadata.fields?.map((f) => f.name) || [];
      for (const section of metadata.sections) {
        for (const fieldName of section.fields) {
          if (!fieldNames.includes(fieldName)) {
            errors.push({
              field: `sections.${section.name}`,
              message: `Field "${fieldName}" in section "${section.name}" does not exist`,
            });
          }
        }
      }
    }

    // Validate GL configuration
    if (metadata.glConfig) {
      const glErrors = this.validateGLConfig(metadata.glConfig, metadata.fields);
      errors.push(...glErrors);
    }

    // Validate workflow transitions
    if (metadata.statusWorkflow) {
      const workflowErrors = this.validateWorkflow(metadata.statusWorkflow);
      errors.push(...workflowErrors);
    }

    // Validate linked forms
    if (metadata.linkedForms) {
      for (const linkedForm of metadata.linkedForms) {
        if (!linkedForm.targetFormId) {
          errors.push({
            field: "linkedForms",
            message: "Linked form must have targetFormId",
          });
        }
      }
    }

    // Check for circular dependencies
    const depErrors = this.detectCircularDependencies(metadata.fields);
    errors.push(...depErrors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate field configuration
   */
  private validateFieldConfig(field: FormFieldConfig, allFields: FormFieldConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!field.name) errors.push({ field: "fields", message: "Field name is required" });
    if (!field.label) errors.push({ field: "fields", message: "Field label is required" });
    if (!field.type) errors.push({ field: "fields", message: "Field type is required" });

    // Validate field type
    const validTypes = [
      "text",
      "email",
      "number",
      "date",
      "datetime",
      "select",
      "multiselect",
      "textarea",
      "checkbox",
      "radio",
      "file",
      "lineitem",
      "nested",
      "calculated",
    ];
    if (!validTypes.includes(field.type)) {
      errors.push({
        field: `fields.${field.name}`,
        message: `Invalid field type: ${field.type}`,
      });
    }

    // Validate select options
    if ((field.type === "select" || field.type === "multiselect") && !field.options && !field.optionsEndpoint) {
      errors.push({
        field: `fields.${field.name}`,
        message: "Select fields must have options or optionsEndpoint",
      });
    }

    // Validate nested fields
    if (field.type === "nested" && (!field.nestedFields || field.nestedFields.length === 0)) {
      errors.push({
        field: `fields.${field.name}`,
        message: "Nested fields must have nestedFields defined",
      });
    }

    // Validate calculated fields
    if (field.type === "calculated" && !field.formula) {
      errors.push({
        field: `fields.${field.name}`,
        message: "Calculated fields must have a formula",
      });
    }

    // Validate field dependencies exist
    if (field.dependsOn) {
      const fieldNames = allFields.map((f) => f.name);
      for (const depField of field.dependsOn) {
        if (!fieldNames.includes(depField)) {
          errors.push({
            field: `fields.${field.name}.dependsOn`,
            message: `Dependency field "${depField}" does not exist`,
          });
        }
      }
    }

    return errors;
  }

  /**
   * Validate GL configuration
   */
  private validateGLConfig(glConfig: any, fields?: FormFieldConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!glConfig.glMappings || glConfig.glMappings.length === 0) {
      if (glConfig.autoCreateGL) {
        errors.push({
          field: "glConfig.glMappings",
          message: "GL mappings are required when autoCreateGL is true",
        });
      }
      return errors;
    }

    let totalDebits = 0;
    let totalCredits = 0;

    for (const mapping of glConfig.glMappings) {
      const mappingErrors = this.validateGLMapping(mapping, fields);
      errors.push(...mappingErrors);

      if (mapping.debitCredit === "debit") totalDebits++;
      if (mapping.debitCredit === "credit") totalCredits++;
    }

    // Validate balance if required
    if (glConfig.requireBalance && totalDebits !== totalCredits) {
      errors.push({
        field: "glConfig",
        message: `GL mappings must balance: ${totalDebits} debits vs ${totalCredits} credits`,
      });
    }

    return errors;
  }

  /**
   * Validate GL mapping
   */
  private validateGLMapping(mapping: GLMappingConfig, fields?: FormFieldConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!mapping.account) {
      errors.push({
        field: "glConfig.glMappings",
        message: "GL account is required",
      });
      return errors;
    }

    if (!this.glAccounts.has(mapping.account)) {
      errors.push({
        field: "glConfig.glMappings",
        message: `Invalid GL account: ${mapping.account}`,
      });
    }

    if (!mapping.debitCredit) {
      errors.push({
        field: "glConfig.glMappings",
        message: "debitCredit must be 'debit' or 'credit'",
      });
    }

    if (mapping.amount === "dynamic" && !mapping.amountField && fields) {
      errors.push({
        field: "glConfig.glMappings",
        message: "amountField is required when amount is 'dynamic'",
      });
    }

    if (mapping.amount === "dynamic" && mapping.amountField && fields) {
      const fieldNames = fields.map((f) => f.name);
      if (!fieldNames.includes(mapping.amountField)) {
        errors.push({
          field: "glConfig.glMappings",
          message: `Amount field "${mapping.amountField}" does not exist`,
        });
      }
    }

    return errors;
  }

  /**
   * Validate workflow configuration
   */
  private validateWorkflow(transitions: WorkflowTransition[]): ValidationError[] {
    const errors: ValidationError[] = [];

    const states = new Set<string>();
    for (const transition of transitions) {
      states.add(transition.fromStatus);
      states.add(transition.toStatus);

      if (!transition.fromStatus) {
        errors.push({
          field: "statusWorkflow",
          message: "fromStatus is required",
        });
      }

      if (!transition.toStatus) {
        errors.push({
          field: "statusWorkflow",
          message: "toStatus is required",
        });
      }
    }

    return errors;
  }

  /**
   * Detect circular dependencies in field conditions
   */
  private detectCircularDependencies(fields: FormFieldConfig[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const fieldNames = fields.map((f) => f.name);

    for (const field of fields) {
      if (field.dependsOn) {
        const visited = new Set<string>();
        const hasCycle = this.findCycle(field.name, fields, visited);
        if (hasCycle) {
          errors.push({
            field: field.name,
            message: "Circular dependency detected",
          });
        }
      }
    }

    return errors;
  }

  /**
   * Find circular dependency using DFS
   */
  private findCycle(fieldName: string, fields: FormFieldConfig[], visited: Set<string>): boolean {
    if (visited.has(fieldName)) {
      return true;
    }

    visited.add(fieldName);
    const field = fields.find((f) => f.name === fieldName);

    if (field?.dependsOn) {
      for (const dep of field.dependsOn) {
        if (this.findCycle(dep, fields, new Set(visited))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Validate specific field type
   */
  validateFieldValue(field: FormFieldConfig, value: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (field.required && !value) {
      errors.push({
        field: field.name,
        message: `${field.label} is required`,
      });
      return { valid: false, errors };
    }

    if (value === null || value === undefined || value === "") {
      return { valid: true, errors: [] };
    }

    switch (field.type) {
      case "email":
        if (!this.isValidEmail(value)) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a valid email`,
          });
        }
        break;

      case "number":
        if (isNaN(Number(value))) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a number`,
          });
        }
        break;

      case "date":
        if (!this.isValidDate(value)) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a valid date`,
          });
        }
        break;
    }

    // Run custom validations
    if (field.validations) {
      for (const validation of field.validations) {
        const validationError = this.validateCustomRule(field, value, validation);
        if (validationError) {
          errors.push(validationError);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate custom validation rule
   */
  private validateCustomRule(field: FormFieldConfig, value: any, validation: any): ValidationError | null {
    switch (validation.type) {
      case "required":
        if (!value) {
          return {
            field: field.name,
            message: validation.message || `${field.label} is required`,
          };
        }
        break;

      case "email":
        if (!this.isValidEmail(value)) {
          return {
            field: field.name,
            message: validation.message || `${field.label} must be a valid email`,
          };
        }
        break;

      case "min":
        if (Number(value) < validation.value) {
          return {
            field: field.name,
            message: validation.message || `${field.label} must be at least ${validation.value}`,
          };
        }
        break;

      case "max":
        if (Number(value) > validation.value) {
          return {
            field: field.name,
            message: validation.message || `${field.label} must be at most ${validation.value}`,
          };
        }
        break;

      case "pattern":
        const regex = new RegExp(validation.value);
        if (!regex.test(value)) {
          return {
            field: field.name,
            message: validation.message || `${field.label} format is invalid`,
          };
        }
        break;
    }

    return null;
  }

  /**
   * Helper methods
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(date: string): boolean {
    return !isNaN(Date.parse(date));
  }

  /**
   * Add custom GL account
   */
  addGLAccount(account: string): void {
    this.glAccounts.add(account);
  }

  /**
   * Check if GL account exists
   */
  hasGLAccount(account: string): boolean {
    return this.glAccounts.has(account);
  }
}

export const metadataValidator = new MetadataValidator();
