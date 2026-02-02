import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ExcelJS from "exceljs";

interface ExcelImportModalProps {
  formId: string;
  templateColumns?: string[];
}

export function ExcelImportModal({ formId, templateColumns }: ExcelImportModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = async () => {
    try {
      const columns = templateColumns || ["column1", "column2", "column3"];
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Template");
      worksheet.addRow(columns);
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${formId}_template.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({
        title: "Template downloaded",
        description: "Fill in the template and upload it to import data.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to generate template file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importMutation = useMutation({
    mutationFn: (records: any[]) =>
      Promise.all(
        records.map((record) =>
          apiRequest("POST", `/api/${formId}`, record)
        )
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api", formId] });
      toast({
        title: "Import successful",
        description: `Successfully imported ${result.length} records`,
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      const worksheet = workbook.worksheets[0];
      
      if (!worksheet) {
        toast({
          title: "No data found",
          description: "The Excel file contains no worksheets",
          variant: "destructive",
        });
        return;
      }

      const records: any[] = [];
      const headers: string[] = [];
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell) => {
            headers.push(String(cell.value || ""));
          });
        } else {
          const record: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              record[header] = cell.value;
            }
          });
          if (Object.keys(record).length > 0) {
            records.push(record);
          }
        }
      });

      if (records.length === 0) {
        toast({
          title: "No data found",
          description: "The Excel file contains no data rows",
          variant: "destructive",
        });
        return;
      }

      importMutation.mutate(records);
    } catch (error) {
      toast({
        title: "File read error",
        description: "Failed to read the Excel file",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-excel-import">
          <Upload className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Excel Data</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx, .xls) to import records into this form.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="gap-2"
              data-testid="button-download-template"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <span className="text-xs text-muted-foreground">
              Download a template file with the correct column headers
            </span>
          </div>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              disabled={importMutation.isPending}
              className="hidden"
              id="excel-file"
              data-testid="input-excel-file"
            />
            <label htmlFor="excel-file" className="cursor-pointer">
              <div className="text-sm text-muted-foreground">
                Click to select an Excel file or drag and drop
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Supports .xlsx, .xls, and .csv files
              </div>
            </label>
          </div>
          {importMutation.isPending && (
            <div className="text-sm text-muted-foreground">Importing records...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
