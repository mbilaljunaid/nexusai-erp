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

            {field.type === "radio" && (
              <div className="space-y-2" data-testid={`radio-group-${field.name}`}>
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`${field.name}-${option.value}`}
                      name={field.name}
                      value={option.value}
                      checked={fieldProps.value === option.value}
                      onChange={() => fieldProps.onChange(option.value)}
                      disabled={readOnly || fieldState.disabled}
                      className="h-4 w-4 text-primary border-gray-300"
                      data-testid={`radio-${field.name}-${option.value}`}
                    />
                    <label htmlFor={`${field.name}-${option.value}`} className="text-sm cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {field.type === "file" && (
              <Input
                type="file"
                id={field.name}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    fieldProps.onChange(file.name);
                  }
                }}
                disabled={readOnly || fieldState.disabled}
                accept={(field as any).accept || "*/*"}
                data-testid={`file-${field.name}`}
              />
            )}

            {field.type === "multiselect" && (
              <div className="space-y-2 border rounded p-3 max-h-48 overflow-y-auto" data-testid={`multiselect-${field.name}`}>
                {field.options?.map((option) => {
                  const selectedValues = Array.isArray(fieldProps.value) ? fieldProps.value : [];
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${field.name}-${option.value}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const newValues = checked
                            ? [...selectedValues, option.value]
                            : selectedValues.filter((v: string) => v !== option.value);
                          fieldProps.onChange(newValues);
                        }}
                        disabled={readOnly || fieldState.disabled}
                        data-testid={`multiselect-option-${field.name}-${option.value}`}
                      />
                      <label htmlFor={`${field.name}-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {field.type === "lineitem" && (
              <div className="space-y-2" data-testid={`lineitem-${field.name}`}>
                {(Array.isArray(fieldProps.value) ? fieldProps.value : []).map((item: Record<string, string>, index: number) => (
                  <div key={index} className="flex gap-2 items-center p-2 border rounded">
                    <Input
                      value={item.description || ""}
                      onChange={(e) => {
                        const newItems = [...(fieldProps.value || [])];
                        newItems[index] = { ...newItems[index], description: e.target.value };
                        fieldProps.onChange(newItems);
                      }}
                      placeholder="Description"
                      className="flex-1"
                      disabled={readOnly || fieldState.disabled}
                      data-testid={`lineitem-desc-${field.name}-${index}`}
                    />
                    <Input
                      type="number"
                      value={item.amount || ""}
                      onChange={(e) => {
                        const newItems = [...(fieldProps.value || [])];
                        newItems[index] = { ...newItems[index], amount: e.target.value };
                        fieldProps.onChange(newItems);
                      }}
                      placeholder="Amount"
                      className="w-24"
                      disabled={readOnly || fieldState.disabled}
                      data-testid={`lineitem-amount-${field.name}-${index}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = (fieldProps.value || []).filter((_: unknown, i: number) => i !== index);
                        fieldProps.onChange(newItems);
                      }}
                      disabled={readOnly || fieldState.disabled}
                      className="text-red-500 hover:text-red-700 px-2"
                      data-testid={`lineitem-remove-${field.name}-${index}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newItems = [...(fieldProps.value || []), { description: "", amount: "" }];
                    fieldProps.onChange(newItems);
                  }}
                  disabled={readOnly || fieldState.disabled}
                  className="text-sm text-primary hover:underline"
                  data-testid={`lineitem-add-${field.name}`}
                >
                  + Add Line Item
                </button>
              </div>
            )}

            {field.type === "nested" && (
              <div className="border rounded p-3 space-y-3 bg-gray-50" data-testid={`nested-${field.name}`}>
                <p className="text-xs text-muted-foreground">Nested field group</p>
                {field.nestedFields?.map((nestedField) => (
                  <div key={nestedField.name} className="space-y-1">
                    <Label className="text-xs">{nestedField.label}</Label>
                    <Input
                      value={(fieldProps.value as Record<string, string>)?.[nestedField.name] || ""}
                      onChange={(e) => {
                        const newValue = { ...(fieldProps.value || {}), [nestedField.name]: e.target.value };
                        fieldProps.onChange(newValue);
                      }}
                      placeholder={nestedField.placeholder}
                      disabled={readOnly || fieldState.disabled}
                      data-testid={`nested-input-${field.name}-${nestedField.name}`}
                    />
                  </div>
                ))}
              </div>
            )}
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
