/**
 * Form Validation Engine - Phase 2
 * Validates form data against metadata configurations
 */

import type { FormFieldConfig } from "@shared/types/metadata";

export class ValidationEngine {
  /**
   * Validate form data against metadata
   */
  validateFormData(
    fields: FormFieldConfig[],
    formData: Record<string, any>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const validation = this.validateField(field, formData[field.name]);
      if (!validation.valid && validation.error) {
        errors[field.name] = validation.error;
      }
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  /**
   * Validate single field value
   */
  validateField(field: FormFieldConfig, value: any): { valid: boolean; error?: string } {
    // Check required
    if (field.required && !value) {
      return { valid: false, error: `${field.label} is required` };
    }

    if (!value) {
      return { valid: true };
    }

    // Check type-specific validations
    switch (field.type) {
      case "email":
        if (!this.isValidEmail(value)) {
          return { valid: false, error: `${field.label} must be a valid email` };
        }
        break;

      case "number":
        if (isNaN(Number(value))) {
          return { valid: false, error: `${field.label} must be a number` };
        }
        break;

      case "date":
        if (!this.isValidDate(value)) {
          return { valid: false, error: `${field.label} must be a valid date` };
        }
        break;
    }

    // Apply custom validations
    if (field.validations) {
      for (const validation of field.validations) {
        const result = this.applyValidation(field, value, validation);
        if (!result.valid) {
          return result;
        }
      }
    }

    return { valid: true };
  }

  /**
   * Apply custom validation rule
   */
  private applyValidation(
    field: FormFieldConfig,
    value: any,
    validation: any
  ): { valid: boolean; error?: string } {
    switch (validation.type) {
      case "required":
        if (!value) {
          return { valid: false, error: validation.message || `${field.label} is required` };
        }
        break;

      case "email":
        if (!this.isValidEmail(value)) {
          return { valid: false, error: validation.message || `${field.label} must be a valid email` };
        }
        break;

      case "min":
        if (Number(value) < validation.value) {
          return {
            valid: false,
            error: validation.message || `${field.label} must be at least ${validation.value}`,
          };
        }
        break;

      case "max":
        if (Number(value) > validation.value) {
          return {
            valid: false,
            error: validation.message || `${field.label} must be at most ${validation.value}`,
          };
        }
        break;

      case "pattern":
        const regex = new RegExp(validation.value);
        if (!regex.test(String(value))) {
          return { valid: false, error: validation.message || `${field.label} format is invalid` };
        }
        break;
    }

    return { valid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(date: string): boolean {
    return !isNaN(Date.parse(date));
  }
}

export const validationEngine = new ValidationEngine();
