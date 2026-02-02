import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { useToast } from "@/hooks/use-toast";

interface ExcelExportButtonProps {
  formId: string;
  fileName?: string;
}

export function ExcelExportButton({ formId, fileName = "export" }: ExcelExportButtonProps) {
  const { toast } = useToast();
  const { data: formRecords = [] } = useQuery<any[]>({
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

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      if (flatRecords.length > 0) {
        const headers = Object.keys(flatRecords[0]);
        worksheet.addRow(headers);
        flatRecords.forEach((record: any) => {
          worksheet.addRow(headers.map(h => record[h]));
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `${fileName}-${timestamp}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);

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
