import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface SearchField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface ContextualSearchProps {
  fields: SearchField[];
  onSearch: (filters: Record<string, string>) => void;
  placeholder?: string;
  testId?: string;
}

export function ContextualSearch({ fields, onSearch, placeholder = "Search...", testId }: ContextualSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    onSearch({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start"
        data-testid={testId || "button-search"}
      >
        <Search className="h-4 w-4 mr-2" />
        <span>{placeholder}</span>
        {activeFilterCount > 0 && (
          <span className="ml-auto bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">{activeFilterCount}</span>
        )}
      </Button>

      {isOpen && (
        <Card className="p-4 space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
              {field.type === "select" && field.options ? (
                <select
                  value={filters[field.key] || ""}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  data-testid={`select-${field.key}`}
                >
                  <option value="">All</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder || field.label}
                  value={filters[field.key] || ""}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  data-testid={`input-${field.key}`}
                />
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSearch} size="sm" className="flex-1" data-testid="button-apply-filters">
              Apply
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="flex-1"
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
