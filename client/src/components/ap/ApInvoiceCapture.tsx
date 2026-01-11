import React, { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Mic,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    FileSpreadsheet,
    FileImage,
    Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApInvoiceCaptureProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApInvoiceCapture({ open, onOpenChange }: ApInvoiceCaptureProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("upload");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [step, setStep] = useState<"idle" | "uploading" | "extracting" | "verifying">("idle");
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState<any>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<any>(null);

    // Mutation for AI Processing
    const processMutation = useMutation({
        mutationFn: async (file: File | Blob) => {
            const formData = new FormData();
            const fileName = file instanceof File ? file.name : "recording.webm";
            formData.append("file", file, fileName);

            setStep("uploading");
            setProgress(20);

            const response = await fetch("/api/ap/ai-invoice-capture", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to process invoice");
            }

            setStep("extracting");
            setProgress(60);

            return response.json();
        },
        onSuccess: (data) => {
            setExtractedData(data);
            setStep("verifying");
            setProgress(100);
            toast({
                title: "Extraction Complete",
                description: "Invoice data has been digitized. Please verify details."
            });
        },
        onError: (err: any) => {
            setStep("idle");
            setProgress(0);
            toast({
                title: "Processing Failed",
                description: err.message,
                variant: "destructive"
            });
        }
    });

    // Mutation for Final Saving
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/ap/invoices", {
                header: {
                    supplierId: 1, // Placeholder: In real app, we'd lookup or ask user
                    invoiceNumber: data.InvoiceNumber || data.invoiceNumber || "UNKNOWN",
                    invoiceDate: new Date(data.Date || data.date || Date.now()),
                    invoiceAmount: String(data.TotalAmount || data.totalAmount || "0"),
                    currency: data.Currency || data.currency || "USD",
                    description: `AI Extracted Invoice for ${data.SupplierName || "Unknown Supplier"}`
                },
                lines: (data.LineItems || data.lineItems || []).map((l: any, i: number) => ({
                    lineNumber: i + 1,
                    description: l.Description || l.description || "Line Item",
                    amount: String(l.Amount || l.amount || "0")
                }))
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
            toast({
                title: "Invoice Created",
                description: "The invoice has been saved to your draft workspace."
            });
            resetState();
            onOpenChange(false);
        }
    });

    const resetState = () => {
        setStep("idle");
        setProgress(0);
        setSelectedFile(null);
        setAudioBlob(null);
        setExtractedData(null);
        setIsRecording(false);
        setRecordingDuration(0);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setAudioBlob(blob);
            };

            recorder.start();
            setIsRecording(true);
            timerRef.current = setInterval(() => {
                setRecordingDuration(d => d + 1);
            }, 1000);

        } catch (err) {
            toast({
                title: "Microphone Error",
                description: "Could not access microphone.",
                variant: "destructive"
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const processCapture = () => {
        const fileToProcess = activeTab === "upload" ? selectedFile : audioBlob;
        if (fileToProcess) {
            processMutation.mutate(fileToProcess);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Send className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">AI-Powered Invoice Capture</DialogTitle>
                            <DialogDescription>
                                Create invoices instantly from audio, images, or spreadsheets.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {step === "idle" ? (
                    <Tabs defaultValue="upload" className="w-full mt-4" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                            <TabsTrigger value="upload" className="gap-2">
                                <Upload className="w-4 h-4" />
                                File Upload
                            </TabsTrigger>
                            <TabsTrigger value="audio" className="gap-2">
                                <Mic className="w-4 h-4" />
                                Voice Entry
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="mt-6">
                            <div
                                className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-10 flex flex-col items-center justify-center gap-3 bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors cursor-pointer relative"
                                onClick={() => document.getElementById("file-upload")?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    title="Invoice file upload"
                                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                                    onChange={handleFileChange}
                                />
                                {selectedFile ? (
                                    <>
                                        {selectedFile.name.endsWith(".xlsx") ? (
                                            <FileSpreadsheet className="w-12 h-12 text-green-500" />
                                        ) : selectedFile.type.startsWith("image") ? (
                                            <FileImage className="w-12 h-12 text-blue-500" />
                                        ) : (
                                            <FileText className="w-12 h-12 text-orange-500" />
                                        )}
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="h-8">
                                            Change File
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 bg-muted rounded-full">
                                            <Upload className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium">Drop your invoice here</p>
                                            <p className="text-sm text-muted-foreground">PDF, JPG, PNG or Excel up to 10MB</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="audio" className="mt-6">
                            <Card className="border-primary/20 bg-primary/[0.01]">
                                <CardContent className="pt-10 flex flex-col items-center justify-center gap-6">
                                    <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
                                        <Button
                                            size="lg"
                                            variant={isRecording ? "destructive" : "default"}
                                            className="w-20 h-20 rounded-full shadow-lg"
                                            onClick={isRecording ? stopRecording : startRecording}
                                        >
                                            {isRecording ? <X className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                                        </Button>
                                        {isRecording && (
                                            <div className="absolute -inset-2 border-2 border-destructive rounded-full animate-ping opacity-25" />
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <p className="text-lg font-mono font-bold">
                                            {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {isRecording ? "Listening to your invoice details..." : audioBlob ? "Recording saved" : "Press the mic to start"}
                                        </p>
                                    </div>

                                    {audioBlob && !isRecording && (
                                        <Badge variant="secondary" className="gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            Capture Ready
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-6 mt-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {step === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                {step === "extracting" && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                                {step === "verifying" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                <span className="text-sm font-medium capitalize">
                                    {step === "uploading" ? "Uploading to Cloud..." :
                                        step === "extracting" ? "AI Engine Processing..." :
                                            "Verification Required"}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />

                        {extractedData && (
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 max-h-[400px]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Supplier</Label>
                                        <Input
                                            value={extractedData.SupplierName || extractedData.supplierName || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, SupplierName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Invoice #</Label>
                                        <Input
                                            value={extractedData.InvoiceNumber || extractedData.invoiceNumber || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, InvoiceNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={extractedData.Date || extractedData.date ? new Date(extractedData.Date || extractedData.date).toISOString().split('T')[0] : ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, Date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Amount</Label>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="h-10 px-3">{extractedData.Currency || extractedData.currency || "USD"}</Badge>
                                            <Input
                                                className="font-bold text-lg"
                                                value={extractedData.TotalAmount || extractedData.totalAmount || ""}
                                                onChange={(e) => setExtractedData({ ...extractedData, TotalAmount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Card className="bg-muted/30">
                                    <CardContent className="p-4">
                                        <Label className="mb-2 block text-xs uppercase text-muted-foreground font-bold">Line Item Preview</Label>
                                        <div className="space-y-2">
                                            {(extractedData.LineItems || extractedData.lineItems || []).map((line: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                                                    <span className="truncate flex-1 pr-4">{line.Description || line.description}</span>
                                                    <span className="font-mono">{line.Amount || line.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className={`mt-6 ${step === "verifying" ? 'flex-row gap-2' : ''}`}>
                    {step === "idle" ? (
                        <>
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button
                                onClick={processCapture}
                                disabled={activeTab === "upload" ? !selectedFile : !audioBlob}
                                className="gap-2"
                            >
                                Process with AI
                                <CheckCircle2 className="w-4 h-4" />
                            </Button>
                        </>
                    ) : step === "verifying" ? (
                        <>
                            <Button variant="outline" onClick={resetState} className="flex-1">Restart</Button>
                            <Button
                                onClick={() => saveMutation.mutate(extractedData)}
                                disabled={saveMutation.isPending}
                                className="flex-1 gap-2"
                            >
                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Confirm & Save
                            </Button>
                        </>
                    ) : (
                        <Button disabled className="w-full gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {step === "uploading" ? "Uploading..." : "Extracting..."}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
