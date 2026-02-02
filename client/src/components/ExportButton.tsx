import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, File, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelJS from "exceljs";

interface ExportButtonProps {
  data: any[];
  filename?: string;
  columns?: { key: string; header: string }[];
}

export function ExportButton({ data, filename = "export", columns }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getExportData = () => {
    if (!columns) return data;
    return data.map((row) => {
      const exportRow: Record<string, any> = {};
      columns.forEach((col) => {
        exportRow[col.header] = row[col.key];
      });
      return exportRow;
    });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = getExportData();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      if (exportData.length > 0) {
        const headers = Object.keys(exportData[0]);
        worksheet.addRow(headers);
        exportData.forEach((record: any) => {
          worksheet.addRow(headers.map(h => record[h]));
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: "Export successful",
        description: `Exported ${data.length} records to Excel`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const exportData = getExportData();
      
      if (exportData.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no records to export",
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(","),
        ...exportData.map((row: any) => 
          headers.map(h => {
            const value = row[h];
            if (value === null || value === undefined) return "";
            const stringValue = String(value);
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(",")
        )
      ];
      const csv = csvRows.join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({
        title: "Export successful",
        description: `Exported ${data.length} records to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data to CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const exportData = getExportData();
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({
        title: "Export successful",
        description: `Exported ${data.length} records to JSON`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data to JSON",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const printToPDF = () => {
    toast({
      title: "Print to PDF",
      description: "Use your browser's print function (Ctrl+P) and select 'Save as PDF' to export.",
    });
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || data.length === 0} data-testid="button-export">
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel} data-testid="export-excel">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} data-testid="export-csv">
          <FileText className="h-4 w-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} data-testid="export-json">
          <File className="h-4 w-4 mr-2" />
          Export to JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printToPDF} data-testid="export-pdf">
          <FileText className="h-4 w-4 mr-2" />
          Print to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
