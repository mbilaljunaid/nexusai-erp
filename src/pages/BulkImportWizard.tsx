
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ImportError {
    row: number;
    reason: string;
    data: any;
}

interface ImportResult {
    total: number;
    success: number;
    failed: number;
    errors: ImportError[];
}

export default function BulkImportWizard() {
    const { toast } = useToast();
    const [entityType, setEntityType] = useState<"party" | "item">("party");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null); // Reset prev results
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({ title: "No file selected", description: "Please choose a CSV file.", variant: "destructive" });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/mdm/bulk/import/${entityType}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }

            const data = await res.json();
            setResult(data);
            toast({ title: "Import Processed", description: `Processed ${data.total} rows.` });

        } catch (error: any) {
            toast({ title: "Import Failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <StandardPage
            title="Bulk Data Import"
            description="Mass import Master Data records via CSV."
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Bulk Import" }]}
        >
            <div className="grid gap-6 md:grid-cols-2">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select Data Type</CardTitle>
                            <CardDescription>What kind of data are you importing?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={entityType} onValueChange={(v: any) => setEntityType(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Entity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="party">Parties (Customers/Suppliers)</SelectItem>
                                    <SelectItem value="item">Items (Products)</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="mt-4 text-sm text-muted-foreground p-4 bg-muted rounded-md border">
                                <p className="font-semibold mb-2">Required Columns:</p>
                                {entityType === "party" ? (
                                    <code className="text-xs">partyName, partyType (ORGANIZATION/PERSON)</code>
                                ) : (
                                    <code className="text-xs">itemNumber, itemName, uomCode</code>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Upload File</CardTitle>
                            <CardDescription>Upload a CSV file matching the schema.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">Drag and drop or click to upload</p>
                                    <p className="text-xs text-muted-foreground">CSV files only</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    title="Upload CSV"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {file && (
                                <div className="flex items-center p-4 border rounded-md bg-background">
                                    <FileText className="w-4 h-4 mr-2 text-primary" />
                                    <span className="text-sm flex-1 truncate">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                disabled={!file || uploading}
                                onClick={handleUpload}
                            >
                                {uploading ? "Processing..." : "Run Import"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    {result ? (
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Import Results</CardTitle>
                                <CardDescription>Summary of the batch processing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-md border bg-muted/50 text-center">
                                        <div className="text-sm font-medium text-muted-foreground">Total</div>
                                        <div className="text-2xl font-bold">{result.total}</div>
                                    </div>
                                    <div className="p-4 rounded-md border bg-green-500/10 border-green-200 text-center">
                                        <div className="text-sm font-medium text-green-700">Success</div>
                                        <div className="text-2xl font-bold text-green-700">{result.success}</div>
                                    </div>
                                    <div className="p-4 rounded-md border bg-red-500/10 border-red-200 text-center">
                                        <div className="text-sm font-medium text-red-700">Failed</div>
                                        <div className="text-2xl font-bold text-red-700">{result.failed}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>100%</span>
                                    </div>
                                    <Progress value={100} className="h-2" />
                                </div>

                                {result.failed > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium flex items-center">
                                            <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                                            Error Log
                                        </h3>
                                        <ScrollArea className="h-72 border rounded-md p-4 bg-muted/30">
                                            <div className="space-y-3">
                                                {result.errors.map((err, i) => (
                                                    <Alert key={i} variant="destructive" className="bg-card">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertTitle className="text-xs font-mono">Row {err.row}</AlertTitle>
                                                        <AlertDescription className="text-xs mt-1">
                                                            {err.reason}
                                                            <div className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                                                                {JSON.stringify(err.data)}
                                                            </div>
                                                        </AlertDescription>
                                                    </Alert>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}

                                {result.failed === 0 && (
                                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-muted-foreground">
                                        <CheckCircle className="w-12 h-12 text-green-500" />
                                        <p>All records imported successfully.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                            <Upload className="w-12 h-12 mb-4 opacity-20" />
                            <p>Upload results will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}
