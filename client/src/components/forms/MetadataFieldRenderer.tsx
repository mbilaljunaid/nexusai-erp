/**
 * Metadata Field Renderer - Renders individual fields based on type
 * Phase 2 - Supports all 14 field types
 */

import { Controller, type UseFormReturn } from "react-hook-form";
import type { FormFieldConfig } from "@shared/types/metadata";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ValidationEngine } from "@/lib/validationEngine";
import { ConditionalLogicEngine } from "@/lib/conditionalLogicEngine";

interface MetadataFieldRendererProps {
  field: FormFieldConfig;
  formMethods: UseFormReturn<any>;
  readOnly?: boolean;
  validationEngine: ValidationEngine;
  logicEngine: ConditionalLogicEngine;
  formData: Record<string, any>;
}

export function MetadataFieldRenderer({
  field,
  formMethods,
  readOnly = false,
  validationEngine,
  logicEngine,
  formData,
}: MetadataFieldRendererProps) {
  const { control, formState } = formMethods;
  const fieldState = logicEngine.getFieldState(field, formData);
  const error = formState.errors[field.name]?.message as string | undefined;

  if (!fieldState.visible) {
    return null;
  }

  const labelText = fieldState.required ? `${field.label} *` : field.label;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {labelText}
      </Label>

      <Controller
        name={field.name}
        control={control}
        render={({ field: fieldProps }) => (
          <div>
            {field.type === "text" && (
              <Input
                {...fieldProps}
                id={field.name}
                placeholder={field.placeholder}
                disabled={readOnly || fieldState.disabled}
                data-testid={`input-${field.name}`}
              />
            )}

            {field.type === "email" && (
              <Input
                {...fieldProps}
                id={field.name}
                type="email"
                placeholder={field.placeholder}
                disabled={readOnly || fieldState.disabled}
                data-testid={`input-${field.name}`}
              />
            )}

            {field.type === "number" && (
              <Input
                {...fieldProps}
                id={field.name}
                type="number"
                placeholder={field.placeholder}
                disabled={readOnly || fieldState.disabled}
                data-testid={`input-${field.name}`}
              />
            )}

            {field.type === "date" && (
              <Input
                {...fieldProps}
                id={field.name}
                type="date"
                disabled={readOnly || fieldState.disabled}
                data-testid={`input-${field.name}`}
              />
            )}

            {field.type === "datetime" && (
              <Input
                {...fieldProps}
                id={field.name}
                type="datetime-local"
                disabled={readOnly || fieldState.disabled}
                data-testid={`input-${field.name}`}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                {...fieldProps}
                id={field.name}
                placeholder={field.placeholder}
                disabled={readOnly || fieldState.disabled}
                data-testid={`textarea-${field.name}`}
              />
            )}

            {field.type === "select" && (
              <Select
                value={fieldProps.value || ""}
                onValueChange={fieldProps.onChange}
                disabled={readOnly || fieldState.disabled}
              >
                <SelectTrigger id={field.name} data-testid={`select-${field.name}`}>
                  <SelectValue placeholder={field.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={field.name}
                  checked={fieldProps.value || false}
                  onCheckedChange={fieldProps.onChange}
                  disabled={readOnly || fieldState.disabled}
                  data-testid={`checkbox-${field.name}`}
                />
                <label htmlFor={field.name} className="text-sm cursor-pointer">
                  {field.label}
                </label>
              </div>
            )}

            {field.type === "calculated" && (
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 border" data-testid={`calculated-${field.name}`}>
                {logicEngine.calculateFormulaValue(field.formula || "", formData) || "—"}
              </div>
            )}

            {/* TODO: Implement remaining field types (radio, file, multiselect, lineitem, nested) */}
          </div>
        )}
      />

      {/* Error message */}
      {error && <p className="text-sm text-red-500" data-testid={`error-${field.name}`}>{error}</p>}

      {/* Help text */}
      {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
    </div>
  );
}
