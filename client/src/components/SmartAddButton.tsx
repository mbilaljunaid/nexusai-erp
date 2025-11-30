import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { FormMetadata } from "@/lib/formMetadata";

interface SmartAddButtonProps {
  formMetadata?: FormMetadata;
  onClick: () => void;
  isLoading?: boolean;
}

export function SmartAddButton({ formMetadata, onClick, isLoading = false }: SmartAddButtonProps) {
  // Don't show button for pages that don't allow creation (analytics, dashboards, etc.)
  if (!formMetadata?.allowCreate) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      data-testid={`button-add-${formMetadata?.id || 'item'}`}
    >
      <Plus className="h-4 w-4 mr-2" />
      {formMetadata?.createButtonText || "Add Item"}
    </Button>
  );
}
