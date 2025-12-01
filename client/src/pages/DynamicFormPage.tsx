import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getFormMetadata, formMetadataRegistry } from "@/lib/formMetadata";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function DynamicFormPage() {
  const [location] = useLocation();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Extract formId from URL path
  const pathParts = location.split("/").filter(Boolean);
  const formId = pathParts[pathParts.length - 1];
  
  const formMetadata = getFormMetadata(formId);

  // If form metadata not found, show error
  if (!formMetadata) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive font-medium">Form not found: {formId}</p>
          <p className="text-sm text-muted-foreground mt-2">This page is not configured in the system.</p>
        </div>
      </div>
    );
  }

  // Fetch data from API
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: [formMetadata.apiEndpoint],
    queryFn: async () => {
      const res = await fetch(formMetadata.apiEndpoint);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${formMetadata.apiEndpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [formMetadata.apiEndpoint] });
      toast({ title: "Deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ title: "Error deleting item", variant: "destructive" });
    },
  });

  // Update filtered data when data or search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(data);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = data.filter((item) => 
      formMetadata.searchFields.some(field => 
        item[field]?.toString().toLowerCase().includes(query)
      )
    );
    setFilteredData(filtered);
  }, [data, searchQuery, formMetadata.searchFields]);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={formMetadata.breadcrumbs} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{formMetadata.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredData.length} {filteredData.length === 1 ? "item" : "items"}
          </p>
        </div>
        <SmartAddButton 
          formMetadata={formMetadata}
          onClick={() => {
            toast({ title: "Add form would open here" });
          }}
        />
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <FormSearchWithMetadata
          formMetadata={formMetadata}
          value={searchQuery}
          onChange={setSearchQuery}
          data={data}
          onFilter={setFilteredData}
        />
      </div>

      {/* Data Table / Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : filteredData.length === 0 ? (
        <Card className="p-8 text-center">
          <Plus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">No items yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first {formMetadata.name.toLowerCase()} to get started.
          </p>
          {formMetadata.allowCreate && (
            <SmartAddButton 
              formMetadata={formMetadata}
              onClick={() => {
                toast({ title: "Add form would open here" });
              }}
            />
          )}
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  {formMetadata.fields.map(field => (
                    <th key={field.name} className="px-4 py-3 text-left font-semibold">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b hover:bg-muted/50 transition-colors" data-testid={`row-${formMetadata.id}-${idx}`}>
                    {formMetadata.fields.map(field => (
                      <td key={field.name} className="px-4 py-3">
                        <span className="text-foreground">
                          {item[field.name] ?? "—"}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-edit-${formMetadata.id}-${idx}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${formMetadata.id}-${idx}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
