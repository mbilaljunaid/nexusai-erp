import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetadataFormRenderer } from "./forms/MetadataFormRenderer";

interface FormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formTitle?: string;
  formDescription?: string;
  initialData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
}

export function FormDialog({
  isOpen,
  onOpenChange,
  formId,
  formTitle,
  formDescription,
  initialData,
  onSubmit,
}: FormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {formTitle && (
          <DialogHeader>
            <DialogTitle>{formTitle}</DialogTitle>
            {formDescription && <DialogDescription>{formDescription}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="mt-4">
          <MetadataFormRenderer
            formId={formId}
            initialData={initialData}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
