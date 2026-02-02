import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FormSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  searchFields: string[];
  data: any[];
  onFilter: (filtered: any[]) => void;
}

/**
 * Form-specific search component - each form defines its own searchable fields
 * Filters data based on form's searchable fields defined in formMetadata
 */
export function FormSearch({
  placeholder = "Search...",
  value,
  onChange,
  searchFields,
  data,
  onFilter
}: FormSearchProps) {
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

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-8"
        data-testid="input-form-search"
      />
    </div>
  );
}
