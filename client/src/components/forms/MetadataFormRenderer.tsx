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
import { ValidationEngine } from "@/lib/validationEngine";
import { ConditionalLogicEngine } from "@/lib/conditionalLogicEngine";
import type { FormFieldConfig } from "@shared/types/metadata";
import { Loader2 } from "lucide-react";

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
  fields: FormFieldConfig[];
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
  formMetadata?: any;
  initialData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  readOnly?: boolean;
  hideFields?: string[];
}

export function MetadataFormRenderer({
  formId,
  formMetadata: providedMetadata,
  initialData,
  onSubmit,
  readOnly = false,
  hideFields = [],
}: MetadataFormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create engine instances
  const validationEngine = useMemo(() => new ValidationEngine(), []);
  const logicEngine = useMemo(() => new ConditionalLogicEngine(), []);

  // Use provided metadata or fallback to mock
  const metadata: FormMetadata = providedMetadata || {
    id: formId,
    name: formId.replace(/([A-Z])/g, " $1").trim(),
    description: `Fill out the ${formId} form`,
    fields: [
      { name: "id", label: "ID", type: "text", required: false, searchable: true },
      { name: "status", label: "Status", type: "text", required: false, searchable: true },
      { name: "notes", label: "Notes", type: "textarea", required: false, searchable: false },
    ],
    createButtonText: initialData ? "Update" : "Submit",
  };

  // Initialize form
  const formMethods = useForm({
    defaultValues: initialData || {},
  });

  // Watch form changes
  const formData = formMethods.watch();

  // Handle form submission with API call
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setFormError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      // Call custom submit handler if provided
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default: save to API
        const url = initialData?.id ? `/api/${formId}/${initialData.id}` : `/api/${formId}`;
        const method = initialData?.id ? "PATCH" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to save form: ${response.statusText}`);
        }

        setSuccessMessage(initialData?.id ? "Form updated successfully" : "Form saved successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      setFormError(error.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get visible fields
  const visibleFields = useMemo(() => {
    return metadata.fields.filter((field: FormFieldConfig) => {
      if (hideFields.includes(field.name)) return false;
      return true;
    });
  }, [metadata.fields, hideFields]);

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
          {metadata.breadcrumbs?.map((crumb: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              <span>{crumb.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4" data-testid="form-error">
          {formError}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-4" data-testid="form-success">
          {successMessage}
        </div>
      )}

      {/* Form */}
      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Render sections or fields */}
          {metadata.sections ? (
            // Sectioned layout
            metadata.sections.map((section: MetadataSection) => (
              <Card key={section.name} className="p-6">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                {section.description && <p className="text-gray-600 mb-4">{section.description}</p>}

                <div
                  className={`grid gap-4 ${
                    metadata.theme?.layout === "two-column" ? "md:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {section.fields.map((fieldName: string) => {
                    const field = metadata.fields.find((f: FormFieldConfig) => f.name === fieldName);
                    if (!field) return null;

                    return (
                      <MetadataFieldRenderer
                        key={field.name}
                        field={field}
                        formMethods={formMethods}
                        readOnly={readOnly}
                        formData={formData}
                        validationEngine={validationEngine}
                        logicEngine={logicEngine}
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
              {visibleFields.map((field: FormFieldConfig) => (
                <MetadataFieldRenderer
                  key={field.name}
                  field={field}
                  formMethods={formMethods}
                  readOnly={readOnly}
                  formData={formData}
                  validationEngine={validationEngine}
                  logicEngine={logicEngine}
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
