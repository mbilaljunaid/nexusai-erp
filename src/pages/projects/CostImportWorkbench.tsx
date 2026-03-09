import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, Download, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { DatePicker } from '@/components/ui/DatePicker';

interface ImportRow {
    id?: string | number;
    rowNumber: number;
    taskId: string;
    expenditureTypeId: string;
    expenditureItemDate: string;
    quantity: number;
    rawCost: number;
    transactionSource: string;
    transactionReference?: string;
    status: "pending" | "valid" | "error";
    errors?: string[];
}

interface FieldMapping {
    sourceColumn: string;
    targetField: string;
}

export default function CostImportWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();

    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<ImportRow[]>([]);
    const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
    const [importStep, setImportStep] = useState<"upload" | "mapping" | "validation" | "complete">("upload");

    // Fetch expenditure types for validation
    const { data: expenditureTypes = [] } = useQuery<any>({
        queryKey: ["expenditure-types"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/expenditure-types");
            return res.json();
        }
    });

    const importMutation = useMutation({
        mutationFn: async (data: ImportRow[]) => {
            const res = await fetch("/api/ppm/costs/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ costs: data })
            });
            if (!res.ok) throw new Error("Import failed");
            return res.json();
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["expenditures"] });
            setImportStep("complete");
            toast({
                title: "Import Successful",
                description: `${result.imported} costs imported successfully.`
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Import Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            if (lines.length === 0) return;

            const headers = lines[0].split(",").map(h => h.trim());
            setCsvHeaders(headers);

            // Auto-map common field names
            const autoMappings: FieldMapping[] = headers.map(header => ({
                sourceColumn: header,
                targetField: getAutoMapping(header)
            }));
            setFieldMappings(autoMappings);

            setImportStep("mapping");
        };

        reader.readAsText(file);
    };

    const getAutoMapping = (header: string): string => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes("task")) return "taskId";
        if (lowerHeader.includes("type")) return "expenditureTypeId";
        if (lowerHeader.includes("date")) return "expenditureItemDate";
        if (lowerHeader.includes("quantity") || lowerHeader.includes("qty")) return "quantity";
        if (lowerHeader.includes("cost") || lowerHeader.includes("amount")) return "rawCost";
        if (lowerHeader.includes("source")) return "transactionSource";
        if (lowerHeader.includes("ref")) return "transactionReference";
        return "";
    };

    const handleValidate = () => {
        if (!csvFile) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            const dataLines = lines.slice(1); // Skip header

            const rows = dataLines.map(line => ({ values: line.split(",").map(v => v.trim()) }));

            try {
                const res = await fetch("/api/ppm/costs/validate-import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rows, mappings: fieldMappings })
                });

                if (!res.ok) throw new Error("Validation failed");
                const { validated } = await res.json();

                setPreviewData(validated);
                setImportStep("validation");
            } catch (error: any) {
                toast({
                    title: "Validation Error",
                    description: error.message,
                    variant: "destructive"
                });
            }
        };

        reader.readAsText(csvFile);
    };

    const handleImport = () => {
        const validRows = previewData.filter(r => r.status === "valid");
        if (validRows.length === 0) {
            toast({
                title: "No Valid Rows",
                description: "Fix validation errors before importing.",
                variant: "destructive"
            });
            return;
        }
        importMutation.mutate(validRows);
    };

    const resetImport = () => {
        setCsvFile(null);
        setCsvHeaders([]);
        setPreviewData([]);
        setFieldMappings([]);
        setImportStep("upload");
    };

    const validCount = previewData.filter(r => r.status === "valid").length;
    const errorCount = previewData.filter(r => r.status === "error").length;

    const handlePreviewDataChange = (newData: unknown[]) => {
        const rows = newData as ImportRow[];
        const validated = rows.map((row) => {
            row.errors = [];
            if (!row.taskId) row.errors.push("Task ID is required");
            if (!row.expenditureTypeId) row.errors.push("Expenditure Type is required");
            if (!row.expenditureItemDate) row.errors.push("Date is required");
            if (!row.quantity || isNaN(Number(row.quantity))) row.errors.push("Valid quantity is required");
            if (!row.rawCost || isNaN(Number(row.rawCost))) row.errors.push("Valid cost is required");
            if (!row.transactionSource) row.errors.push("Transaction source is required");

            row.status = row.errors.length === 0 ? "valid" : "error";
            return row;
        });
        setPreviewData(validated);
    };

    const columns: SpreadsheetColumn<ImportRow>[] = [
        {
            id: "rowNumber",
            header: "Row",
            width: "60px",
            cell: (row) => <div className="p-2 text-muted-foreground">{row.rowNumber}</div>
        },
        {
            id: "taskId",
            header: "Task ID",
            width: "150px",
            cell: (row, index, updateRow) => (
                <Input className="h-9 w-full font-mono text-xs" value={row.taskId || ''} onChange={(e) => updateRow("taskId", e.target.value)} />
            )
        },
        {
            id: "expenditureTypeId",
            header: "Type",
            width: "150px",
            cell: (row, index, updateRow) => (
                <Input className="h-9 w-full text-xs" value={row.expenditureTypeId || ''} onChange={(e) => updateRow("expenditureTypeId", e.target.value)} />
            )
        },
        {
            id: "expenditureItemDate",
            header: "Date",
            width: "130px",
            cell: (row, index, updateRow) => (
                <DatePicker className="h-9 w-full text-xs" value={row.expenditureItemDate || ''} onChange={(v) => updateRow("expenditureItemDate", v)} />
            )
        },
        {
            id: "quantity",
            header: "Quantity",
            width: "100px",
            cell: (row, index, updateRow) => (
                <Input type="number" step="0.01" className="h-9 w-full" value={row.quantity || ''} onChange={(e) => updateRow("quantity", e.target.value ? Number(e.target.value) : 0)} />
            )
        },
        {
            id: "rawCost",
            header: "Cost",
            width: "120px",
            cell: (row, index, updateRow) => (
                <Input type="number" step="0.01" className="h-9 w-full" value={row.rawCost || ''} onChange={(e) => updateRow("rawCost", e.target.value ? Number(e.target.value) : 0)} />
            )
        },
        {
            id: "status",
            header: "Status",
            width: "200px",
            cell: (row) => (
                <div className="flex items-center h-full p-1">
                    {row.status === "valid" ? (
                        <Badge variant="default" className="gap-1 whitespace-nowrap">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                        </Badge>
                    ) : (
                        <div className="space-y-1">
                            <Badge variant="destructive" className="gap-1 whitespace-nowrap">
                                <AlertCircle className="h-3 w-3" /> Error
                            </Badge>
                            {row.errors?.map((err, i) => (
                                <p key={i} className="text-[10px] text-red-600 leading-tight">{err}</p>
                            ))}
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Cost Import Workbench"
            description="Import project costs from CSV/Excel files with field mapping and validation."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Cost Import" }
            ]}
        >
            <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className={cn(`flex items-center gap-2 ${importStep === "upload" ? "text-primary font-bold" : "text-muted-foreground"}`)}>
                            <div className={cn(`h-8 w-8 rounded-full flex items-center justify-center ${importStep === "upload" ? "bg-primary text-white" : "bg-muted"}`)}>1</div>
                            <span>Upload</span>
                        </div>
                        <div className={cn(`flex items-center gap-2 ${importStep === "mapping" ? "text-primary font-bold" : "text-muted-foreground"}`)}>
                            <div className={cn(`h-8 w-8 rounded-full flex items-center justify-center ${importStep === "mapping" ? "bg-primary text-white" : "bg-muted"}`)}>2</div>
                            <span>Map Fields</span>
                        </div>
                        <div className={cn(`flex items-center gap-2 ${importStep === "validation" ? "text-primary font-bold" : "text-muted-foreground"}`)}>
                            <div className={cn(`h-8 w-8 rounded-full flex items-center justify-center ${importStep === "validation" ? "bg-primary text-white" : "bg-muted"}`)}>3</div>
                            <span>Validate</span>
                        </div>
                        <div className={cn(`flex items-center gap-2 ${importStep === "complete" ? "text-green-600 font-bold" : "text-muted-foreground"}`)}>
                            <div className={cn(`h-8 w-8 rounded-full flex items-center justify-center ${importStep === "complete" ? "bg-green-600 text-white" : "bg-muted"}`)}>
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <span>Complete</span>
                        </div>
                    </div>
                    {importStep !== "upload" && (
                        <Button variant="outline" size="sm" onClick={resetImport}>
                            <Trash2 className="h-4 w-4 mr-2" /> Start Over
                        </Button>
                    )}
                </div>

                {/* Step 1: Upload */}
                {importStep === "upload" && (
                    <Card className="border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle>Upload Cost File</CardTitle>
                            <CardDescription>Select a CSV or Excel file containing project costs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
                                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">Drag and drop your file here, or click to browse</p>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                    aria-label="Upload cost file"
                                />
                                <Button onClick={() => document.getElementById("file-upload")?.click()}>
                                    <Upload className="h-4 w-4 mr-2" /> Choose File
                                </Button>
                            </div>
                            <Alert>
                                <AlertDescription>
                                    <strong>Required columns:</strong> Task ID, Expenditure Type, Date, Quantity, Cost, Transaction Source
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Field Mapping */}
                {importStep === "mapping" && (
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader>
                            <CardTitle>Map Fields</CardTitle>
                            <CardDescription>Match CSV columns to PPM fields. Auto-mapping applied based on column names.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>CSV Column</TableHead>
                                        <TableHead>Target PPM Field</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {csvHeaders.map((header, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-mono text-sm">{header}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={fieldMappings[idx]?.targetField}
                                                    onValueChange={(value) => {
                                                        const newMappings = [...fieldMappings];
                                                        newMappings[idx] = { sourceColumn: header, targetField: value };
                                                        setFieldMappings(newMappings);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-64">
                                                        <SelectValue placeholder="Select field..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">-- Skip --</SelectItem>
                                                        <SelectItem value="taskId">Task ID</SelectItem>
                                                        <SelectItem value="expenditureTypeId">Expenditure Type ID</SelectItem>
                                                        <SelectItem value="expenditureItemDate">Date</SelectItem>
                                                        <SelectItem value="quantity">Quantity</SelectItem>
                                                        <SelectItem value="rawCost">Raw Cost</SelectItem>
                                                        <SelectItem value="transactionSource">Transaction Source</SelectItem>
                                                        <SelectItem value="transactionReference">Transaction Reference</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setImportStep("upload")}>Back</Button>
                                <Button onClick={handleValidate}>
                                    <Play className="h-4 w-4 mr-2" /> Validate Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Validation */}
                {importStep === "validation" && (
                    <Card className="border-t-4 border-t-orange-500">
                        <CardHeader>
                            <CardTitle>Validation Results</CardTitle>
                            <CardDescription>
                                <Badge variant={errorCount === 0 ? "default" : "destructive"} className="mr-2">
                                    {validCount} Valid
                                </Badge>
                                {errorCount > 0 && (
                                    <Badge variant="destructive">{errorCount} Errors</Badge>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="max-h-96 overflow-y-auto">
                                <div className="max-h-96 overflow-y-auto">
                                    <InteractiveSpreadsheet
                                        data={previewData}
                                        columns={columns}
                                        onChange={handlePreviewDataChange}
                                        rowHeight={60}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setImportStep("mapping")}>Back to Mapping</Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={validCount === 0 || importMutation.isPending}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {importMutation.isPending ? "Importing..." : `Import ${validCount} Rows`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Complete */}
                {importStep === "complete" && (
                    <Card className="border-t-4 border-t-green-500">
                        <CardContent className="py-12 text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Import Complete!</h3>
                            <p className="text-muted-foreground mb-6">
                                {validCount} cost records have been successfully imported.
                            </p>
                            <div className="flex justify-center gap-2">
                                <Button variant="outline" onClick={resetImport}>
                                    Import Another File
                                </Button>
                                <Button onClick={() => setLocation("/projects/expenditures")}>
                                    View Expenditures
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
