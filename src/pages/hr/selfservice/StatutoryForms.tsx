import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { i18n } from "@/lib/i18n";
import {
    FileText,
    Upload,
    Download,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Plus,
    FileCheck,
    Globe,
    Search,
    Info,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useNexusAI } from "@/contexts/NexusAIContext";

interface ComplianceForm {
    id: string;
    documentName: string;
    documentType: string;
    issueDate: string | null;
    dateTo: string | null;
    verificationStatus: string;
    attachmentUrl: string | null;
    createdAt: string;
}

const AVAILABLE_FORM_TEMPLATES = [
    { id: "W4_2024", name: "Form W-4 (2024)", category: "Tax", region: "United States" },
    { id: "I9_2024", name: "Form I-9 (Employment Eligibility)", category: "Legal", region: "United States" },
    { id: "P45_UK", name: "Form P45", category: "Tax", region: "United Kingdom" },
    { id: "TD1_CAN", name: "Form TD1", category: "Tax", region: "Canada" },
];

export default function StatutoryForms() {
    const { open, sendMessage } = useNexusAI();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");

    const { data: submittedForms, isLoading } = useQuery<ComplianceForm[]>({
        queryKey: ["/api/hr-self-service/me/compliance/forms"],
    });

    const uploadMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/hr-self-service/me/compliance/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Upload failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr-self-service/me/compliance/forms"] });
            toast({ title: "Submitted", description: "Form has been uploaded for verification." });
            setIsUploadDialogOpen(false);
            setSelectedTemplate("");
        },
    });

    const handleUpload = () => {
        if (!selectedTemplate) return;
        const template = AVAILABLE_FORM_TEMPLATES.find(t => t.id === selectedTemplate);
        uploadMutation.mutate({
            documentName: template?.name,
            documentType: "TAX_FORM",
            attachmentUrl: "#mock-upload-url",
            verificationStatus: "PENDING"
        });
    };

    const columns: Column<ComplianceForm>[] = [
        {
            accessorKey: "documentName",
            header: "Form Name",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium">{item.documentName}</span>
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Submitted On",
            cell: (item) => format(new Date(item.createdAt), "PPP")
        },
        {
            accessorKey: "verificationStatus",
            header: "Status",
            cell: (item) => {
                const colorMap: any = {
                    "PENDING": "bg-yellow-100 text-yellow-700 border-yellow-200",
                    "VERIFIED": "bg-green-100 text-green-700 border-green-200",
                    "REJECTED": "bg-red-100 text-red-700 border-red-200"
                };
                return (
                    <Badge variant="outline" className={colorMap[item.verificationStatus]}>
                        {item.verificationStatus === "VERIFIED" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {item.verificationStatus === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                        {item.verificationStatus === "REJECTED" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {item.verificationStatus}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "attachmentUrl",
            header: "Actions",
            cell: (item) => (
                <Button variant="ghost" size="sm" asChild>
                    <a href={item.attachmentUrl || "#"} target="_blank" rel="noreferrer">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                    </a>
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Compliance & Statutory Forms"
            description="Manage localized tax forms and legal documentation"
            breadcrumbs={[
                { label: "Self-Service", href: "/hr/self-service/me" },
                { label: "Compliance Forms" }
            ]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="vanguard-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Submitted Forms</CardTitle>
                                <CardDescription>Tracking your active compliance documents</CardDescription>
                            </div>
                            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="vanguard-button">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Form
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Submit Statutory Form</DialogTitle>
                                        <DialogDescription>
                                            Upload a completed form for HR verification.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Select Form Type</Label>
                                            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select template..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {AVAILABLE_FORM_TEMPLATES.map(t => (
                                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.region})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>File Upload</Label>
                                            <Input type="file" className="cursor-pointer" />
                                            <p className="text-[10px] text-muted-foreground italic">
                                                Accepted formats: PDF, JPEG, PNG. Max size: 5MB.
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleUpload} disabled={!selectedTemplate || uploadMutation.isPending}>
                                            {uploadMutation.isPending ? "Uploading..." : "Submit for Verification"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={submittedForms || []}
                                columns={columns}
                                isLoading={isLoading}
                            />
                            {submittedForms?.length === 0 && !isLoading && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No forms submitted yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="vanguard-card bg-primary/[0.02]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Available Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {AVAILABLE_FORM_TEMPLATES.map(template => (
                                <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                                    <div>
                                        <p className="text-sm font-medium">{template.name}</p>
                                        <p className="text-xs text-muted-foreground">{template.region}</p>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="vanguard-card bg-teal-50/50 border-teal-100">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-teal-700">
                                <Info className="w-4 h-4" />
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider">Payroll Help</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-teal-800 leading-relaxed">
                                Need assistance with statutory reporting or tax forms? Our AI assistant is ready to help.
                            </p>
                            <Button
                                variant="link"
                                className="px-0 text-teal-700 h-auto mt-2 text-xs font-semibold"
                                onClick={() => open()}
                            >
                                Launch NexusAI Assistant <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
