import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { openFormInNewWindow } from "@/lib/formUtils";
import type { FormMetadata } from "@/lib/formMetadata";

interface SmartAddButtonProps {
  formMetadata?: FormMetadata;
  onClick?: () => void;
  isLoading?: boolean;
  formId?: string;
}

export function SmartAddButton({ formMetadata, onClick, isLoading = false, formId }: SmartAddButtonProps) {
  // Don't show button for pages that don't allow creation (analytics, dashboards, etc.)
  if (!formMetadata?.allowCreate) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (formId) {
      openFormInNewWindow(formId, formMetadata?.name || 'Form');
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      data-testid={`button-add-${formMetadata?.id || 'item'}`}
    >
      <Plus className="h-4 w-4 mr-2" />
      {formMetadata?.createButtonText || "Add Item"}
    </Button>
  );
}
