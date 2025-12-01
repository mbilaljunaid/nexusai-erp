/**
 * Rules Engine - Phase 5
 * Conditional logic and business rules for workflows
 */

export interface Rule {
  id: string;
  name: string;
  description?: string;
  conditions: Condition[];
  actions: Action[];
  priority: number;
  enabled: boolean;
}

export interface Condition {
  field: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains" | "in" | "between";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface Action {
  type: "transition" | "notify" | "createGL" | "assignApprover" | "setFieldValue" | "sendEmail";
  config: Record<string, any>;
}

export class RulesEngine {
  private rules: Map<string, Rule[]> = new Map();

  /**
   * Register rules for a form
   */
  registerRules(formId: string, rules: Rule[]): void {
    this.rules.set(formId, rules.sort((a, b) => b.priority - a.priority));
  }

  /**
   * Evaluate rules for form data
   */
  evaluateRules(formId: string, formData: Record<string, any>): Action[] {
    const formRules = this.rules.get(formId) || [];
    const actions: Action[] = [];

    for (const rule of formRules) {
      if (!rule.enabled) continue;

      if (this.evaluateConditions(rule.conditions, formData)) {
        actions.push(...rule.actions);
      }
    }

    return actions;
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateConditions(conditions: Condition[], formData: Record<string, any>): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], formData);

    for (let i = 1; i < conditions.length; i++) {
      const conditionResult = this.evaluateCondition(conditions[i], formData);
      const operator = conditions[i - 1].logicalOperator || "AND";

      result = operator === "AND" ? result && conditionResult : result || conditionResult;
    }

    return result;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: Condition, formData: Record<string, any>): boolean {
    const value = formData[condition.field];

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "notEquals":
        return value !== condition.value;
      case "greaterThan":
        return Number(value) > Number(condition.value);
      case "lessThan":
        return Number(value) < Number(condition.value);
      case "contains":
        return String(value).includes(String(condition.value));
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(value);
      case "between":
        return Number(value) >= Number(condition.value[0]) && Number(value) <= Number(condition.value[1]);
      default:
        return true;
    }
  }

  /**
   * Get rules for form
   */
  getRulesForForm(formId: string): Rule[] {
    return this.rules.get(formId) || [];
  }
}

export const rulesEngine = new RulesEngine();
