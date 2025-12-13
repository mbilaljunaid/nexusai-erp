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
import * as XLSX from "xlsx";

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

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const exportData = getExportData();
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
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

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const exportData = getExportData();
      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);
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
