import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface ExcelExportButtonProps {
  formId: string;
  fileName?: string;
}

export function ExcelExportButton({ formId, fileName = "export" }: ExcelExportButtonProps) {
  const { toast } = useToast();
  const { data: formRecords = [] } = useQuery({
    queryKey: ["/api", formId],
  });

  const handleExport = async () => {
    try {
      if (!formRecords || formRecords.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no records to export",
          variant: "destructive",
        });
        return;
      }

      // Transform records: flatten nested data objects
      const flatRecords = formRecords.map((record: any) => {
        const flat: any = { id: record.id };
        if (record.data && typeof record.data === "object") {
          Object.entries(record.data).forEach(([key, value]) => {
            flat[key] = value;
          });
        }
        if (record.status) flat.status = record.status;
        if (record.submittedAt) flat.submittedAt = record.submittedAt;
        return flat;
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(flatRecords);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      // Export
      const timestamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `${fileName}-${timestamp}.xlsx`);

      toast({
        title: "Export successful",
        description: `Exported ${flatRecords.length} records to ${fileName}.xlsx`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data to Excel",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      data-testid="button-excel-export"
    >
      <Download className="h-4 w-4 mr-2" />
      Export Excel
    </Button>
  );
}
