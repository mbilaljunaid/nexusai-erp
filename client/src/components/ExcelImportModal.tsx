import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import * as XLSX from "xlsx";

interface ExcelImportModalProps {
  formId: string;
}

export function ExcelImportModal({ formId }: ExcelImportModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json(worksheet);

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
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
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
