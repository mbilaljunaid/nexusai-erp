/**
 * Form Schema Generator - Generates Zod schemas from metadata
 */

import { z } from "zod";
import { FormMetadataAdvanced, FormFieldConfig } from "@shared/types/metadata";

export class FormSchemaGenerator {
  /**
   * Generate complete Zod schema from metadata
   */
  generateZodSchema(metadata: FormMetadataAdvanced): z.ZodSchema {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of metadata.fields) {
      shape[field.name] = this.generateFieldSchema(field);
    }

    return z.object(shape);
  }

  /**
   * Generate insert schema (with omitted auto-generated fields)
   */
  generateInsertSchema(metadata: FormMetadataAdvanced): z.ZodSchema {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of metadata.fields) {
      // Skip read-only fields in insert schema
      if (field.readOnly) {
        continue;
      }

      const fieldSchema = this.generateFieldSchema(field);
      shape[field.name] = fieldSchema;
    }

    return z.object(shape);
  }

  /**
   * Generate select schema (with optional fields)
   */
  generateSelectSchema(metadata: FormMetadataAdvanced): z.ZodSchema {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of metadata.fields) {
      const fieldSchema = this.generateFieldSchema(field);
      // Make all fields optional for select schema
      shape[field.name] = fieldSchema.optional();
    }

    return z.object(shape).partial();
  }

  /**
   * Generate schema for individual field
   */
  private generateFieldSchema(field: FormFieldConfig): z.ZodTypeAny {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "text":
        schema = z.string();
        break;

      case "email":
        schema = z.string().email("Invalid email address");
        break;

      case "number":
        schema = z.number().or(z.string().transform((val) => parseFloat(val)));
        break;

      case "date":
        schema = z.string().date().or(z.date().transform((d) => d.toISOString()));
        break;

      case "datetime":
        schema = z.string().datetime().or(z.date().transform((d) => d.toISOString()));
        break;

      case "select":
        if (field.options) {
          const values = field.options.map((opt) => opt.value);
          schema = z.enum(values as [string, ...string[]]);
        } else {
          schema = z.string();
        }
        break;

      case "multiselect":
        if (field.options) {
          const values = field.options.map((opt) => opt.value);
          schema = z.array(z.enum(values as [string, ...string[]]));
        } else {
          schema = z.array(z.string());
        }
        break;

      case "textarea":
        schema = z.string();
        break;

      case "checkbox":
        schema = z.boolean();
        break;

      case "radio":
        schema = z.string();
        break;

      case "file":
        schema = z.any(); // File handling in form submission
        break;

      case "lineitem":
        if (field.nestedFields) {
          schema = z.array(z.object(this.buildNestedShape(field.nestedFields)));
        } else {
          schema = z.array(z.object({}));
        }
        break;

      case "nested":
        if (field.nestedFields) {
          schema = z.object(this.buildNestedShape(field.nestedFields));
        } else {
          schema = z.object({});
        }
        break;

      case "calculated":
        schema = z.string().or(z.number()); // Calculated fields are read-only but may be strings or numbers
        break;

      default:
        schema = z.string();
    }

    // Apply validations
    if (field.validations) {
      schema = this.applyValidations(schema, field);
    }

    // Apply required/optional
    if (!field.required) {
      schema = schema.nullable().optional();
    }

    return schema;
  }

  /**
   * Build shape for nested fields
   */
  private buildNestedShape(nestedFields: FormFieldConfig[]): Record<string, z.ZodTypeAny> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of nestedFields) {
      shape[field.name] = this.generateFieldSchema(field);
    }

    return shape;
  }

  /**
   * Apply custom validations to schema
   */
  private applyValidations(schema: z.ZodTypeAny, field: FormFieldConfig): z.ZodTypeAny {
    if (!field.validations) {
      return schema;
    }

    for (const validation of field.validations) {
      switch (validation.type) {
        case "min":
          if (schema instanceof z.ZodNumber || schema instanceof z.ZodString) {
            schema = (schema as any).min(validation.value, validation.message);
          }
          break;

        case "max":
          if (schema instanceof z.ZodNumber || schema instanceof z.ZodString) {
            schema = (schema as any).max(validation.value, validation.message);
          }
          break;

        case "pattern":
          if (schema instanceof z.ZodString) {
            schema = (schema as any).regex(new RegExp(validation.value), validation.message);
          }
          break;

        case "email":
          if (schema instanceof z.ZodString) {
            schema = (schema as any).email(validation.message);
          }
          break;

        case "custom":
          // Custom validation should be handled at form level
          break;
      }
    }

    return schema;
  }

  /**
   * Parse value according to field type
   */
  parseFieldValue(field: FormFieldConfig, value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    switch (field.type) {
      case "number":
        return parseFloat(value);

      case "date":
      case "datetime":
        return new Date(value).toISOString();

      case "checkbox":
        return Boolean(value);

      case "multiselect":
      case "lineitem":
        return Array.isArray(value) ? value : [value];

      default:
        return value;
    }
  }

  /**
   * Validate value against field schema
   */
  validateFieldValue(field: FormFieldConfig, value: any): { valid: boolean; error?: string } {
    try {
      const schema = this.generateFieldSchema(field);
      schema.parse(value);
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.errors?.[0]?.message || error.message,
      };
    }
  }

  /**
   * Generate default value for field
   */
  getDefaultValue(field: FormFieldConfig): any {
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    switch (field.type) {
      case "text":
      case "email":
      case "textarea":
        return "";

      case "number":
        return 0;

      case "checkbox":
        return false;

      case "multiselect":
      case "lineitem":
        return [];

      case "date":
      case "datetime":
        return new Date().toISOString();

      case "select":
        if (field.options && field.options.length > 0) {
          return field.options[0].value;
        }
        return "";

      default:
        return null;
    }
  }

  /**
   * Generate sample data for all fields
   */
  generateSampleData(metadata: FormMetadataAdvanced): Record<string, any> {
    const data: Record<string, any> = {};

    for (const field of metadata.fields) {
      data[field.name] = this.generateSampleValue(field);
    }

    return data;
  }

  /**
   * Generate sample value for a field
   */
  private generateSampleValue(field: FormFieldConfig): any {
    switch (field.type) {
      case "text":
        return `Sample ${field.label}`;

      case "email":
        return "sample@example.com";

      case "number":
        return 100;

      case "date":
        return new Date().toISOString().split("T")[0];

      case "datetime":
        return new Date().toISOString();

      case "select":
        if (field.options && field.options.length > 0) {
          return field.options[0].value;
        }
        return "option1";

      case "multiselect":
        if (field.options && field.options.length > 0) {
          return [field.options[0].value];
        }
        return ["option1"];

      case "textarea":
        return `Sample ${field.label} content`;

      case "checkbox":
        return true;

      case "radio":
        return "option1";

      case "file":
        return null;

      case "lineitem":
        return [{ id: 1, name: "Sample Item", amount: 100 }];

      case "nested":
        return { nested: "value" };

      case "calculated":
        return "0.00";

      default:
        return null;
    }
  }
}

export const formSchemaGenerator = new FormSchemaGenerator();
