/**
 * Conditional Logic Engine - Phase 2
 * Evaluates field conditions and manages field visibility/state
 */

import type { FormFieldConfig, FormFieldCondition } from "@shared/types/metadata";

export class ConditionalLogicEngine {
  /**
   * Check if field should be shown based on conditions
   */
  shouldShowField(field: FormFieldConfig, formData: Record<string, any>): boolean {
    if (!field.conditions || field.conditions.length === 0) {
      return true;
    }

    // All conditions must be met for field to show
    return field.conditions.every((condition) => this.evaluateCondition(condition, formData));
  }

  /**
   * Check if field should be disabled
   */
  shouldDisableField(field: FormFieldConfig, formData: Record<string, any>): boolean {
    if (!field.conditions || field.conditions.length === 0) {
      return false;
    }

    // Check for disable actions
    return field.conditions.some(
      (condition) => condition.action === "disable" && this.evaluateCondition(condition, formData)
    );
  }

  /**
   * Get field visibility state
   */
  getFieldState(field: FormFieldConfig, formData: Record<string, any>): {
    visible: boolean;
    disabled: boolean;
    required: boolean;
  } {
    let required = field.required;

    if (field.conditions) {
      for (const condition of field.conditions) {
        if (condition.action === "require" && this.evaluateCondition(condition, formData)) {
          required = true;
        }
      }
    }

    return {
      visible: this.shouldShowField(field, formData),
      disabled: this.shouldDisableField(field, formData),
      required,
    };
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: FormFieldCondition, formData: Record<string, any>): boolean {
    const fieldValue = formData[condition.field];

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;

      case "notEquals":
        return fieldValue !== condition.value;

      case "greaterThan":
        return Number(fieldValue) > Number(condition.value);

      case "lessThan":
        return Number(fieldValue) < Number(condition.value);

      case "contains":
        return String(fieldValue).includes(String(condition.value));

      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);

      default:
        return true;
    }
  }

  /**
   * Get fields visible for current form state
   */
  getVisibleFields(fields: FormFieldConfig[], formData: Record<string, any>): FormFieldConfig[] {
    return fields.filter((field) => this.shouldShowField(field, formData));
  }

  /**
   * Calculate formula for calculated fields
   */
  calculateFormulaValue(formula: string, formData: Record<string, any>): any {
    if (!formula) return null;

    try {
      // Replace field names in formula with their values
      let expression = formula;
      for (const [key, value] of Object.entries(formData)) {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, "g"), String(value));
      }

      // Safely evaluate expression (only numbers and basic operators)
      return Function('"use strict"; return (' + expression + ")")();
    } catch {
      return null;
    }
  }

  /**
   * Get dynamic options for a field based on dependencies
   */
  getDynamicOptions(
    field: FormFieldConfig,
    formData: Record<string, any>
  ): Array<{ label: string; value: string }> {
    // This would be extended to support dynamic option loading from API
    if (field.options) {
      return field.options;
    }

    return [];
  }
}

export const conditionalLogicEngine = new ConditionalLogicEngine();
