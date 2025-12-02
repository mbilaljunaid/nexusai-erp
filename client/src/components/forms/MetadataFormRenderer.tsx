/**
 * Universal Metadata-Driven Form Renderer - Phase 2
 * Renders any form from metadata configuration
 */

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetadataFieldRenderer } from "./MetadataFieldRenderer";
import { Loader2 } from "lucide-react";

interface MetadataField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  disabled?: boolean;
}

interface MetadataSection {
  name: string;
  title: string;
  description?: string;
  fields: string[];
}

interface FormMetadata {
  id: string;
  name: string;
  description?: string;
  fields: MetadataField[];
  sections?: MetadataSection[];
  createButtonText?: string;
  theme?: {
    layout?: string;
    showHeader?: boolean;
    showBreadcrumbs?: boolean;
  };
  breadcrumbs?: Array<{ label: string }>;
}

interface MetadataFormRendererProps {
  formId: string;
  initialData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  readOnly?: boolean;
  hideFields?: string[];
}

export function MetadataFormRenderer({
  formId,
  initialData,
  onSubmit,
  readOnly = false,
  hideFields = [],
}: MetadataFormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load metadata
  const metadata = useMemo(() => metadataRegistry.getMetadata(formId), [formId]);

  if (!metadata) {
    return <div className="text-red-500">Form not found: {formId}</div>;
  }

  // Initialize form
  const formMethods = useForm({
    defaultValues: initialData || {},
  });

  // Create validation and logic engines
  const validationEngine = useMemo(() => new ValidationEngine(), []);
  const logicEngine = useMemo(() => new ConditionalLogicEngine(), []);

  // Watch form changes for conditional logic
  const formData = formMethods.watch();

  // Handle form submission
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setFormError(null);
      setIsSubmitting(true);

      // Validate data
      const validation = validationEngine.validateFormData(metadata, data);
      if (!validation.valid) {
        setFormError("Form has validation errors");
        return;
      }

      // Call submit handler
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error: any) {
      setFormError(error.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get visible fields
  const visibleFields = useMemo(() => {
    return metadata.fields.filter((field) => {
      if (hideFields.includes(field.name)) return false;
      return logicEngine.shouldShowField(field, formData);
    });
  }, [metadata.fields, formData, hideFields, logicEngine]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      {metadata.theme?.showHeader !== false && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{metadata.name}</h1>
          {metadata.description && <p className="text-gray-500 mt-2">{metadata.description}</p>}
        </div>
      )}

      {/* Breadcrumbs */}
      {metadata.theme?.showBreadcrumbs !== false && (
        <div className="flex gap-2 mb-6 text-sm text-gray-600">
          {metadata.breadcrumbs?.map((crumb, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              <span>{crumb.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {formError && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">{formError}</div>}

      {/* Form */}
      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Render sections or fields */}
          {metadata.sections ? (
            // Sectioned layout
            metadata.sections.map((section) => (
              <Card key={section.name} className="p-6">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                {section.description && <p className="text-gray-600 mb-4">{section.description}</p>}

                <div
                  className={`grid gap-4 ${
                    metadata.theme?.layout === "two-column" ? "md:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {section.fields.map((fieldName) => {
                    const field = metadata.fields.find((f) => f.name === fieldName);
                    if (!field) return null;

                    const fieldState = logicEngine.getFieldState(field, formData);
                    if (!fieldState.visible) return null;

                    return (
                      <MetadataFieldRenderer
                        key={field.name}
                        field={field}
                        formMethods={formMethods}
                        readOnly={readOnly || fieldState.disabled}
                        validationEngine={validationEngine}
                        logicEngine={logicEngine}
                        formData={formData}
                      />
                    );
                  })}
                </div>
              </Card>
            ))
          ) : (
            // Non-sectioned layout
            <div
              className={`grid gap-4 ${
                metadata.theme?.layout === "two-column" ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {visibleFields.map((field) => (
                <MetadataFieldRenderer
                  key={field.name}
                  field={field}
                  formMethods={formMethods}
                  readOnly={readOnly}
                  validationEngine={validationEngine}
                  logicEngine={logicEngine}
                  formData={formData}
                />
              ))}
            </div>
          )}

          {/* Submit button */}
          {!readOnly && (
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button variant="outline" type="button" onClick={() => formMethods.reset()}>
                Clear
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {metadata.createButtonText || "Submit"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
