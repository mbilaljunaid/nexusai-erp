import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AIExtractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (extractedData: any) => void;
}

interface ExtractedData {
    leaseName: string;
    commencementDate: string;
    expirationDate: string;
    monthlyPayment: number;
    discountRate: number;
    termMonths: number;
    confidence: {
        leaseName: number;
        commencementDate: number;
        expirationDate: number;
        monthlyPayment: number;
        discountRate: number;
        termMonths: number;
    };
}

export function LeaseAIExtractionModal({ isOpen, onClose, onSuccess }: AIExtractionModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [extractionProgress, setExtractionProgress] = useState(0);

    const extractMutation = useMutation({
        mutationFn: async (file: File) => {
            // Simulate extraction with FormData
            const formData = new FormData();
            formData.append("file", file);

            // In real implementation, this would be multipart/form-data
            // For now, simulate with text extraction
            const text = await file.text();

            const res = await fetch("/api/lease/leases/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Extraction failed");
            }
            return res.json();
        },
        onSuccess: (data) => {
            setExtractedData(data);
            setExtractionProgress(100);
            toast({
                title: "Extraction Complete",
                description: "AI has extracted lease data from the document"
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Extraction Failed",
                description: error.message
            });
            setExtractionProgress(0);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setExtractedData(null);
            setExtractionProgress(0);
        }
    };

    const handleExtract = () => {
        if (!file) return;
        setExtractionProgress(10);

        // Simulate progress
        const interval = setInterval(() => {
            setExtractionProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        extractMutation.mutate(file);
    };

    const handleCreateLease = () => {
        if (extractedData) {
            onSuccess(extractedData);
            onClose();
            setFile(null);
            setExtractedData(null);
            setExtractionProgress(0);
        }
    };

    const getConfidenceBadge = (confidence: number) => {
        if (confidence >= 0.9) return <Badge className="bg-green-600">High ({(confidence * 100).toFixed(0)}%)</Badge>;
        if (confidence >= 0.7) return <Badge className="bg-yellow-600">Medium ({(confidence * 100).toFixed(0)}%)</Badge>;
        return <Badge variant="destructive">Low ({(confidence * 100).toFixed(0)}%)</Badge>;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Lease Contract Extraction
                    </DialogTitle>
                    <DialogDescription>
                        Upload a lease contract PDF and AI will extract key terms automatically
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Upload */}
                    {!extractedData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Upload Contract Document</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="mb-2 text-sm text-muted-foreground">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (MAX. 10MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {file && (
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm font-medium flex-1">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                )}

                                {extractionProgress > 0 && extractionProgress < 100 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Extracting data...</span>
                                            <span>{extractionProgress}%</span>
                                        </div>
                                        <Progress value={extractionProgress} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Extracted Data Review */}
                    {extractedData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Extracted Lease Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Lease Name</Label>
                                        <Input
                                            value={extractedData.leaseName}
                                            onChange={(e) => setExtractedData({
                                                ...extractedData,
                                                leaseName: e.target.value
                                            })}
                                        />
                                        {getConfidenceBadge(extractedData.confidence.leaseName)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Term (Months)</Label>
                                        <Input
                                            type="number"
                                            value={extractedData.termMonths}
                                            onChange={(e) => setExtractedData({
                                                ...extractedData,
                                                termMonths: parseInt(e.target.value)
                                            })}
                                        />
                                        {getConfidenceBadge(extractedData.confidence.termMonths)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Commencement Date</Label>
                                        <Input
                                            type="date"
                                            value={extractedData.commencementDate}
                                            onChange={(e) => setExtractedData({
                                                ...extractedData,
                                                commencementDate: e.target.value
                                            })}
                                        />
                                        {getConfidenceBadge(extractedData.confidence.commencementDate)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Expiration Date</Label>
                                        <Input
                                            type="date"
                                            value={extractedData.expirationDate}
                                            onChange={(e) => setExtractedData({
                                                ...extractedData,
                                                expirationDate: e.target.value
                                            })}
                                        />
                                        {getConfidenceBadge(extractedData.confidence.expirationDate)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Monthly Payment</Label>
                                        <Input
                                            type="number"
                                            value={extractedData.monthlyPayment}
                                            onChange={(e) => setExtractedData({
                                                ...extractedData,
                                                monthlyPayment: parseFloat(e.target.value)
                                            })}
                                        />
                                        {getConfidenceBadge(extractedData.confidence.monthlyPayment)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Discount Rate (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={extractedData.discountRate}
                                            onChange={(e) => setExtractedData({
                                                ...extractedData,
                                                discountRate: parseFloat(e.target.value)
                                            })}
                                        />
                                        {getConfidenceBadge(extractedData.confidence.discountRate)}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <div className="text-blue-900">
                                        <p className="font-medium">Review Extracted Data</p>
                                        <p className="text-xs mt-1">
                                            AI confidence scores are shown. Please verify and edit any incorrect values before creating the lease.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    {!extractedData ? (
                        <Button
                            onClick={handleExtract}
                            disabled={!file || extractMutation.isPending}
                        >
                            {extractMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Extracting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Extract with AI
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleCreateLease}>
                            Create Lease from Extraction
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
