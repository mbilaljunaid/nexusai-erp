import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image, FileAudio, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Label } from "@/components/ui/label";

export default function APAICaptureUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [extractedData, setExtractedData] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/ap/ai-invoice-capture", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Upload failed");
            return response.json();
        },
        onSuccess: (data) => {
            setExtractedData(data);
            toast({ title: "Invoice extracted successfully", description: "Review and save the invoice below" });
        },
        onError: () => {
            toast({ title: "Extraction failed", description: "Please try again", variant: "destructive" });
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiRequest("POST", "/api/ap/invoices", {
                header: {
                    supplierId: data.supplierId || "temp-supplier",
                    invoiceNumber: data.invoiceNumber,
                    invoiceDate: data.invoiceDate,
                    dueDate: data.dueDate,
                    invoiceAmount: data.totalAmount,
                    currency: data.currency || "USD",
                    invoiceStatus: "Draft",
                    validationStatus: "Pending"
                },
                lines: data.lineItems?.map((item: any, idx: number) => ({
                    lineNumber: idx + 1,
                    description: item.description,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice,
                    amount: item.amount
                })) || []
            });

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
            toast({ title: "Invoice saved successfully" });
            setLocation("/finance/ap/invoices");
        }
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setExtractedData(null);
        }
    };

    const handleUpload = () => {
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
        if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
        if (type.includes("audio")) return <FileAudio className="h-8 w-8 text-purple-500" />;
        if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    };

    const lineItemColumns: SpreadsheetColumn<any>[] = [
        { id: "description", header: "Description", width: "1fr", cell: (row) => row.description },
        { id: "quantity", header: "Quantity", width: "100px", cell: (row) => <div className="text-right w-full">{row.quantity || 1}</div> },
        { id: "unitPrice", header: "Unit Price", width: "120px", cell: (row) => <div className="text-right w-full">${row.unitPrice}</div> },
        { id: "amount", header: "Amount", width: "120px", cell: (row) => <div className="text-right w-full font-medium">${row.amount}</div> },
    ];

    return (
        <StandardPage
            title="AI Invoice Capture"
            description="Upload invoices in any format and extract data with AI"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "AI Capture" }
            ]}
        >
            <div className="space-y-6">
                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Invoice</CardTitle>
                        <CardDescription>
                            Supports: Images (JPG, PNG), PDFs, Excel files, and even audio recordings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept="image/*,.pdf,.xlsx,.xls,audio/*"
                                />
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground/70 mb-4" />
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Images, PDFs, Excel, or Audio files
                                    </p>
                                </Label>
                            </div>

                            {file && (
                                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(file.type)}
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={uploadMutation.isPending}
                                    >
                                        {uploadMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Extract Data
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Extracted Data Preview */}
                {extractedData && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        Extracted Invoice Data
                                    </CardTitle>
                                    <CardDescription>Review and edit before saving</CardDescription>
                                </div>
                                <Button onClick={() => saveMutation.mutate(extractedData)}>
                                    Save Invoice
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium">Invoice Number</Label>
                                    <p className="text-lg font-mono">{extractedData.invoiceNumber || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Supplier</Label>
                                    <p className="text-lg">{extractedData.supplierName || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Invoice Date</Label>
                                    <p className="text-lg">{extractedData.invoiceDate || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Due Date</Label>
                                    <p className="text-lg">{extractedData.dueDate || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Total Amount</Label>
                                    <p className="text-lg font-bold">
                                        {extractedData.currency || "USD"} {extractedData.totalAmount || "0.00"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Confidence</Label>
                                    <p className="text-lg">{(extractedData.confidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>

                            {extractedData.lineItems && extractedData.lineItems.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Line Items</h4>
                                    <div className="border rounded-lg overflow-hidden h-72">
                                        <InteractiveSpreadsheet
                                            columns={lineItemColumns}
                                            data={extractedData.lineItems}
                                            onChange={() => { }}
                                            containerHeight="100%"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
