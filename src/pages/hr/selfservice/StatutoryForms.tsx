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
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
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

    const handleAddRow = () => {
        const newRow = {
            id: `temp-${Date.now()}`,
            documentName: "",
            documentType: "TAX_FORM",
            createdAt: "",
            verificationStatus: "NEW",
            attachmentUrl: ""
        };
        queryClient.setQueryData(["/api/hr-self-service/me/compliance/forms"], (old: any) => [...(old || []), newRow]);
    };

    const handleSaveForms = (data: any[]) => {
        const validDocs = data.map(d => ({
            ...d,
            createdAt: d.createdAt || new Date().toISOString(),
            verificationStatus: d.verificationStatus === "NEW" ? "PENDING" : d.verificationStatus
        }));
        queryClient.setQueryData(["/api/hr-self-service/me/compliance/forms"], validDocs);
        toast({ title: "Forms Updated", description: "Your statutory forms have been saved successfully." });
    };

    const columns = [
        {
            id: "documentName",
            header: "Form Name / Type *",
            width: "300px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.documentName} onValueChange={(val) => updateRow("documentName", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue placeholder="Select template..." />
                    </SelectTrigger>
                    <SelectContent>
                        {AVAILABLE_FORM_TEMPLATES.map(t => (
                            <SelectItem key={t.id} value={t.name}>{t.name} ({t.region})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "createdAt",
            header: "Submitted On",
            width: "150px",
            cell: (row: any) => (
                <div className="h-9 flex items-center px-2 text-sm">
                    {row.createdAt ? format(new Date(row.createdAt), "PPP") : "-"}
                </div>
            )
        },
        {
            id: "verificationStatus",
            header: "Status",
            width: "150px",
            cell: (row: any) => {
                const colorMap: any = {
                    "PENDING": "bg-yellow-100 text-yellow-700 border-yellow-200",
                    "VERIFIED": "bg-green-100 text-green-700 border-green-200",
                    "REJECTED": "bg-red-100 text-red-700 border-red-200",
                    "NEW": "bg-blue-100 text-blue-700 border-blue-200"
                };
                const status = row.verificationStatus || "NEW";
                return (
                    <div className="flex items-center h-full px-2">
                        <Badge variant="outline" className={colorMap[status]}>
                            {status === "VERIFIED" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {status === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                            {status === "REJECTED" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {status === "NEW" && <Plus className="w-3 h-3 mr-1" />}
                            {status}
                        </Badge>
                    </div>
                );
            }
        },
        {
            id: "attachmentUrl",
            header: "Attachment",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                row.attachmentUrl ? (
                    <div className="flex items-center h-full px-2 gap-2">
                        <Button variant="ghost" size="sm" asChild className="h-8">
                            <a href={row.attachmentUrl} target="_blank" rel="noreferrer">
                                <Download className="w-4 h-4 mr-1" /> Download
                            </a>
                        </Button>
                        {row.verificationStatus === "NEW" && (
                            <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700" onClick={() => updateRow("attachmentUrl", "")}>
                                Remove
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center h-full px-2">
                        <Input type="file" className="h-8 text-xs w-full" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                updateRow("attachmentUrl", "#mock-upload-url");
                            }
                        }} />
                    </div>
                )
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
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle>Submitted Forms</CardTitle>
                                <CardDescription>Manage and upload your active compliance documents</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleAddRow}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Form
                                </Button>
                                <Button size="sm" onClick={() => handleSaveForms(submittedForms || [])}>
                                    <Upload className="w-4 h-4 mr-2" /> Save & Submit
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px] p-0">
                            <InteractiveSpreadsheet
                                data={submittedForms || []}
                                columns={columns}
                                onChange={(newData) => queryClient.setQueryData(["/api/hr-self-service/me/compliance/forms"], () => newData)}
                                virtualized={true}
                                containerHeight="400px"
                            />
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
                                    <Button variant="ghost" size="icon" aria-label="Download">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="vanguard-card bg-teal-500/10 border-teal-100">
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
