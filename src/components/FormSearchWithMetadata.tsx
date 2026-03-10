import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { FormMetadata } from "@/lib/formMetadata";

interface FormSearchWithMetadataProps {
  formMetadata?: FormMetadata;
  value: string;
  onChange: (value: string) => void;
  data: any[];
  onFilter: (filtered: any[]) => void;
}

/**
 * Form-specific search component that uses the form's defined searchable fields
 * Each form defines its own search fields in the metadata
 */
export function FormSearchWithMetadata({
  formMetadata,
  value,
  onChange,
  data,
  onFilter,
}: FormSearchWithMetadataProps) {
  // Don't show search for pages that don't need it
  if (!formMetadata?.showSearch) {
    return null;
  }

  const searchFields = formMetadata?.searchFields || [];

  const handleSearch = (query: string) => {
    onChange(query);

    if (!query.trim()) {
      onFilter(data);
      return;
    }

    const filtered = data.filter((item) => {
      const queryLower = query.toLowerCase();
      return searchFields.some((field) => {
        const fieldValue = item[field];
        if (!fieldValue) return false;
        return fieldValue.toString().toLowerCase().includes(queryLower);
      });
    });

    onFilter(filtered);
  };

  const placeholderText = searchFields.length > 0
    ? `Search by ${searchFields.join(", ")}...`
    : "Search...";

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholderText}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-8"
        data-testid={`input-search-${formMetadata?.id || 'form'}`}
      />
    </div>
  );
}
